import { useState } from 'react'
import { State } from '../engine/scenarioTypes'
import { WONDERS, Wonder } from '../utils/wonders'

interface WonderPanelProps {
  state: State
}

export default function WonderPanel({ state }: WonderPanelProps) {
  const completedWonders = state.completedWonders || []
  const [hoveredWonder, setHoveredWonder] = useState<string | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null)

  if (completedWonders.length === 0) {
    return null
  }

  const getWonderData = (wonderId: string): Wonder | null => {
    return WONDERS.find(w => w.id === wonderId) || null
  }

  const formatEffect = (wonder: Wonder): string[] => {
    const effects: string[] = []
    if (wonder.effect.metrics?.measured) {
      Object.entries(wonder.effect.metrics.measured).forEach(([key, value]) => {
        const sign = value > 0 ? '+' : ''
        effects.push(`${key}: ${sign}${(value * 100).toFixed(0)}%`)
      })
    }
    if (wonder.effect.metrics?.unmeasured) {
      Object.entries(wonder.effect.metrics.unmeasured).forEach(([key, value]) => {
        const sign = value > 0 ? '+' : ''
        effects.push(`${key}: ${sign}${(value * 100).toFixed(0)}%`)
      })
    }
    if (wonder.effect.map?.regionValues) {
      const regions = Object.keys(wonder.effect.map.regionValues).length
      if (regions > 0) {
        effects.push(`Regional boost: +${(wonder.effect.map.regionValues[Object.keys(wonder.effect.map.regionValues)[0]]! * 100).toFixed(0)}% to ${regions} regions`)
      }
    }
    return effects
  }

  return (
    <>
      <div style={{
        padding: '16px',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        marginBottom: '16px'
      }}>
        <h3 style={{
          fontSize: '14px',
          fontWeight: 600,
          color: '#fff',
          margin: '0 0 12px 0',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Wonders
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {completedWonders.map((wonderId) => {
            const wonder = getWonderData(wonderId)
            if (!wonder) return null
            
            const icon = wonder.icon
            const effects = formatEffect(wonder)
            
            return (
              <div
                key={wonderId}
                style={{
                  padding: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'center',
                  cursor: 'help',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (effects.length > 0) {
                    const rect = e.currentTarget.getBoundingClientRect()
                    setHoveredWonder(wonderId)
                    setTooltipPosition({ x: rect.right + 10, y: rect.top })
                  }
                }}
                onMouseLeave={() => {
                  setHoveredWonder(null)
                  setTooltipPosition(null)
                }}
              >
                {icon && (
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    border: '2px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: '0 2px 6px rgba(255, 255, 255, 0.1)'
                  }}>
                    <img 
                      src={icon} 
                      alt={wonder.name}
                      loading="lazy"
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#fff',
                    marginBottom: '4px'
                  }}>
                    {wonder.name}
                  </div>
                  {wonder.location.country && (
                    <div style={{
                      fontSize: '11px',
                      color: '#aaa',
                      lineHeight: '1.4'
                    }}>
                      {wonder.location.country}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredWonder && tooltipPosition && (() => {
        const wonder = getWonderData(hoveredWonder)
        if (!wonder) return null
        const effects = formatEffect(wonder)
        
        return (
          <div 
            style={{
              position: 'fixed',
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`,
              backgroundColor: '#111111',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '12px',
              maxWidth: '280px',
              zIndex: 10000,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
              pointerEvents: 'none'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
              {wonder.name}
            </div>
            <div style={{ fontSize: '11px', color: '#bbb', lineHeight: '1.5', marginBottom: '8px' }}>
              {wonder.description}
            </div>
            {effects.length > 0 && (
              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#4ade80', marginBottom: '4px' }}>
                  Global Effect:
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '10px', color: '#aaa', lineHeight: '1.6' }}>
                  {effects.map((effect, idx) => (
                    <li key={idx}>{effect}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )
      })()}
    </>
  )
}
