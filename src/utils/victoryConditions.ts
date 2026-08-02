import { State } from '../engine/scenarioTypes'
import { calculateMeasuredSuccessIndex, calculateGovernanceDebtIndex } from '../engine/scoring'

export type VictoryType = 'control' | 'debt' | 'regulatoryExposure' | 'balance' | null

export interface VictoryCondition {
  type: VictoryType
  name: string
  description: string
  checkCondition: (state: State) => boolean
  message: string
  color: string
}

export const VICTORY_CONDITIONS: VictoryCondition[] = [
  {
    type: 'control',
    name: 'Control Outcome',
    description: 'Strong operational control and jurisdiction posture under fire',
    checkCondition: (state) => {
      const successIndex = calculateMeasuredSuccessIndex(state.metrics.measured)
      const avgWelfare = Object.values(state.map.regionValues).reduce((a, b) => a + b, 0) / Object.values(state.map.regionValues).length
      const highWelfareCountries = Object.values(state.map.regionValues).filter(v => v > 0.7).length
      
      return successIndex > 0.75 && avgWelfare > 0.6 && highWelfareCountries >= 5
    },
    message: 'You held operational control and lifted jurisdiction posture across key regions. Containment and disclosure process stayed coherent under pressure.',
    color: '#4ade80' // green
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
    color: '#60a5fa' // blue
  },
  {
    type: 'regulatoryExposure',
    name: 'Clock Outcome',
    description: 'Own regulatory clocks with minimal narrative capture',
    checkCondition: (state) => {
      const regulatoryExposure = state.metrics.unmeasured.regulatoryExposure
      const narrativeIntegrity = state.metrics.unmeasured.narrativeIntegrity
      const avgWelfare = Object.values(state.map.regionValues).reduce((a, b) => a + b, 0) / Object.values(state.map.regionValues).length
      
      return regulatoryExposure < 0.15 && narrativeIntegrity > 0.8 && avgWelfare > 0.5
    },
    message: 'You owned the clocks. Regulatory lag stayed low and messaging tracked operational truth.',
    color: '#a78bfa' // purple
  },
  {
    type: 'balance',
    name: 'Balance Outcome',
    description: 'Hold control, debt, clocks, and facts in healthy ranges',
    checkCondition: (state) => {
      const successIndex = calculateMeasuredSuccessIndex(state.metrics.measured)
      const debtIndex = calculateGovernanceDebtIndex(state.metrics.unmeasured)
      const regulatoryExposure = state.metrics.unmeasured.regulatoryExposure
      const avgWelfare = Object.values(state.map.regionValues).reduce((a, b) => a + b, 0) / Object.values(state.map.regionValues).length
      
      return successIndex > 0.65 && 
             debtIndex < 0.35 && 
             regulatoryExposure < 0.25 && 
             avgWelfare > 0.55 &&
             state.metrics.unmeasured.narrativeIntegrity > 0.7 &&
             state.metrics.unmeasured.factsConfidence > 0.7
    },
    message: 'Balanced war-room: control, disclosure posture, clocks, and facts gap all held. Every second counted — and you spent them well.',
    color: '#fbbf24' // gold
  }
]

/**
 * Check which victory condition (if any) has been achieved
 */
export function checkVictoryConditions(state: State): VictoryType {
  // Check in order of specificity (most specific first)
  // Balance is checked last as it's the most comprehensive
  const order = ['balance', 'regulatoryExposure', 'debt', 'control'] as VictoryType[]
  
  for (const victoryType of order) {
    const condition = VICTORY_CONDITIONS.find(c => c.type === victoryType)
    if (condition && condition.checkCondition(state)) {
      return victoryType
    }
  }
  
  return null
}

/**
 * Get victory condition details by type
 */
export function getVictoryCondition(type: VictoryType): VictoryCondition | null {
  return VICTORY_CONDITIONS.find(c => c.type === type) || null
}
