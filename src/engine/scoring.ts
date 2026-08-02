import { State, MeasuredMetrics, UnmeasuredMetrics } from './scenarioTypes'

/**
 * Calculate "Measured Success Index" - aggregate of measured metrics
 * Higher is better (weighted average)
 */
export function calculateMeasuredSuccessIndex(metrics: MeasuredMetrics): number {
  // Weighted average: production efficiency and welfare standard adoption are positive,
  // while cost and incidents are negative influences on success (lower is better).
  const weights = {
    productionEfficiency: 0.3,
    welfareStandardAdoption: 0.3,  // Can be > 1, so normalize
    // For cost and incidents we invert the metric (1 - x) so that
    // lower values (good) contribute positively to the index.
    costPerUnit: 0.2,
    welfareIncidentRate: 0.2,
  }

  const normalizedAdoption = Math.min(1, metrics.welfareStandardAdoption / 3) // Normalize to 0-1

  return (
    metrics.productionEfficiency * weights.productionEfficiency +
    normalizedAdoption * weights.welfareStandardAdoption +
    (1 - metrics.costPerUnit) * weights.costPerUnit +          // Invert cost (lower is better)
    (1 - metrics.welfareIncidentRate) * weights.welfareIncidentRate  // Invert incidents (lower is better)
  )
}

/**
 * Calculate "Governance Debt Index" - aggregate of unmeasured metrics
 * Higher means more debt accumulated
 */
export function calculateGovernanceDebtIndex(metrics: UnmeasuredMetrics): number {
  // All unmeasured metrics contribute to debt
  // System irreversibility is already inverted (higher = more irreversible = more debt)
  const weights = {
    welfareDebt: 0.25,
    enforcementGap: 0.25,
    regulatoryCapture: 0.15,
    sentienceKnowledgeGap: 0.15,
    systemIrreversibility: 0.2,  // Higher irreversibility = higher debt
  }

  return (
    metrics.welfareDebt * weights.welfareDebt +
    metrics.enforcementGap * weights.enforcementGap +
    metrics.regulatoryCapture * weights.regulatoryCapture +
    metrics.sentienceKnowledgeGap * weights.sentienceKnowledgeGap +
    metrics.systemIrreversibility * weights.systemIrreversibility
  )
}

/**
 * Get trajectory data for post-mortem visualization
 */
export function getTrajectoryData(_state: State, _auditTrail: State['auditTrail']) {
  // This would track metrics over time
  // For now, return empty arrays
  return {
    measuredSuccess: [] as number[],
    governanceDebt: [] as number[],
    turns: [] as number[]
  }
}
