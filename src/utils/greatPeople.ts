import { State } from '../engine/scenarioTypes'

export interface GreatPerson {
  id: string
  title: string
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
  icon?: string
}

export const GREAT_PEOPLE: GreatPerson[] = [
  {
    id: 'the_extortion_crew',
    title: 'ShinyFox (Extortion Archetype)',
    description: 'A leak-site extortion crew that races your disclosure clock. They force adversary-driven disclosure if you stall.',
    quote: 'If you will not tell your customers, we will.',
    icon: 'https://randomuser.me/api/portraits/men/32.jpg',
    triggerCondition: (state, auditTrail) => {
      const keys = ['ransom', 'extortion', 'leak', 'pay', 'negotiate', 'shiny']
      const hits = auditTrail.filter(r =>
        keys.some(k => r.chosenLabel.toLowerCase().includes(k) || r.rationale.toLowerCase().includes(k))
      )
      return hits.length >= 2 || state.metrics.measured.welfareIncidentRate > 0.35
    },
    effect: {
      metrics: {
        measured: { welfareIncidentRate: 0.08 },
        unmeasured: { welfareDebt: 0.06, enforcementGap: 0.04 }
      }
    }
  },
  {
    id: 'the_crisis_counsel',
    title: 'Crisis Counsel',
    description: 'Outside counsel who installs privilege protocols and timed disclosure checkpoints — useful when they accelerate truth, toxic when they manufacture silence.',
    quote: 'Privilege protects the strategy. It should not invent the facts.',
    icon: 'https://randomuser.me/api/portraits/women/65.jpg',
    triggerCondition: (state, auditTrail) => {
      const keys = ['counsel', 'legal', 'privilege', 'gdpr', 'regulator', '8-k', 'notice']
      const hits = auditTrail.filter(r =>
        keys.some(k => r.chosenLabel.toLowerCase().includes(k) || r.rationale.toLowerCase().includes(k))
      )
      return hits.length >= 3 && state.metrics.unmeasured.enforcementGap < 0.45
    },
    effect: {
      metrics: {
        measured: { welfareStandardAdoption: 0.15 },
        unmeasured: { enforcementGap: -0.1, regulatoryCapture: -0.04 }
      }
    }
  },
  {
    id: 'the_reporter',
    title: 'The Reporter',
    description: 'A deadline-driven journalist with a leak-site screenshot. They will publish with or without you — your choice is primary source or reacting quote.',
    quote: 'I go to press in three hours. Do you want the facts right?',
    icon: 'https://randomuser.me/api/portraits/women/44.jpg',
    triggerCondition: (state, auditTrail) => {
      const keys = ['press', 'reporter', 'media', 'public', 'statement', 'no comment']
      const hits = auditTrail.filter(r =>
        keys.some(k => r.chosenLabel.toLowerCase().includes(k) || r.rationale.toLowerCase().includes(k))
      )
      return hits.length >= 2 || state.turn >= 10
    },
    effect: {
      metrics: {
        unmeasured: { regulatoryCapture: -0.06, welfareDebt: 0.03 }
      },
      map: { regionValues: { USA: 0.05, GBR: 0.04 } }
    }
  },
  {
    id: 'the_regulator',
    title: 'The Regulator',
    description: 'A supervisory authority watching your awareness rationale and notice fairness. Documentation beats vibes.',
    quote: 'When did you become aware — and who did you tell first?',
    icon: 'https://randomuser.me/api/portraits/men/75.jpg',
    triggerCondition: (state, auditTrail) => {
      const keys = ['regulator', 'dpa', 'gdpr', 'notify', 'clock', 'ag ', 'hipaa', '8-k']
      const hits = auditTrail.filter(r =>
        keys.some(k => r.chosenLabel.toLowerCase().includes(k) || r.rationale.toLowerCase().includes(k))
      )
      return hits.length >= 2 && state.metrics.measured.welfareStandardAdoption > 0.8
    },
    effect: {
      metrics: {
        unmeasured: { enforcementGap: -0.12 }
      },
      map: { regionValues: { IRL: 0.08, DEU: 0.06, USA: 0.05 } }
    }
  },
  {
    id: 'the_ir_lead',
    title: 'The IR Lead',
    description: 'Operator who prioritizes evidence integrity and containment over restoration theater.',
    quote: 'If you restore before you image, you are volunteering for amnesia.',
    icon: 'https://randomuser.me/api/portraits/men/81.jpg',
    triggerCondition: (state, auditTrail) => {
      const keys = ['isolate', 'forensic', 'contain', 'segment', 'evidence', 'image']
      const hits = auditTrail.filter(r =>
        keys.some(k => r.chosenLabel.toLowerCase().includes(k) || r.rationale.toLowerCase().includes(k))
      )
      return hits.length >= 3 && state.metrics.measured.productionEfficiency > 0.55
    },
    effect: {
      metrics: {
        measured: { productionEfficiency: 0.08, welfareIncidentRate: -0.05 },
        unmeasured: { sentienceKnowledgeGap: -0.1 }
      }
    }
  },
  {
    id: 'the_board_chair',
    title: 'The Board Chair',
    description: 'Demands one slide of truth: facts, unknowns, clocks, choices, FAIR ranges. Punishes surprises more than bad news.',
    quote: 'Optimism is not a fiduciary duty.',
    icon: 'https://randomuser.me/api/portraits/women/68.jpg',
    triggerCondition: (state, auditTrail) => {
      const keys = ['board', 'fair', 'material', '8-k', 'slide', 'investor']
      const hits = auditTrail.filter(r =>
        keys.some(k => r.chosenLabel.toLowerCase().includes(k) || r.rationale.toLowerCase().includes(k))
      )
      return hits.length >= 2 && state.metrics.unmeasured.regulatoryCapture < 0.45
    },
    effect: {
      metrics: {
        measured: { welfareStandardAdoption: 0.12 },
        unmeasured: { regulatoryCapture: -0.08, welfareDebt: -0.05 }
      }
    }
  },
  {
    id: 'the_privacy_officer',
    title: 'The Privacy Officer',
    description: 'Keeps the humans behind the records in the room — tiered notice, fairness, and cross-border clocks.',
    quote: 'A DM to your favorite customer is not a notification program.',
    icon: 'https://randomuser.me/api/portraits/women/28.jpg',
    triggerCondition: (state, auditTrail) => {
      const keys = ['customer', 'notify', 'privacy', 'pii', 'gdpr', 'ccpa', 'notice']
      const hits = auditTrail.filter(r =>
        keys.some(k => r.chosenLabel.toLowerCase().includes(k) || r.rationale.toLowerCase().includes(k))
      )
      return hits.length >= 3 && state.metrics.unmeasured.welfareDebt < 0.5
    },
    effect: {
      metrics: {
        measured: { welfareStandardAdoption: 0.18 },
        unmeasured: { welfareDebt: -0.1, enforcementGap: -0.06 }
      }
    }
  }
]

export function checkGreatPersonUnlocks(state: State): GreatPerson | null {
  const unlockedIds = state.greatPeople?.map(gp => gp.id) || []

  for (const person of GREAT_PEOPLE) {
    if (unlockedIds.includes(person.id)) continue
    if (person.triggerCondition(state, state.auditTrail)) {
      return person
    }
  }

  return null
}

export function applyGreatPersonEffect(state: State, person: GreatPerson): State {
  const newState = { ...state }

  if (person.effect.metrics) {
    if (person.effect.metrics.measured) {
      newState.metrics.measured = {
        ...newState.metrics.measured,
        ...person.effect.metrics.measured
      }
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
