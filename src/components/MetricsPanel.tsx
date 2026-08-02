import { useState, useMemo, useEffect } from 'react'
import { State, MeasuredMetrics, UnmeasuredMetrics } from '../engine/scenarioTypes'
import { calculateMeasuredSuccessIndex, calculateGovernanceDebtIndex } from '../engine/scoring'
import { getMetricExplanation } from '../utils/metricExplanations'
import MetricHistoryViewer from './MetricHistoryViewer'
import IndexExplainerModal from './IndexExplainerModal'
import LongtermismPanel from './LongtermismPanel'
import { getLossCondition } from '../utils/lossConditions'

interface MetricsPanelProps {
  state: State
}

// Mini sparkline component
function MiniSparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null
  
  const max = Math.max(...values, 0.01)
  const min = Math.min(...values)
  const range = max - min || 1
  const width = 40
  const height = 16
  
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width
    const y = height - ((v - min) / range) * height
    return `${x},${y}`
  }).join(' ')
  
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}


export default function MetricsPanel({ state }: MetricsPanelProps) {
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false)
  const [tooltipMetric, setTooltipMetric] = useState<string | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null)
  const [tooltipHovered, setTooltipHovered] = useState(false)
  const [hideTooltipTimeout, setHideTooltipTimeout] = useState<ReturnType<typeof setTimeout> | null>(null)
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTooltipTimeout) {
        clearTimeout(hideTooltipTimeout)
      }
    }
  }, [hideTooltipTimeout])
  
  const [historyViewer, setHistoryViewer] = useState<{
    metricKey: keyof MeasuredMetrics | keyof UnmeasuredMetrics
    label: string
    color: string
    isUnmeasured: boolean
  } | null>(null)
  const [showIndexExplainer, setShowIndexExplainer] = useState<'success' | 'debt' | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<'success' | 'debt' | null>(null)
  const [indexTooltipPosition, setIndexTooltipPosition] = useState<{ x: number; y: number } | null>(null)
  const measuredIndex = calculateMeasuredSuccessIndex(state.metrics.measured)
  const debtIndex = calculateGovernanceDebtIndex(state.metrics.unmeasured)

  // Memoize metric history calculation - use audit trail length and turn as dependencies
  const metricHistoryCache = useMemo(() => {
    const cache = new Map<string, number[]>()
    
    // Pre-populate cache for all known metrics
    const allMetricKeys = [
      ...Object.keys(state.metrics.measured),
      ...Object.keys(state.metrics.unmeasured)
    ]
    
    allMetricKeys.forEach(metricKey => {
      const history: number[] = []
      
      // Get initial value
      const initialValue = (state.initialMetrics?.measured as any)?.[metricKey] ?? 
                          (state.initialMetrics?.unmeasured as any)?.[metricKey] ?? 0
      history.push(initialValue)
      
      // Add values from audit trail snapshots
      state.auditTrail.forEach(record => {
        if (record.metricsSnapshot) {
          const value = (record.metricsSnapshot.measured as any)?.[metricKey] ?? 
                       (record.metricsSnapshot.unmeasured as any)?.[metricKey] ?? 
                       history[history.length - 1]
          history.push(value)
        }
      })
      
      // Always include current value
      const currentValue = (state.metrics.measured as any)[metricKey] ?? 
                          (state.metrics.unmeasured as any)[metricKey] ?? 0
      if (history.length === 0 || Math.abs(history[history.length - 1] - currentValue) > 0.001) {
        history.push(currentValue)
      }
      
      // Ensure at least 2 points
      if (history.length < 2) {
        cache.set(metricKey, [initialValue, currentValue])
      } else {
        cache.set(metricKey, history)
      }
    })
    
    return cache
  }, [state.auditTrail.length, state.turn, state.initialMetrics, state.metrics])

  // Build metric history from audit trail using actual snapshots
  const getMetricHistory = (metricKey: string): number[] => {
    // Check cache first
    if (metricHistoryCache.has(metricKey)) {
      return metricHistoryCache.get(metricKey)!
    }
    const history: number[] = []
    
    // Get initial value from initialMetrics (before any decisions)
    const initialValue = (state.initialMetrics?.measured as any)?.[metricKey] ?? 
                        (state.initialMetrics?.unmeasured as any)?.[metricKey] ?? 0
    
    // Always start with initial value
    history.push(initialValue)
    
    // Add values from audit trail snapshots (these are the metrics AFTER each decision)
    state.auditTrail.forEach(record => {
      if (record.metricsSnapshot) {
        const value = (record.metricsSnapshot.measured as any)?.[metricKey] ?? 
                     (record.metricsSnapshot.unmeasured as any)?.[metricKey] ?? 
                     history[history.length - 1] // Fallback to last value
        history.push(value)
      }
    })
    
    // Always include current value at the end
    const currentValue = (state.metrics.measured as any)[metricKey] ?? (state.metrics.unmeasured as any)[metricKey] ?? 0
    if (history.length === 0 || Math.abs(history[history.length - 1] - currentValue) > 0.001) {
      history.push(currentValue)
    }
    
    // Ensure we have at least 2 points for sparkline
    if (history.length < 2) {
      return [initialValue, currentValue]
    }
    
    // Cache the result
    metricHistoryCache.set(metricKey, history)
    return history
  }
  
  // Get trend direction from actual history
  const getTrendDirection = (metricKey: string, currentValue: number): 'up' | 'down' | 'neutral' => {
    const history = getMetricHistory(metricKey)
    if (history.length < 2) return 'neutral'
    
    const prevValue = history[history.length - 2]
    const change = currentValue - prevValue
    const threshold = 0.02 // 2% change threshold
    
    if (change > threshold) return 'up'
    if (change < -threshold) return 'down'
    return 'neutral'
  }

  // Determine if metric is "higher is better" or "lower is better"
  const isHigherBetter = (metricKey: string): boolean => {
    // Metrics where higher is better
    const higherIsBetter = [
      'productionEfficiency',
      'welfareStandardAdoption'
    ]
    // Metrics where lower is better
    const lowerIsBetter = [
      'costPerUnit',
      'welfareIncidentRate',
      'welfareDebt',
      'enforcementGap',
      'regulatoryCapture',
      'sentienceKnowledgeGap',
      'systemIrreversibility'
    ]
    
    if (higherIsBetter.includes(metricKey)) return true
    if (lowerIsBetter.includes(metricKey)) return false
    return true // Default to higher is better
  }

  // Get color based on value range (red=bad, yellow=medium, green=good)
  const getValueColor = (value: number, metricKey: string): string => {
    const normalizedValue = Math.min(1, Math.max(0, value))
    const isBetter = isHigherBetter(metricKey)
    const effectiveValue = isBetter ? normalizedValue : 1 - normalizedValue
    
    if (effectiveValue < 0.33) {
      // Red for bad (0-33%)
      return '#ef4444'
    } else if (effectiveValue < 0.67) {
      // Yellow for medium (34-66%)
      return '#fbbf24'
    } else {
      // Green for good (67-100%)
      return '#4ade80'
    }
  }

  const MetricBar = ({ 
    label, 
    value, 
    max = 1, 
    color, 
    metricKey
  }: { 
    label: string | React.ReactNode
    value: number
    max?: number
    color: string
    metricKey: string
  }) => {
    const explanation = getMetricExplanation(metricKey)
    const history = getMetricHistory(metricKey)
    const trend = getTrendDirection(metricKey, value)
    const trendArrow = trend === 'up' ? '↗️' : trend === 'down' ? '↘️' : '→'
    const showAlert = explanation?.alertThreshold && value >= explanation.alertThreshold
    const dynamicColor = getValueColor(value / max, metricKey)
    
    return (
      <div 
        style={{ marginBottom: '16px', position: 'relative' }}
        onMouseEnter={(e) => {
          // Clear any pending hide timeout
          if (hideTooltipTimeout) {
            clearTimeout(hideTooltipTimeout)
            setHideTooltipTimeout(null)
          }
          if (explanation) {
            const rect = e.currentTarget.getBoundingClientRect()
            setTooltipMetric(metricKey)
            setTooltipPosition({ x: rect.right + 10, y: rect.top })
            setTooltipHovered(false)
          }
        }}
        onMouseLeave={() => {
          // Delay hiding to allow moving mouse to tooltip
          const timeout = setTimeout(() => {
            if (!tooltipHovered) {
              setTooltipMetric(null)
              setTooltipPosition(null)
            }
          }, 200) // 200ms delay
          setHideTooltipTimeout(timeout)
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
            <span style={{ fontSize: '12px', color: '#aaa', cursor: explanation ? 'help' : 'default' }}>
              {label}
            </span>
            {explanation && <span style={{ fontSize: '10px', color: '#666' }}>ℹ️</span>}
            {showAlert && <span style={{ fontSize: '12px', color: '#ef4444' }}>⚠️</span>}
            <span style={{ fontSize: '10px', color: '#888' }}>{trendArrow}</span>
            <div 
              style={{ flex: 1, maxWidth: '40px', marginLeft: '4px', cursor: 'pointer' }}
              onClick={() => setHistoryViewer({ 
                metricKey: metricKey as keyof MeasuredMetrics | keyof UnmeasuredMetrics, 
                label, 
                color, 
                isUnmeasured: (Object.keys(state.metrics.unmeasured) as (keyof UnmeasuredMetrics)[]).includes(metricKey as keyof UnmeasuredMetrics)
              })}
              title="Click to view full history"
            >
              <MiniSparkline values={history} color={dynamicColor} />
            </div>
          </div>
          <span style={{ fontSize: '12px', color: showAlert ? '#ef4444' : dynamicColor, fontWeight: 600 }}>
            {(value * 100).toFixed(0)}%
          </span>
        </div>
        {showAlert && explanation?.alertMessage && (
          <div style={{
            fontSize: '10px',
            color: '#ef4444',
            marginTop: '4px',
            padding: '4px 6px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '4px',
            border: '1px solid rgba(239, 68, 68, 0.3)'
          }}>
            {explanation.alertMessage}
          </div>
        )}
        <div style={{
          height: '10px',
          backgroundColor: '#000000',
          borderRadius: '6px',
          overflow: 'hidden',
          boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{
            height: '100%',
            width: `${(value / max) * 100}%`,
            backgroundColor: dynamicColor,
            transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease',
            boxShadow: `0 0 10px ${dynamicColor}40`,
            borderRadius: '6px'
          }} />
        </div>
      </div>
    )
  }

  return (
    <div style={{
      padding: '0',
      backgroundColor: 'transparent'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ 
          fontSize: '20px', 
          fontWeight: 600, 
          color: '#fff', 
          margin: 0,
          letterSpacing: '-0.02em'
        }}>
          Metrics Dashboard
        </h3>
        <button
          onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
          style={{
            padding: '8px 12px',
            backgroundColor: showAdvancedMetrics ? '#60a5fa' : 'rgba(255, 255, 255, 0.1)',
            color: showAdvancedMetrics ? '#000' : '#fff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (!showAdvancedMetrics) {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'
            }
          }}
          onMouseLeave={(e) => {
            if (!showAdvancedMetrics) {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          {showAdvancedMetrics ? '▼ Show Less' : '▶ Show All Metrics'}
        </button>
      </div>

      {/* Loss Warnings */}
      {state.lossWarnings && state.lossWarnings.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          {state.lossWarnings.map((warning, idx) => {
            const condition = getLossCondition(warning.type)
            if (!condition) return null
            
            return (
              <div
                key={`${warning.type}-${warning.turn}-${idx}`}
                style={{
                  padding: '12px 16px',
                  backgroundColor: warning.severity === 'critical' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                  border: `2px solid ${warning.severity === 'critical' ? '#ef4444' : '#eab308'}`,
                  borderRadius: '8px',
                  marginBottom: '12px',
                  borderLeft: `4px solid ${condition.color}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '16px' }}>
                    {warning.severity === 'critical' ? '🔴' : '⚠️'}
                  </span>
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: 600, 
                    color: warning.severity === 'critical' ? '#ef4444' : '#eab308'
                  }}>
                    {condition.name}
                  </span>
                  {warning.severity === 'critical' && (
                    <span style={{ 
                      fontSize: '10px', 
                      color: '#ef4444',
                      backgroundColor: 'rgba(239, 68, 68, 0.2)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}>
                      Critical
                    </span>
                  )}
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#ddd',
                  lineHeight: '1.5',
                  marginTop: '4px'
                }}>
                  {warning.severity === 'critical' ? condition.message : condition.warningMessage}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Measured Metrics */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Measured
        </div>
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#111111', 
          borderRadius: '8px',
          marginBottom: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {/* Core metrics - always shown */}
          <MetricBar label="Welfare Standard Adoption" value={state.metrics.measured.welfareStandardAdoption / 3} max={1} color="#60a5fa" metricKey="welfareStandardAdoption" />
          <MetricBar label="Welfare Incident Rate" value={state.metrics.measured.welfareIncidentRate} color="#f87171" metricKey="welfareIncidentRate" />
          
          {/* Advanced metrics - shown when expanded */}
          {showAdvancedMetrics && (
            <>
              <MetricBar label="Production Efficiency" value={state.metrics.measured.productionEfficiency} color="#4ade80" metricKey="productionEfficiency" />
              <MetricBar label="Cost Per Unit" value={state.metrics.measured.costPerUnit} color="#fbbf24" metricKey="costPerUnit" />
            </>
          )}
        </div>
        
        <div style={{ 
          marginTop: '20px', 
          padding: '16px', 
          backgroundColor: '#111111', 
          borderRadius: '8px',
          border: '2px solid rgba(74, 222, 128, 0.3)',
          boxShadow: '0 0 20px rgba(74, 222, 128, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <div style={{ fontSize: '12px', color: '#888', fontWeight: 500 }}>Success Index</div>
            <button
              onClick={() => setShowIndexExplainer('success')}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                setHoveredIndex('success')
                setIndexTooltipPosition({ x: rect.right + 10, y: rect.top })
              }}
              onMouseLeave={() => {
                setHoveredIndex(null)
                setIndexTooltipPosition(null)
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#4ade80',
                cursor: 'pointer',
                fontSize: '12px',
                padding: '0',
                display: 'flex',
                alignItems: 'center',
                lineHeight: '1'
              }}
              title="Click to learn more about Success Index"
            >
              ℹ️
            </button>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#4ade80', letterSpacing: '-0.02em' }}>
            {(measuredIndex * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Unmeasured Metrics */}
      <div>
        <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Unmeasured (Governance Debt)
        </div>
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#111111', 
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {/* Core metrics - always shown */}
          <MetricBar label="Welfare Debt" value={state.metrics.unmeasured.welfareDebt} color="#fb923c" metricKey="welfareDebt" />
          <MetricBar label="System Irreversibility" value={state.metrics.unmeasured.systemIrreversibility} color="#ef4444" metricKey="systemIrreversibility" />
          
          {/* Advanced metrics - shown when expanded */}
          {showAdvancedMetrics && (
            <>
              <MetricBar label="Enforcement Gap" value={state.metrics.unmeasured.enforcementGap} color="#f59e0b" metricKey="enforcementGap" />
              <MetricBar label="Regulatory Capture" value={state.metrics.unmeasured.regulatoryCapture} color="#ef4444" metricKey="regulatoryCapture" />
              <MetricBar label="Sentience Knowledge Gap" value={state.metrics.unmeasured.sentienceKnowledgeGap} color="#a855f7" metricKey="sentienceKnowledgeGap" />
            </>
          )}
        </div>
        
        <div style={{ 
          marginTop: '20px', 
          padding: '16px', 
          backgroundColor: '#000000', 
          borderRadius: '8px',
          border: '2px solid rgba(251, 146, 60, 0.3)',
          boxShadow: '0 0 20px rgba(251, 146, 60, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <div style={{ fontSize: '12px', color: '#888', fontWeight: 500 }}>Debt Index</div>
            <button
              onClick={() => setShowIndexExplainer('debt')}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                setHoveredIndex('debt')
                setIndexTooltipPosition({ x: rect.right + 10, y: rect.top })
              }}
              onMouseLeave={() => {
                setHoveredIndex(null)
                setIndexTooltipPosition(null)
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#fb923c',
                cursor: 'pointer',
                fontSize: '12px',
                padding: '0',
                display: 'flex',
                alignItems: 'center',
                lineHeight: '1'
              }}
              title="Click to learn more about Debt Index"
            >
              ℹ️
            </button>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#fb923c', letterSpacing: '-0.02em' }}>
            {(debtIndex * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Longtermism Research Panel */}
      <LongtermismPanel />

      {/* Index Tooltip */}
      {hoveredIndex && indexTooltipPosition && (
        <div style={{
          position: 'fixed',
          left: `${indexTooltipPosition.x}px`,
          top: `${indexTooltipPosition.y}px`,
          backgroundColor: '#111111',
          border: `1px solid ${hoveredIndex === 'success' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(251, 146, 60, 0.3)'}`,
          borderRadius: '8px',
          padding: '12px',
          maxWidth: '280px',
          zIndex: 10000,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
          pointerEvents: 'none'
        }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
            {hoveredIndex === 'success' ? 'Measured Success Index' : 'Governance Debt Index'}
          </div>
          <div style={{ fontSize: '11px', color: '#bbb', lineHeight: '1.5', marginBottom: '8px' }}>
            {hoveredIndex === 'success' 
              ? 'Combines production efficiency, welfare standard adoption, cost management, and incident reduction into a single score. Higher is better.'
              : 'Tracks hidden costs: enforcement gaps, regulatory capture, knowledge gaps, system irreversibility, and welfare debt. Lower is better.'}
          </div>
          <div style={{ fontSize: '10px', color: '#888', fontStyle: 'italic', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            Click the icon for detailed explanation
          </div>
        </div>
      )}

      {/* Tooltip */}
      {tooltipMetric && tooltipPosition && (() => {
        const explanation = getMetricExplanation(tooltipMetric)
        if (!explanation) return null
        
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
              maxWidth: '300px',
              zIndex: 10000,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
              pointerEvents: 'auto' // Enable pointer events so links can be clicked
            }}
            onMouseEnter={() => {
              // Clear any pending hide timeout
              if (hideTooltipTimeout) {
                clearTimeout(hideTooltipTimeout)
                setHideTooltipTimeout(null)
              }
              setTooltipHovered(true)
            }}
            onMouseLeave={() => {
              setTooltipHovered(false)
              // Hide after a short delay
              const timeout = setTimeout(() => {
                setTooltipMetric(null)
                setTooltipPosition(null)
              }, 150)
              setHideTooltipTimeout(timeout)
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
              {explanation.label}
            </div>
            <div style={{ fontSize: '11px', color: '#bbb', lineHeight: '1.5', marginBottom: '8px' }}>
              {explanation.description}
            </div>
            <div style={{ fontSize: '10px', color: '#888', fontStyle: 'italic', marginBottom: '6px', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              📊 {explanation.realWorldExample}
            </div>
            {explanation.benchmark && (
              <div style={{ fontSize: '10px', color: '#60a5fa', marginTop: '6px' }}>
                Benchmark: {explanation.benchmark.level} - {explanation.benchmark.description}
              </div>
            )}
            {explanation.researchCitation && (
              <div style={{ fontSize: '9px', color: '#666', marginTop: '6px', fontStyle: 'italic' }}>
                {explanation.researchCitation}
                {explanation.researchUrl && (
                  <a 
                    href={explanation.researchUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      color: '#60a5fa', 
                      marginLeft: '6px', 
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      fontWeight: 500
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      // Try to open link, but handle errors gracefully
                      try {
                        // Link will open in new tab via href
                        // Keep tooltip open briefly after click to show it worked
                        setTimeout(() => {
                          setTooltipMetric(null)
                          setTooltipPosition(null)
                        }, 500)
                      } catch (error) {
                        console.warn('Could not open link:', explanation.researchUrl, error)
                        // Still close tooltip
                        setTimeout(() => {
                          setTooltipMetric(null)
                          setTooltipPosition(null)
                        }, 100)
                      }
                    }}
                    onError={(e) => {
                      console.warn('Link error:', explanation.researchUrl)
                    }}
                  >
                    Read paper →
                  </a>
                )}
              </div>
            )}
          </div>
        )
      })()}

      {/* Metric History Viewer Modal */}
      {historyViewer && (
        <MetricHistoryViewer
          state={state}
          metricKey={historyViewer.metricKey}
          label={historyViewer.label}
          color={historyViewer.color}
          isUnmeasured={historyViewer.isUnmeasured}
          onClose={() => setHistoryViewer(null)}
        />
      )}

      {/* Index Explainer Modal */}
      {showIndexExplainer && (
        <IndexExplainerModal
          type={showIndexExplainer}
          onClose={() => setShowIndexExplainer(null)}
        />
      )}
    </div>
  )
}
