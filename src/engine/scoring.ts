import { State, MeasuredMetrics, UnmeasuredMetrics } from './scenarioTypes'

/** Control Index — higher is better */
export function calculateMeasuredSuccessIndex(metrics: MeasuredMetrics): number {
  const weights = {
    operationalControl: 0.22,
    disclosurePosture: 0.22,
    financialBurn: 0.14,
    serviceDisruption: 0.14,
    evidenceIntegrity: 0.14,
    stakeholderTrust: 0.14,
  }

  const posture = Math.min(1, metrics.disclosurePosture / 3)

  return (
    metrics.operationalControl * weights.operationalControl +
    posture * weights.disclosurePosture +
    (1 - metrics.financialBurn) * weights.financialBurn +
    (1 - metrics.serviceDisruption) * weights.serviceDisruption +
    metrics.evidenceIntegrity * weights.evidenceIntegrity +
    metrics.stakeholderTrust * weights.stakeholderTrust
  )
}

/** Disclosure Debt Index — higher means more hidden risk */
export function calculateGovernanceDebtIndex(metrics: UnmeasuredMetrics): number {
  const weights = {
    disclosureDebt: 0.28,
    regulatoryExposure: 0.24,
    commitmentLock: 0.2,
    // invert higher-better metrics into debt contribution
    narrativeIntegrity: 0.14,
    factsConfidence: 0.14,
  }

  return (
    metrics.disclosureDebt * weights.disclosureDebt +
    metrics.regulatoryExposure * weights.regulatoryExposure +
    metrics.commitmentLock * weights.commitmentLock +
    (1 - metrics.narrativeIntegrity) * weights.narrativeIntegrity +
    (1 - metrics.factsConfidence) * weights.factsConfidence
  )
}

export function getTrajectoryData(_state: State, _auditTrail: State['auditTrail']) {
  return {
    measuredSuccess: [] as number[],
    governanceDebt: [] as number[],
    turns: [] as number[],
  }
}
