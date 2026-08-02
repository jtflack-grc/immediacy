import { Metrics } from '../engine/scenarioTypes'

export type DifficultyLevel = 'very_easy' | 'easy' | 'medium' | 'hard' | 'very_hard'
export type StartingCondition = 'default' | 'optimistic' | 'pessimistic' | 'balanced' | 'crisis' | 'transition' | 'innovation'

export interface ScenarioVariation {
  difficulty: DifficultyLevel
  startingCondition: StartingCondition
  timeLimit?: number // Optional time limit in minutes
}

/**
 * Apply difficulty level to initial metrics
 */
export function applyDifficulty(metrics: Metrics, difficulty: DifficultyLevel): Metrics {
  const multiplier = {
    very_easy: 1.4,  // 40% easier
    easy: 1.2,       // 20% easier (better starting conditions)
    medium: 1.0,     // Default
    hard: 0.8,       // 20% harder (worse starting conditions)
    very_hard: 0.6   // 40% harder
  }[difficulty]

  return {
    measured: {
      productionEfficiency: Math.min(1, metrics.measured.productionEfficiency * multiplier),
      costPerUnit: Math.max(0, metrics.measured.costPerUnit * (2 - multiplier)), // Inverted
      welfareIncidentRate: Math.max(0, metrics.measured.welfareIncidentRate * (2 - multiplier)), // Inverted
      welfareStandardAdoption: Math.min(3, metrics.measured.welfareStandardAdoption * multiplier),
    },
    unmeasured: {
      welfareDebt: Math.max(0, metrics.unmeasured.welfareDebt * (2 - multiplier)), // Inverted
      enforcementGap: Math.max(0, metrics.unmeasured.enforcementGap * (2 - multiplier)), // Inverted
      regulatoryCapture: Math.max(0, metrics.unmeasured.regulatoryCapture * (2 - multiplier)), // Inverted
      sentienceKnowledgeGap: Math.max(0, metrics.unmeasured.sentienceKnowledgeGap * (2 - multiplier)), // Inverted
      systemIrreversibility: Math.max(0, metrics.unmeasured.systemIrreversibility * (2 - multiplier)), // Inverted
    }
  }
}

/**
 * Apply starting condition to initial metrics
 */
