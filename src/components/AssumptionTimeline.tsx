import { State } from '../engine/scenarioTypes'
import { getDegradedAssumptions } from '../engine/selectors'

interface AssumptionTimelineProps {
  state: State
  onClose: () => void
}

export default function AssumptionTimeline({ state, onClose }: AssumptionTimelineProps) {
  const degradedAssumptions = getDegradedAssumptions(state)
  
  // Build timeline for each assumption
  const buildTimeline = () => {
    const timeline: Array<{
      turn: number
      assumption: string
      strength: number
      event: string
    }> = []

    // Track assumptions across audit trail
    const assumptionMap = new Map<string, { strength: number; createdTurn: number; lastReaffirmed?: number }>()
    
    state.auditTrail.forEach(record => {
      // Extract assumptions from record
      if (record.assumptions) {
        const assumptions = record.assumptions.split(',').map(a => a.trim()).filter(a => a)
        assumptions.forEach(assumption => {
          if (!assumptionMap.has(assumption)) {
            assumptionMap.set(assumption, { strength: 1.0, createdTurn: record.turn })
          }
        })
      }
    })

    // Build timeline entries
    state.auditTrail.forEach(record => {
      if (record.assumptions) {
        const assumptions = record.assumptions.split(',').map(a => a.trim()).filter(a => a)
        assumptions.forEach(assumption => {
          const info = assumptionMap.get(assumption)
          if (info) {
            // Calculate strength based on turns since creation/reaffirmation
            const turnsSinceCreation = record.turn - info.createdTurn
            const strength = Math.max(0, 1.0 - (turnsSinceCreation * 0.1)) // Decay 10% per turn
            
            timeline.push({
              turn: record.turn,
              assumption,
              strength,
              event: `Reaffirmed in "${record.nodeTitle}"`
            })
            
            info.lastReaffirmed = record.turn
          }
        })
      }
    })

    // Add current state
    state.memory.assumptionsBank.forEach(assumption => {
      timeline.push({
        turn: state.turn,
        assumption: assumption.text,
        strength: assumption.strength,
        event: 'Current State'
      })
    })

    return timeline.sort((a, b) => a.turn - b.turn)
  }

  const timeline = buildTimeline()
  const uniqueAssumptions = Array.from(new Set(timeline.map(t => t.assumption)))

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }} onClick={onClose}>
      <div style={{
        backgroundColor: '#000000',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '24px'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#fff', margin: 0 }}>
            Assumption Timeline
          </h2>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0',
              width: '32px',
              height: '32px'
            }}
          >
            ×
          </button>
        </div>

        {/* Timeline Visualization */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            position: 'relative',
            paddingLeft: '40px',
            borderLeft: '2px solid rgba(255, 255, 255, 0.2)',
            minHeight: '200px'
          }}>
            {uniqueAssumptions.map((assumption, idx) => {
              const assumptionTimeline = timeline.filter(t => t.assumption === assumption)
              const currentStrength = assumptionTimeline[assumptionTimeline.length - 1]?.strength || 0
              
              return (
                <div key={idx} style={{ marginBottom: '32px', position: 'relative' }}>
                  {/* Assumption Label */}
                  <div style={{
                    position: 'absolute',
                    left: '-45px',
                    top: '0',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: currentStrength > 0.7 ? '#4ade80' : currentStrength > 0.3 ? '#fbbf24' : '#ef4444',
                    border: '2px solid #000'
                  }} />
                  
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                      {assumption}
                    </div>
                    <div style={{ fontSize: '11px', color: '#888' }}>
                      Current Strength: {(currentStrength * 100).toFixed(0)}%
                    </div>
                  </div>

                  {/* Strength Bar */}
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      flex: 1,
                      height: '8px',
                      backgroundColor: '#111111',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${currentStrength * 100}%`,
                        backgroundColor: currentStrength > 0.7 ? '#4ade80' : currentStrength > 0.3 ? '#fbbf24' : '#ef4444',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                    <div style={{ fontSize: '10px', color: '#666', minWidth: '40px', textAlign: 'right' }}>
                      {(currentStrength * 100).toFixed(0)}%
                    </div>
                  </div>

                  {/* Timeline Events */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {assumptionTimeline.map((event, eventIdx) => (
                      <div key={eventIdx} style={{
                        padding: '8px 12px',
                        backgroundColor: '#111111',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        fontSize: '11px',
                        color: '#aaa'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ color: '#fff', fontWeight: 600 }}>Turn {event.turn}</span>
                          <span style={{ color: event.strength > 0.7 ? '#4ade80' : event.strength > 0.3 ? '#fbbf24' : '#ef4444' }}>
                            Strength: {(event.strength * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div style={{ color: '#888', fontSize: '10px' }}>{event.event}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Degraded Assumptions Warning */}
        {degradedAssumptions.length > 0 && (
          <div style={{
            padding: '16px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            marginBottom: '24px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#ef4444', marginBottom: '8px' }}>
              ⚠️ Critical Assumption Failures
            </div>
            <div style={{ fontSize: '12px', color: '#aaa' }}>
              {degradedAssumptions.length} assumption(s) have degraded below critical thresholds:
            </div>
            <ul style={{ marginTop: '8px', paddingLeft: '20px', fontSize: '12px', color: '#aaa' }}>
              {degradedAssumptions.map((assumption, idx) => (
                <li key={idx} style={{ marginBottom: '4px' }}>
                  {assumption.text} (Strength: {(assumption.strength * 100).toFixed(0)}%)
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Summary Stats */}
        <div style={{
          padding: '16px',
          backgroundColor: '#111111',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Summary</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', fontSize: '12px' }}>
            <div>
              <div style={{ color: '#aaa' }}>Total Assumptions</div>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: '18px' }}>
                {uniqueAssumptions.length}
              </div>
            </div>
            <div>
              <div style={{ color: '#aaa' }}>Active</div>
              <div style={{ color: '#4ade80', fontWeight: 600, fontSize: '18px' }}>
                {uniqueAssumptions.filter(a => {
                  const timeline = buildTimeline().filter(t => t.assumption === a)
                  const strength = timeline[timeline.length - 1]?.strength || 0
                  return strength > 0.3
                }).length}
              </div>
            </div>
            <div>
              <div style={{ color: '#aaa' }}>Degraded</div>
              <div style={{ color: '#ef4444', fontWeight: 600, fontSize: '18px' }}>
                {degradedAssumptions.length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
