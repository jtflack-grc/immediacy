import { State, AuditRecord, IncidentDeadline } from '../engine/scenarioTypes'
import { formatIncidentClock } from '../engine/incidentClock'
import { STRENGTH_THRESHOLD } from '../engine/memoryDecay'

export type Assessment = 'strong' | 'moderate' | 'weak'

export interface TimeToMilestone {
  found: boolean
  turn: number | null
  incidentMinutes: number | null
  clockLabel: string | null
  nodeTitle: string | null
  chosenLabel: string | null
}

export interface MetricAssessment {
  value: number
  displayValue: string
  assessment: Assessment
}

export interface DisclosureTimeliness {
  disclosureDebt: number
  regulatoryExposure: number
  missedDeadlines: IncidentDeadline[]
  assessment: Assessment
}

export interface RegulatoryPosture {
  disclosurePosture: number // 0-3 raw scale
  disclosurePostureNormalized: number // 0-1
  regulatoryExposure: number
  assessment: Assessment
}

export interface OperationalRecovery {
  operationalControl: number
  serviceDisruption: number
  assessment: Assessment
}

export interface DecisionOwnership {
  totalDecisions: number
  uniqueOwners: number
  ownerCounts: Record<string, number>
  diversityRatio: number // uniqueOwners / totalDecisions, 0-1
}

export interface AssumptionQuality {
  totalCount: number
  averageStrength: number
  degradedCount: number
  assessment: Assessment
}

export interface PivotalMoment {
  turn: number
  nodeTitle: string
  chosenLabel: string
  disclosureDebtDelta: number
  commitmentLockDelta: number
  magnitude: number
}

export interface InsurancePosture {
  coverageAtRisk: boolean
  note: string
}

export interface CrisisPostmortemReport {
  timeToDeclare: TimeToMilestone
  timeToContain: TimeToMilestone
  evidencePreservation: MetricAssessment
  factsConfidence: MetricAssessment
  disclosureTimeliness: DisclosureTimeliness
  narrativeConsistency: MetricAssessment
  stakeholderTrust: MetricAssessment
  regulatoryPosture: RegulatoryPosture
  insurance: InsurancePosture
  operationalRecovery: OperationalRecovery
  decisionOwnership: DecisionOwnership
  assumptionQuality: AssumptionQuality
  disclosureDebtAccumulated: number
  pivotalMoments: PivotalMoment[]
  counterfactuals: string[]
}

const DECLARE_PATTERN = /disclos|notify|notif|notice|announce|going public|inform (the )?(customers|public|press|regulator)|going to press/i
const CONTAIN_PATTERN = /contain|isolat|segment|quarantine|take offline|shut down|cut off|revoke access/i

function assessHigherBetter(value: number, strongAt = 0.7, moderateAt = 0.4): Assessment {
  if (value >= strongAt) return 'strong'
  if (value >= moderateAt) return 'moderate'
  return 'weak'
}

function findFirstMatch(auditTrail: AuditRecord[], pattern: RegExp): AuditRecord | null {
  for (const record of auditTrail) {
    const haystack = `${record.chosenLabel} ${record.rationale} ${record.unmeasuredImpact}`
    if (pattern.test(haystack)) return record
  }
  return null
}

function toTimeToMilestone(record: AuditRecord | null): TimeToMilestone {
  if (!record) {
    return {
      found: false,
      turn: null,
      incidentMinutes: null,
      clockLabel: null,
      nodeTitle: null,
      chosenLabel: null,
    }
  }
  const incidentMinutes = typeof record.incidentTime === 'number' ? record.incidentTime : null
  return {
    found: true,
    turn: record.turn,
    incidentMinutes,
    clockLabel: incidentMinutes !== null ? formatIncidentClock(incidentMinutes) : null,
    nodeTitle: record.nodeTitle,
    chosenLabel: record.chosenLabel,
  }
}

function computeDecisionOwnership(auditTrail: AuditRecord[]): DecisionOwnership {
  const ownerCounts: Record<string, number> = {}
  for (const record of auditTrail) {
    const owner = record.ownerRole || 'Unattributed'
    ownerCounts[owner] = (ownerCounts[owner] || 0) + 1
  }
  const totalDecisions = auditTrail.length
  const uniqueOwners = Object.keys(ownerCounts).length
  return {
    totalDecisions,
    uniqueOwners,
    ownerCounts,
    diversityRatio: totalDecisions > 0 ? uniqueOwners / totalDecisions : 0,
  }
}

