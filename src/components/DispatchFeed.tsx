import { State } from '../engine/scenarioTypes'
import { formatIncidentClock } from '../engine/incidentClock'

interface DispatchFeedProps {
  state: State
}

export default function DispatchFeed({ state }: DispatchFeedProps) {
  const dispatches = [...(state.dispatchLog || [])].reverse()

  return (
    <div style={{
      marginTop: '20px',
      padding: '16px',
      backgroundColor: '#111111',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    }}>
      <div style={{
        fontSize: '12px',
        color: '#888',
        marginBottom: '12px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        fontWeight: 600,
      }}>
        Dispatch Feed
      </div>

      {dispatches.length === 0 ? (
        <div style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>No dispatches yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {dispatches.map((dispatch, idx) => (
            <div
              key={`${dispatch.id}-${idx}`}
              style={{
                padding: '10px 12px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '6px',
                border: '1px solid rgba(96, 165, 250, 0.2)',
                borderLeft: '3px solid #60a5fa',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#60a5fa' }}>{dispatch.source}</span>
                <span style={{ fontSize: '10px', color: '#777', fontVariantNumeric: 'tabular-nums' }}>
                  {formatIncidentClock(dispatch.at)}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#ddd', lineHeight: 1.4 }}>
                {dispatch.body}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
