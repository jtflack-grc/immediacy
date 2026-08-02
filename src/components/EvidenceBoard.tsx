import { State, FactKind } from '../engine/scenarioTypes'
import { formatIncidentClock } from '../engine/incidentClock'

interface EvidenceBoardProps {
  state: State
}

export interface StarterUnknown {
  id: string
  text: string
}

// Shown when no evidence facts have been logged yet, so the board is never empty at T0.
export const STARTER_UNKNOWNS: StarterUnknown[] = [
  { id: 'unknown_blast_radius', text: 'Blast radius unknown' },
  { id: 'unknown_personal_data', text: 'Personal data in scope: unconfirmed' },
  { id: 'unknown_awareness_time', text: 'Awareness time: TBD' },
]

const KIND_COLORS: Record<FactKind, string> = {
  verified: '#4ade80',
  preliminary: '#60a5fa',
  assumption: '#fbbf24',
  third_party: '#a855f7',
  adversary: '#ef4444',
  legal: '#38bdf8',
  executive: '#f472b6',
}

const KIND_LABELS: Record<FactKind, string> = {
  verified: 'Verified',
  preliminary: 'Preliminary',
  assumption: 'Assumption',
  third_party: '3rd Party',
  adversary: 'Adversary',
  legal: 'Legal',
  executive: 'Executive',
}

export default function EvidenceBoard({ state }: EvidenceBoardProps) {
  const facts = state.evidence || []

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
        Evidence Board
      </div>

      {facts.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {STARTER_UNKNOWNS.map(u => (
            <div
              key={u.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 10px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '6px',
                border: '1px dashed rgba(255, 255, 255, 0.15)',
              }}
            >
              <span style={{ fontSize: '11px', color: '#666' }}>❓</span>
              <span style={{ fontSize: '12px', color: '#bbb', fontStyle: 'italic' }}>{u.text}</span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {facts.map(fact => (
            <div
              key={fact.id}
              style={{
                padding: '10px 12px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '6px',
                border: `1px solid ${KIND_COLORS[fact.kind]}33`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: KIND_COLORS[fact.kind],
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  border: `1px solid ${KIND_COLORS[fact.kind]}66`,
                  backgroundColor: `${KIND_COLORS[fact.kind]}18`,
                  whiteSpace: 'nowrap',
                }}>
                  {KIND_LABELS[fact.kind]}
                </span>
                <span style={{ fontSize: '10px', color: '#777', fontVariantNumeric: 'tabular-nums' }}>
                  {formatIncidentClock(fact.timestamp)}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#ddd', lineHeight: 1.4, marginBottom: '6px' }}>
                {fact.text}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#888' }}>
                <span>{fact.source}</span>
                <span>Confidence {Math.round(fact.confidence * 100)}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
