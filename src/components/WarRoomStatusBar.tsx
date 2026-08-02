import { State, TimeMode } from '../engine/scenarioTypes'
import { formatIncidentClock } from '../engine/incidentClock'
import { STARTER_UNKNOWNS } from './EvidenceBoard'

interface WarRoomStatusBarProps {
  state: State
  onSetTimeMode?: (mode: TimeMode) => void
}

const TIME_MODE_LABELS: Record<TimeMode, string> = {
  learning: 'Learning',
  exercise: 'Exercise',
  accessibility: 'Accessibility',
  simulated: 'Simulated',
}

const TIME_MODES: TimeMode[] = ['learning', 'exercise', 'accessibility', 'simulated']

function StatItem({ label, value, accent, title }: { label: string; value: string; accent?: string; title?: string }) {
  return (
    <div style={{ minWidth: 0 }} title={title}>
      <div style={{
        fontSize: '9px',
        color: '#777',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginBottom: '2px',
        whiteSpace: 'nowrap',
      }}>
        {label}
      </div>
      <div style={{
        fontSize: '12px',
        fontWeight: 600,
        color: accent || '#eee',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {value}
      </div>
    </div>
  )
}

export default function WarRoomStatusBar({ state, onSetTimeMode }: WarRoomStatusBarProps) {
  const evidence = state.evidence || []
  const verifiedCount = evidence.filter(f => f.verificationStatus === 'corroborated').length
  const unknownCount = evidence.length > 0 ? evidence.length - verifiedCount : STARTER_UNKNOWNS.length

  const activeDeadlines = (state.deadlines || []).filter(d => !d.missed)
  const nearestDeadline = activeDeadlines.length > 0
    ? activeDeadlines.reduce((a, b) => (a.dueAt < b.dueAt ? a : b))
    : null

  const dispatchLog = state.dispatchLog || []
  const latestDispatch = dispatchLog.length > 0 ? dispatchLog[dispatchLog.length - 1] : null

  const disclosureDebtPct = Math.round((state.metrics?.unmeasured?.disclosureDebt ?? 0) * 100)
  const operationalControlPct = Math.round((state.metrics?.measured?.operationalControl ?? 0) * 100)

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '18px',
      flexWrap: 'wrap',
      padding: '10px 14px',
      marginBottom: '16px',
      backgroundColor: '#0a0a0a',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '8px',
    }}>
      <StatItem label="Incident Clock" value={formatIncidentClock(state.incidentTime)} accent="#60a5fa" />
      <StatItem label="Facts" value={`${verifiedCount} verified / ${unknownCount} unknown`} />
      <StatItem
        label="Nearest Deadline"
        value={nearestDeadline ? `${nearestDeadline.label} · ${formatIncidentClock(nearestDeadline.dueAt)}` : 'None active'}
        accent={nearestDeadline ? '#fbbf24' : undefined}
        title={nearestDeadline?.label}
      />
      <StatItem
        label="Latest Dispatch"
        value={latestDispatch ? `${latestDispatch.source}: ${latestDispatch.body}` : 'No dispatches yet'}
        title={latestDispatch?.body}
      />
      <StatItem label="Disclosure Debt" value={`${disclosureDebtPct}%`} accent="#fb923c" />
      <StatItem label="Operational Control" value={`${operationalControlPct}%`} accent="#4ade80" />

      {onSetTimeMode && (
        <div style={{ marginLeft: 'auto' }}>
          <select
            value={state.timeMode}
            onChange={e => onSetTimeMode(e.target.value as TimeMode)}
            style={{
              padding: '6px 10px',
              fontSize: '11px',
              fontWeight: 600,
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
            title="Time mode"
          >
            {TIME_MODES.map(mode => (
              <option key={mode} value={mode} style={{ color: '#000' }}>
                {TIME_MODE_LABELS[mode]}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
