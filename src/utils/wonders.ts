import { State } from '../engine/scenarioTypes'

export interface Wonder {
  id: string
  name: string
  description: string
  completionCondition: (state: State) => boolean
  effect: {
    metrics?: {
      measured?: Partial<State['metrics']['measured']>
      unmeasured?: Partial<State['metrics']['unmeasured']>
    }
    map?: {
      regionValues?: Record<string, number>
    }
  }
  location: {
    lat: number
    lng: number
    country?: string
  }
  icon?: string
}

export const WONDERS: Wonder[] = [
  {
    id: 'global_welfare_accord',
    name: 'Cross-Border Notice Accord',
    description: 'You aligned multi-jurisdiction notice so US, UK/EU, and APAC customers heard consistent facts on coordinated clocks.',
    completionCondition: (state) => {
      const highWelfareCountries = Object.values(state.map.regionValues).filter(v => v > 0.7).length
      const avgWelfare = Object.values(state.map.regionValues).reduce((a, b) => a + b, 0) / Object.values(state.map.regionValues).length
      return highWelfareCountries >= 5 && avgWelfare > 0.65
    },
    effect: {
      metrics: {
        unmeasured: {
          enforcementGap: -0.1
        }
      },
      map: {
        regionValues: {
          'USA': 0.05,
          'CAN': 0.05,
          'MEX': 0.05,
          'GBR': 0.05,
          'FRA': 0.05,
          'DEU': 0.05,
          'IND': 0.05,
          'CHN': 0.05,
          'BRA': 0.05,
          'ZAF': 0.05,
          'AUS': 0.05
        }
      }
    },
    location: { lat: 46.2, lng: 6.1, country: 'Switzerland' },
    icon: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=200&h=200&fit=crop'
  },
  {
    id: 'sentience_recognition_treaty',
    name: 'Facts-First Playbook',
    description: 'You drove the facts gap down and locked a disclosure posture strong enough that notices matched forensics.',
    completionCondition: (state) => {
      return state.metrics.unmeasured.sentienceKnowledgeGap < 0.2 &&
             state.metrics.measured.welfareStandardAdoption > 1.5
    },
    effect: {
      metrics: {
        unmeasured: {
          sentienceKnowledgeGap: -0.15
        },
        measured: {
          welfareStandardAdoption: 0.3
        }
      }
    },
    location: { lat: 38.9, lng: -77.0, country: 'USA' },
    icon: 'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=200&h=200&fit=crop'
  },
  {
    id: 'alternative_protein_revolution',
    name: 'Clean Rebuild',
    description: 'You restored operations without paying disclosure debt — high control, contained burn, low silence tax.',
    completionCondition: (state) => {
      return state.metrics.unmeasured.welfareDebt < 0.25 &&
             state.metrics.measured.productionEfficiency > 0.7 &&
             state.metrics.measured.costPerUnit < 0.35
    },
    effect: {
      metrics: {
        unmeasured: {
          welfareDebt: -0.12,
          systemIrreversibility: -0.1
        },
        measured: {
          productionEfficiency: 0.1,
          costPerUnit: -0.05
        }
      }
    },
    location: { lat: 37.8, lng: -122.4, country: 'USA' },
    icon: 'https://images.unsplash.com/photo-1556911220-bff31c812fba?w=200&h=200&fit=crop'
  },
  {
    id: 'enforcement_network',
    name: 'Regulator-Ready War Room',
    description: 'Clock lag and narrative capture stayed low while coordination arcs spanned jurisdictions.',
    completionCondition: (state) => {
      return state.metrics.unmeasured.enforcementGap < 0.2 &&
             state.metrics.unmeasured.regulatoryCapture < 0.25 &&
             state.map.activeArcs.length >= 10
    },
    effect: {
      metrics: {
        unmeasured: {
          enforcementGap: -0.12,
          regulatoryCapture: -0.08
        }
      }
    },
    location: { lat: 53.35, lng: -6.26, country: 'Ireland' },
    icon: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=200&h=200&fit=crop'
  },
  {
    id: 'welfare_research_institute',
    name: 'OWASP After-Action Lab',
    description: 'You treated root-cause classes as curriculum — research-backed rationales and rising disclosure posture.',
    completionCondition: (state) => {
      return state.metrics.unmeasured.sentienceKnowledgeGap < 0.2 &&
             state.metrics.measured.welfareStandardAdoption > 1.2 &&
             state.auditTrail.filter(r =>
               r.rationale.toLowerCase().includes('owasp') ||
               r.rationale.toLowerCase().includes('forensic') ||
               r.rationale.toLowerCase().includes('root cause')
             ).length >= 3
    },
    effect: {
      metrics: {
        unmeasured: {
          sentienceKnowledgeGap: -0.1
        },
        measured: {
          welfareStandardAdoption: 0.2
        }
      }
    },
    location: { lat: 37.4, lng: -122.1, country: 'USA' },
    icon: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=200&h=200&fit=crop'
  },
  {
    id: 'transition_fund',
    name: 'Trust-Center Endowment',
    description: 'You funded lasting customer trust infrastructure — monitoring, updates, and burn held in check.',
    completionCondition: (state) => {
      return state.metrics.measured.costPerUnit < 0.4 &&
             state.metrics.unmeasured.welfareDebt < 0.3 &&
             state.metrics.measured.productionEfficiency > 0.6
    },
    effect: {
      metrics: {
        measured: {
          costPerUnit: -0.08,
          productionEfficiency: 0.05
        },
        unmeasured: {
          welfareDebt: -0.08
        }
      }
    },
    location: { lat: 40.7, lng: -74.0, country: 'USA' },
    icon: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=200&h=200&fit=crop'
  }
]

