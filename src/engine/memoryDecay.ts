import { State, Assumption } from './scenarioTypes'

const DECAY_RATE = 0.05  // 5% decay per turn
export const STRENGTH_THRESHOLD = 0.3  // Below this, assumption is "degraded"

/**
 * Apply memory decay to assumptions
 * Each turn, assumptions lose strength unless reaffirmed
 */
export function memoryDecay(state: State): State {
  const newState = { ...state }
  const currentTurn = state.turn

  newState.memory.assumptionsBank = state.memory.assumptionsBank.map(assumption => {
    // If reaffirmed this turn, reset strength
    if (assumption.lastReaffirmedTurn === currentTurn) {
      return {
        ...assumption,
        strength: Math.min(1.0, assumption.strength + 0.2), // Boost when reaffirmed
      }
    }

    // Otherwise, decay
    const newStrength = Math.max(0, assumption.strength - DECAY_RATE)
    
    return {
      ...assumption,
      strength: newStrength,
    }
  })

  // Mark degraded assumptions (for UI display)
  // This is handled in selectors/UI, but we could add a flag here if needed

  return newState
}

/**
 * Reaffirm an assumption (called when user checks "Preserve assumptions")
 */
export function reaffirmAssumption(state: State, assumptionText: string, turn: number): State {
  const newState = { ...state }
  
  newState.memory.assumptionsBank = newState.memory.assumptionsBank.map(assumption => {
    if (assumption.text === assumptionText) {
      return {
        ...assumption,
        lastReaffirmedTurn: turn,
        strength: Math.min(1.0, assumption.strength + 0.2),
      }
    }
    return assumption
  })

  return newState
}

/**
 * Add a new assumption to the bank
 */
export function addAssumption(state: State, text: string, turn: number): State {
  const newState = { ...state }
  
  const newAssumption: Assumption = {
    text,
    createdTurn: turn,
    strength: 1.0, // Start at full strength
  }

  newState.memory.assumptionsBank = [...newState.memory.assumptionsBank, newAssumption]
  
  return newState
}
