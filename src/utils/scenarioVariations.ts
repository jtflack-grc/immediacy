import { Metrics } from '../engine/scenarioTypes'

/**
 * Incident conditions replace the old "difficulty level" / "starting condition"
 * concepts. Each condition is a flag that nudges starting metrics to reflect a
 * real-world complicating factor present at the moment the incident begins.
 * Multiple conditions can be combined (state.scenarioConditions: string[]).
 */
export type IncidentConditionId =
  | 'tabletop'
  | 'standard'
  | 'thin_staffing'
  | 'weak_telemetry'
  | 'no_playbook'
  | 'cross_border'
  | 'critical_customer'
  | 'unverified_backups'
  | 'late_insurer_notice'
  | 'leak_site_pressure'
  | 'public_company_pressure'

export interface IncidentConditionMeta {
  id: IncidentConditionId
  label: string
  description: string
}

export const INCIDENT_CONDITIONS: IncidentConditionMeta[] = [
  {
    id: 'tabletop',
    label: 'Tabletop',
    description: 'Low-stakes practice run — forgiving clocks and burn, ideal for learning the flow.',
  },
  {
    id: 'standard',
    label: 'Standard',
    description: 'Baseline incident conditions with no additional complicating factors.',
  },
  {
    id: 'thin_staffing',
    label: 'Thin Staffing',
    description: 'The IR team is understaffed — containment is slower and costs run higher.',
  },
  {
    id: 'weak_telemetry',
    label: 'Weak Telemetry',
    description: 'Limited logging and monitoring — the facts gap starts wider and forensics take longer.',
  },
  {
    id: 'no_playbook',
    label: 'No Playbook',
    description: 'No incident response plan on file — disclosure posture starts lower and early statements lock you in faster.',
  },
  {
    id: 'cross_border',
    label: 'Cross-Border Exposure',
    description: 'Data and customers span multiple jurisdictions — regulatory exposure starts elevated.',
  },
  {
    id: 'critical_customer',
    label: 'Critical Customer Impact',
    description: 'A high-profile customer is affected — service disruption and narrative pressure start higher.',
  },
  {
    id: 'unverified_backups',
    label: 'Unverified Backups',
    description: 'Backup integrity is unconfirmed — operational control starts lower and restores carry more risk.',
  },
  {
    id: 'late_insurer_notice',
    label: 'Late Insurer Notice',
    description: 'Cyber insurer notification is already overdue — regulatory exposure and disclosure debt start higher.',
  },
  {
    id: 'leak_site_pressure',
    label: 'Leak-Site Pressure',
    description: 'Attackers are already threatening publication — disclosure debt and service disruption start elevated.',
  },
  {
    id: 'public_company_pressure',
    label: 'Public Company Pressure',
    description: 'A materiality clock and investor scrutiny apply from turn one — regulatory exposure starts elevated and narrative integrity starts under strain.',
  },
]

export const INCIDENT_CONDITION_IDS: IncidentConditionId[] = INCIDENT_CONDITIONS.map(c => c.id)

export const DEFAULT_INCIDENT_CONDITIONS: string[] = ['standard']

export function getIncidentConditionMeta(id: string): IncidentConditionMeta | undefined {
  return INCIDENT_CONDITIONS.find(c => c.id === id)
}

export function getIncidentConditionLabel(id: string): string {
  return getIncidentConditionMeta(id)?.label || id
}

export function getIncidentConditionDescription(id: string): string {
  return getIncidentConditionMeta(id)?.description || ''
}

function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * Apply a single incident condition flag to a metrics object, returning a new
 * metrics object. Unknown ids are a no-op ('standard' is always a no-op).
 */
function applyOneCondition(metrics: Metrics, condition: string): Metrics {
  switch (condition) {
    case 'tabletop':
      return {
        measured: {
          ...metrics.measured,
          operationalControl: clamp(metrics.measured.operationalControl * 1.3),
          financialBurn: clamp(metrics.measured.financialBurn * 0.6),
          serviceDisruption: clamp(metrics.measured.serviceDisruption * 0.6),
        },
        unmeasured: {
          ...metrics.unmeasured,
          disclosureDebt: clamp(metrics.unmeasured.disclosureDebt * 0.6),
          regulatoryExposure: clamp(metrics.unmeasured.regulatoryExposure * 0.6),
        },
      }

    case 'thin_staffing':
      return {
        ...metrics,
        measured: {
          ...metrics.measured,
          operationalControl: clamp(metrics.measured.operationalControl * 0.85),
          financialBurn: clamp(metrics.measured.financialBurn * 1.2),
        },
      }

    case 'weak_telemetry':
      return {
        ...metrics,
        unmeasured: {
          ...metrics.unmeasured,
          factsConfidence: clamp(metrics.unmeasured.factsConfidence * 0.7),
        },
      }

    case 'no_playbook':
      return {
        ...metrics,
        measured: {
          ...metrics.measured,
          disclosurePosture: Math.max(0, metrics.measured.disclosurePosture * 0.7),
        },
        unmeasured: {
          ...metrics.unmeasured,
          commitmentLock: clamp(metrics.unmeasured.commitmentLock * 1.3),
        },
      }

    case 'cross_border':
      return {
        ...metrics,
        unmeasured: {
          ...metrics.unmeasured,
          regulatoryExposure: clamp(metrics.unmeasured.regulatoryExposure * 1.35),
        },
      }

    case 'critical_customer':
      return {
        ...metrics,
        measured: {
          ...metrics.measured,
          serviceDisruption: clamp(metrics.measured.serviceDisruption * 1.3),
        },
        unmeasured: {
          ...metrics.unmeasured,
          narrativeIntegrity: clamp(metrics.unmeasured.narrativeIntegrity * 0.8),
        },
      }

    case 'unverified_backups':
      return {
        ...metrics,
        measured: {
          ...metrics.measured,
          operationalControl: clamp(metrics.measured.operationalControl * 0.8),
        },
      }

    case 'late_insurer_notice':
      return {
        ...metrics,
        unmeasured: {
          ...metrics.unmeasured,
          regulatoryExposure: clamp(metrics.unmeasured.regulatoryExposure * 1.3),
          disclosureDebt: clamp(metrics.unmeasured.disclosureDebt * 1.25),
        },
      }

    case 'leak_site_pressure':
      return {
        ...metrics,
        measured: {
          ...metrics.measured,
          serviceDisruption: clamp(metrics.measured.serviceDisruption * 1.2),
        },
        unmeasured: {
          ...metrics.unmeasured,
          disclosureDebt: clamp(metrics.unmeasured.disclosureDebt * 1.4),
        },
      }

    case 'public_company_pressure':
      return {
        ...metrics,
        unmeasured: {
          ...metrics.unmeasured,
          regulatoryExposure: clamp(metrics.unmeasured.regulatoryExposure * 1.25),
          narrativeIntegrity: clamp(metrics.unmeasured.narrativeIntegrity * 0.85),
        },
      }

    case 'standard':
    default:
      return metrics
  }
}

/**
 * Apply a set of incident condition flags to initial metrics, in order.
 * Defaults to ['standard'] (no-op) when no conditions are supplied.
 */
export function applyIncidentConditions(metrics: Metrics, conditions: string[] = DEFAULT_INCIDENT_CONDITIONS): Metrics {
  return conditions.reduce((acc, condition) => applyOneCondition(acc, condition), metrics)
}
