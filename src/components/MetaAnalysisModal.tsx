import { useState, useEffect } from 'react'
import { getSavedRuns, RunSummary } from '../utils/runHistory'
import { analyzeRuns, MetaAnalysis, Pattern } from '../utils/metaAnalysis'

interface MetaAnalysisModalProps {
  onClose: () => void
}

export default function MetaAnalysisModal({ onClose }: MetaAnalysisModalProps) {
  const [visible, setVisible] = useState(false)
  const [analysis, setAnalysis] = useState<MetaAnalysis | null>(null)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
    try {
      const runs = getSavedRuns()
      // analyzeRuns now handles backward compatibility, so we can pass all runs
      setAnalysis(analyzeRuns(runs))
    } catch (error) {
      console.error('Error analyzing runs:', error)
      // Set empty analysis on error
      setAnalysis({
        totalRuns: 0,
        averageSuccessIndex: 0,
        averageDebtIndex: 0,
        patterns: [],
        commonFailureModes: [],
        effectiveStrategies: [],
        sequencingInsights: [],
        surprisingOutcomes: [],
        decisionFrequency: new Map(),
        nodeFrequency: new Map(),
        correlationMatrix: new Map()
      })
    }
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 300)
  }

  if (!analysis) {
    return null
  }

  const renderPattern = (pattern: Pattern, index: number) => {
    const typeColors = {
      failure_mode: { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', text: '#ef4444' },
      success_pattern: { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.3)', text: '#22c55e' },
      sequencing_insight: { bg: 'rgba(96, 165, 250, 0.1)', border: 'rgba(96, 165, 250, 0.3)', text: '#60a5fa' },
      surprising_outcome: { bg: 'rgba(251, 146, 60, 0.1)', border: 'rgba(251, 146, 60, 0.3)', text: '#fb923c' }
    }
    const colors = typeColors[pattern.type]

    return (
      <div
        key={index}
        style={{
          padding: '16px',
          backgroundColor: colors.bg,
          border: '1px solid ' + colors.border,
          borderRadius: '8px',
          marginBottom: '12px'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'start',
          marginBottom: '8px'
        }}>
          <div style={{
            fontSize: '15px',
            fontWeight: 700,
            color: colors.text
          }}>
            {pattern.title}
          </div>
          <div style={{
            fontSize: '11px',
            color: '#888',
            padding: '4px 8px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '4px'
          }}>
            {(pattern.frequency * 100).toFixed(0)}% of runs
          </div>
        </div>
        <div style={{
          fontSize: '13px',
          color: '#ddd',
          lineHeight: '1.5',
          marginBottom: '8px'
        }}>
          {pattern.description}
        </div>
        {pattern.examples.length > 0 && (
          <div style={{
            fontSize: '11px',
            color: '#aaa',
            fontStyle: 'italic',
            marginBottom: '8px',
            paddingLeft: '8px',
            borderLeft: '2px solid ' + colors.border
          }}>
            Examples: {pattern.examples.slice(0, 3).join(', ')}
          </div>
        )}
        {pattern.recommendation && (
          <div style={{
            fontSize: '12px',
            color: '#fff',
            fontWeight: 600,
            marginTop: '8px',
            padding: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '4px'
          }}>
            💡 {pattern.recommendation}
          </div>
        )}
      </div>
    )
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
        maxWidth: '1000px',
        width: '90%',
        padding: '30px',
        backgroundColor: '#0a0a0a',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)',
        maxHeight: '85vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div>
            <div style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#fff',
              marginBottom: '4px'
            }}>
              Meta-Analysis Dashboard
            </div>
            <div style={{
              fontSize: '13px',
              color: '#888'
            }}>
              Pattern analysis across {analysis.totalRuns} saved runs
            </div>
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

        {analysis.totalRuns === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#888',
            fontSize: '14px'
          }}>
            <div style={{ marginBottom: '12px', fontSize: '48px' }}>📊</div>
            <div>No saved runs available for analysis.</div>
            <div style={{ marginTop: '8px', fontSize: '12px' }}>
              Save at least 2 runs to see pattern analysis.
            </div>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '16px',
              marginBottom: '32px'
            }}>
              <div style={{
                padding: '20px',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '8px'
              }}>
                <div style={{
                  fontSize: '11px',
                  color: '#888',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Average Success Index
                </div>
                <div style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: '#22c55e'
                }}>
                  {(analysis.averageSuccessIndex * 100).toFixed(0)}%
                </div>
              </div>
              <div style={{
                padding: '20px',
                backgroundColor: 'rgba(251, 146, 60, 0.1)',
                border: '1px solid rgba(251, 146, 60, 0.3)',
                borderRadius: '8px'
              }}>
                <div style={{
                  fontSize: '11px',
                  color: '#888',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Average Debt Index
                </div>
                <div style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: '#fb923c'
                }}>
                  {(analysis.averageDebtIndex * 100).toFixed(0)}%
                </div>
              </div>
              <div style={{
                padding: '20px',
                backgroundColor: 'rgba(96, 165, 250, 0.1)',
                border: '1px solid rgba(96, 165, 250, 0.3)',
                borderRadius: '8px'
              }}>
                <div style={{
                  fontSize: '11px',
                  color: '#888',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Total Patterns Detected
                </div>
                <div style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: '#60a5fa'
                }}>
                  {analysis.patterns.length}
                </div>
              </div>
            </div>

            {/* Common Failure Modes */}
            {analysis.commonFailureModes.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#ef4444',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>⚠️</span>
                  <span>Common Failure Modes</span>
                </div>
                {analysis.commonFailureModes.map((pattern, idx) => renderPattern(pattern, idx))}
              </div>
            )}

            {/* Effective Strategies */}
            {analysis.effectiveStrategies.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#22c55e',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>✅</span>
                  <span>Effective Strategies</span>
                </div>
                {analysis.effectiveStrategies.map((pattern, idx) => renderPattern(pattern, idx))}
              </div>
            )}

            {/* Sequencing Insights */}
            {analysis.sequencingInsights.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#60a5fa',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>🔗</span>
                  <span>Sequencing Insights</span>
                </div>
                {analysis.sequencingInsights.map((pattern, idx) => renderPattern(pattern, idx))}
              </div>
            )}

            {/* Surprising Outcomes */}
            {analysis.surprisingOutcomes.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#fb923c',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>💡</span>
                  <span>Surprising Outcomes</span>
                </div>
                {analysis.surprisingOutcomes.map((pattern, idx) => renderPattern(pattern, idx))}
              </div>
            )}

            {/* Decision Frequency */}
            {analysis.decisionFrequency.size > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#fff',
                  marginBottom: '16px'
                }}>
                  Most Common Decisions
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  {Array.from(analysis.decisionFrequency.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .map(([choice, freq]) => (
                      <div
                        key={choice}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.03)',
                          borderRadius: '6px'
                        }}
                      >
                        <div style={{
                          fontSize: '12px',
                          color: '#ddd',
                          flex: 1
                        }}>
                          {choice}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#888',
                          minWidth: '60px',
                          textAlign: 'right'
                        }}>
                          {(freq * 100).toFixed(0)}%
                        </div>
                        <div style={{
                          width: '100px',
                          height: '4px',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '2px',
                          marginLeft: '12px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${freq * 100}%`,
                            height: '100%',
                            backgroundColor: '#60a5fa',
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {analysis.patterns.length === 0 && (
              <div style={{
                padding: '32px',
                textAlign: 'center',
                color: '#888',
                fontSize: '13px',
                fontStyle: 'italic'
              }}>
                Not enough data to detect patterns yet. Save more runs with different strategies to see insights.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
