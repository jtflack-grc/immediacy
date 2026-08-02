import { State } from '../engine/scenarioTypes'

export interface GreatPerson {
  id: string
  title: string  // e.g., "The Primatologist"
  description: string
  quote?: string
  triggerCondition: (state: State, auditTrail: State['auditTrail']) => boolean
  effect: {
    metrics?: {
      measured?: Partial<State['metrics']['measured']>
      unmeasured?: Partial<State['metrics']['unmeasured']>
    }
    map?: {
      regionValues?: Record<string, number>
    }
  }
  icon?: string  // Optional emoji or icon identifier
}

export const GREAT_PEOPLE: GreatPerson[] = [
  {
    id: 'the_primatologist',
    title: 'The Primatologist',
    description: 'A renowned researcher whose groundbreaking work on animal cognition has revolutionized our understanding of sentience. Their insights help bridge the gap between scientific knowledge and policy implementation.',
    quote: 'Understanding animal minds is the foundation of ethical governance.',
    icon: 'https://randomuser.me/api/portraits/women/65.jpg',
    triggerCondition: (state, auditTrail) => {
      // Unlock if player prioritized research/knowledge in 3+ decisions
      const researchKeywords = ['research', 'knowledge', 'understanding', 'study', 'science', 'sentience']
      const researchDecisions = auditTrail.filter(record => 
        researchKeywords.some(keyword => 
          record.rationale.toLowerCase().includes(keyword) ||
          record.chosenLabel.toLowerCase().includes(keyword)
        )
      )
      return researchDecisions.length >= 3 && state.metrics.unmeasured.sentienceKnowledgeGap < 0.3
    },
    effect: {
      metrics: {
        unmeasured: {
          sentienceKnowledgeGap: -0.15
        }
      }
    }
  },
  {
    id: 'the_welfare_engineer',
    title: 'The Welfare Engineer',
    description: 'An innovator who designs humane systems that balance welfare with practical production needs. Their engineering solutions demonstrate that ethical standards need not compromise efficiency.',
    quote: 'Good design serves both animals and producers.',
    icon: 'https://randomuser.me/api/portraits/men/75.jpg',
    triggerCondition: (state, auditTrail) => {
      // Unlock if player focused on welfare standards and efficiency
      const welfareDecisions = auditTrail.filter(record =>
        record.chosenLabel.toLowerCase().includes('welfare') ||
        record.chosenLabel.toLowerCase().includes('standard')
      )
      const efficiencyMaintained = state.metrics.measured.productionEfficiency > 0.5
      return welfareDecisions.length >= 3 && efficiencyMaintained
    },
    effect: {
      metrics: {
        measured: {
          welfareStandardAdoption: 0.2,
          productionEfficiency: 0.05
        }
      }
    }
  },
  {
    id: 'the_ethicist',
    title: 'The Ethicist',
    description: 'A philosopher whose work on animal ethics has shaped modern welfare frameworks. Their moral reasoning helps balance competing ethical considerations and reduce accumulated welfare debt.',
    quote: 'Ethics without action is mere contemplation.',
    icon: 'https://randomuser.me/api/portraits/women/44.jpg',
    triggerCondition: (state, auditTrail) => {
      // Unlock if player emphasized ethics in decisions
      const ethicsKeywords = ['ethic', 'moral', 'right', 'wrong', 'value', 'principle']
      const ethicsDecisions = auditTrail.filter(record =>
        ethicsKeywords.some(keyword =>
          record.rationale.toLowerCase().includes(keyword) ||
          record.chosenLabel.toLowerCase().includes(keyword)
        )
      )
      return ethicsDecisions.length >= 3 && state.metrics.unmeasured.welfareDebt < 0.4
    },
    effect: {
      metrics: {
        unmeasured: {
          welfareDebt: -0.12
        }
      }
    }
  },
  {
    id: 'the_conservationist',
    title: 'The Conservationist',
    description: 'An advocate whose research on ecosystem health has influenced conservation policy. Their holistic approach connects individual welfare with broader environmental and biodiversity concerns.',
    quote: 'Every animal is part of a larger system.',
    icon: 'https://randomuser.me/api/portraits/men/81.jpg',
    triggerCondition: (state, auditTrail) => {
      // Unlock if player considered broader impacts
      const conservationKeywords = ['ecosystem', 'wildlife', 'conservation', 'biodiversity', 'environment']
      const conservationDecisions = auditTrail.filter(record =>
        conservationKeywords.some(keyword =>
          record.rationale.toLowerCase().includes(keyword) ||
          record.chosenLabel.toLowerCase().includes(keyword)
        )
      )
      return conservationDecisions.length >= 2
    },
    effect: {
      metrics: {
        unmeasured: {
          welfareDebt: -0.08
        },
        measured: {
          welfareStandardAdoption: 0.1
        }
      }
    }
  },
  {
    id: 'the_policy_architect',
    title: 'The Policy Architect',
    description: 'A governance expert who designs effective regulatory frameworks. Their systematic approach helps bridge the gap between policy intent and practical enforcement.',
    quote: 'Good policy is policy that works.',
    icon: 'https://randomuser.me/api/portraits/women/68.jpg',
    triggerCondition: (state, auditTrail) => {
      // Unlock if player focused on enforcement and governance
      const governanceKeywords = ['enforcement', 'regulation', 'policy', 'governance', 'compliance', 'oversight']
      const governanceDecisions = auditTrail.filter(record =>
        governanceKeywords.some(keyword =>
          record.rationale.toLowerCase().includes(keyword) ||
          record.chosenLabel.toLowerCase().includes(keyword)
        )
      )
      return governanceDecisions.length >= 3 && state.metrics.unmeasured.enforcementGap < 0.3
    },
    effect: {
      metrics: {
        unmeasured: {
          enforcementGap: -0.12,
          regulatoryCapture: -0.05
        }
      }
    }
  },
  {
    id: 'the_transition_specialist',
    title: 'The Transition Specialist',
    description: 'An expert in systemic change who helps organizations transition to higher welfare standards without disrupting operations. Their practical experience guides smooth transformations.',
    quote: 'Change is inevitable; transition is a choice.',
    icon: 'https://randomuser.me/api/portraits/men/92.jpg',
    triggerCondition: (state, auditTrail) => {
      // Unlock if player balanced transitions and avoided debt
      const transitionKeywords = ['transition', 'alternative', 'change', 'transform', 'adapt']
      const transitionDecisions = auditTrail.filter(record =>
        transitionKeywords.some(keyword =>
          record.rationale.toLowerCase().includes(keyword) ||
          record.chosenLabel.toLowerCase().includes(keyword)
        )
      )
      const lowDebt = state.metrics.unmeasured.welfareDebt < 0.3
      const lowIrreversibility = state.metrics.unmeasured.systemIrreversibility < 0.4
      return transitionDecisions.length >= 2 && lowDebt && lowIrreversibility
    },
    effect: {
      metrics: {
        unmeasured: {
          welfareDebt: -0.1,
          systemIrreversibility: -0.08
        }
      }
    }
  }
]

