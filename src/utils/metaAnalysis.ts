// Pattern detection and meta-analysis utilities

import { RunSummary } from './runHistory'

export interface Pattern {
  type: 'failure_mode' | 'success_pattern' | 'sequencing_insight' | 'surprising_outcome'
  title: string
  description: string
  frequency: number // How many runs exhibit this pattern (0-1)
  confidence: number // How confident we are this is a real pattern (0-1)
  examples: string[] // Example choice sequences or outcomes
  recommendation?: string
}

export interface MetaAnalysis {
  totalRuns: number
  averageSuccessIndex: number
  averageDebtIndex: number
  patterns: Pattern[]
  commonFailureModes: Pattern[]
  effectiveStrategies: Pattern[]
  sequencingInsights: Pattern[]
  surprisingOutcomes: Pattern[]
  decisionFrequency: Map<string, number> // How often each choice was made
  nodeFrequency: Map<string, number> // How often each node was reached
  correlationMatrix: Map<string, Map<string, number>> // Correlations between choices and outcomes
}

/**
 * Analyze patterns across multiple runs
 */
export function analyzeRuns(runs: RunSummary[]): MetaAnalysis {
  if (runs.length === 0) {
    return {
      totalRuns: 0,
      averageSuccessIndex: 0,
      averageDebtIndex: 0,
      patterns: [],
      commonFailureModes: [],
      effectiveStrategies: [],
      sequencingInsights: [],
      surprisingOutcomes: [],
      decisionFrequency: new Map(),
      nodeFrequency: new Map(),
      correlationMatrix: new Map()
    }
  }

  // Calculate averages
  const averageSuccessIndex = runs.reduce((sum, r) => sum + r.successIndex, 0) / runs.length
  const averageDebtIndex = runs.reduce((sum, r) => sum + r.debtIndex, 0) / runs.length

  // Build frequency maps
  const decisionFrequency = new Map<string, number>()
  const nodeFrequency = new Map<string, number>()
  
  runs.forEach(run => {
    // Handle backward compatibility - old runs might not have allChoices/nodeSequence
    const choices = run.allChoices || run.keyChoices || []
    const nodes = run.nodeSequence || []
    
    choices.forEach(choice => {
      decisionFrequency.set(choice, (decisionFrequency.get(choice) || 0) + 1)
    })
    nodes.forEach(nodeId => {
      nodeFrequency.set(nodeId, (nodeFrequency.get(nodeId) || 0) + 1)
    })
  })

  // Normalize frequencies
  decisionFrequency.forEach((count, choice) => {
    decisionFrequency.set(choice, count / runs.length)
  })
  nodeFrequency.forEach((count, nodeId) => {
    nodeFrequency.set(nodeId, count / runs.length)
  })

  // Detect patterns
  const commonFailureModes = detectFailureModes(runs)
  const effectiveStrategies = detectEffectiveStrategies(runs)
  const sequencingInsights = detectSequencingInsights(runs)
  const surprisingOutcomes = detectSurprisingOutcomes(runs)

  const allPatterns = [
    ...commonFailureModes,
    ...effectiveStrategies,
    ...sequencingInsights,
    ...surprisingOutcomes
  ]

  // Build correlation matrix (simplified - choice to outcome correlations)
  const correlationMatrix = buildCorrelationMatrix(runs)

  return {
    totalRuns: runs.length,
    averageSuccessIndex,
    averageDebtIndex,
    patterns: allPatterns,
    commonFailureModes,
    effectiveStrategies,
    sequencingInsights,
    surprisingOutcomes,
    decisionFrequency,
    nodeFrequency,
    correlationMatrix
  }
}

/**
 * Detect common failure modes
 */
