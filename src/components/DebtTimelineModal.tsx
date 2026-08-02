import { useState, useEffect } from 'react'
import { State, AuditRecord } from '../engine/scenarioTypes'

interface DebtTimelineModalProps {
  state: State
  onClose: () => void
}

interface DebtEvent {
  turn: number
  decision: string
  nodeTitle: string
  debtType: string
  change: number
  cumulative: number
  color: string
}

export default function DebtTimelineModal({ state, onClose }: DebtTimelineModalProps) {
  const [visible, setVisible] = useState(false)
  const [selectedDebtType, setSelectedDebtType] = useState<string | 'all'>('all')

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 300)
  }

  // Build debt timeline from audit trail
  const buildDebtTimeline = (): DebtEvent[] => {
    const events: DebtEvent[] = []
    let cumulativeDebt = { ...state.initialMetrics?.unmeasured || {} }
    
    const debtColors: Record<string, string> = {
      welfareDebt: '#ef4444',
      enforcementGap: '#fbbf24',
      regulatoryCapture: '#ec4899',
      sentienceKnowledgeGap: '#8b5cf6',
      systemIrreversibility: '#fb923c'
    }

    state.auditTrail.forEach((record: AuditRecord, idx: number) => {
      // Get the delta from the record (we need to reconstruct it)
      // For now, we'll use the metrics snapshot difference
      const prevSnapshot = idx > 0 && state.auditTrail[idx - 1].metricsSnapshot
        ? state.auditTrail[idx - 1].metricsSnapshot.unmeasured
        : cumulativeDebt
      const currentSnapshot = record.metricsSnapshot?.unmeasured || cumulativeDebt

      // Check each debt type
      Object.keys(currentSnapshot).forEach((debtType) => {
        const prevValue = prevSnapshot[debtType] || 0
        const currentValue = currentSnapshot[debtType] || 0
        const change = currentValue - prevValue

        if (Math.abs(change) > 0.01) { // Only significant changes
          const newCumulative = { ...cumulativeDebt, [debtType]: currentValue }
          cumulativeDebt = newCumulative

          events.push({
            turn: record.turn,
            decision: record.chosenLabel,
            nodeTitle: record.nodeTitle,
            debtType,
            change,
            cumulative: currentValue,
            color: debtColors[debtType] || '#888'
          })
        }
      })
    })

    return events.sort((a, b) => a.turn - b.turn)
  }

  const debtEvents = buildDebtTimeline()
  const filteredEvents = selectedDebtType === 'all' 
    ? debtEvents 
    : debtEvents.filter(e => e.debtType === selectedDebtType)

  const debtTypes = ['welfareDebt', 'enforcementGap', 'regulatoryCapture', 'sentienceKnowledgeGap', 'systemIrreversibility']
  const debtLabels: Record<string, string> = {
    welfareDebt: 'Welfare Debt',
    enforcementGap: 'Enforcement Gap',
    regulatoryCapture: 'Regulatory Capture',
    sentienceKnowledgeGap: 'Sentience Knowledge Gap',
    systemIrreversibility: 'System Irreversibility'
  }

  // Calculate total debt accumulation
  const totalDebt = Object.values(state.metrics.unmeasured).reduce((sum, val) => sum + val, 0)
  const initialDebt = Object.values(state.initialMetrics?.unmeasured || {}).reduce((sum, val) => sum + val, 0)
  const debtIncrease = totalDebt - initialDebt

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.3s ease'
    }}>
      <div style={{
        maxWidth: '900px',
        width: '90%',
        padding: '30px',
        backgroundColor: '#0a0a0a',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div style={{
            fontSize: '22px',
            fontWeight: 700,
            color: '#fff'
          }}>
            Governance Debt Timeline
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#888',
              cursor: 'pointer',
              fontSize: '24px',
              padding: '0',
              lineHeight: '1'
            }}
          >
            ×
          </button>
        </div>

        {/* Summary */}
        <div style={{
          marginBottom: '24px',
          padding: '20px',
          backgroundColor: 'rgba(251, 146, 60, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(251, 146, 60, 0.3)'
        }}>
          <div style={{
            fontSize: '14px',
            color: '#fb923c',
            fontWeight: 600,
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Total Debt Accumulation
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>Initial Debt</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#aaa' }}>
                {(initialDebt * 100).toFixed(0)}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>Current Debt</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#fb923c' }}>
                {(totalDebt * 100).toFixed(0)}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>Increase</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#ef4444' }}>
                +{(debtIncrease * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div style={{
          marginBottom: '20px',
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setSelectedDebtType('all')}
            style={{
              padding: '8px 16px',
              backgroundColor: selectedDebtType === 'all' ? '#60a5fa' : 'rgba(255, 255, 255, 0.05)',
              color: selectedDebtType === 'all' ? '#000' : '#fff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            All Types
          </button>
          {debtTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedDebtType(type)}
              style={{
                padding: '8px 16px',
                backgroundColor: selectedDebtType === type ? '#60a5fa' : 'rgba(255, 255, 255, 0.05)',
                color: selectedDebtType === type ? '#000' : '#fff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {debtLabels[type]}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div>
          <div style={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#fff',
            marginBottom: '16px'
          }}>
            Debt Accumulation Events ({filteredEvents.length})
          </div>

          {filteredEvents.length === 0 ? (
            <div style={{
              padding: '32px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '8px',
              textAlign: 'center',
              color: '#888',
              fontSize: '13px',
              fontStyle: 'italic'
            }}>
              No debt accumulation events found for this filter.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredEvents.map((event, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    border: '2px solid ' + event.color,
                    borderLeftWidth: '6px'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '12px',
                        color: event.color,
                        fontWeight: 600,
                        marginBottom: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Turn {event.turn}: {debtLabels[event.debtType]}
                      </div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#fff',
                        marginBottom: '4px'
                      }}>
                        {event.nodeTitle}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: '#ddd',
                        marginBottom: '8px'
                      }}>
                        Decision: {event.decision}
                      </div>
                    </div>
                    <div style={{
                      textAlign: 'right',
                      minWidth: '120px'
                    }}>
                      <div style={{
                        fontSize: '11px',
                        color: '#888',
                        marginBottom: '4px'
                      }}>
                        Change
                      </div>
                      <div style={{
                        fontSize: '18px',
                        fontWeight: 700,
                        color: event.change > 0 ? '#ef4444' : '#4ade80'
                      }}>
                        {event.change > 0 ? '+' : ''}{(event.change * 100).toFixed(1)}%
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: '#888',
                        marginTop: '8px'
                      }}>
                        Cumulative: {(event.cumulative * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
