import { useState } from 'react'
import { State, MeasuredMetrics, UnmeasuredMetrics } from '../engine/scenarioTypes'
import { calculateMeasuredSuccessIndex, calculateGovernanceDebtIndex } from '../engine/scoring'

interface MetricHistoryViewerProps {
  state: State
  metricKey: keyof MeasuredMetrics | keyof UnmeasuredMetrics
  label: string
  color: string
  isUnmeasured?: boolean
  onClose: () => void
}

export default function MetricHistoryViewer({ 
  state, 
  metricKey, 
  label, 
  color, 
  isUnmeasured = false,
  onClose 
}: MetricHistoryViewerProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // Build complete metric history
  const getMetricHistory = (): Array<{ turn: number; value: number; label?: string }> => {
    const history: Array<{ turn: number; value: number; label?: string }> = []
    
    // Initial value (turn 0)
    const initialValue = (state.initialMetrics?.measured as any)?.[metricKey] ?? 
                        (state.initialMetrics?.unmeasured as any)?.[metricKey] ?? 0
    history.push({ 
      turn: 0, 
      value: initialValue,
      label: 'Initial State'
    })
    
    // Values from audit trail
    state.auditTrail.forEach((record, idx) => {
      if (record.metricsSnapshot) {
        const value = (record.metricsSnapshot.measured as any)?.[metricKey] ?? 
                     (record.metricsSnapshot.unmeasured as any)?.[metricKey] ?? 
                     history[history.length - 1].value
        history.push({ 
          turn: record.turn, 
          value,
          label: `${record.nodeTitle} (Turn ${record.turn})`
        })
      }
    })
    
    // Current value
    const currentValue = (state.metrics.measured as any)[metricKey] ?? 
                        (state.metrics.unmeasured as any)[metricKey] ?? 0
    if (history.length === 0 || Math.abs(history[history.length - 1].value - currentValue) > 0.001) {
      history.push({ 
        turn: state.turn, 
        value: currentValue,
        label: `Current (Turn ${state.turn})`
      })
    }
    
    return history
  }

  const history = getMetricHistory()
  const maxValue = Math.max(...history.map(h => h.value), 1)
  const minValue = Math.min(...history.map(h => h.value), 0)

  // Calculate chart dimensions
  const chartWidth = 600
  const chartHeight = 200
  const padding = 40

  // Generate SVG path for the line
  const points = history.map((h, idx) => {
    const x = padding + (idx / (history.length - 1 || 1)) * (chartWidth - 2 * padding)
    const y = chartHeight - padding - ((h.value - minValue) / (maxValue - minValue || 1)) * (chartHeight - 2 * padding)
    return { x, y, ...h }
  })

  const pathData = points.map((p, idx) => 
    `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ')

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
        backgroundColor: '#111111',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        padding: '24px',
        maxWidth: '700px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#fff', margin: 0 }}>
            {label} - History
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
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        {/* Chart */}
        <div style={{ marginBottom: '24px' }}>
          <svg width={chartWidth} height={chartHeight} style={{ display: 'block' }}>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
              const y = chartHeight - padding - ratio * (chartHeight - 2 * padding)
              return (
                <g key={ratio}>
                  <line
                    x1={padding}
                    y1={y}
                    x2={chartWidth - padding}
                    y2={y}
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="1"
                  />
                  <text
                    x={padding - 10}
                    y={y + 4}
                    fill="#888"
                    fontSize="10"
                    textAnchor="end"
                  >
                    {((maxValue - minValue) * (1 - ratio) + minValue).toFixed(2)}
                  </text>
                </g>
              )
            })}

            {/* Turn markers */}
            {points.map((p, idx) => {
              if (idx === 0 || idx === points.length - 1 || idx % Math.ceil(points.length / 5) === 0) {
                return (
                  <g key={idx}>
                    <line
                      x1={p.x}
                      y1={chartHeight - padding}
                      x2={p.x}
                      y2={chartHeight - padding + 5}
                      stroke="rgba(255, 255, 255, 0.3)"
                      strokeWidth="1"
                    />
                    <text
                      x={p.x}
                      y={chartHeight - padding + 20}
                      fill="#888"
                      fontSize="10"
                      textAnchor="middle"
                    >
                      T{p.turn}
                    </text>
                  </g>
                )
              }
              return null
            })}

            {/* Line */}
            <path
              d={pathData}
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Points */}
            {points.map((p, idx) => (
              <circle
                key={idx}
                cx={p.x}
                cy={p.y}
                r={hoveredIndex === idx ? 6 : 4}
                fill={color}
                stroke="#000"
                strokeWidth="2"
                style={{ cursor: 'pointer', transition: 'r 0.2s' }}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            ))}

            {/* Hover tooltip */}
            {hoveredIndex !== null && (
              <g>
                <rect
                  x={points[hoveredIndex].x - 60}
                  y={points[hoveredIndex].y - 50}
                  width="120"
                  height="40"
                  fill="#111111"
                  stroke={color}
                  strokeWidth="1"
                  rx="4"
                />
                <text
                  x={points[hoveredIndex].x}
                  y={points[hoveredIndex].y - 35}
                  fill="#fff"
                  fontSize="11"
                  textAnchor="middle"
                  fontWeight="600"
                >
                  {points[hoveredIndex].label || `Turn ${points[hoveredIndex].turn}`}
                </text>
                <text
                  x={points[hoveredIndex].x}
                  y={points[hoveredIndex].y - 20}
                  fill={color}
                  fontSize="12"
                  textAnchor="middle"
                  fontWeight="600"
                >
                  {(points[hoveredIndex].value * 100).toFixed(1)}%
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* History Table */}
        <div style={{
          backgroundColor: '#000000',
          borderRadius: '8px',
          padding: '16px',
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <th style={{ textAlign: 'left', padding: '8px', fontSize: '12px', color: '#888', fontWeight: 600 }}>Turn</th>
                <th style={{ textAlign: 'left', padding: '8px', fontSize: '12px', color: '#888', fontWeight: 600 }}>Event</th>
                <th style={{ textAlign: 'right', padding: '8px', fontSize: '12px', color: '#888', fontWeight: 600 }}>Value</th>
                <th style={{ textAlign: 'right', padding: '8px', fontSize: '12px', color: '#888', fontWeight: 600 }}>Change</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, idx) => {
                const prevValue = idx > 0 ? history[idx - 1].value : h.value
                const change = h.value - prevValue
                return (
                  <tr 
                    key={idx}
                    style={{ 
                      borderBottom: idx < history.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <td style={{ padding: '8px', fontSize: '12px', color: '#fff' }}>{h.turn}</td>
                    <td style={{ padding: '8px', fontSize: '12px', color: '#aaa' }}>{h.label || '-'}</td>
                    <td style={{ padding: '8px', fontSize: '12px', color: color, textAlign: 'right', fontWeight: 600 }}>
                      {(h.value * 100).toFixed(1)}%
                    </td>
                    <td style={{ 
                      padding: '8px', 
                      fontSize: '12px', 
                      textAlign: 'right',
                      color: change > 0 ? (isUnmeasured ? '#ef4444' : '#4ade80') : (isUnmeasured ? '#4ade80' : '#ef4444'),
                      fontWeight: 600
                    }}>
                      {idx > 0 && (
                        <>
                          {change > 0 ? '+' : ''}{(change * 100).toFixed(1)}%
                        </>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
