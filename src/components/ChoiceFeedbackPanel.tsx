import { useState, useEffect } from 'react'

interface MetricChange {
  metric: string
  change: number
  direction: 'up' | 'down'
  reason: string
}

interface ChoiceFeedbackPanelProps {
  choiceLabel: string
  measuredChanges: MetricChange[]
  unmeasuredChanges: MetricChange[]
  onClose: () => void
}

export default function ChoiceFeedbackPanel({
  choiceLabel,
  measuredChanges,
  unmeasuredChanges,
  onClose
}: ChoiceFeedbackPanelProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
    // Auto-close after 8 seconds
    const timer = setTimeout(() => {
      handleClose()
    }, 8000)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 300)
  }

  const getMetricLabel = (metric: string): string => {
    return metric.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      maxWidth: '400px',
      padding: '20px',
      backgroundColor: '#0a0a0a',
      borderRadius: '10px',
      border: '1px solid rgba(96, 165, 250, 0.3)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)',
      zIndex: 5000,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(20px)',
      transition: 'all 0.3s ease'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <div style={{
          fontSize: '14px',
          fontWeight: 600,
          color: '#60a5fa'
        }}>
          📊 Impact Feedback
        </div>
        <button
          onClick={handleClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#888',
            cursor: 'pointer',
            fontSize: '18px',
            padding: '0',
            lineHeight: '1'
          }}
        >
          ×
        </button>
      </div>

      {/* Choice Label */}
      <div style={{
        fontSize: '13px',
        color: '#ddd',
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <strong>You chose:</strong> {choiceLabel}
      </div>

      {/* Measured Changes */}
      {measuredChanges.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            fontSize: '11px',
            color: '#4ade80',
            fontWeight: 600,
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Measured Outcomes
          </div>
          {measuredChanges.map((change, idx) => (
            <div key={idx} style={{
              marginBottom: '10px',
              padding: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <div style={{
                fontSize: '12px',
                color: change.direction === 'up' ? '#4ade80' : '#f87171',
                fontWeight: 600,
                marginBottom: '4px'
              }}>
                {change.direction === 'up' ? '↑' : '↓'} {getMetricLabel(change.metric)}: {(Math.abs(change.change) * 100).toFixed(0)}%
              </div>
              <div style={{
                fontSize: '11px',
                color: '#aaa',
                lineHeight: '1.4'
              }}>
                {change.reason}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Unmeasured Changes */}
      {unmeasuredChanges.length > 0 && (
        <div>
          <div style={{
            fontSize: '11px',
            color: '#fb923c',
            fontWeight: 600,
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Hidden Risks (Governance Debt)
          </div>
          {unmeasuredChanges.map((change, idx) => (
            <div key={idx} style={{
              marginBottom: '10px',
              padding: '10px',
              backgroundColor: 'rgba(251, 146, 60, 0.05)',
              borderRadius: '6px',
              border: '1px solid rgba(251, 146, 60, 0.1)'
            }}>
              <div style={{
                fontSize: '12px',
                color: change.direction === 'up' ? '#fb923c' : '#4ade80',
                fontWeight: 600,
                marginBottom: '4px'
              }}>
                {change.direction === 'up' ? '⚠️ ↑' : '✓ ↓'} {getMetricLabel(change.metric)}: {(Math.abs(change.change) * 100).toFixed(0)}%
              </div>
              <div style={{
                fontSize: '11px',
                color: '#aaa',
                lineHeight: '1.4'
              }}>
                {change.reason}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No significant changes */}
      {measuredChanges.length === 0 && unmeasuredChanges.length === 0 && (
        <div style={{
          fontSize: '12px',
          color: '#888',
          fontStyle: 'italic',
          textAlign: 'center',
          padding: '12px'
        }}>
          No significant metric changes from this decision
        </div>
      )}
    </div>
  )
}