function detectFailureModes(runs: RunSummary[]): Pattern[] {
  const patterns: Pattern[] = []
  
  // High debt, low success runs
  const failureRuns = runs.filter(r => r.debtIndex > 0.6 || r.successIndex < 0.4)
  if (failureRuns.length >= 2) {
    const frequency = failureRuns.length / runs.length
    
    // Check for common early choices in failures
    const earlyChoices = new Map<string, number>()
    failureRuns.forEach(run => {
      const choices = run.allChoices || run.keyChoices || []
      choices.slice(0, 3).forEach(choice => {
        earlyChoices.set(choice, (earlyChoices.get(choice) || 0) + 1)
      })
    })
    
    const mostCommonEarlyChoice = Array.from(earlyChoices.entries())
      .sort((a, b) => b[1] - a[1])[0]
    
    if (mostCommonEarlyChoice && mostCommonEarlyChoice[1] >= failureRuns.length * 0.5) {
      patterns.push({
        type: 'failure_mode',
        title: 'Early Decision Trap',
        description: `Runs that started with "${mostCommonEarlyChoice[0]}" often led to high debt (${(frequency * 100).toFixed(0)}% of runs). This early choice may lock in problematic patterns.`,
        frequency,
        confidence: 0.7,
        examples: failureRuns.slice(0, 3).map(r => (r.allChoices || r.keyChoices || [])[0] || 'N/A'),
        recommendation: 'Consider alternative early choices or delay this decision until more information is available.'
      })
    }

    // Check for debt accumulation patterns
    const highDebtRuns = runs.filter(r => r.debtIndex > 0.7)
    if (highDebtRuns.length >= 2) {
      const debtFrequency = highDebtRuns.length / runs.length
      patterns.push({
        type: 'failure_mode',
        title: 'Governance Debt Accumulation',
        description: `${(debtFrequency * 100).toFixed(0)}% of runs accumulated high governance debt (>70%). Debt often accumulates when enforcement capacity is not built early.`,
        frequency: debtFrequency,
        confidence: 0.8,
        examples: highDebtRuns.slice(0, 3).map(r => `Debt: ${(r.debtIndex * 100).toFixed(0)}%`),
        recommendation: 'Prioritize enforcement capacity and avoid choices that increase enforcement gaps early in the game.'
      })
    }
  }

  // System irreversibility trap
  const irreversibleRuns = runs.filter(r => {
    if (!r.metricsHistory || r.metricsHistory.length === 0) return false
    const finalMetrics = r.metricsHistory[r.metricsHistory.length - 1]
    return finalMetrics?.unmeasured?.systemIrreversibility > 0.8
  })
  if (irreversibleRuns.length >= 2) {
    patterns.push({
      type: 'failure_mode',
      title: 'System Irreversibility Trap',
      description: `${(irreversibleRuns.length / runs.length * 100).toFixed(0)}% of runs reached high system irreversibility (>80%), making course corrections difficult.`,
      frequency: irreversibleRuns.length / runs.length,
      confidence: 0.75,
      examples: irreversibleRuns.slice(0, 3).map(r => `Irreversibility: ${(r.metricsHistory[r.metricsHistory.length - 1]?.unmeasured?.systemIrreversibility || 0) * 100}%`),
      recommendation: 'Avoid locking in systems too early. Maintain flexibility for mid-game adjustments.'
    })
  }

  return patterns
}

/**
 * Detect effective strategies
 */
