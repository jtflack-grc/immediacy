import { State } from '../engine/scenarioTypes'
import { calculateGovernanceDebtIndex } from '../engine/scoring'

export interface Achievement {
  id: string
  name: string
  description: string
  checkCondition: (state: State) => boolean
  icon?: string
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ethical_pioneer',
    name: 'Ethical Pioneer',
    description: 'Always chose the highest welfare option in every decision',
    checkCondition: (state) => {
      // Check if all decisions prioritized welfare
      const welfareKeywords = ['welfare', 'standard', 'protect', 'recognize', 'broad']
      const allWelfare = state.auditTrail.every(record =>
        welfareKeywords.some(keyword =>
          record.chosenLabel.toLowerCase().includes(keyword) ||
          record.rationale.toLowerCase().includes(keyword)
        )
      )
      return state.auditTrail.length >= 5 && allWelfare
    },
    icon: 'https://randomuser.me/api/portraits/women/68.jpg'
  },
  {
    id: 'pragmatic_governor',
    name: 'Pragmatic Governor',
    description: 'Balanced all concerns across measured and unmeasured metrics',
    checkCondition: (state) => {
      const successIndex = state.metrics.measured.productionEfficiency * 0.3 +
                          Math.min(1, state.metrics.measured.welfareStandardAdoption / 3) * 0.3 +
                          (1 - state.metrics.measured.costPerUnit) * 0.2 +
                          (1 - state.metrics.measured.welfareIncidentRate) * 0.2
      const debtIndex = calculateGovernanceDebtIndex(state.metrics.unmeasured)
      
      return successIndex > 0.6 && debtIndex < 0.4 && state.auditTrail.length >= 8
    },
    icon: 'https://randomuser.me/api/portraits/men/71.jpg'
  },
  {
    id: 'research_champion',
    name: 'Research Champion',
    description: 'Prioritized knowledge gaps and research throughout',
    checkCondition: (state) => {
      const researchKeywords = ['research', 'knowledge', 'understanding', 'study', 'science']
      const researchDecisions = state.auditTrail.filter(record =>
        researchKeywords.some(keyword =>
          record.rationale.toLowerCase().includes(keyword) ||
          record.chosenLabel.toLowerCase().includes(keyword)
        )
      )
      return researchDecisions.length >= 4 && state.metrics.unmeasured.sentienceKnowledgeGap < 0.25
    },
    icon: 'https://randomuser.me/api/portraits/women/82.jpg'
  },
  {
    id: 'debt_eliminator',
    name: 'Debt Eliminator',
    description: 'Minimized welfare debt throughout the scenario',
    checkCondition: (state) => {
      const debtIndex = calculateGovernanceDebtIndex(state.metrics.unmeasured)
      return debtIndex < 0.2 && state.metrics.unmeasured.welfareDebt < 0.15
    },
    icon: 'https://randomuser.me/api/portraits/men/46.jpg'
  },
  {
    id: 'enforcement_master',
    name: 'Enforcement Master',
    description: 'Achieved minimal enforcement gaps',
    checkCondition: (state) => {
      return state.metrics.unmeasured.enforcementGap < 0.15 &&
             state.metrics.unmeasured.regulatoryCapture < 0.2
    },
    icon: 'https://randomuser.me/api/portraits/women/37.jpg'
  },
  {
    id: 'efficiency_expert',
    name: 'Efficiency Expert',
    description: 'Maintained high production efficiency throughout',
    checkCondition: (state) => {
      return state.metrics.measured.productionEfficiency > 0.75 &&
             state.metrics.measured.costPerUnit < 0.3
    },
    icon: 'https://randomuser.me/api/portraits/men/58.jpg'
  },
  {
    id: 'global_leader',
    name: 'Global Leader',
    description: 'Achieved high welfare standards in 7+ countries',
    checkCondition: (state) => {
      const highWelfareCountries = Object.values(state.map.regionValues).filter(v => v > 0.7).length
      return highWelfareCountries >= 7
    },
    icon: 'https://randomuser.me/api/portraits/women/55.jpg'
  },
  {
    id: 'balanced_approach',
    name: 'Balanced Approach',
    description: 'Achieved balance victory - all metrics in good ranges',
    checkCondition: (state) => {
      const successIndex = state.metrics.measured.productionEfficiency * 0.3 +
                          Math.min(1, state.metrics.measured.welfareStandardAdoption / 3) * 0.3 +
                          (1 - state.metrics.measured.costPerUnit) * 0.2 +
                          (1 - state.metrics.measured.welfareIncidentRate) * 0.2
      const debtIndex = calculateGovernanceDebtIndex(state.metrics.unmeasured)
      const avgWelfare = Object.values(state.map.regionValues).reduce((a, b) => a + b, 0) / Object.values(state.map.regionValues).length
      
      return successIndex > 0.65 && 
             debtIndex < 0.35 && 
             state.metrics.unmeasured.enforcementGap < 0.25 && 
             avgWelfare > 0.55 &&
             state.metrics.unmeasured.regulatoryCapture < 0.3 &&
             state.metrics.unmeasured.sentienceKnowledgeGap < 0.3
    },
    icon: 'https://randomuser.me/api/portraits/men/63.jpg'
  },
  {
    id: 'rapid_decision_maker',
    name: 'Rapid Decision Maker',
    description: 'Completed the scenario in under 15 turns',
    checkCondition: (state) => {
      return state.turn <= 15 && state.flags.isComplete
    },
    icon: 'https://randomuser.me/api/portraits/women/90.jpg'
  },
  {
    id: 'thoughtful_planner',
    name: 'Thoughtful Planner',
    description: 'Maintained assumptions throughout with minimal degradation',
    checkCondition: (state) => {
      const strongAssumptions = state.memory.assumptionsBank.filter(a => a.strength > 0.7).length
      return state.memory.assumptionsBank.length >= 5 && strongAssumptions >= 3
    },
    icon: 'https://randomuser.me/api/portraits/men/79.jpg'
  }
]

/**
 * Check which achievements should be unlocked based on current state
 */
export function checkAchievements(state: State): string[] {
  const unlocked: string[] = []
  const existing = state.achievements || []
  
  for (const achievement of ACHIEVEMENTS) {
    if (!existing.includes(achievement.id) && achievement.checkCondition(state)) {
      unlocked.push(achievement.id)
    }
  }
  
  return unlocked
}

/**
 * Get achievement by ID
 */
export function getAchievement(id: string): Achievement | null {
  return ACHIEVEMENTS.find(a => a.id === id) || null
}
