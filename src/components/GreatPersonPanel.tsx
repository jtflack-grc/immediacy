import { useState } from 'react'
import { State } from '../engine/scenarioTypes'
import { GREAT_PEOPLE, GreatPerson } from '../utils/greatPeople'

interface GreatPersonPanelProps {
  state: State
}

export default function GreatPersonPanel({ state }: GreatPersonPanelProps) {
  const greatPeople = state.greatPeople || []
  const [hoveredPerson, setHoveredPerson] = useState<string | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null)

  if (greatPeople.length === 0) {
    return null
  }

  const getPersonData = (personId: string): GreatPerson | null => {
    return GREAT_PEOPLE.find(p => p.id === personId) || null
  }

  const formatEffect = (person: GreatPerson): string[] => {
    const effects: string[] = []
    if (person.effect.metrics?.measured) {
      Object.entries(person.effect.metrics.measured).forEach(([key, value]) => {
        const sign = value > 0 ? '+' : ''
        effects.push(`${key}: ${sign}${(value * 100).toFixed(0)}%`)
      })
    }
    if (person.effect.metrics?.unmeasured) {
      Object.entries(person.effect.metrics.unmeasured).forEach(([key, value]) => {
        const sign = value > 0 ? '+' : ''
        effects.push(`${key}: ${sign}${(value * 100).toFixed(0)}%`)
      })
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
          Great People
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {greatPeople.map((person) => {
            const personData = getPersonData(person.id)
            const icon = personData?.icon
            const effects = personData ? formatEffect(personData) : []
            
            return (
              <div
                key={person.id}
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
                  if (personData && effects.length > 0) {
                    const rect = e.currentTarget.getBoundingClientRect()
                    setHoveredPerson(person.id)
                    setTooltipPosition({ x: rect.right + 10, y: rect.top })
                  }
                }}
                onMouseLeave={() => {
                  setHoveredPerson(null)
                  setTooltipPosition(null)
                }}
              >
                {icon && (
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    flexShrink: 0,
                    border: '2px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: '0 2px 6px rgba(255, 255, 255, 0.1)'
                  }}>
                    <img 
                      src={icon} 
                      alt={person.title}
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
                    {person.title}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#aaa',
                    lineHeight: '1.4'
                  }}>
                    Unlocked on Turn {person.unlockedTurn}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredPerson && tooltipPosition && (() => {
        const personData = getPersonData(hoveredPerson)
        if (!personData) return null
        const effects = formatEffect(personData)
        
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
              {personData.title}
            </div>
            <div style={{ fontSize: '11px', color: '#bbb', lineHeight: '1.5', marginBottom: '8px' }}>
              {personData.description}
            </div>
            {effects.length > 0 && (
              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#4ade80', marginBottom: '4px' }}>
                  Abilities:
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
