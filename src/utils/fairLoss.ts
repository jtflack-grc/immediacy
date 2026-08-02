import { Metrics, EvidenceFact } from '../engine/scenarioTypes'

export interface FairRange {
  min: number
  mode: number
  max: number
}

export interface FairDriver {
  id: string
  label: string
  dollars: number
  kind: 'primary' | 'secondary'
}

export interface FairLossEstimate {
  primary: FairRange
  secondary: FairRange
  total: FairRange
  drivers: FairDriver[]
  headline: string
  urgency: 'elevated' | 'severe' | 'critical'
  /** 0–1 — how much we trust this board estimate right now */
  confidence: number
  confidenceLabel: 'very low' | 'low' | 'moderate' | 'improving' | 'high'
  provisional: boolean
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))

/** Format USD compact for war-room rail */
export function formatUsd(n: number): string {
  const abs = Math.abs(n)
  if (abs >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`
  if (abs >= 1_000_000) {
    const m = n / 1_000_000
    return m >= 10 ? `$${m.toFixed(0)}M` : `$${m.toFixed(1)}M`
  }
  if (abs >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${Math.round(n)}`
}

function rangeFromMode(mode: number, down: number, up: number): FairRange {
  const m = Math.max(250_000, mode)
  return {
    min: m * down,
    mode: m,
    max: m * up,
  }
}

function estimateConfidence(metrics: Metrics, evidence?: EvidenceFact[]): number {
  const facts = clamp(metrics.unmeasured.factsConfidence, 0, 1)
  const verified = (evidence || []).filter(e => e.kind === 'verified' || e.verificationStatus === 'corroborated').length
  const prelim = (evidence || []).filter(e => e.kind === 'preliminary' || e.kind === 'assumption').length
  const evidenceBoost = Math.min(0.35, verified * 0.12 + prelim * 0.03)
  return clamp(facts * 0.65 + evidenceBoost + 0.1, 0.08, 0.92)
}

function confidenceLabel(c: number): FairLossEstimate['confidenceLabel'] {
  if (c < 0.25) return 'very low'
  if (c < 0.4) return 'low'
  if (c < 0.55) return 'moderate'
  if (c < 0.75) return 'improving'
  return 'high'
}

/**
 * Lightweight FAIR-style loss estimate for Northline-scale SaaS.
 * Early estimates are deliberately wide / low-confidence (provisional board range).
 * As factsConfidence and verified evidence rise, ranges tighten.
 */
export function estimateFairLoss(metrics: Metrics, evidence?: EvidenceFact[]): FairLossEstimate {
  const m = metrics.measured
  const u = metrics.unmeasured
  const control = clamp(m.operationalControl, 0, 1)
  const burn = clamp(m.financialBurn, 0, 1)
  const exposure = clamp(m.serviceDisruption, 0, 1)
  const posture = clamp(m.disclosurePosture / 3, 0, 1)
  const debt = clamp(u.disclosureDebt, 0, 1)
  const clock = clamp(u.regulatoryExposure, 0, 1)
  const narrative = clamp(1 - u.narrativeIntegrity, 0, 1)
  const factsGap = clamp(1 - u.factsConfidence, 0, 1)
  const lock = clamp(u.commitmentLock, 0, 1)

  const confidence = estimateConfidence(metrics, evidence)
  const provisional = confidence < 0.55
  // Low confidence → wider bands; high confidence → tighter
  const spread = 1.15 + (1 - confidence) * 1.35
  const down = clamp(0.55 / spread, 0.22, 0.55)
  const upPrimary = clamp(1.35 * spread, 1.4, 3.2)
  const upSecondary = clamp(1.75 * spread, 1.6, 4.0)

  const primaryDrivers: FairDriver[] = [
    { id: 'burn', label: 'Response burn (IR, counsel, overtime)', dollars: burn * 8_000_000, kind: 'primary' },
    { id: 'downtime', label: 'Operational disruption / downtime', dollars: (1 - control) * 7_500_000, kind: 'primary' },
    { id: 'exposure', label: 'Exposure severity (containment load)', dollars: exposure * 11_000_000, kind: 'primary' },
  ]

  const secondaryDrivers: FairDriver[] = [
    { id: 'debt', label: 'Disclosure debt → churn & litigation', dollars: debt * 28_000_000, kind: 'secondary' },
    { id: 'clock', label: 'Regulatory clock lag → fines / orders', dollars: clock * 14_000_000, kind: 'secondary' },
    { id: 'narrative', label: 'Narrative capture → trust destruction', dollars: narrative * 16_000_000, kind: 'secondary' },
    { id: 'lock', label: 'Commitment lock (pay / deny / overclaim)', dollars: lock * 12_000_000, kind: 'secondary' },
    { id: 'facts', label: 'Facts gap → re-notice & class actions', dollars: factsGap * 9_000_000, kind: 'secondary' },
    {
      id: 'interaction',
      label: 'Exposure × weak disclosure (compounding)',
      dollars: exposure * debt * 22_000_000,
      kind: 'secondary',
    },
  ]

  const postureRelief = posture * 6_000_000

  const primaryMode =
    2_200_000 +
    primaryDrivers.reduce((s, d) => s + d.dollars, 0)

  const secondaryMode = Math.max(
    800_000,
    1_200_000 + secondaryDrivers.reduce((s, d) => s + d.dollars, 0) - postureRelief
  )

  const primary = rangeFromMode(primaryMode, down, upPrimary)
  const secondary = rangeFromMode(secondaryMode, down * 0.85, upSecondary)
  const total: FairRange = {
    min: primary.min + secondary.min,
    mode: primary.mode + secondary.mode,
    max: primary.max + secondary.max,
  }

  const drivers = [...primaryDrivers, ...secondaryDrivers]
    .filter(d => d.dollars > 500_000)
    .sort((a, b) => b.dollars - a.dollars)
    .slice(0, 4)

  let urgency: FairLossEstimate['urgency'] = 'elevated'
  if (total.mode >= 45_000_000 || secondary.mode > primary.mode * 1.8) urgency = 'critical'
  else if (total.mode >= 22_000_000 || debt > 0.45 || clock > 0.5) urgency = 'severe'

  const label = confidenceLabel(confidence)
  const secondaryShare = total.mode > 0 ? secondary.mode / total.mode : 0
  const headline = provisional
    ? `Provisional board range (${label} confidence) — widen or tighten as facts verify`
    : secondaryShare > 0.58
      ? 'Secondary loss dominates — disclosure failure is the expensive problem'
      : secondaryShare > 0.42
        ? 'Primary and secondary losses are both material'
        : 'Primary response costs lead — disclosure debt still accumulating'

  return {
    primary,
    secondary,
    total,
    drivers,
    headline,
    urgency,
    confidence,
    confidenceLabel: label,
    provisional,
  }
}
