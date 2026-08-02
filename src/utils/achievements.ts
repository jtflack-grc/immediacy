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
    name: 'Facts-First Lead',
    description: 'Consistently chose disclosure and containment paths over silence and spin',
    checkCondition: (state) => {
      const discloseKeywords = ['disclos', 'notice', 'notify', 'contain', 'isolate', 'facts', 'honest', 'transparent']
      const allDisclose = state.auditTrail.every(record =>
        discloseKeywords.some(keyword =>
          record.chosenLabel.toLowerCase().includes(keyword) ||
          record.rationale.toLowerCase().includes(keyword)
        )
      )
      return state.auditTrail.length >= 5 && allDisclose
    },
    icon: 'https://randomuser.me/api/portraits/women/68.jpg'
  },
  {
    id: 'pragmatic_governor',
    name: 'War-Room Balancer',
    description: 'Held measured control while keeping disclosure debt in check',
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
    name: 'Scope Champion',
    description: 'Prioritized forensics and facts-gap reduction throughout',
    checkCondition: (state) => {
      const researchKeywords = ['forensic', 'scope', 'facts', 'research', 'investigate', 'confirm']
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
    name: 'Debt Killer',
    description: 'Kept disclosure debt low across the incident',
    checkCondition: (state) => {
      const debtIndex = calculateGovernanceDebtIndex(state.metrics.unmeasured)
      return debtIndex < 0.2 && state.metrics.unmeasured.welfareDebt < 0.15
    },
    icon: 'https://randomuser.me/api/portraits/men/46.jpg'
  },
  {
    id: 'enforcement_master',
    name: 'Clock Keeper',
    description: 'Held regulatory clock lag and narrative capture down',
    checkCondition: (state) => {
      return state.metrics.unmeasured.enforcementGap < 0.15 &&
             state.metrics.unmeasured.regulatoryCapture < 0.2
    },
    icon: 'https://randomuser.me/api/portraits/women/37.jpg'
  },
  {
    id: 'efficiency_expert',
    name: 'Containment Ace',
    description: 'Maintained high operational control with contained burn',
    checkCondition: (state) => {
      return state.metrics.measured.productionEfficiency > 0.75 &&
             state.metrics.measured.costPerUnit < 0.3
    },
    icon: 'https://randomuser.me/api/portraits/men/58.jpg'
  },
  {
    id: 'global_leader',
    name: 'Jurisdiction Lead',
    description: 'Held strong disclosure posture across 7+ jurisdictions',
    checkCondition: (state) => {
      const highPostureCountries = Object.values(state.map.regionValues).filter(v => v > 0.7).length
      return highPostureCountries >= 7
    },
    icon: 'https://randomuser.me/api/portraits/women/55.jpg'
  },
  {
    id: 'balanced_approach',
    name: 'Every Second Counts',
    description: 'Balance victory — control, clocks, and debt all in good ranges',
    checkCondition: (state) => {
      const successIndex = state.metrics.measured.productionEfficiency * 0.3 +
                          Math.min(1, state.metrics.measured.welfareStandardAdoption / 3) * 0.3 +
                          (1 - state.metrics.measured.costPerUnit) * 0.2 +
                          (1 - state.metrics.measured.welfareIncidentRate) * 0.2
      const debtIndex = calculateGovernanceDebtIndex(state.metrics.unmeasured)
      const avgPosture = Object.values(state.map.regionValues).reduce((a, b) => a + b, 0) / Object.values(state.map.regionValues).length
      
      return successIndex > 0.65 && 
             debtIndex < 0.35 && 
             state.metrics.unmeasured.enforcementGap < 0.25 && 
             avgPosture > 0.55 &&
             state.metrics.unmeasured.regulatoryCapture < 0.3 &&
             state.metrics.unmeasured.sentienceKnowledgeGap < 0.3
    },
    icon: 'https://randomuser.me/api/portraits/men/63.jpg'
  },
  {
    id: 'rapid_decision_maker',
    name: 'Rapid Decision Maker',
    description: 'Closed the war game in under 15 turns',
    checkCondition: (state) => {
      return state.turn <= 15 && state.flags.isComplete
    },
    icon: 'https://randomuser.me/api/portraits/women/90.jpg'
  },
  {
    id: 'thoughtful_planner',
    name: 'Assumption Anchor',
    description: 'Maintained strong assumptions with minimal decay',
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
