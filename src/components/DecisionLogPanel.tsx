import { useState } from 'react'
import { State } from '../engine/scenarioTypes'
import { formatIncidentClock } from '../engine/incidentClock'

interface DecisionLogPanelProps {
  state: State
}

export default function DecisionLogPanel({ state }: DecisionLogPanelProps) {
  const [collapsed, setCollapsed] = useState(true)
  const entries = [...(state.auditTrail || [])].reverse()

  return (
    <div style={{
      marginTop: '20px',
      backgroundColor: '#111111',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: '#fff',
        }}
      >
        <span style={{
          fontSize: '12px',
          color: '#888',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          fontWeight: 600,
        }}>
          Decision Log ({entries.length})
        </span>
        <span style={{ fontSize: '11px', color: '#888' }}>{collapsed ? '▶' : '▼'}</span>
      </button>

      {!collapsed && (
        <div style={{ padding: '0 16px 16px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {entries.length === 0 ? (
            <div style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>No decisions logged yet.</div>
          ) : (
            entries.map((record, idx) => (
              <div
                key={`${record.turn}-${record.timestamp}-${idx}`}
                style={{
                  padding: '10px 12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '10px', color: '#60a5fa', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                    {record.incidentTime !== undefined ? formatIncidentClock(record.incidentTime) : `Turn ${record.turn}`}
                  </span>
                  <span style={{
                    fontSize: '10px',
                    color: '#aaa',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    whiteSpace: 'nowrap',
                  }}>
                    {record.ownerRole}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#fff', fontWeight: 600, marginBottom: '4px' }}>
                  {record.chosenLabel}
                </div>
                {record.rationale && (
                  <div style={{ fontSize: '11px', color: '#999', lineHeight: 1.4 }}>
                    {record.rationale.length > 140 ? `${record.rationale.slice(0, 140)}…` : record.rationale}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
