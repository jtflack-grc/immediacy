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
      
      // Capture the actual geographic consequence after propagation, not just the requested delta.
      const regionDeltas: Record<string, number> = {}
      const regionKeys = new Set([
        ...Object.keys(stateAfterDecay.map.regionValues),
        ...Object.keys(stateAfterDelta.map.regionValues),
      ])
      regionKeys.forEach((iso3) => {
        const before = stateAfterDecay.map.regionValues[iso3] ?? 0
        const after = stateAfterDelta.map.regionValues[iso3] ?? 0
        const change = after - before
        if (Math.abs(change) > 0.0001) regionDeltas[iso3] = change
      })

      const priorArcIds = new Set(stateAfterDecay.map.activeArcs.map((arc) => arc.id))
      const priorHubIds = new Set(stateAfterDecay.map.activeHubs.map((hub) => hub.id))
      const priorRingIds = new Set(stateAfterDecay.map.activeRings.map((ring) => ring.id))
      const mapImpact = {
        regionDeltas,
        activatedArcIds: stateAfterDelta.map.activeArcs
          .filter((arc) => !priorArcIds.has(arc.id))
          .map((arc) => arc.id),
        activatedHubIds: stateAfterDelta.map.activeHubs
          .filter((hub) => !priorHubIds.has(hub.id))
          .map((hub) => hub.id),
        spawnedRings: stateAfterDelta.map.activeRings
          .filter((ring) => !priorRingIds.has(ring.id))
          .map((ring) => ({ ...ring })),
      }

      // Create audit record with metric snapshot and reproducible decision inputs.
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
        delta: JSON.parse(JSON.stringify(delta)),
        mapImpact,
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
