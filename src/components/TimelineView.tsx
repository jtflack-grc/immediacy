import { State } from '../engine/scenarioTypes'
import { getPhaseByNodeId } from '../engine/scenarioLoader'
import { Scenario } from '../engine/scenarioTypes'

interface TimelineViewProps {
  state: State
  scenario: Scenario
}

export default function TimelineView({ state, scenario }: TimelineViewProps) {
  const auditTrail = state.auditTrail || []

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '20px' }}>
        Decision Timeline
      </h3>
      <div style={{
        position: 'relative',
        paddingLeft: '40px',
        borderLeft: '2px solid rgba(255, 255, 255, 0.2)'
      }}>
        {auditTrail.map((record, index) => {
          const phase = scenario.phases.find(p => p.id === record.phaseId)
          const isLast = index === auditTrail.length - 1
          
          return (
            <div
              key={index}
              style={{
                position: 'relative',
                marginBottom: '24px',
                paddingLeft: '20px'
              }}
            >
              {/* Timeline dot */}
              <div style={{
                position: 'absolute',
                left: '-31px',
                top: '4px',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#4ade80',
                border: '2px solid #000',
                boxShadow: '0 0 8px rgba(74, 222, 128, 0.5)'
              }} />
              
              {/* Timeline line */}
              {!isLast && (
                <div style={{
                  position: 'absolute',
                  left: '-26px',
                  top: '16px',
                  width: '2px',
                  height: 'calc(100% + 8px)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }} />
              )}

              {/* Content */}
              <div style={{
                padding: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '8px'
                }}>
                  <div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#fff',
                      marginBottom: '4px'
                    }}>
                      Turn {record.turn} - {record.nodeTitle}
                    </div>
                    {phase && (
                      <div style={{
                        fontSize: '11px',
                        color: '#888',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {phase.title}
                      </div>
                    )}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#666'
                  }}>
                    {new Date(record.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                <div style={{
                  fontSize: '13px',
                  color: '#ddd',
                  marginBottom: '8px',
                  fontStyle: 'italic'
                }}>
                  "{record.chosenLabel}"
                </div>

                {record.rationale && (
                  <div style={{
                    fontSize: '12px',
                    color: '#aaa',
                    lineHeight: '1.5',
                    marginBottom: '8px'
                  }}>
                    <strong style={{ color: '#fff' }}>Rationale:</strong> {record.rationale}
                  </div>
                )}

                {record.unmeasuredImpact && (
                  <div style={{
                    fontSize: '11px',
                    color: '#fb923c',
                    padding: '8px',
                    backgroundColor: 'rgba(251, 146, 60, 0.1)',
                    borderRadius: '4px',
                    border: '1px solid rgba(251, 146, 60, 0.2)',
                    marginTop: '8px'
                  }}>
                    <strong>Unmeasured Impact:</strong> {record.unmeasuredImpact}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
