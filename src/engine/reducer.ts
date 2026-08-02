import { State, Delta, AuditRecord, TimeMode } from './scenarioTypes'
import { applyDelta } from './applyDelta'
import { memoryDecay } from './memoryDecay'
import { addAssumption } from './memoryDecay'
import { checkLossConditions, checkLossWarnings } from '../utils/lossConditions'

export type Action =
  | { type: 'INIT'; payload: { initialState: State } }
  | { type: 'CHOOSE_OPTION'; payload: { choiceId: string; ownerRole: string; rationale: string; assumptions: string; delta: Delta; nodeTitle: string; chosenLabel: string; phaseId: string; unmeasuredImpact: string; alternativesConsidered?: string[]; factsAvailable?: string[] } }
  | { type: 'TOGGLE_DEBUG' }
  | { type: 'RESET'; payload: { initialState: State } }
  | { type: 'SET_MAP_MODE'; payload: { mode: State['map']['mode'] } }
  | { type: 'SET_TIME_MODE'; payload: { mode: TimeMode } }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: { achievementId: string } }
  | { type: 'RESEARCH_TECH'; payload: { techId: string } }
  | { type: 'TRIGGER_EVENT'; payload: { event: any } }
  | { type: 'RESOLVE_EVENT'; payload: { eventId: string; choiceIndex: number } }
  | { type: 'SET_PLAYER_NAME'; payload: { playerName: string } }

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'INIT':
      return action.payload.initialState

    case 'CHOOSE_OPTION': {
      const { ownerRole, rationale, assumptions, delta, nodeTitle, chosenLabel, phaseId, unmeasuredImpact, alternativesConsidered, factsAvailable } = action.payload
      
      // Apply memory decay first
      let stateAfterDecay = memoryDecay(state)
      
      // Add new assumptions to the bank
      if (assumptions.trim()) {
        stateAfterDecay = addAssumption(stateAfterDecay, assumptions, stateAfterDecay.turn)
      }
      
      // Apply delta
      const stateAfterDelta = applyDelta(stateAfterDecay, delta)
      
      // Create audit record with metric snapshot
      const auditRecord: AuditRecord = {
        turn: stateAfterDelta.turn + 1,
        phaseId,
        nodeId: state.currentNodeId,
        nodeTitle,
        chosenLabel,
        ownerRole,
        rationale,
        assumptions,
        unmeasuredImpact,
        timestamp: Date.now(),
        metricsSnapshot: JSON.parse(JSON.stringify(stateAfterDelta.metrics)), // Deep copy for history
        immediateConsequence: unmeasuredImpact,
        alternativesConsidered,
        factsAvailable,
      }
      
      // Increment turn
      const newTurn = stateAfterDelta.turn + 1
      const newState = {
        ...stateAfterDelta,
        turn: newTurn,
        auditTrail: [...stateAfterDelta.auditTrail, auditRecord],
      }
      
      // Check loss conditions and warnings
      const lossConditionsMet = checkLossConditions(newState)
      const lossWarnings = checkLossWarnings(newState).map(w => ({
        ...w,
        turn: newTurn
      }))
      
      return {
        ...newState,
        lossConditionsMet,
        lossWarnings,
      }
    }

    case 'TOGGLE_DEBUG':
      return {
        ...state,
        flags: {
          ...state.flags,
          showDebug: !state.flags.showDebug,
        },
      }

    case 'RESET':
      // Return to initial state
      return action.payload.initialState

    case 'SET_MAP_MODE':
      return {
        ...state,
        map: {
          ...state.map,
          mode: action.payload.mode,
        },
      }

    case 'UNLOCK_ACHIEVEMENT': {
      const existing = state.achievements || []
      if (existing.includes(action.payload.achievementId)) {
        return state
      }
      return {
        ...state,
        achievements: [...existing, action.payload.achievementId],
      }
    }

    case 'RESEARCH_TECH': {
      const existing = state.researchedTechs || []
      if (existing.includes(action.payload.techId)) {
        return state
      }
      return {
        ...state,
        researchedTechs: [...existing, action.payload.techId],
      }
    }

    case 'TRIGGER_EVENT': {
      const existing = state.activeEvents || []
      return {
        ...state,
        activeEvents: [...existing, action.payload.event],
      }
    }

    case 'RESOLVE_EVENT': {
      const existing = state.activeEvents || []
      return {
        ...state,
        activeEvents: existing.filter(e => e.id !== action.payload.eventId),
      }
    }

    case 'SET_PLAYER_NAME':
      return {
        ...state,
        playerName: action.payload.playerName
      }

    case 'SET_TIME_MODE':
      return {
        ...state,
        timeMode: action.payload.mode,
      }

    default:
      return state
  }
}
