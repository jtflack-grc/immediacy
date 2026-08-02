import { State } from '../engine/scenarioTypes'
import { calculateMeasuredSuccessIndex, calculateGovernanceDebtIndex } from '../engine/scoring'

export type VictoryType = 'welfare' | 'debt' | 'enforcement' | 'balance' | null

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
    type: 'welfare',
    name: 'Welfare Victory',
    description: 'Achieve high welfare standards globally while maintaining efficiency',
    checkCondition: (state) => {
      const successIndex = calculateMeasuredSuccessIndex(state.metrics.measured)
      const avgWelfare = Object.values(state.map.regionValues).reduce((a, b) => a + b, 0) / Object.values(state.map.regionValues).length
      const highWelfareCountries = Object.values(state.map.regionValues).filter(v => v > 0.7).length
      
      return successIndex > 0.75 && avgWelfare > 0.6 && highWelfareCountries >= 5
    },
    message: 'You have achieved exceptional welfare standards across the globe while maintaining production efficiency. Your commitment to animal welfare has created a model for others to follow.',
    color: '#4ade80' // green
  },
  {
    type: 'debt',
    name: 'Debt Victory',
    description: 'Minimize welfare debt while maintaining reasonable standards',
    checkCondition: (state) => {
      const debtIndex = calculateGovernanceDebtIndex(state.metrics.unmeasured)
      const successIndex = calculateMeasuredSuccessIndex(state.metrics.measured)
      
      return debtIndex < 0.25 && successIndex > 0.5
    },
    message: 'You have successfully minimized hidden costs and governance debt while maintaining reasonable welfare standards. Your pragmatic approach avoided the pitfalls of unmeasured risks.',
    color: '#60a5fa' // blue
  },
  {
    type: 'enforcement',
    name: 'Enforcement Victory',
    description: 'Achieve perfect enforcement with minimal gaps',
    checkCondition: (state) => {
      const enforcementGap = state.metrics.unmeasured.enforcementGap
      const regulatoryCapture = state.metrics.unmeasured.regulatoryCapture
      const avgWelfare = Object.values(state.map.regionValues).reduce((a, b) => a + b, 0) / Object.values(state.map.regionValues).length
      
      return enforcementGap < 0.15 && regulatoryCapture < 0.2 && avgWelfare > 0.5
    },
    message: 'You have achieved exceptional enforcement with minimal gaps between policy and practice. Your governance systems ensure that standards translate into real-world improvements.',
    color: '#a78bfa' // purple
  },
  {
    type: 'balance',
    name: 'Balance Victory',
    description: 'Achieve all metrics in good ranges - the most challenging path',
    checkCondition: (state) => {
      const successIndex = calculateMeasuredSuccessIndex(state.metrics.measured)
      const debtIndex = calculateGovernanceDebtIndex(state.metrics.unmeasured)
      const enforcementGap = state.metrics.unmeasured.enforcementGap
      const avgWelfare = Object.values(state.map.regionValues).reduce((a, b) => a + b, 0) / Object.values(state.map.regionValues).length
      
      return successIndex > 0.65 && 
             debtIndex < 0.35 && 
             enforcementGap < 0.25 && 
             avgWelfare > 0.55 &&
             state.metrics.unmeasured.regulatoryCapture < 0.3 &&
             state.metrics.unmeasured.sentienceKnowledgeGap < 0.3
    },
    message: 'You have achieved exceptional balance across all dimensions of governance. Your holistic approach demonstrates that it is possible to balance welfare, efficiency, enforcement, and long-term sustainability.',
    color: '#fbbf24' // gold
  }
]

/**
 * Check which victory condition (if any) has been achieved
 */
export function checkVictoryConditions(state: State): VictoryType {
  // Check in order of specificity (most specific first)
  // Balance is checked last as it's the most comprehensive
  const order = ['balance', 'enforcement', 'debt', 'welfare'] as VictoryType[]
  
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