/**
 * Check which wonders should be completed based on current state
 */
export function checkWonderCompletions(state: State): string[] {
  const completed: string[] = []
  const existing = state.completedWonders || []
  
  for (const wonder of WONDERS) {
    if (!existing.includes(wonder.id) && wonder.completionCondition(state)) {
      completed.push(wonder.id)
    }
  }
  
  return completed
}

/**
 * Get wonder by ID
 */
export function getWonder(id: string): Wonder | null {
  return WONDERS.find(w => w.id === id) || null
}

/**
 * Apply wonder effect to state
 */
export function applyWonderEffect(state: State, wonder: Wonder): State {
  const newState = { ...state }
  
  if (wonder.effect.metrics) {
    if (wonder.effect.metrics.measured) {
      newState.metrics.measured = {
        ...newState.metrics.measured,
        ...wonder.effect.metrics.measured
      }
      // Clamp values
      newState.metrics.measured.productionEfficiency = Math.max(0, Math.min(1, newState.metrics.measured.productionEfficiency))
      newState.metrics.measured.costPerUnit = Math.max(0, Math.min(1, newState.metrics.measured.costPerUnit))
      newState.metrics.measured.welfareIncidentRate = Math.max(0, Math.min(1, newState.metrics.measured.welfareIncidentRate))
      newState.metrics.measured.welfareStandardAdoption = Math.max(0, newState.metrics.measured.welfareStandardAdoption)
    }
    
    if (wonder.effect.metrics.unmeasured) {
      newState.metrics.unmeasured = {
        ...newState.metrics.unmeasured,
        ...wonder.effect.metrics.unmeasured
      }
      // Clamp values
      Object.keys(newState.metrics.unmeasured).forEach(key => {
        const value = newState.metrics.unmeasured[key as keyof typeof newState.metrics.unmeasured]
        newState.metrics.unmeasured[key as keyof typeof newState.metrics.unmeasured] = Math.max(0, Math.min(1, value))
      })
    }
  }
  
  if (wonder.effect.map?.regionValues) {
    newState.map.regionValues = { ...newState.map.regionValues }
    Object.entries(wonder.effect.map.regionValues).forEach(([iso3, adjustment]) => {
      newState.map.regionValues[iso3] = Math.max(0, Math.min(1,
        (newState.map.regionValues[iso3] || 0) + adjustment
      ))
    })
  }
  
  return newState
}