function detectEffectiveStrategies(runs: RunSummary[]): Pattern[] {
  const patterns: Pattern[] = []
  
  // High success, low debt runs
  const successRuns = runs.filter(r => r.successIndex > 0.7 && r.debtIndex < 0.4)
  if (successRuns.length >= 2) {
    const frequency = successRuns.length / runs.length
    
    // Check for common early choices in successes
    const earlyChoices = new Map<string, number>()
    successRuns.forEach(run => {
      const choices = run.allChoices || run.keyChoices || []
      choices.slice(0, 3).forEach(choice => {
        earlyChoices.set(choice, (earlyChoices.get(choice) || 0) + 1)
      })
    })
    
    const mostCommonEarlyChoice = Array.from(earlyChoices.entries())
      .sort((a, b) => b[1] - a[1])[0]
    
    if (mostCommonEarlyChoice && mostCommonEarlyChoice[1] >= successRuns.length * 0.5) {
      patterns.push({
        type: 'success_pattern',
        title: 'Strong Opening Strategy',
        description: `Runs that started with "${mostCommonEarlyChoice[0]}" often achieved high success with low debt (${(frequency * 100).toFixed(0)}% of successful runs).`,
        frequency,
        confidence: 0.7,
        examples: successRuns.slice(0, 3).map(r => (r.allChoices || r.keyChoices || [])[0] || 'N/A'),
        recommendation: 'This early choice appears to set up a strong foundation for later decisions.'
      })
    }

    // Check for phase completion patterns
    const fullyCompletedRuns = successRuns.filter(r => r.completedPhases.length >= 4)
    if (fullyCompletedRuns.length >= 2) {
      patterns.push({
        type: 'success_pattern',
        title: 'Phase Completion Strategy',
        description: `${(fullyCompletedRuns.length / successRuns.length * 100).toFixed(0)}% of successful runs completed all phases. Completing phases appears correlated with better outcomes.`,
        frequency: fullyCompletedRuns.length / runs.length,
        confidence: 0.65,
        examples: fullyCompletedRuns.slice(0, 3).map(r => `${r.completedPhases.length} phases`),
        recommendation: 'Aim to complete all phases rather than ending early.'
      })
    }
  }

  // Balanced approach
  const balancedRuns = runs.filter(r => {
    const diff = Math.abs(r.successIndex - (1 - r.debtIndex))
    return diff < 0.2 && r.successIndex > 0.5 && r.debtIndex < 0.5
  })
  if (balancedRuns.length >= 2) {
    patterns.push({
      type: 'success_pattern',
      title: 'Balanced Approach',
      description: `${(balancedRuns.length / runs.length * 100).toFixed(0)}% of runs achieved balanced outcomes (success and debt within 20% of each other). Balanced approaches may be more sustainable.`,
      frequency: balancedRuns.length / runs.length,
      confidence: 0.6,
      examples: balancedRuns.slice(0, 3).map(r => `Success: ${(r.successIndex * 100).toFixed(0)}%, Debt: ${(r.debtIndex * 100).toFixed(0)}%`),
      recommendation: 'Consider balancing immediate success with long-term governance health.'
    })
  }

  return patterns
}

/**
 * Detect sequencing insights
 */
function detectSequencingInsights(runs: RunSummary[]): Pattern[] {
  const patterns: Pattern[] = []
  
  // Check for common choice sequences
  const sequenceFrequency = new Map<string, { count: number; outcomes: number[] }>()
  
  runs.forEach(run => {
    // Handle backward compatibility
    const choices = run.allChoices || run.keyChoices || []
    // Look at pairs of consecutive choices
    for (let i = 0; i < choices.length - 1; i++) {
      const sequence = `${choices[i]} → ${choices[i + 1]}`
      if (!sequenceFrequency.has(sequence)) {
        sequenceFrequency.set(sequence, { count: 0, outcomes: [] })
      }
      const entry = sequenceFrequency.get(sequence)!
      entry.count++
      entry.outcomes.push(run.successIndex)
    }
  })

  // Find sequences that lead to good or bad outcomes
  sequenceFrequency.forEach((data, sequence) => {
    if (data.count >= 2) {
      const avgOutcome = data.outcomes.reduce((a, b) => a + b, 0) / data.outcomes.length
      const frequency = data.count / runs.length
      
      if (avgOutcome > 0.7 && frequency > 0.2) {
        patterns.push({
          type: 'sequencing_insight',
          title: 'Effective Sequence',
          description: `The sequence "${sequence}" appears ${data.count} times and correlates with high success (avg ${(avgOutcome * 100).toFixed(0)}%).`,
          frequency,
          confidence: 0.6,
          examples: [`Appeared in ${data.count} runs`],
          recommendation: 'Consider this choice sequence when planning your strategy.'
        })
      } else if (avgOutcome < 0.4 && frequency > 0.2) {
        patterns.push({
          type: 'sequencing_insight',
          title: 'Problematic Sequence',
          description: `The sequence "${sequence}" appears ${data.count} times and correlates with low success (avg ${(avgOutcome * 100).toFixed(0)}%).`,
          frequency,
          confidence: 0.6,
          examples: [`Appeared in ${data.count} runs`],
          recommendation: 'Avoid this choice sequence or find alternatives.'
        })
      }
    }
  })

  return patterns
}

