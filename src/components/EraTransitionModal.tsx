import { useEffect, useState } from 'react'
import { Scenario, State } from '../engine/scenarioTypes'
import { calculateMeasuredSuccessIndex, calculateGovernanceDebtIndex } from '../engine/scoring'

interface EraTransitionModalProps {
  phaseId: string
  scenario: Scenario
  state?: State
  onClose: () => void
}

export default function EraTransitionModal({ phaseId, scenario, state, onClose }: EraTransitionModalProps) {
  const phase = scenario?.phases?.find(p => p.id === phaseId)
  
  // Calculate statistics if state is available
  const successIndex = state ? calculateMeasuredSuccessIndex(state.metrics.measured) : 0
  const debtIndex = state ? calculateGovernanceDebtIndex(state.metrics.unmeasured) : 0
  const avgWelfare = state && state.map?.regionValues ? Object.values(state.map.regionValues).reduce((a, b) => a + b, 0) / Object.values(state.map.regionValues).length : 0
  const highWelfareCountries = state && state.map?.regionValues ? Object.values(state.map.regionValues).filter(v => v > 0.7).length : 0

  useEffect(() => {
    // If phase not found, close immediately
    if (!phase || !scenario) {
      console.warn('EraTransitionModal: Phase or scenario not found', { phaseId, phase, scenario })
      onClose()
      return
    }
    
    // Auto-close after 5 seconds (increased from 4)
    const closeTimer = setTimeout(() => {
      onClose()
    }, 5000)

    return () => {
      clearTimeout(closeTimer)
    }
  }, [onClose, phase, scenario, phaseId])

  if (!phase || !scenario) {
    return null
  }

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
      `}</style>
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #000000 0%, #1a1a2e 50%, #000000 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 25000,
          opacity: 1,
          pointerEvents: 'auto'
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose()
          }
        }}
      >
        {/* Animated background elements */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(74, 222, 128, 0.1) 0%, transparent 70%)',
          animation: 'pulse 3s ease-in-out infinite'
        }} />
        
        <div 
          style={{
            backgroundColor: '#000000',
            borderRadius: '20px',
            border: '2px solid rgba(74, 222, 128, 0.3)',
            maxWidth: '800px',
            width: '90%',
            padding: '48px',
            textAlign: 'center',
            boxShadow: '0 8px 48px rgba(74, 222, 128, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            position: 'relative',
            overflow: 'visible',
            zIndex: 25001
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Decorative corner elements */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '60px',
            height: '60px',
            borderTop: '2px solid rgba(74, 222, 128, 0.5)',
            borderLeft: '2px solid rgba(74, 222, 128, 0.5)',
            borderTopLeftRadius: '20px'
          }} />
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '60px',
            height: '60px',
            borderTop: '2px solid rgba(74, 222, 128, 0.5)',
            borderRight: '2px solid rgba(74, 222, 128, 0.5)',
            borderTopRightRadius: '20px'
          }} />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '60px',
            height: '60px',
            borderBottom: '2px solid rgba(74, 222, 128, 0.5)',
            borderLeft: '2px solid rgba(74, 222, 128, 0.5)',
            borderBottomLeftRadius: '20px'
          }} />
          <div style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '60px',
            height: '60px',
            borderBottom: '2px solid rgba(74, 222, 128, 0.5)',
            borderRight: '2px solid rgba(74, 222, 128, 0.5)',
            borderBottomRightRadius: '20px'
          }} />

          {/* Phase indicator */}
          <div style={{
            fontSize: '12px',
            color: '#4ade80',
            textTransform: 'uppercase',
            letterSpacing: '3px',
            marginBottom: '20px',
            fontWeight: 600
          }}>
            Phase Transition
          </div>
          
          {/* Phase title */}
          <div style={{
            fontSize: '48px',
            fontWeight: 700,
            color: '#fff',
            marginBottom: '16px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            textShadow: '0 0 20px rgba(74, 222, 128, 0.5)'
          }}>
            {phase.title}
          </div>

          {/* Phase description */}
          <div style={{
            fontSize: '18px',
            color: '#bbb',
            lineHeight: '1.7',
            marginBottom: '40px',
            maxWidth: '600px',
            margin: '0 auto 40px auto'
          }}>
            {phase.description}
          </div>

          {/* Statistics section */}
          {state && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '20px',
              marginBottom: '32px',
              padding: '24px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '11px',
                  color: '#888',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '8px'
                }}>
                  Success Index
                </div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  color: '#4ade80',
                  marginBottom: '4px'
                }}>
                  {(successIndex * 100).toFixed(0)}%
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '11px',
                  color: '#888',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '8px'
                }}>
                  Debt Index
                </div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  color: '#fb923c',
                  marginBottom: '4px'
                }}>
                  {(debtIndex * 100).toFixed(0)}%
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '11px',
                  color: '#888',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '8px'
                }}>
                  Avg Welfare
                </div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  color: '#60a5fa',
                  marginBottom: '4px'
                }}>
                  {(avgWelfare * 100).toFixed(0)}%
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '11px',
                  color: '#888',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '8px'
                }}>
                  Turn {state.turn}
                </div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  color: '#a78bfa',
                  marginBottom: '4px'
                }}>
                  {highWelfareCountries} Countries
                </div>
                <div style={{
                  fontSize: '10px',
                  color: '#666',
                  marginTop: '4px'
                }}>
                  High welfare (&gt;70%)
                </div>
              </div>
            </div>
          )}

          {/* Progress indicator */}
          <div style={{
            marginBottom: '32px',
            padding: '16px',
            backgroundColor: 'rgba(74, 222, 128, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(74, 222, 128, 0.2)'
          }}>
            <div style={{
              fontSize: '14px',
              color: '#4ade80',
              fontWeight: 600,
              marginBottom: '8px'
            }}>
              Progress: {scenario.phases.findIndex(p => p.id === phaseId) + 1} of {scenario.phases.length} Phases
            </div>
            <div style={{
              width: '100%',
              height: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${((scenario.phases.findIndex(p => p.id === phaseId) + 1) / scenario.phases.length) * 100}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #4ade80 0%, #22c55e 100%)',
                transition: 'width 0.5s ease-in-out',
                boxShadow: '0 0 10px rgba(74, 222, 128, 0.5)'
              }} />
            </div>
          </div>

          {/* Continue button */}
          <button
            onClick={onClose}
            style={{
              padding: '14px 32px',
              fontSize: '16px',
              fontWeight: 600,
              backgroundColor: '#4ade80',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(74, 222, 128, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#22c55e'
              e.currentTarget.style.transform = 'scale(1.05)'
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(74, 222, 128, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#4ade80'
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(74, 222, 128, 0.3)'
            }}
          >
            Continue to Next Phase
          </button>
          <div style={{
            fontSize: '12px',
            color: '#666',
            fontStyle: 'italic',
            marginTop: '12px'
          }}>
            (Auto-closes in 5 seconds)
          </div>
        </div>
      </div>
    </>
  )
}
