import { useState, useEffect } from 'react'
import { State } from '../engine/scenarioTypes'
import { RunSummary, getSavedRuns, saveCurrentRun, clearSavedRuns } from '../utils/runHistory'
import { calculateMeasuredSuccessIndex, calculateGovernanceDebtIndex } from '../engine/scoring'

interface RunComparisonModalProps {
  currentState: State
  onClose: () => void
}

export default function RunComparisonModal({ currentState, onClose }: RunComparisonModalProps) {
  const [visible, setVisible] = useState(false)
  const [savedRuns, setSavedRuns] = useState<RunSummary[]>([])

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
    setSavedRuns(getSavedRuns())
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 300)
  }

  const handleSaveCurrentRun = () => {
    saveCurrentRun(currentState)
    setSavedRuns(getSavedRuns())
  }

  const handleClearAll = () => {
    if (confirm('Clear all saved runs?')) {
      clearSavedRuns()
      setSavedRuns([])
    }
  }

  // Current run stats
  const currentSuccess = calculateMeasuredSuccessIndex(currentState.metrics.measured)
  const currentDebt = calculateGovernanceDebtIndex(currentState.metrics.unmeasured)

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
        maxWidth: '800px',
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
            Run Comparison
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

        {/* Current Run */}
        <div style={{
          marginBottom: '24px',
          padding: '20px',
          backgroundColor: 'rgba(96, 165, 250, 0.1)',
          borderRadius: '8px',
          border: '2px solid rgba(96, 165, 250, 0.3)'
        }}>
          <div style={{
            fontSize: '14px',
            color: '#60a5fa',
            fontWeight: 600,
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Current Run
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>Turn</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>{currentState.turn}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>Success Index</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#4ade80' }}>
                {(currentSuccess * 100).toFixed(0)}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>Debt Index</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#fb923c' }}>
                {(currentDebt * 100).toFixed(0)}%
              </div>
            </div>
          </div>
          <button
            onClick={handleSaveCurrentRun}
            style={{
              marginTop: '16px',
              width: '100%',
              padding: '10px',
              backgroundColor: '#60a5fa',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Save This Run
          </button>
        </div>

        {/* Saved Runs */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff' }}>
              Previous Runs ({savedRuns.length}/5)
            </div>
            {savedRuns.length > 0 && (
              <button
                onClick={handleClearAll}
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'rgba(239, 68, 68, 0.2)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Clear All
              </button>
            )}
          </div>

          {savedRuns.length === 0 ? (
            <div style={{
              padding: '32px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '8px',
              textAlign: 'center',
              color: '#888',
              fontSize: '13px',
              fontStyle: 'italic'
            }}>
              No saved runs yet. Save your current run to compare different paths.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {savedRuns.map((run, idx) => {
                const successDiff = run.successIndex - currentSuccess
                const debtDiff = run.debtIndex - currentDebt
                const date = new Date(run.timestamp)
                
                return (
                  <div
                    key={run.id}
                    style={{
                      padding: '16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '12px'
                    }}>
                      <div style={{ fontSize: '12px', color: '#888' }}>
                        {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div style={{ fontSize: '12px', color: '#888' }}>
                        Turn {run.finalTurn}
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>Success Index</div>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: '#4ade80' }}>
                          {(run.successIndex * 100).toFixed(0)}%
                          <span style={{
                            fontSize: '11px',
                            marginLeft: '6px',
                            color: successDiff > 0 ? '#ef4444' : successDiff < 0 ? '#4ade80' : '#888'
                          }}>
                            {successDiff > 0 ? '↓' : successDiff < 0 ? '↑' : '='} {Math.abs(successDiff * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>Debt Index</div>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: '#fb923c' }}>
                          {(run.debtIndex * 100).toFixed(0)}%
                          <span style={{
                            fontSize: '11px',
                            marginLeft: '6px',
                            color: debtDiff > 0 ? '#ef4444' : debtDiff < 0 ? '#4ade80' : '#888'
                          }}>
                            {debtDiff > 0 ? '↑' : debtDiff < 0 ? '↓' : '='} {Math.abs(debtDiff * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {run.keyChoices.length > 0 && (
                      <div>
                        <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px' }}>First 3 Choices:</div>
                        {run.keyChoices.map((choice, i) => (
                          <div key={i} style={{
                            fontSize: '11px',
                            color: '#ddd',
                            marginBottom: '2px',
                            paddingLeft: '8px',
                            borderLeft: '2px solid rgba(96, 165, 250, 0.3)'
                          }}>
                            {i + 1}. {choice}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
