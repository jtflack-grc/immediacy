import { State, TimeMode, Choice } from './scenarioTypes'
import { deliverDueDispatches } from './dispatches'

const DEFAULT_CHOICE_MINUTES = 30

export function getTimeCost(choice: Choice): number {
  return choice.timeCost ?? choice.delta?.timeCost ?? DEFAULT_CHOICE_MINUTES
}

/** Advance incident clock; in learning mode still advances simulated time for narrative consistency */
export function advanceIncidentTime(state: State, minutes: number, mode?: TimeMode): State {
  const timeMode = mode || state.timeMode || 'simulated'
  // Accessibility / learning: still advance simulated clock (no real-time penalty elsewhere)
  const cost = timeMode === 'learning' ? Math.max(5, Math.floor(minutes * 0.5)) : minutes
  const incidentTime = (state.incidentTime || 0) + cost

  const deadlines = (state.deadlines || []).map(d => ({
    ...d,
    missed: d.missed || incidentTime > d.dueAt,
  }))

  let next: State = { ...state, incidentTime, deadlines }
  next = deliverDueDispatches(next)
  return next
}

export function formatIncidentClock(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `T+${h}h ${String(m).padStart(2, '0')}m`
}
