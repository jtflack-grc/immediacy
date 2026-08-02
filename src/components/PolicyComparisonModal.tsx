import { useState, useEffect } from 'react'
import { State } from '../engine/scenarioTypes'
import { calculateMeasuredSuccessIndex, calculateGovernanceDebtIndex } from '../engine/scoring'

interface ParallelRun {
  id: string
  name: string
  state: State
  color: string
}

interface PolicyComparisonModalProps {
  currentState: State
  onSelectRun: (runId: string) => void
  onClose: () => void
}

export default function PolicyComparisonModal({ currentState, onSelectRun, onClose }: PolicyComparisonModalProps) {
  const [visible, setVisible] = useState(false)
  const [parallelRuns, setParallelRuns] = useState<ParallelRun[]>([])
  const [runName, setRunName] = useState('')

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
    // Load existing parallel runs from localStorage
    const saved = localStorage.getItem('parallelRuns')
    if (saved) {
      try {
        setParallelRuns(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load parallel runs:', e)
      }
    }
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 300)
  }

  const handleCreateRun = () => {
    if (!runName.trim()) {
      alert('Please enter a name for this run')
      return
    }

    const colors = ['#60a5fa', '#4ade80', '#fbbf24', '#ef4444', '#a855f7', '#ec4899']
    const newRun: ParallelRun = {
      id: `run_${Date.now()}`,
      name: runName.trim(),
      state: JSON.parse(JSON.stringify(currentState)), // Deep clone
      color: colors[parallelRuns.length % colors.length]
    }

    const updated = [...parallelRuns, newRun]
    setParallelRuns(updated)
    localStorage.setItem('parallelRuns', JSON.stringify(updated))
    setRunName('')
  }

  const handleDeleteRun = (runId: string) => {
    const updated = parallelRuns.filter(r => r.id !== runId)
    setParallelRuns(updated)
    localStorage.setItem('parallelRuns', JSON.stringify(updated))
  }

  const handleSelectRun = (runId: string) => {
    onSelectRun(runId)
    handleClose()
  }

  const getRunStats = (run: ParallelRun) => {
    const success = calculateMeasuredSuccessIndex(run.state.metrics.measured)
    const debt = calculateGovernanceDebtIndex(run.state.metrics.unmeasured)
    return { success, debt }
  }

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
            Policy Comparison Mode
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

        {/* Description */}
        <div style={{
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: 'rgba(96, 165, 250, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(96, 165, 250, 0.3)',
          fontSize: '13px',
          color: '#ddd',
          lineHeight: '1.6'
        }}>
          Run multiple governance strategies in parallel to compare outcomes. Each run tracks independently, allowing you to explore different approaches side-by-side.
        </div>

        {/* Create New Run */}
        <div style={{
          marginBottom: '24px',
          padding: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#fff',
            marginBottom: '12px'
          }}>
            Create Parallel Run from Current State
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={runName}
              onChange={(e) => setRunName(e.target.value)}
              placeholder="e.g., 'Pragmatic Approach', 'Idealist Strategy'"
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: '#111111',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '13px'
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCreateRun()
                }
              }}
            />
            <button
              onClick={handleCreateRun}
              disabled={parallelRuns.length >= 4}
              style={{
                padding: '10px 20px',
                backgroundColor: parallelRuns.length >= 4 ? '#444' : '#60a5fa',
                color: '#000',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: parallelRuns.length >= 4 ? 'not-allowed' : 'pointer',
                opacity: parallelRuns.length >= 4 ? 0.5 : 1
              }}
            >
              Create Run
            </button>
          </div>
          {parallelRuns.length >= 4 && (
            <div style={{
              marginTop: '8px',
              fontSize: '11px',
              color: '#888',
              fontStyle: 'italic'
            }}>
              Maximum 4 parallel runs (to maintain performance)
            </div>
          )}
        </div>

        {/* Parallel Runs List */}
        <div>
          <div style={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#fff',
            marginBottom: '16px'
          }}>
            Parallel Runs ({parallelRuns.length}/4)
          </div>

          {parallelRuns.length === 0 ? (
            <div style={{
              padding: '32px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '8px',
              textAlign: 'center',
              color: '#888',
              fontSize: '13px',
              fontStyle: 'italic'
            }}>
              No parallel runs yet. Create one to start comparing strategies.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {parallelRuns.map((run) => {
                const stats = getRunStats(run)
                const currentStats = getRunStats({ id: '', name: '', state: currentState, color: '' })
                
                return (
                  <div
                    key={run.id}
                    style={{
                      padding: '16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px',
                      border: '2px solid ' + run.color,
                      position: 'relative'
                    }}
                  >
                    {/* Run Name */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '12px'
                    }}>
                      <div style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        color: '#fff'
                      }}>
                        {run.name}
                      </div>
                      <button
                        onClick={() => handleDeleteRun(run.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#888',
                          cursor: 'pointer',
                          fontSize: '18px',
                          padding: '0',
                          lineHeight: '1'
                        }}
                        title="Delete run"
                      >
                        ×
                      </button>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>Success Index</div>
                        <div style={{ fontSize: '18px', fontWeight: 700, color: '#4ade80' }}>
                          {(stats.success * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>Debt Index</div>
                        <div style={{ fontSize: '18px', fontWeight: 700, color: '#fb923c' }}>
                          {(stats.debt * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>

                    {/* Progress */}
                    <div style={{
                      fontSize: '11px',
                      color: '#888',
                      marginBottom: '12px'
                    }}>
                      Turn {run.state.turn} • {run.state.auditTrail.length} decisions
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleSelectRun(run.id)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          backgroundColor: run.color,
                          color: '#000',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Switch to This Run
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Current Run Info */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: 'rgba(96, 165, 250, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(96, 165, 250, 0.3)'
        }}>
          <div style={{
            fontSize: '12px',
            color: '#60a5fa',
            fontWeight: 600,
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Current Active Run
          </div>
          <div style={{
            fontSize: '13px',
            color: '#ddd',
            lineHeight: '1.6'
          }}>
            You're currently working on the main run. Create a parallel run to branch from this point and explore alternative strategies.
          </div>
        </div>
      </div>
    </div>
  )
}
