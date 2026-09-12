/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ArcDatum, HubDatum, MapMode, RingDatum, State } from '../engine/scenarioTypes'
import { getActiveArcs, getActiveHubs, getActiveRings } from '../engine/selectors'
import { getCountryData, generateBasicFastFacts, IN_PLAY_ISO3 } from '../utils/jurisdictionData'
import {
  getJurisdictionStatus,
  type JurisdictionStatus,
  notificationStatusColor,
  notificationStatusLabel,
  regulatoryPressureColor,
} from '../utils/jurisdictionStatus'
import RegionTrajectoryModal from './RegionTrajectoryModal'

declare global {
  interface Window {
    Cesium: any
    CESIUM_BASE_URL?: string
  }
}

interface GlobePanelProps {
  regionValues: Record<string, number>
  state?: State
  mapMode?: MapMode
}

interface RegionHover {
  name: string
  iso3: string
  fastFacts: string[]
  detailedContext?: string
  sources?: string[]
  status: JurisdictionStatus
}

const ARCGIS_TERRAIN_URL =
  'https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer'
const ARCGIS_IMAGERY_URL =
  'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'

const FLOW_COLORS: Record<ArcDatum['type'], string> = {
  supply_chain: '#8bb2cb',
  regulatory_flow: '#c89a55',
  research_collaboration: '#9d8ac2',
  market_influence: '#d96f6f',
  incident_link: '#73a987',
  trust_sync: '#7ea4bf',
}

const RING_COLORS: Record<RingDatum['eventType'], string> = {
  policy_shift: '#7ea4bf',
  breach_notice: '#d96f6f',
  regulatory_response: '#c89a55',
  market_change: '#9d8ac2',
  research_breakthrough: '#73a987',
  public_pressure: '#b77b9d',
  leak_site: '#c95f5f',
  customer_report: '#78aeb8',
}

function valueColor(mode: MapMode, value: number): string {
  if (mode === 'disclosurePosture') {
    if (value < 0.33) return '#8f4f4f'
    if (value < 0.66) return '#a18452'
    return '#5f8b72'
  }
  if (value < 0.33) return '#5f8b72'
  if (value < 0.66) return '#a18452'
  return '#8f4f4f'
}

function getProperty(entity: any, names: string[]): string {
  for (const name of names) {
    const property = entity?.properties?.[name]
    if (property !== undefined) {
      const value = property?.getValue ? property.getValue() : property
      if (value !== undefined && value !== null && String(value).trim()) return String(value)
    }
  }
  return ''
}

function getIso3(entity: any): string {
  const fromProperties = getProperty(entity, ['ISO_A3', 'iso_a3', 'ADM0_A3', 'ISO3'])
  if (fromProperties && fromProperties !== '-99') return fromProperties.toUpperCase()
  const entityId = String(entity?.id ?? '').toUpperCase()
  return /^[A-Z]{3}$/.test(entityId) ? entityId : ''
}

function getCountryName(entity: any): string {
  return getProperty(entity, ['name', 'NAME', 'ADMIN', 'admin']) || 'Unknown jurisdiction'
}

function buildArcPositions(Cesium: any, arc: ArcDatum): any[] {
  const start = Cesium.Cartographic.fromDegrees(arc.startLng, arc.startLat)
  const end = Cesium.Cartographic.fromDegrees(arc.endLng, arc.endLat)
  const geodesic = new Cesium.EllipsoidGeodesic(start, end)
  const positions: any[] = []
  const peak = 180_000 + Math.min(650_000, arc.baseWeight * 280_000)

  for (let index = 0; index <= 40; index += 1) {
    const fraction = index / 40
    const point = geodesic.interpolateUsingFraction(fraction)
    const height = Math.sin(Math.PI * fraction) * peak
    positions.push(Cesium.Cartesian3.fromRadians(point.longitude, point.latitude, height))
  }
  return positions
}