/**
 * Check if any Great Person should be unlocked based on current state
 */
export function checkGreatPersonUnlocks(state: State): GreatPerson | null {
  const unlockedIds = state.greatPeople?.map(gp => gp.id) || []
  
  for (const person of GREAT_PEOPLE) {
    // Skip if already unlocked
    if (unlockedIds.includes(person.id)) {
      continue
    }
    
    // Check trigger condition
    if (person.triggerCondition(state, state.auditTrail)) {
      return person
    }
  }
  
  return null
}

/**
 * Apply a Great Person's effect to state metrics
 */
export function applyGreatPersonEffect(state: State, person: GreatPerson): State {
  const newState = { ...state }
  
  if (person.effect.metrics) {
    if (person.effect.metrics.measured) {
      newState.metrics.measured = {
        ...newState.metrics.measured,
        ...person.effect.metrics.measured
      }
      // Clamp values
      newState.metrics.measured.productionEfficiency = Math.max(0, Math.min(1, newState.metrics.measured.productionEfficiency))
      newState.metrics.measured.costPerUnit = Math.max(0, Math.min(1, newState.metrics.measured.costPerUnit))
      newState.metrics.measured.welfareIncidentRate = Math.max(0, Math.min(1, newState.metrics.measured.welfareIncidentRate))
      newState.metrics.measured.welfareStandardAdoption = Math.max(0, newState.metrics.measured.welfareStandardAdoption)
    }
    
    if (person.effect.metrics.unmeasured) {
      newState.metrics.unmeasured = {
        ...newState.metrics.unmeasured,
        ...person.effect.metrics.unmeasured
      }
      // Clamp values
      Object.keys(newState.metrics.unmeasured).forEach(key => {
        const value = newState.metrics.unmeasured[key as keyof typeof newState.metrics.unmeasured]
        newState.metrics.unmeasured[key as keyof typeof newState.metrics.unmeasured] = Math.max(0, Math.min(1, value))
      })
    }
  }
  
  if (person.effect.map?.regionValues) {
    newState.map.regionValues = { ...newState.map.regionValues }
    Object.entries(person.effect.map.regionValues).forEach(([iso3, adjustment]) => {
      newState.map.regionValues[iso3] = Math.max(0, Math.min(1,
        (newState.map.regionValues[iso3] || 0) + adjustment
      ))
    })
  }
  
  return newState
}
