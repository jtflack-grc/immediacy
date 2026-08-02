import { Metrics } from '../engine/scenarioTypes'

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

/**
 * Lightweight FAIR-style loss estimate for Northline-scale SaaS.
 * Derived from existing war-room metrics (no separate state fields).
 *
 * Primary ≈ response / downtime / IR burn
 * Secondary ≈ fines, churn, litigation, reputation from disclosure failure
 */
export function estimateFairLoss(metrics: Metrics): FairLossEstimate {
  const m = metrics.measured
  const u = metrics.unmeasured
  const control = clamp(m.operationalControl, 0, 1)
  const burn = clamp(m.financialBurn, 0, 1)
  const exposure = clamp(m.serviceDisruption, 0, 1)
  const posture = clamp(m.disclosurePosture / 3, 0, 1)
  const debt = clamp(u.disclosureDebt, 0, 1)
  const clock = clamp(u.regulatoryExposure, 0, 1)
  const narrative = clamp(1 - u.narrativeIntegrity, 0, 1)
  const facts = clamp(1 - u.factsConfidence, 0, 1)
  const lock = clamp(u.commitmentLock, 0, 1)

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
    { id: 'facts', label: 'Facts gap → re-notice & class actions', dollars: facts * 9_000_000, kind: 'secondary' },
    {
      id: 'interaction',
      label: 'Exposure × weak disclosure (compounding)',
      dollars: exposure * debt * 22_000_000,
      kind: 'secondary',
    },
  ]

  // Strong posture slightly dampens secondary loss
  const postureRelief = posture * 6_000_000

  const primaryMode =
    2_200_000 +
    primaryDrivers.reduce((s, d) => s + d.dollars, 0)

  const secondaryMode = Math.max(
    800_000,
    1_200_000 + secondaryDrivers.reduce((s, d) => s + d.dollars, 0) - postureRelief
  )

  const primary = rangeFromMode(primaryMode, 0.48, 1.75)
  const secondary = rangeFromMode(secondaryMode, 0.38, 2.35)
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

  const secondaryShare = total.mode > 0 ? secondary.mode / total.mode : 0
  const headline =
    secondaryShare > 0.58
      ? 'Secondary loss dominates — disclosure failure is the expensive problem'
      : secondaryShare > 0.42
        ? 'Primary and secondary losses are both material'
        : 'Primary response costs lead — disclosure debt still accumulating'

  return { primary, secondary, total, drivers, headline, urgency }
}