function legendRows(mode: MapMode) {
  if (mode === 'disclosurePosture') {
    return [
      ['Low', '#8f4f4f', '0–33%'],
      ['Medium', '#a18452', '34–66%'],
      ['High', '#5f8b72', '67–100%'],
    ]
  }
  return [
    ['Low', '#5f8b72', '0–33%'],
    ['Medium', '#a18452', '34–66%'],
    ['High', '#8f4f4f', '67–100%'],
  ]
}

export default function GlobePanel({
  regionValues,
  state,
  mapMode = 'disclosurePosture',
}: GlobePanelProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const viewerRef = useRef<any>(null)
  const countrySourceRef = useRef<any>(null)
  const handlerRef = useRef<any>(null)
  const stateRef = useRef<State | undefined>(state)
  const regionValuesRef = useRef(regionValues)

  const [allArcs, setAllArcs] = useState<ArcDatum[]>([])
  const [allHubs, setAllHubs] = useState<HubDatum[]>([])
  const [ready, setReady] = useState(false)
  const [terrainState, setTerrainState] = useState<'loading' | 'streaming' | 'fallback' | 'error'>('loading')
  const [hoveredRegion, setHoveredRegion] = useState<RegionHover | null>(null)
  const [hoveredArc, setHoveredArc] = useState<ArcDatum | null>(null)
  const [hoveredRing, setHoveredRing] = useState<RingDatum | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null)
  const [clickedRegion, setClickedRegion] = useState<string | null>(null)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    regionValuesRef.current = regionValues
  }, [regionValues])

  useEffect(() => {
    Promise.all([
      fetch(`${import.meta.env.BASE_URL}flows.json`).then((response) => response.json()),
      fetch(`${import.meta.env.BASE_URL}hubs.json`).then((response) => response.json()),
    ])
      .then(([arcs, hubs]) => {
        setAllArcs(arcs as ArcDatum[])
        setAllHubs(hubs as HubDatum[])
      })
      .catch((error) => console.error('Failed to load map flow data:', error))
  }, [])

  const activeArcs = useMemo(() => {
    if (!state || allArcs.length === 0) return []
    return getActiveArcs(state, allArcs)
  }, [state, allArcs])

  const activeHubs = useMemo(() => {
    if (!state || allHubs.length === 0) return []
    return getActiveHubs(state, allHubs)
  }, [state, allHubs])

  const activeRings = useMemo(() => (state ? getActiveRings(state) : []), [state])

  const showRegionAt = (iso3: string, name: string, x: number, y: number) => {
    const currentState = stateRef.current
    const values = regionValuesRef.current
    if (!IN_PLAY_ISO3.has(iso3) || !Object.prototype.hasOwnProperty.call(values, iso3)) {
      setHoveredRegion(null)
      setTooltipPosition(null)
      return
    }

    const value = values[iso3] ?? 0
    const status = getJurisdictionStatus(iso3, value, currentState, name)
    if (!status) return
    const countryData = getCountryData(iso3, name)
    setHoveredRegion({
      name: countryData?.name || name,
      iso3,
      fastFacts: countryData?.fastFacts || generateBasicFastFacts(iso3, name),
      detailedContext: countryData?.detailedContext,
      sources: countryData?.sources,
      status,
    })
    setTooltipPosition({ x, y })
  }

  useEffect(() => {
    let disposed = false
    let viewer: any = null

    const initialize = async () => {
      const Cesium = window.Cesium
      if (!Cesium || !containerRef.current) {
        setTerrainState('error')
        return
      }

      let terrainProvider: any
      try {
        terrainProvider = await Cesium.ArcGISTiledElevationTerrainProvider.fromUrl(ARCGIS_TERRAIN_URL)
        if (!disposed) setTerrainState('streaming')
      } catch (error) {
        console.warn('Cesium terrain unavailable; using ellipsoid fallback.', error)
        terrainProvider = new Cesium.EllipsoidTerrainProvider()
        if (!disposed) setTerrainState('fallback')
      }

      if (disposed || !containerRef.current) return

      viewer = new Cesium.Viewer(containerRef.current, {
        animation: false,
        baseLayer: false,
        baseLayerPicker: false,
        fullscreenButton: false,
        geocoder: false,
        homeButton: false,
        infoBox: false,
        navigationHelpButton: false,
        sceneModePicker: false,
        selectionIndicator: false,
        timeline: false,
        terrainProvider,
      })
      viewerRef.current = viewer

      viewer.scene.globe.enableLighting = false
      viewer.scene.globe.depthTestAgainstTerrain = true
      viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#07111b')
      viewer.scene.highDynamicRange = true
      viewer.scene.screenSpaceCameraController.minimumZoomDistance = 100
      viewer.scene.screenSpaceCameraController.maximumZoomDistance = 30_000_000
      viewer.resolutionScale = Math.min(window.devicePixelRatio || 1, 1.5)

      viewer.scene.renderError.addEventListener((_scene: any, error: unknown) => {
        console.error('Cesium render error:', error)
        setTerrainState('error')
      })

      try {
        const imageryProvider = await Cesium.ArcGisMapServerImageryProvider.fromUrl(ARCGIS_IMAGERY_URL)
        if (!disposed && viewer && !viewer.isDestroyed()) {
          const layer = viewer.imageryLayers.addImageryProvider(imageryProvider)
          layer.brightness = 0.72
          layer.contrast = 1.1
          layer.saturation = 0.62
        }
      } catch (error) {
        console.warn('ArcGIS World Imagery could not be loaded.', error)
      }

      try {
        const countries = await Cesium.GeoJsonDataSource.load(
          `${import.meta.env.BASE_URL}world.geojson`,
          { clampToGround: true }
        )
        if (!disposed && viewer && !viewer.isDestroyed()) {
          viewer.dataSources.add(countries)
          countrySourceRef.current = countries
        }
      } catch (error) {
        console.warn('Country overlay could not be loaded.', error)
      }

      if (disposed || !viewer || viewer.isDestroyed()) return

      const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
      handler.setInputAction((movement: any) => {
        const picked = viewer.scene.pick(movement.endPosition)
        const entity = picked?.id
        const rect = viewer.scene.canvas.getBoundingClientRect()
        const x = rect.left + movement.endPosition.x
        const y = rect.top + movement.endPosition.y

        if (entity?.__immediacyArc) {
          setHoveredArc(entity.__immediacyArc as ArcDatum)
          setHoveredRing(null)
          setHoveredRegion(null)
          setTooltipPosition({ x, y })
          viewer.scene.canvas.style.cursor = 'default'
          return
        }
        if (entity?.__immediacyRing) {
          setHoveredRing(entity.__immediacyRing as RingDatum)
          setHoveredArc(null)
          setHoveredRegion(null)
          setTooltipPosition({ x, y })
          viewer.scene.canvas.style.cursor = 'default'
          return
        }
        if (entity?.__immediacyIso3) {
          const iso3 = String(entity.__immediacyIso3)
          const name = String(entity.__immediacyName || 'Unknown jurisdiction')
          showRegionAt(iso3, name, x, y)
          setHoveredArc(null)
          setHoveredRing(null)
          viewer.scene.canvas.style.cursor = IN_PLAY_ISO3.has(iso3) ? 'pointer' : 'default'
          return
        }

        setHoveredRegion(null)
        setHoveredArc(null)
        setHoveredRing(null)
        setTooltipPosition(null)
        viewer.scene.canvas.style.cursor = 'default'
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

      handler.setInputAction((movement: any) => {
        const picked = viewer.scene.pick(movement.position)
        const entity = picked?.id
        if (!entity?.__immediacyIso3) return

        const iso3 = String(entity.__immediacyIso3)
        const name = String(entity.__immediacyName || 'Unknown jurisdiction')
        const currentState = stateRef.current
        const values = regionValuesRef.current
        if (!currentState || !IN_PLAY_ISO3.has(iso3) || !Object.prototype.hasOwnProperty.call(values, iso3)) return

        const hasTrajectory = currentState.auditTrail.some(
          (record) => record.delta?.map?.regionValues?.[iso3] !== undefined
        )
        if (hasTrajectory) {
          setClickedRegion(iso3)
          return
        }

        const rect = viewer.scene.canvas.getBoundingClientRect()
        showRegionAt(iso3, name, rect.left + movement.position.x, rect.top + movement.position.y)
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

      handlerRef.current = handler

      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(0, 20, 10_500_000),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-90),
          roll: 0,
        },
      })
      setReady(true)
    }

    void initialize()

    return () => {
      disposed = true
      if (handlerRef.current && !handlerRef.current.isDestroyed()) handlerRef.current.destroy()
      handlerRef.current = null
      countrySourceRef.current = null
      viewerRef.current = null
      if (viewer && !viewer.isDestroyed()) viewer.destroy()
    }
  }, [])

  useEffect(() => {
    if (!ready || !state) return
    const Cesium = window.Cesium
    const viewer = viewerRef.current
    if (!Cesium || !viewer || viewer.isDestroyed()) return

    viewer.entities.removeAll()

    const countrySource = countrySourceRef.current
    if (countrySource) {
      for (const entity of countrySource.entities.values) {
        const iso3 = getIso3(entity)
        const name = getCountryName(entity)
        const inPlay = Boolean(iso3) && IN_PLAY_ISO3.has(iso3) && Object.prototype.hasOwnProperty.call(regionValues, iso3)
        const value = inPlay ? regionValues[iso3] ?? 0 : 0
        entity.__immediacyIso3 = iso3
        entity.__immediacyName = name
        if (entity.polygon) {
          entity.polygon.material = inPlay
            ? Cesium.Color.fromCssColorString(valueColor(mapMode, value)).withAlpha(0.42)
            : Cesium.Color.fromCssColorString('#52606d').withAlpha(0.06)
          entity.polygon.outline = inPlay
          entity.polygon.outlineColor = inPlay
            ? Cesium.Color.fromCssColorString('#b6c1ca').withAlpha(0.65)
            : Cesium.Color.TRANSPARENT
        }
      }
    }

    for (const arc of activeArcs) {
      const entity = viewer.entities.add({
        polyline: {
          positions: buildArcPositions(Cesium, arc),
          width: Math.max(1.5, Math.min(4, arc.baseWeight * 1.3)),
          material: Cesium.Color.fromCssColorString(FLOW_COLORS[arc.type] || '#8b949e').withAlpha(0.82),
          arcType: Cesium.ArcType.NONE,
        },
      })
      entity.__immediacyArc = arc
    }

    for (const hub of activeHubs) {
      const entity = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(hub.lng, hub.lat, 1200),
        point: {
          pixelSize: 7 + Math.round((hub._size || 0.5) * 4),
          color: Cesium.Color.fromCssColorString('#7ea4bf'),
          outlineColor: Cesium.Color.fromCssColorString('#e3edf3'),
          outlineWidth: 1,
          heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        label: {
          text: hub.name,
          font: '500 11px IBM Plex Sans, sans-serif',
          fillColor: Cesium.Color.fromCssColorString('#dfe5ea'),
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 3,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(0, -16),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          showBackground: true,
          backgroundColor: Cesium.Color.fromCssColorString('#080b0e').withAlpha(0.76),
          backgroundPadding: new Cesium.Cartesian2(5, 3),
        },
      })
      entity.__immediacyHub = hub
    }

    for (const ring of activeRings) {
      const age = Math.max(0, state.turn - ring.createdTurn)
      const progress = Math.min(1, age / Math.max(1, ring.ttl))
      const radius = 90_000 + (1 - progress) * 190_000
      const color = Cesium.Color.fromCssColorString(RING_COLORS[ring.eventType] || '#8b949e')
      const entity = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(ring.lng, ring.lat),
        ellipse: {
          semiMajorAxis: radius,
          semiMinorAxis: radius,
          material: color.withAlpha(0.05),
          outline: true,
          outlineColor: color.withAlpha(0.9),
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
      })
      entity.__immediacyRing = ring
    }
  }, [ready, state, regionValues, mapMode, activeArcs, activeHubs, activeRings])

  const title =
    mapMode === 'disclosurePosture'
      ? 'Disclosure posture'
      : mapMode === 'disclosureDebt'
        ? 'Disclosure debt'
        : 'Regulatory pressure'

  const rows = legendRows(mapMode)

  return (
    <div className="immediacy-globe" style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: '#000' }}>
      <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />

      <div
        className="immediacy-map-legend"
        style={{ position: 'absolute', top: '14px', left: '14px', zIndex: 20, width: '176px', padding: '10px 11px', borderRadius: '5px' }}
      >
        <div style={{ fontSize: '11px', fontWeight: 600, color: '#f2f5f7', marginBottom: '7px' }}>{title}</div>
        <div style={{ display: 'grid', gap: '5px' }}>
          {rows.map(([label, color, range]) => (
            <div key={label} style={{ display: 'grid', gridTemplateColumns: '10px 1fr auto', alignItems: 'center', gap: '7px', fontSize: '10px', color: '#aeb7c0' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: color }} />
              <span>{label}</span>
              <span style={{ fontFamily: '"IBM Plex Mono", monospace', color: '#7f8993' }}>{range}</span>
            </div>
          ))}
        </div>
      </div>

      <div
        className="immediacy-map-badge"
        style={{ position: 'absolute', top: '14px', right: '14px', zIndex: 20, padding: '5px 7px', borderRadius: '4px', fontFamily: '"IBM Plex Mono", monospace', fontSize: '9px', color: '#aeb7c0', textTransform: 'uppercase', letterSpacing: '0.08em' }}
      >
        {terrainState === 'streaming' ? 'terrain streamed' : terrainState} · {activeArcs.length} flows · {activeRings.length} events
      </div>

      {terrainState === 'error' && (
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', zIndex: 15, pointerEvents: 'none' }}>
          <div className="immediacy-map-tooltip" style={{ padding: '12px 14px', borderRadius: '5px', color: '#c9d1d9', fontSize: '12px' }}>
            3D map unavailable. The decision engine is still running.
          </div>
        </div>
      )}

      {hoveredRegion && tooltipPosition && (
        <div
          className="immediacy-map-tooltip"
          style={{
            position: 'fixed',
            left: `${Math.min(tooltipPosition.x + 14, window.innerWidth - 400)}px`,
            top: `${Math.max(12, Math.min(tooltipPosition.y - 12, window.innerHeight - 510))}px`,
            zIndex: 10000,
            width: '370px',
            maxHeight: '500px',
            overflowY: 'auto',
            padding: '14px',
            borderRadius: '6px',
          }}
          onMouseLeave={() => {
            setHoveredRegion(null)
            setTooltipPosition(null)
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start', paddingBottom: '10px', borderBottom: '1px solid #20262d' }}>
            <div>
              <div style={{ fontSize: '17px', fontWeight: 600, color: '#f2f5f7' }}>{hoveredRegion.name}</div>
              <div style={{ marginTop: '3px', fontFamily: '"IBM Plex Mono", monospace', fontSize: '10px', color: '#8b949e' }}>{hoveredRegion.iso3}</div>
            </div>
            <div
              style={{
                fontSize: '10px',
                fontWeight: 600,
                color: notificationStatusColor(hoveredRegion.status.notificationStatus),
                borderBottom: `2px solid ${notificationStatusColor(hoveredRegion.status.notificationStatus)}`,
                paddingBottom: '2px',
              }}
            >
              {notificationStatusLabel(hoveredRegion.status.notificationStatus)}
            </div>
          </div>

          <div style={{ marginTop: '10px', paddingBottom: '10px', borderBottom: '1px solid #20262d', fontSize: '11px', color: '#c5ccd3' }}>
            <span style={{ color: '#7f8993', marginRight: '6px' }}>Clock</span>
            {hoveredRegion.status.clockHint}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '11px 0', borderBottom: '1px solid #20262d' }}>
            <div>
              <div style={{ fontSize: '10px', color: '#7f8993' }}>Confidence</div>
              <div style={{ marginTop: '2px', fontFamily: '"IBM Plex Mono", monospace', fontSize: '20px', fontWeight: 500, color: '#8bb2cb' }}>
                {(hoveredRegion.status.confidence * 100).toFixed(0)}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#7f8993' }}>Regulatory pressure</div>
              <div style={{ marginTop: '2px', fontFamily: '"IBM Plex Mono", monospace', fontSize: '20px', fontWeight: 500, color: regulatoryPressureColor(hoveredRegion.status.regulatoryPressure) }}>
                {(hoveredRegion.status.regulatoryPressure * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          {hoveredRegion.fastFacts.length > 0 && (
            <div style={{ paddingTop: '11px' }}>
              <div style={{ fontSize: '10px', fontWeight: 600, color: '#8bb2cb', marginBottom: '7px' }}>Disclosure & notice</div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '11px', color: '#c5ccd3', lineHeight: 1.55 }}>
                {hoveredRegion.fastFacts.map((fact, index) => (
                  <li key={index} style={{ marginBottom: '6px' }}>{fact}</li>
                ))}
              </ul>
            </div>
          )}

          {hoveredRegion.detailedContext && (
            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #20262d', fontSize: '11px', color: '#aeb7c0', lineHeight: 1.55 }}>
              {hoveredRegion.detailedContext}
            </div>
          )}

          {hoveredRegion.sources && hoveredRegion.sources.length > 0 && (
            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #20262d', display: 'grid', gap: '5px' }}>
              <div style={{ fontSize: '10px', color: '#7f8993' }}>Sources</div>
              {hoveredRegion.sources.slice(0, 3).map((source) => (
                <a key={source} href={source} target="_blank" rel="noopener noreferrer" style={{ fontSize: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {source.replace(/^https?:\/\//, '').replace(/^www\./, '')}
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {hoveredArc && tooltipPosition && (
        <div
          className="immediacy-map-tooltip"
          style={{ position: 'fixed', left: `${Math.min(tooltipPosition.x + 14, window.innerWidth - 270)}px`, top: `${Math.min(tooltipPosition.y - 10, window.innerHeight - 120)}px`, zIndex: 10000, width: '250px', padding: '10px 11px', borderRadius: '5px', pointerEvents: 'none' }}
        >
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#f2f5f7' }}>{hoveredArc.label}</div>
          <div style={{ marginTop: '4px', fontSize: '10px', color: '#8b949e' }}>{hoveredArc.type.replaceAll('_', ' ')}</div>
        </div>
      )}

      {hoveredRing && tooltipPosition && (
        <div
          className="immediacy-map-tooltip"
          style={{ position: 'fixed', left: `${Math.min(tooltipPosition.x + 14, window.innerWidth - 270)}px`, top: `${Math.min(tooltipPosition.y - 10, window.innerHeight - 120)}px`, zIndex: 10000, width: '250px', padding: '10px 11px', borderRadius: '5px', pointerEvents: 'none' }}
        >
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#f2f5f7' }}>{hoveredRing.eventType.replaceAll('_', ' ')}</div>
          {hoveredRing.triggeredByNodeId && <div style={{ marginTop: '4px', fontSize: '10px', color: '#8b949e' }}>Triggered by {hoveredRing.triggeredByNodeId}</div>}
        </div>
      )}

      {clickedRegion && state && (
        <RegionTrajectoryModal regionName={clickedRegion} state={state} onClose={() => setClickedRegion(null)} />
      )}
    </div>
  )
}