/**
 * Detect surprising outcomes
 */
function detectSurprisingOutcomes(runs: RunSummary[]): Pattern[] {
  const patterns: Pattern[] = []
  
  // Find runs with unexpected outcomes (high success but high debt, or vice versa)
  const surprisingRuns = runs.filter(r => {
    const successHigh = r.successIndex > 0.7
    const debtHigh = r.debtIndex > 0.7
    return (successHigh && debtHigh) || (!successHigh && !debtHigh && r.successIndex < 0.3 && r.debtIndex < 0.3)
  })
  
  if (surprisingRuns.length >= 2) {
    patterns.push({
      type: 'surprising_outcome',
      title: 'Counter-Intuitive Outcomes',
      description: `${(surprisingRuns.length / runs.length * 100).toFixed(0)}% of runs showed counter-intuitive patterns (e.g., high success with high debt, or low success with low debt). Success and debt don't always move in opposite directions.`,
      frequency: surprisingRuns.length / runs.length,
      confidence: 0.7,
      examples: surprisingRuns.slice(0, 3).map(r => `Success: ${(r.successIndex * 100).toFixed(0)}%, Debt: ${(r.debtIndex * 100).toFixed(0)}%`),
      recommendation: 'Success metrics and governance debt can accumulate independently. Monitor both carefully.'
    })
  }

  // Find runs that improved dramatically mid-game
  const improvingRuns = runs.filter(run => {
    if (!run.metricsHistory || run.metricsHistory.length < 3) return false
    const early = run.metricsHistory[Math.floor(run.metricsHistory.length / 3)]
    const late = run.metricsHistory[run.metricsHistory.length - 1]
    return (late.successIndex - early.successIndex) > 0.3
  })
  
  if (improvingRuns.length >= 2) {
    patterns.push({
      type: 'surprising_outcome',
      title: 'Mid-Game Recovery',
      description: `${(improvingRuns.length / runs.length * 100).toFixed(0)}% of runs showed significant mid-game improvement (>30% success increase). Recovery is possible even after weak starts.`,
      frequency: improvingRuns.length / runs.length,
      confidence: 0.65,
      examples: improvingRuns.slice(0, 3).map(r => {
        if (!r.metricsHistory || r.metricsHistory.length < 3) return 'N/A'
        const early = r.metricsHistory[Math.floor(r.metricsHistory.length / 3)]
        const late = r.metricsHistory[r.metricsHistory.length - 1]
        return `${(early.successIndex * 100).toFixed(0)}% → ${(late.successIndex * 100).toFixed(0)}%`
      }),
      recommendation: 'Don\'t give up after a weak start. Strategic mid-game choices can turn things around.'
    })
  }

  return patterns
}

/**
 * Build correlation matrix between choices and outcomes
 */
function buildCorrelationMatrix(runs: RunSummary[]): Map<string, Map<string, number>> {
  const matrix = new Map<string, Map<string, number>>()
  
  // Simplified correlation: choice → average outcome
  const choiceOutcomes = new Map<string, number[]>()
  
  runs.forEach(run => {
    const choices = run.allChoices || run.keyChoices || []
    choices.forEach(choice => {
      if (!choiceOutcomes.has(choice)) {
        choiceOutcomes.set(choice, [])
      }
      choiceOutcomes.get(choice)!.push(run.successIndex)
    })
  })
  
  choiceOutcomes.forEach((outcomes, choice) => {
    const avg = outcomes.reduce((a, b) => a + b, 0) / outcomes.length
    if (!matrix.has(choice)) {
      matrix.set(choice, new Map())
    }
    matrix.get(choice)!.set('successIndex', avg)
  })
  
  return matrix
}
