import { useEffect, useRef, useState, useMemo } from 'react'
import Globe from 'react-globe.gl'
import { ArcDatum, HubDatum, RingDatum } from '../engine/scenarioTypes'
import { getActiveArcs, getActiveHubs, getActiveRings } from '../engine/selectors'
import { State } from '../engine/scenarioTypes'
import { getCountryData, getWelfareGrade, getGradeColor, generateBasicFastFacts } from '../utils/countryWelfareData'
import StarfieldBackground from './StarfieldBackground'
import GlobeParticleEffects from './GlobeParticleEffects'
import RegionTrajectoryModal from './RegionTrajectoryModal'

interface GlobePanelProps {
  regionValues: Record<string, number>
  state?: State
  mapMode?: 'welfareStandards' | 'welfareDebt' | 'enforcement'
}

export default function GlobePanel({ regionValues, state, mapMode = 'welfareStandards' }: GlobePanelProps) {
  console.log('GlobePanel rendering with regionValues:', regionValues)
  const globeEl = useRef<any>()
  const [worldData, setWorldData] = useState<any>(null)
  const [arcsData, setArcsData] = useState<ArcDatum[]>([])
  const [hubsData, setHubsData] = useState<HubDatum[]>([])
  const [ringsData, setRingsData] = useState<RingDatum[]>([])

  // Debug logging for regionValues
  useEffect(() => {
    const countryCount = Object.keys(regionValues).length
    console.log('GlobePanel regionValues:', countryCount, 'countries')
    console.log('Has EGY?', 'EGY' in regionValues, regionValues['EGY'])
    console.log('Sample countries:', Object.keys(regionValues).slice(0, 5))
    if (regionValues['EGY'] !== undefined) {
      console.log('✅ EGY found in regionValues:', regionValues['EGY'])
    } else {
      console.warn('❌ EGY NOT found in regionValues')
    }
  }, [regionValues])
  const [hoveredRegion, setHoveredRegion] = useState<{ 
    name: string
    iso3: string
    value: number
    grade: string
    gradeColor: string
    fastFacts: string[]
    detailedContext?: string
    sources?: string[]
    baselineGrade?: string
    baselineScore?: number
  } | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null)
  const [hoveredPolygonId, setHoveredPolygonId] = useState<string | null>(null)
  const [hoveredArc, setHoveredArc] = useState<any | null>(null)
  const [hoveredRing, setHoveredRing] = useState<any | null>(null)
  const [arcTooltipPosition, setArcTooltipPosition] = useState<{ x: number; y: number } | null>(null)
  const [ringTooltipPosition, setRingTooltipPosition] = useState<{ x: number; y: number } | null>(null)
  const [clickedRegion, setClickedRegion] = useState<string | null>(null)

  // Load GeoJSON dynamically (relative path so it works on GitHub Pages)
  useEffect(() => {
    fetch('world.geojson')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => {
        setWorldData(data)
      })
      .catch(err => {
        console.error('Failed to load GeoJSON:', err)
        setWorldData({ type: 'FeatureCollection', features: [] })
      })
  }, [])

  // Load arcs and hubs data (relative paths for GitHub Pages)
  useEffect(() => {
    Promise.all([
      fetch('flows.json').then(r => r.json()),
      fetch('hubs.json').then(r => r.json())
    ]).then(([arcs, hubs]) => {
      setArcsData(arcs)
      setHubsData(hubs)
    }).catch(err => {
      console.error('Failed to load arcs/hubs:', err)
    })
  }, [])

  // Memoize rings calculation
  const activeRingsMemo = useMemo(() => {
    if (!state) return []
    return getActiveRings(state)
  }, [state])

  // Memoize active arcs and hubs to avoid recalculating on every render - MUST be before conditional returns
  const activeArcs = useMemo(() => {
    if (!state || arcsData.length === 0) return []
    return getActiveArcs(state, arcsData)
  }, [state, arcsData])

  const activeHubs = useMemo(() => {
    if (!state || hubsData.length === 0) return []
    return getActiveHubs(state, hubsData)
  }, [state, hubsData])

  // Update rings from memoized value
  useEffect(() => {
    setRingsData(activeRingsMemo)
  }, [activeRingsMemo])

  useEffect(() => {
    if (globeEl.current && worldData) {
      // Closer, more centered view to reduce dead space
      globeEl.current.pointOfView({ lat: 20, lng: 0, altitude: 1.4 }, 0)
      
      // Try to make the Globe background transparent
      // Wait a bit for the Globe to fully initialize
      const timeoutId = setTimeout(() => {
        try {
          // Access the Globe's internal Three.js objects
          const globe = globeEl.current as any
          
          // Try to get the scene
          if (globe.scene) {
            const scene = typeof globe.scene === 'function' ? globe.scene() : globe.scene
            if (scene && scene.background !== undefined) {
              scene.background = null
            }
          }
          
          // Try to get the renderer and set clear color to transparent
          if (globe.renderer) {
            const renderer = typeof globe.renderer === 'function' ? globe.renderer() : globe.renderer
            if (renderer && renderer.setClearColor) {
              renderer.setClearColor(0x000000, 0) // Transparent black
            }
          }
          
          // Also try accessing via the internal _globeRenderer if it exists
          if (globe._globeRenderer) {
            const renderer = globe._globeRenderer.renderer()
            if (renderer && renderer.setClearColor) {
              renderer.setClearColor(0x000000, 0)
            }
          }
        } catch (e) {
          // If we can't access the scene, that's okay - the starfield will still show through
          // if the Globe's background is transparent via CSS
          console.log('Could not access Globe scene for background transparency:', e)
        }
      }, 200)
      
      return () => clearTimeout(timeoutId)
    }
  }, [worldData]) // Re-run when worldData loads

  if (!worldData) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        Loading world map...
      </div>
    )
  }

  // Only countries explicitly present in regionValues are "in play".
  // Everything else should render muted so the globe isn't visually noisy.
  const hasRegionValue = (iso3: string) => {
    const has = Object.prototype.hasOwnProperty.call(regionValues, iso3)
    if (iso3 === 'EGY') {
      console.log('EGY check:', has, 'value:', regionValues[iso3])
    }
    return has
  }

  const getMutedCountryColor = (isHovered: boolean) =>
    isHovered ? 'rgba(120, 180, 255, 0.22)' : 'rgba(70, 130, 200, 0.12)'

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: '#000000'
    }}>
      {/* Dynamic Starfield Background */}
      <StarfieldBackground />
      
      {/* @ts-ignore - react-globe.gl type definitions don't match actual props */}
      <Globe
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        // Remove static background - using dynamic starfield instead
        // @ts-ignore
        backgroundImageUrl=""
        style={{ position: 'absolute', zIndex: 1, top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'transparent' }}
        globeRadius={90}
        // Enhanced atmospheric glow with multiple layers
        // @ts-ignore
        atmosphereColor="#4a7fb8"
        // @ts-ignore
        atmosphereAltitude={0.2}
        // @ts-ignore
        atmosphereGlowPower={0.8}
        // @ts-ignore
        atmosphereGlowColorScale={["#1a3a5f", "#2a5a8f", "#4a7fb8", "#6a9fd8"]}
        // Better polygon rendering
        polygonsData={worldData.features}
        polygonGeoJsonGeometry={(d: any) => d.geometry}
        polygonAltitude={(d: any) => {
          const iso3 = d.id || d.properties?.ISO_A3 || d.properties?.iso_a3
          const isHovered = hoveredPolygonId === iso3
          const hasValue = hasRegionValue(iso3)
          
          // Use consistent base altitude for all countries to prevent overlap
          // Only apply hover elevation to avoid z-fighting
          const baseAltitude = 0.01 // Same for all countries
          const hoverElevation = isHovered ? 0.03 : 0 // Only hover raises it
          
          // Subtle pulse for active countries (very small to avoid overlap)
          const time = Date.now() / 2000
          const pulse = hasValue ? Math.sin(time + iso3.charCodeAt(0)) * 0.002 : 0
          
          return baseAltitude + hoverElevation + pulse
        }}
        polygonResolution={3}
        // Arcs
        arcsData={activeArcs}
        arcStartLat={(d: any) => d.startLat}
        arcStartLng={(d: any) => d.startLng}
        arcEndLat={(d: any) => d.endLat}
        arcEndLng={(d: any) => d.endLng}
        arcColor={(d: any) => {
          const colors: Record<string, string> = {
            outsourcing: '#ef4444',
            model_handoff: '#f59e0b',
            supply_chain: '#3b82f6',
            reg_arbitrage: '#8b5cf6',
            data_sharing: '#10b981'
          }
          return colors[d.type] || '#888'
        }}
        arcAltitude={(d: any) => d.baseWeight * 0.15}
        arcStroke={(d: any) => d.baseWeight * 1.5}
        arcDashLength={0.5}
        arcDashGap={0.15}
        arcDashAnimateTime={1500}
        // @ts-ignore - Add glow effect to arcs
        arcGlowPower={0.3}
        arcGlowRadiusScale={1.5}
        // Hubs (points) with enhanced visuals
        pointsData={activeHubs}
        pointLat={(d: any) => d.lat}
        pointLng={(d: any) => d.lng}
        pointColor={() => '#60a5fa'}
        pointRadius={(d: any) => {
          const baseSize = (d._size || 0.5) * 0.6
          // Pulsing effect
          const time = Date.now() / 1500
          const pulse = Math.sin(time + (d.id?.charCodeAt(0) || 0)) * 0.1 + 1
          return baseSize * pulse
        }}
        pointAltitude={(d: any) => {
          const baseAlt = 0.02
          // Slight pulsing altitude
          const time = Date.now() / 2000
          const pulse = Math.sin(time + (d.id?.charCodeAt(0) || 0)) * 0.005
          return baseAlt + pulse
        }}
        pointResolution={12}
        // @ts-ignore - Add glow to points
        pointGlowPower={0.5}
        pointGlowRadiusScale={2}
        // Rings
        ringsData={ringsData}
        ringLat={(d: any) => d.lat}
        ringLng={(d: any) => d.lng}
        ringColor={(d: any) => {
          const colors: Record<string, string> = {
            policy_shift: '#3b82f6',
            welfare_incident: '#ef4444',
            regulatory_response: '#f59e0b',
            market_change: '#8b5cf6',
            research_breakthrough: '#10b981',
            public_pressure: '#ec4899'
          }
          return colors[d.eventType] || '#888'
        }}
        ringMaxRadius={(d: any) => {
          const age = (state?.turn || 0) - d.createdTurn
          const progress = age / d.ttl
          const baseRadius = Math.max(0, 4 - (progress * 4))
          // Add pulsing effect
          const time = Date.now() / 1000
          const pulse = Math.sin(time * 2) * 0.3 + 1
          return baseRadius * pulse
        }}
        ringPropagationSpeed={0.4}
        ringRepeatPeriod={800}
        // @ts-ignore - Enhanced ring visuals
        ringGlowPower={0.6}
        ringGlowRadiusScale={1.8}
        // @ts-ignore
        onArcHover={(arc: any, prevArc: any, event?: MouseEvent) => {
          if (arc) {
            setHoveredArc(arc)
            if (event) {
              setArcTooltipPosition({ x: event.clientX, y: event.clientY })
            }
          } else {
            setHoveredArc(null)
            setArcTooltipPosition(null)
          }
        }}
        // @ts-ignore
        onRingHover={(ring: any, prevRing: any, event?: MouseEvent) => {
          if (ring) {
            setHoveredRing(ring)
            if (event) {
              setRingTooltipPosition({ x: event.clientX, y: event.clientY })
            }
          } else {
            setHoveredRing(null)
            setRingTooltipPosition(null)
          }
        }}
        polygonCapColor={(d: any) => {
          const iso3 = d.id || d.properties?.ISO_A3 || d.properties?.iso_a3
          const isHovered = hoveredPolygonId === iso3
          if (!hasRegionValue(iso3)) return getMutedCountryColor(isHovered)

          const value = regionValues[iso3] ?? 0
          
          // Different color schemes based on map mode
          if (mapMode === 'welfareDebt') {
            // Welfare Debt mode: purple/red scale
            if (value < 0.33) {
              const t = value / 0.33
              return `rgb(${Math.floor(50 + t * 100)}, ${Math.floor(20 + t * 50)}, ${Math.floor(100 + t * 155)})`
            } else if (value < 0.66) {
              const t = (value - 0.33) / 0.33
              return `rgb(${Math.floor(150 + t * 105)}, ${Math.floor(70 + t * 50)}, ${Math.floor(255 - t * 100)})`
            } else {
              const t = (value - 0.66) / 0.34
              return `rgb(${Math.floor(255 - t * 50)}, ${Math.floor(120 - t * 120)}, ${Math.floor(155 - t * 155)})`
            }
          } else if (mapMode === 'enforcement') {
            // Enforcement mode: green/yellow scale
            if (value < 0.33) {
              const t = value / 0.33
              return `rgb(${Math.floor(20 + t * 80)}, ${Math.floor(100 + t * 100)}, ${Math.floor(50 + t * 50)})`
            } else if (value < 0.66) {
              const t = (value - 0.33) / 0.33
              return `rgb(${Math.floor(100 + t * 155)}, ${Math.floor(200 + t * 55)}, ${Math.floor(100 - t * 50)})`
            } else {
              const t = (value - 0.66) / 0.34
              return `rgb(${Math.floor(255 - t * 100)}, ${Math.floor(255 - t * 100)}, ${Math.floor(50 - t * 50)})`
            }
          } else {
            // Welfare Standards mode (default): red -> yellow -> green
            // Red (0-33%) = Bad, Yellow (34-66%) = Medium, Green (67-100%) = Good
            let r, g, b
            if (value < 0.33) {
              // Dark burgundy for low/bad (0-33%) - rich, muted, less jarring
              const t = value / 0.33
              r = Math.floor(110 + t * 25)   // Dark burgundy red (110-135)
              g = Math.floor(20 + t * 15)   // Very low green (20-35)
              b = Math.floor(30 + t * 15)   // Low blue (30-45)
            } else if (value < 0.66) {
              // Yellow for medium (34-66%)
              const t = (value - 0.33) / 0.33
              r = Math.floor(139 + t * 116)   // Red component increases
              g = Math.floor(18 + t * 189)    // Green increases to yellow
              b = Math.floor(18 - t * 18)     // Blue decreases
            } else {
              // Green for high/good (67-100%)
              const t = (value - 0.66) / 0.34
              r = Math.floor(255 - t * 211)   // Red decreases
              g = Math.floor(207 + t * 48)    // Green stays high
              b = Math.floor(0 + t * 0)       // Blue stays low
            }
            
            // Add pulsing glow effect for active countries
            const time = Date.now() / 3000
            const pulse = Math.sin(time + iso3.charCodeAt(0)) * 0.08 + 1
            
            // Brighten on hover
            if (isHovered) {
              r = Math.min(255, (r + 40) * pulse)
              g = Math.min(255, (g + 40) * pulse)
              b = Math.min(255, (b + 40) * pulse)
            } else {
              r = Math.min(255, r * pulse)
              g = Math.min(255, g * pulse)
              b = Math.min(255, b * pulse)
            }
            
            return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`
          }
        }}
        polygonSideColor={(d: any) => {
          const iso3 = d.id || d.properties?.ISO_A3 || d.properties?.iso_a3
          const isHovered = hoveredPolygonId === iso3
          if (!hasRegionValue(iso3)) return isHovered ? 'rgba(120, 180, 255, 0.18)' : 'rgba(70, 130, 200, 0.10)'
          // Brighter side color on hover
          return isHovered ? 'rgba(150, 200, 255, 0.3)' : 'rgba(100, 150, 255, 0.15)'
        }}
        polygonStrokeColor={(d: any) => {
          const iso3 = d.id || d.properties?.ISO_A3 || d.properties?.iso_a3
          const isHovered = hoveredPolygonId === iso3
          const hasValue = hasRegionValue(iso3)
          
          if (!hasValue) {
            return isHovered ? 'rgba(150, 180, 220, 0.4)' : 'rgba(100, 130, 180, 0.15)'
          }
          
          // Animated glowing border for active countries
          const time = Date.now() / 2000
          const pulse = Math.sin(time + iso3.charCodeAt(0)) * 0.2 + 0.8
          
          if (isHovered) {
            // Bright animated glow on hover
            return `rgba(255, 255, 255, ${0.7 * pulse})`
          } else {
            // Subtle animated glow
            return `rgba(255, 255, 255, ${0.4 * pulse})`
          }
        }}
        polygonStrokeWidth={(d: any) => {
          const iso3 = d.id || d.properties?.ISO_A3 || d.properties?.iso_a3
          const isHovered = hoveredPolygonId === iso3
          const hasValue = hasRegionValue(iso3)
          
          if (!hasValue) return isHovered ? 1.5 : 0.8
          
          // Thicker, pulsing border for active countries
          const time = Date.now() / 2000
          const pulse = Math.sin(time + iso3.charCodeAt(0)) * 0.3 + 1
          return isHovered ? 2.5 * pulse : 1.5 * pulse
        }}
        polygonLabel={(d: any) => {
          const iso3 = d.id || d.properties?.ISO_A3 || d.properties?.iso_a3
          const name = d.properties?.name || d.properties?.NAME || 'Unknown'
          if (!hasRegionValue(iso3)) return `${name}\nStatus: Not in current simulation focus`
          const value = regionValues[iso3] ?? 0
          return `${name}\nValue: ${(value * 100).toFixed(0)}%`
        }}
        onPolygonHover={(polygon: any, _prevPolygon: any, event?: MouseEvent) => {
          if (polygon) {
            const iso3 = polygon.id || polygon.properties?.ISO_A3 || polygon.properties?.iso_a3
            const name = polygon.properties?.name || polygon.properties?.NAME || 'Unknown'
            const inPlay = hasRegionValue(iso3)
            const value = inPlay ? (regionValues[iso3] ?? 0) : 0
            
            // Set hovered polygon for visual highlighting
            setHoveredPolygonId(iso3)
            
            // Get country data and calculate grade
            const countryData = getCountryData(iso3, name)
            if (iso3 === 'EGY') {
              console.log('EGY countryData:', countryData)
              console.log('EGY inPlay:', inPlay, 'value:', value)
            }
            const baseScore = countryData?.baselineScore || 0.3
            // Combine baseline with current value (weighted average)
            const currentScore = Math.min(1, Math.max(0, baseScore + (value * 0.5)))
            const grade = inPlay ? getWelfareGrade(currentScore) : '—'
            const gradeColor = getGradeColor(grade)
            if (iso3 === 'EGY') {
              console.log('EGY grade calculation:', { baseScore, value, currentScore, grade, gradeColor })
            }
            const fastFacts = countryData?.fastFacts || generateBasicFastFacts(iso3, name)
            
            setHoveredRegion({ 
              name: countryData?.name || name, 
              iso3, 
              value: currentScore,
              grade,
              gradeColor,
              fastFacts,
              detailedContext: countryData?.detailedContext,
              sources: countryData?.sources,
              baselineScore: countryData?.baselineScore,
              baselineGrade: countryData?.baselineGrade
            })
            if (event) {
              setTooltipPosition({ x: event.clientX, y: event.clientY })
            }
            document.body.style.cursor = 'pointer'
          } else {
            setHoveredPolygonId(null)
            // Don't clear tooltip immediately - let user move mouse to tooltip to read it
            // Tooltip's onMouseLeave will handle clearing when mouse actually leaves tooltip area
            document.body.style.cursor = 'default'
          }
        }}
        // @ts-ignore - react-globe.gl doesn't have perfect TypeScript support
        onPolygonClick={(polygon: any, event?: MouseEvent) => {
          if (polygon) {
            const iso3 = polygon.id || polygon.properties?.ISO_A3 || polygon.properties?.iso_a3
            const name = polygon.properties?.name || polygon.properties?.NAME || 'Unknown'
            const value = regionValues[iso3] || 0
            
            // Check if region has trajectory (for trajectory modal)
            const hasTrajectory = state?.auditTrail.some(record => 
              record.delta?.map?.regionValues?.[iso3] !== undefined
            )
            
            if (hasTrajectory && state) {
              setClickedRegion(iso3)
            } else {
              // Show tooltip on click for touch devices
              const countryData = getCountryData(iso3, name)
              const baseScore = countryData?.baselineScore || 0.3
              const currentScore = Math.min(1, Math.max(0, baseScore + (value * 0.5)))
              const inPlay = hasRegionValue(iso3)
              const grade = inPlay ? getWelfareGrade(currentScore) : '—'
              const gradeColor = getGradeColor(grade)
              const fastFacts = countryData?.fastFacts || generateBasicFastFacts(iso3, name)
              
              setHoveredRegion({ 
                name: countryData?.name || name, 
                iso3, 
                value: currentScore,
                grade,
                gradeColor,
                fastFacts,
                detailedContext: countryData?.detailedContext,
                sources: countryData?.sources,
                baselineScore: countryData?.baselineScore
              })
              
              if (event) {
                setTooltipPosition({ x: event.clientX, y: event.clientY })
              } else {
                // Fallback position for touch events
                setTooltipPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
              }
            }
          }
        }}
      />
      {/* Overlay with info */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        padding: '12px 16px',
        borderRadius: '8px',
        color: '#fff',
        fontSize: '13px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ fontWeight: 600, marginBottom: '8px' }}>
          {mapMode === 'welfareStandards' ? 'Welfare Standards' : 
           mapMode === 'welfareDebt' ? 'Welfare Debt' : 
           'Enforcement'}
        </div>
        <div style={{ fontSize: '11px', color: '#aaa', lineHeight: '1.6' }}>
          {mapMode === 'welfareStandards' ? (
            <>
              <div style={{ color: '#ef4444' }}>🔴 Low (0-33%)</div>
              <div style={{ color: '#fbbf24' }}>🟡 Medium (34-66%)</div>
              <div style={{ color: '#4ade80' }}>🟢 High (67-100%)</div>
            </>
          ) : mapMode === 'welfareDebt' ? (
            <>
              <div style={{ color: '#4ade80' }}>🟢 Low (0-33%)</div>
              <div style={{ color: '#fbbf24' }}>🟡 Medium (34-66%)</div>
              <div style={{ color: '#ef4444' }}>🔴 High (67-100%)</div>
            </>
          ) : (
            <>
              <div style={{ color: '#4ade80' }}>🟢 Low (0-33%)</div>
              <div style={{ color: '#fbbf24' }}>🟡 Medium (34-66%)</div>
              <div style={{ color: '#ef4444' }}>🔴 High (67-100%)</div>
            </>
          )}
        </div>
      </div>

      {/* Enhanced Hover Tooltip with Fast Facts and Grade */}
      {hoveredRegion && tooltipPosition && (
        <div 
          style={{
            position: 'fixed',
            left: `${Math.min(tooltipPosition.x + 15, window.innerWidth - 420)}px`,
            top: `${Math.min(tooltipPosition.y - 10, window.innerHeight - 550)}px`,
            backgroundColor: '#000000',
            border: '2px solid ' + (hoveredRegion.gradeColor || 'rgba(255, 255, 255, 0.2)'),
            borderRadius: '10px',
            padding: '18px',
            zIndex: 10000,
            boxShadow: `0 8px 24px rgba(0, 0, 0, 0.8), 0 0 20px ${hoveredRegion.gradeColor || '#000'}40`,
            pointerEvents: 'auto',
            minWidth: '380px',
            maxWidth: '420px',
            maxHeight: '550px',
            overflowY: 'auto',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif'
          }}
          onMouseEnter={() => {
            // Keep tooltip visible when hovering over it
          }}
          onMouseLeave={() => {
            // Only hide if not clicking (let click handler manage visibility)
            setHoveredRegion(null)
            setTooltipPosition(null)
          }}
        >
          {/* Header with Country Name and Grade */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
              {hoveredRegion.name}
            </div>
            {hoveredRegion.grade && hoveredRegion.grade !== '—' && (
              <div style={{
                fontSize: '36px',
                fontWeight: 800,
                color: hoveredRegion.gradeColor,
                textShadow: `0 0 12px ${hoveredRegion.gradeColor}80`,
                lineHeight: '1'
              }}>
                {hoveredRegion.grade}
              </div>
            )}
          </div>
          
          {/* Welfare Metrics */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            marginBottom: '12px',
            padding: '10px',
            backgroundColor: '#111111',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Current Score
              </div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: hoveredRegion.gradeColor || '#fff' }}>
                {(hoveredRegion.value * 100).toFixed(0)}%
              </div>
            </div>
            {hoveredRegion.baselineScore !== undefined && (
              <div>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Baseline
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: '#aaa' }}>
                    {(hoveredRegion.baselineScore * 100).toFixed(0)}%
                  </div>
                  {hoveredRegion.baselineGrade && (
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: 700, 
                      color: getGradeColor(hoveredRegion.baselineGrade),
                      opacity: 0.8
                    }}>
                      ({hoveredRegion.baselineGrade})
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Fast Facts - Show All */}
          {hoveredRegion.fastFacts && hoveredRegion.fastFacts.length > 0 && (
            <div style={{ marginBottom: '14px' }}>
              <div style={{ 
                fontSize: '12px', 
                color: '#60a5fa', 
                marginBottom: '10px', 
                textTransform: 'uppercase', 
                letterSpacing: '0.5px', 
                fontWeight: 700
              }}>
                Key Facts
              </div>
              <ul style={{ 
                margin: 0, 
                paddingLeft: '22px', 
                fontSize: '13px', 
                color: '#ddd', 
                lineHeight: '1.8',
                listStyleType: 'disc'
              }}>
                {hoveredRegion.fastFacts.map((fact, idx) => (
                  <li key={idx} style={{ marginBottom: '10px' }}>{fact}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Detailed Context */}
          {hoveredRegion.detailedContext && (
            <div style={{ 
              marginBottom: '14px',
              padding: '12px',
              backgroundColor: 'rgba(96, 165, 250, 0.08)',
              borderRadius: '6px',
              border: '1px solid rgba(96, 165, 250, 0.2)'
            }}>
              <div style={{ 
                fontSize: '12px', 
                color: '#60a5fa', 
                marginBottom: '8px', 
                textTransform: 'uppercase', 
                letterSpacing: '0.5px', 
                fontWeight: 700
              }}>
                Context
              </div>
              <div style={{ 
                fontSize: '13px', 
                color: '#ccc', 
                lineHeight: '1.8',
                textAlign: 'justify'
              }}>
                {hoveredRegion.detailedContext}
              </div>
            </div>
          )}

          {/* Sources */}
          {hoveredRegion.sources && hoveredRegion.sources.length > 0 && (
            <div style={{ 
              marginTop: '14px',
              paddingTop: '14px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ 
                fontSize: '12px', 
                color: '#888', 
                marginBottom: '8px', 
                textTransform: 'uppercase', 
                letterSpacing: '0.5px', 
                fontWeight: 600
              }}>
                Sources
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {hoveredRegion.sources.slice(0, 3).map((source, idx) => (
                  <a
                    key={idx}
                    href={source}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '12px',
                      color: '#60a5fa',
                      textDecoration: 'none',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'block',
                      padding: '6px 0',
                      borderBottom: '1px solid rgba(96, 165, 250, 0.1)',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                  >
                    {source.replace(/^https?:\/\//, '').replace(/^www\./, '')}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Arc Hover Tooltip */}
      {hoveredArc && arcTooltipPosition && (
        <div style={{
          position: 'fixed',
          left: `${Math.min(arcTooltipPosition.x + 15, window.innerWidth - 250)}px`,
          top: `${Math.min(arcTooltipPosition.y - 10, window.innerHeight - 150)}px`,
          backgroundColor: '#000000',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          padding: '12px',
          zIndex: 10000,
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.8)',
          pointerEvents: 'none',
          minWidth: '200px',
          maxWidth: '250px'
        }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>
            {hoveredArc.label || hoveredArc.type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </div>
          {hoveredArc.triggeredByNodeId && (
            <div style={{ fontSize: '11px', color: '#60a5fa', marginTop: '4px' }}>
              Triggered by: {hoveredArc.triggeredByNodeId}
            </div>
          )}
        </div>
      )}

      {/* Ring Hover Tooltip */}
      {hoveredRing && ringTooltipPosition && (
        <div style={{
          position: 'fixed',
          left: `${Math.min(ringTooltipPosition.x + 15, window.innerWidth - 250)}px`,
          top: `${Math.min(ringTooltipPosition.y - 10, window.innerHeight - 150)}px`,
          backgroundColor: '#000000',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          padding: '12px',
          zIndex: 10000,
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.8)',
          pointerEvents: 'none',
          minWidth: '200px',
          maxWidth: '250px'
        }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>
            {hoveredRing.eventType?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Event'}
          </div>
          {hoveredRing.triggeredByNodeId && (
            <div style={{ fontSize: '11px', color: '#60a5fa', marginTop: '4px' }}>
              Triggered by: {hoveredRing.triggeredByNodeId}
            </div>
          )}
        </div>
      )}

      {/* Region Trajectory Modal */}
      {clickedRegion && state && (
        <RegionTrajectoryModal
          regionName={clickedRegion}
          state={state}
          onClose={() => setClickedRegion(null)}
        />
      )}
    </div>
  )
}