function computeAssumptionQuality(state: State): AssumptionQuality {
  const bank = state.memory?.assumptionsBank || []
  const totalCount = bank.length
  const averageStrength = totalCount > 0
    ? bank.reduce((sum, a) => sum + a.strength, 0) / totalCount
    : 1
  const degradedCount = bank.filter(a => a.strength < STRENGTH_THRESHOLD).length
  return {
    totalCount,
    averageStrength,
    degradedCount,
    assessment: assessHigherBetter(averageStrength),
  }
}

function computePivotalMoments(state: State): PivotalMoment[] {
  const auditTrail = state.auditTrail || []
  const moments: PivotalMoment[] = []

  let previousSnapshot = state.initialMetrics

  for (const record of auditTrail) {
    if (!record.metricsSnapshot) continue
    const disclosureDebtDelta =
      record.metricsSnapshot.unmeasured.disclosureDebt - previousSnapshot.unmeasured.disclosureDebt
    const commitmentLockDelta =
      record.metricsSnapshot.unmeasured.commitmentLock - previousSnapshot.unmeasured.commitmentLock

    moments.push({
      turn: record.turn,
      nodeTitle: record.nodeTitle,
      chosenLabel: record.chosenLabel,
      disclosureDebtDelta,
      commitmentLockDelta,
      magnitude: Math.abs(disclosureDebtDelta) + Math.abs(commitmentLockDelta),
    })

    previousSnapshot = record.metricsSnapshot
  }

  return moments
    .sort((a, b) => b.magnitude - a.magnitude)
    .slice(0, 3)
}

function computeCounterfactuals(state: State): string[] {
  const flags = state.flags || {}
  const bullets: string[] = []

  if (flags.adversaryDisclosedFirst) {
    bullets.push(
      'The adversary posted proof of exfiltration before an internal disclosure decision was finalized — a different sequencing of escalation vs. disclosure could have kept the narrative in your hands longer.'
    )
  }
  if (flags.paidRansom) {
    bullets.push(
      'A ransom payment was made. Avoiding payment removes OFAC/sanctions screening exposure and the moral-hazard signal to future attackers, at the cost of losing whatever leverage the payment bought.'
    )
  }
  if (flags.staffLearnedFromPress) {
    bullets.push(
      'Staff learned about the incident from press or rumor rather than leadership — an earlier internal briefing could have preserved internal trust even if external disclosure timing stayed the same.'
    )
  }
  if (flags.coverageAtRisk) {
    bullets.push(
      'Insurer notice landed late enough to put coverage at risk. Earlier, parallel notice to the insurer alongside regulators/counsel would not have required disclosing externally any sooner.'
    )
  }
  if (flags.scopeRevisedUp) {
    bullets.push(
      'Forensics revised scope upward after an earlier public characterization. A more conservative early scope statement (bounded uncertainty, not false precision) could have reduced the credibility cost of the revision.'
    )
  }
  if (flags.vendorDispute) {
    bullets.push(
      'A vendor disputed responsibility for the misconfiguration path. Earlier joint fact-finding with the vendor might have prevented a public disagreement over attribution.'
    )
  }
  if (flags.leakSiteActive) {
    bullets.push(
      'A leak site went active during the incident. Faster, bounded early disclosure is one lever (among several) that can reduce the window in which a leak site sets the public narrative.'
    )
  }
  if (flags.customerDetected) {
    bullets.push(
      'A customer detected service disruption independently. Proactive status communication during containment can reduce the number of stakeholders who "find out the hard way."'
    )
  }

  if (bullets.length === 0) {
    bullets.push(
      'No major adversary-driven or self-inflicted narrative breaks were recorded this run — the counterfactual space here is mostly about pace and sequencing, not damage control.'
    )
  }

  return bullets
}