export function applyStartingCondition(metrics: Metrics, condition: StartingCondition): Metrics {
  switch (condition) {
    case 'optimistic':
      return {
        measured: {
          ...metrics.measured,
          productionEfficiency: Math.min(1, metrics.measured.productionEfficiency * 1.3),
          welfareStandardAdoption: Math.min(3, metrics.measured.welfareStandardAdoption * 1.5),
          welfareIncidentRate: Math.max(0, metrics.measured.welfareIncidentRate * 0.7),
        },
        unmeasured: {
          ...metrics.unmeasured,
          welfareDebt: Math.max(0, metrics.unmeasured.welfareDebt * 0.5),
          enforcementGap: Math.max(0, metrics.unmeasured.enforcementGap * 0.6),
          regulatoryCapture: Math.max(0, metrics.unmeasured.regulatoryCapture * 0.7),
        }
      }
    
    case 'pessimistic':
      return {
        measured: {
          ...metrics.measured,
          productionEfficiency: Math.max(0, metrics.measured.productionEfficiency * 0.7),
          welfareStandardAdoption: Math.max(0, metrics.measured.welfareStandardAdoption * 0.5),
          welfareIncidentRate: Math.min(1, metrics.measured.welfareIncidentRate * 1.5),
        },
        unmeasured: {
          ...metrics.unmeasured,
          welfareDebt: Math.min(1, metrics.unmeasured.welfareDebt * 1.5),
          enforcementGap: Math.min(1, metrics.unmeasured.enforcementGap * 1.4),
          regulatoryCapture: Math.min(1, metrics.unmeasured.regulatoryCapture * 1.3),
        }
      }
    
    case 'balanced':
      // Slight improvements across the board
      return {
        measured: {
          ...metrics.measured,
          productionEfficiency: Math.min(1, metrics.measured.productionEfficiency * 1.1),
          welfareStandardAdoption: Math.min(3, metrics.measured.welfareStandardAdoption * 1.2),
        },
        unmeasured: {
          ...metrics.unmeasured,
          welfareDebt: Math.max(0, metrics.unmeasured.welfareDebt * 0.9),
          enforcementGap: Math.max(0, metrics.unmeasured.enforcementGap * 0.9),
        }
      }
    
    case 'crisis':
      // Crisis mode: high welfare debt, low enforcement, high irreversibility
      return {
        measured: {
          ...metrics.measured,
          productionEfficiency: Math.max(0, metrics.measured.productionEfficiency * 0.6),
          welfareStandardAdoption: Math.max(0, metrics.measured.welfareStandardAdoption * 0.4),
          welfareIncidentRate: Math.min(1, metrics.measured.welfareIncidentRate * 1.8),
        },
        unmeasured: {
          ...metrics.unmeasured,
          welfareDebt: Math.min(1, metrics.unmeasured.welfareDebt * 1.8),
          enforcementGap: Math.min(1, metrics.unmeasured.enforcementGap * 1.7),
          regulatoryCapture: Math.min(1, metrics.unmeasured.regulatoryCapture * 1.6),
          systemIrreversibility: Math.min(1, metrics.unmeasured.systemIrreversibility * 1.5),
        }
      }
    
    case 'transition':
      // Transition mode: moderate improvements, but high system irreversibility
      return {
        measured: {
          ...metrics.measured,
          productionEfficiency: Math.min(1, metrics.measured.productionEfficiency * 1.15),
          welfareStandardAdoption: Math.min(3, metrics.measured.welfareStandardAdoption * 1.3),
        },
        unmeasured: {
          ...metrics.unmeasured,
          welfareDebt: Math.max(0, metrics.unmeasured.welfareDebt * 0.85),
          enforcementGap: Math.max(0, metrics.unmeasured.enforcementGap * 0.9),
          systemIrreversibility: Math.min(1, metrics.unmeasured.systemIrreversibility * 1.2), // High irreversibility makes change harder
        }
      }
    
    case 'innovation':
      // Innovation mode: good starting metrics, but knowledge gaps
      return {
        measured: {
          ...metrics.measured,
          productionEfficiency: Math.min(1, metrics.measured.productionEfficiency * 1.25),
          welfareStandardAdoption: Math.min(3, metrics.measured.welfareStandardAdoption * 1.4),
          welfareIncidentRate: Math.max(0, metrics.measured.welfareIncidentRate * 0.8),
        },
        unmeasured: {
          ...metrics.unmeasured,
          welfareDebt: Math.max(0, metrics.unmeasured.welfareDebt * 0.7),
          enforcementGap: Math.max(0, metrics.unmeasured.enforcementGap * 0.75),
          sentienceKnowledgeGap: Math.min(1, metrics.unmeasured.sentienceKnowledgeGap * 1.3), // Knowledge gaps remain
        }
      }
    
    default:
      return metrics
  }
}

/**
 * Get description for difficulty level
 */
export function getDifficultyDescription(difficulty: DifficultyLevel): string {
  return {
    very_easy: 'Very favorable starting conditions, ideal for learning and exploration',
    easy: 'More favorable starting conditions, easier to achieve positive outcomes',
    medium: 'Standard starting conditions, balanced challenge',
    hard: 'Challenging starting conditions, requires careful decision-making',
    very_hard: 'Extremely challenging conditions, maximum difficulty for experienced players'
  }[difficulty]
}

/**
 * Get description for starting condition
 */
export function getStartingConditionDescription(condition: StartingCondition): string {
  return {
    default: 'Standard baseline metrics',
    optimistic: 'Favorable conditions with higher welfare standards already in place',
    pessimistic: 'Challenging conditions with significant welfare debt and enforcement gaps',
    balanced: 'Moderate improvements across key metrics',
    crisis: 'Crisis scenario: high welfare debt, low enforcement, system near collapse',
    transition: 'Transition period: moderate improvements but high system irreversibility',
    innovation: 'Innovation-driven: good metrics but knowledge gaps remain'
  }[condition]
}
