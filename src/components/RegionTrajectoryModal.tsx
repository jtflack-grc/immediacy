import { useState, useEffect } from 'react'
import { State } from '../engine/scenarioTypes'

interface RegionTrajectoryModalProps {
  regionName: string
  state: State
  onClose: () => void
}

export default function RegionTrajectoryModal({ regionName, state, onClose }: RegionTrajectoryModalProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 300)
  }

  // Get region's trajectory from map history
  const getRegionTrajectory = () => {
    const trajectory: Array<{ turn: number; value: number }> = []
    
    // Initial value
    const initialValue = (state.initialMetrics?.measured as any)?.welfareStandardAdoption || 0
    trajectory.push({ turn: 0, value: initialValue })
    
    // Trace through audit trail
    state.auditTrail.forEach((record, idx) => {
      // Look for map changes affecting this region
      const regionValue = record.delta?.map?.regionValues?.[regionName]
      if (regionValue !== undefined) {
        const prevValue = trajectory[trajectory.length - 1].value
        trajectory.push({ turn: idx + 1, value: prevValue + regionValue })
      } else {
        // No change this turn
        trajectory.push({ turn: idx + 1, value: trajectory[trajectory.length - 1].value })
      }
    })
    
    return trajectory
  }

  const trajectory = getRegionTrajectory()
  const currentValue = trajectory[trajectory.length - 1]?.value || 0
  const peakValue = Math.max(...trajectory.map(t => t.value))
  const decisions = state.auditTrail.filter(record => 
    record.delta?.map?.regionValues?.[regionName] !== undefined
  )

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
        maxWidth: '600px',
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
          marginBottom: '20px'
        }}>
          <div style={{
            fontSize: '22px',
            fontWeight: 700,
            color: '#fff'
          }}>
            {regionName} Trajectory
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

        {/* Summary Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <div style={{
            padding: '12px',
            backgroundColor: 'rgba(96, 165, 250, 0.1)',
            borderRadius: '6px',
            border: '1px solid rgba(96, 165, 250, 0.3)'
          }}>
            <div style={{ fontSize: '11px', color: '#60a5fa', marginBottom: '4px' }}>Current Value</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>
              {(currentValue * 100).toFixed(0)}%
            </div>
          </div>
          <div style={{
            padding: '12px',
            backgroundColor: 'rgba(74, 222, 128, 0.1)',
            borderRadius: '6px',
            border: '1px solid rgba(74, 222, 128, 0.3)'
          }}>
            <div style={{ fontSize: '11px', color: '#4ade80', marginBottom: '4px' }}>Peak Value</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>
              {(peakValue * 100).toFixed(0)}%
            </div>
          </div>
          <div style={{
            padding: '12px',
            backgroundColor: 'rgba(251, 146, 60, 0.1)',
            borderRadius: '6px',
            border: '1px solid rgba(251, 146, 60, 0.3)'
          }}>
            <div style={{ fontSize: '11px', color: '#fb923c', marginBottom: '4px' }}>Decisions</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>
              {decisions.length}
            </div>
          </div>
        </div>

        {/* Mini Chart */}
        <div style={{
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px', fontWeight: 600 }}>
            Welfare Standards Adoption Over Time
          </div>
          <svg width="100%" height="120" style={{ overflow: 'visible' }}>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((y, i) => (
              <line
                key={i}
                x1="0"
                y1={120 - y * 120}
                x2="100%"
                y2={120 - y * 120}
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="1"
              />
            ))}
            
            {/* Line chart */}
            <polyline
              points={trajectory.map((t, i) => {
                const x = (i / Math.max(1, trajectory.length - 1)) * 100
                const y = 120 - (t.value * 120)
                return `${x}%,${y}`
              }).join(' ')}
              fill="none"
              stroke="#60a5fa"
              strokeWidth="2"
            />
            
            {/* Points */}
            {trajectory.map((t, i) => {
              const x = (i / Math.max(1, trajectory.length - 1)) * 100
              const y = 120 - (t.value * 120)
              return (
                <circle
                  key={i}
                  cx={`${x}%`}
                  cy={y}
                  r="3"
                  fill="#60a5fa"
                />
              )
            })}
          </svg>
        </div>

        {/* Decisions Affecting This Region */}
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>
            Decisions Affecting {regionName}
          </div>
          {decisions.length === 0 ? (
            <div style={{
              padding: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '6px',
              fontSize: '13px',
              color: '#888',
              fontStyle: 'italic',
              textAlign: 'center'
            }}>
              No decisions have directly affected this region yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {decisions.map((record, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '14px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <div style={{
                    fontSize: '12px',
                    color: '#60a5fa',
                    marginBottom: '6px',
                    fontWeight: 600
                  }}>
                    Turn {record.turn}: {record.nodeTitle}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: '#ddd',
                    marginBottom: '4px'
                  }}>
                    {record.chosenLabel}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#4ade80',
                    fontWeight: 600
                  }}>
                    Impact: +{((record.delta?.map?.regionValues?.[regionName] || 0) * 100).toFixed(0)}%
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