/**
 * Generate a multi-dimensional crisis postmortem from the current run state.
 * This intentionally avoids scoring any single choice as "correct" — it surfaces
 * timing, trust, and governance signals so the player can reflect on tradeoffs.
 */
export function generateCrisisPostmortem(state: State): CrisisPostmortemReport {
  const auditTrail = state.auditTrail || []
  const measured = state.metrics.measured
  const unmeasured = state.metrics.unmeasured
  const missedDeadlines = (state.deadlines || []).filter(d => d.missed)

  const declareRecord = findFirstMatch(auditTrail, DECLARE_PATTERN)
  const containRecord = findFirstMatch(auditTrail, CONTAIN_PATTERN)

  const disclosureTimelinessAssessment: Assessment =
    unmeasured.disclosureDebt > 0.6 || missedDeadlines.length >= 2
      ? 'weak'
      : unmeasured.disclosureDebt > 0.3 || missedDeadlines.length === 1
        ? 'moderate'
        : 'strong'

  const disclosurePostureNormalized = Math.min(1, measured.disclosurePosture / 3)
  const regulatoryPostureAssessment: Assessment =
    disclosurePostureNormalized >= 0.7 && unmeasured.regulatoryExposure < 0.4
      ? 'strong'
      : disclosurePostureNormalized >= 0.4 && unmeasured.regulatoryExposure < 0.65
        ? 'moderate'
        : 'weak'

  const operationalAssessment: Assessment =
    measured.operationalControl >= 0.7 && measured.serviceDisruption <= 0.3
      ? 'strong'
      : measured.operationalControl >= 0.4 && measured.serviceDisruption <= 0.6
        ? 'moderate'
        : 'weak'

  return {
    timeToDeclare: toTimeToMilestone(declareRecord),
    timeToContain: toTimeToMilestone(containRecord),
    evidencePreservation: {
      value: measured.evidenceIntegrity,
      displayValue: `${Math.round(measured.evidenceIntegrity * 100)}%`,
      assessment: assessHigherBetter(measured.evidenceIntegrity),
    },
    factsConfidence: {
      value: unmeasured.factsConfidence,
      displayValue: `${Math.round(unmeasured.factsConfidence * 100)}%`,
      assessment: assessHigherBetter(unmeasured.factsConfidence),
    },
    disclosureTimeliness: {
      disclosureDebt: unmeasured.disclosureDebt,
      regulatoryExposure: unmeasured.regulatoryExposure,
      missedDeadlines,
      assessment: disclosureTimelinessAssessment,
    },
    narrativeConsistency: {
      value: unmeasured.narrativeIntegrity,
      displayValue: `${Math.round(unmeasured.narrativeIntegrity * 100)}%`,
      assessment: assessHigherBetter(unmeasured.narrativeIntegrity),
    },
    stakeholderTrust: {
      value: measured.stakeholderTrust,
      displayValue: `${Math.round(measured.stakeholderTrust * 100)}%`,
      assessment: assessHigherBetter(measured.stakeholderTrust),
    },
    regulatoryPosture: {
      disclosurePosture: measured.disclosurePosture,
      disclosurePostureNormalized,
      regulatoryExposure: unmeasured.regulatoryExposure,
      assessment: regulatoryPostureAssessment,
    },
    insurance: {
      coverageAtRisk: Boolean(state.flags?.coverageAtRisk),
      note: state.flags?.coverageAtRisk
        ? 'Insurer questioned evidence preservation and notice timing — coverage may be at risk.'
        : 'No insurer coverage-risk flag was raised this run.',
    },
    operationalRecovery: {
      operationalControl: measured.operationalControl,
      serviceDisruption: measured.serviceDisruption,
      assessment: operationalAssessment,
    },
    decisionOwnership: computeDecisionOwnership(auditTrail),
    assumptionQuality: computeAssumptionQuality(state),
    disclosureDebtAccumulated: unmeasured.disclosureDebt,
    pivotalMoments: computePivotalMoments(state),
    counterfactuals: computeCounterfactuals(state),
  }
}

export function assessmentColor(assessment: Assessment): string {
  switch (assessment) {
    case 'strong':
      return '#4ade80'
    case 'moderate':
      return '#fb923c'
    case 'weak':
    default:
      return '#ef4444'
  }
}
