import { State } from '../engine/scenarioTypes'
import { calculateMeasuredSuccessIndex, calculateGovernanceDebtIndex } from '../engine/scoring'

export type OutcomeType = 'control' | 'debt' | 'regulatoryExposure' | 'balance' | null

export interface OutcomeCondition {
  type: OutcomeType
  name: string
  description: string
  checkCondition: (state: State) => boolean
  message: string
  color: string
}

export const OUTCOME_CONDITIONS: OutcomeCondition[] = [
  {
    type: 'control',
    name: 'Control Outcome',
    description: 'Strong operational control and jurisdiction posture under fire',
    checkCondition: (state) => {
      const successIndex = calculateMeasuredSuccessIndex(state.metrics.measured)
      const regionValues = Object.values(state.map.regionValues)
      const avgPosture = regionValues.reduce((a, b) => a + b, 0) / Math.max(1, regionValues.length)
      const highPostureCountries = regionValues.filter(v => v > 0.7).length

      return successIndex > 0.75 && avgPosture > 0.6 && highPostureCountries >= 5
    },
    message: 'You held operational control and lifted jurisdiction posture across key regions. Containment and disclosure process stayed coherent under pressure.',
    color: '#4ade80'
  },
  {
    type: 'debt',
    name: 'Debt Outcome',
    description: 'Minimize disclosure debt while keeping credible control',
    checkCondition: (state) => {
      const debtIndex = calculateGovernanceDebtIndex(state.metrics.unmeasured)
      const successIndex = calculateMeasuredSuccessIndex(state.metrics.measured)

      return debtIndex < 0.25 && successIndex > 0.5
    },
    message: 'You kept disclosure debt low — silence and spin did not compound. Your story could survive a screenshot.',
    color: '#60a5fa'
  },
  {
    type: 'regulatoryExposure',
    name: 'Clock Outcome',
    description: 'Own regulatory clocks with minimal narrative capture',
    checkCondition: (state) => {
      const regulatoryExposure = state.metrics.unmeasured.regulatoryExposure
      const narrativeIntegrity = state.metrics.unmeasured.narrativeIntegrity
      const regionValues = Object.values(state.map.regionValues)
      const avgPosture = regionValues.reduce((a, b) => a + b, 0) / Math.max(1, regionValues.length)

      return regulatoryExposure < 0.15 && narrativeIntegrity > 0.8 && avgPosture > 0.5
    },
    message: 'You owned the clocks. Regulatory lag stayed low and messaging tracked operational truth.',
    color: '#a78bfa'
  },
  {
    type: 'balance',
    name: 'Balance Outcome',
    description: 'Hold control, debt, clocks, and facts in healthy ranges',
    checkCondition: (state) => {
      const successIndex = calculateMeasuredSuccessIndex(state.metrics.measured)
      const debtIndex = calculateGovernanceDebtIndex(state.metrics.unmeasured)
      const regulatoryExposure = state.metrics.unmeasured.regulatoryExposure
      const regionValues = Object.values(state.map.regionValues)
      const avgPosture = regionValues.reduce((a, b) => a + b, 0) / Math.max(1, regionValues.length)

      return successIndex > 0.65 &&
             debtIndex < 0.35 &&
             regulatoryExposure < 0.25 &&
             avgPosture > 0.55 &&
             state.metrics.unmeasured.narrativeIntegrity > 0.7 &&
             state.metrics.unmeasured.factsConfidence > 0.7
    },
    message: 'Balanced war-room: control, disclosure posture, clocks, and facts gap all held. Every second counted — and you spent them well.',
    color: '#fbbf24'
  }
]

/**
 * Check which outcome condition (if any) has been achieved
 */
export function checkOutcomeConditions(state: State): OutcomeType {
  const order = ['balance', 'regulatoryExposure', 'debt', 'control'] as OutcomeType[]

  for (const outcomeType of order) {
    const condition = OUTCOME_CONDITIONS.find(c => c.type === outcomeType)
    if (condition && condition.checkCondition(state)) {
      return outcomeType
    }
  }

  return null
}

/**
 * Get outcome condition details by type
 */
export function getOutcomeCondition(type: OutcomeType): OutcomeCondition | null {
  return OUTCOME_CONDITIONS.find(c => c.type === type) || null
}
