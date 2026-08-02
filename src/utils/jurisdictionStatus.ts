import { State, IncidentDeadline } from '../engine/scenarioTypes'
import { getCountryData, IN_PLAY_ISO3 } from './jurisdictionData'

export type NotificationStatus = 'not_started' | 'assessing' | 'notice_due' | 'filed' | 'overdue'

export interface JurisdictionStatus {
  iso3: string
  name: string
  score: number
  notificationStatus: NotificationStatus
  clockHint: string
  confidence: number
  regulatoryPressure: number
}

/** Jurisdictions whose regulatory clock maps onto a GDPR-style awareness deadline. */
const GDPR_STYLE_ISO3 = new Set(['GBR', 'IRL', 'DEU', 'FRA', 'NLD', 'ITA', 'ESP', 'SWE', 'DNK', 'POL'])

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n))
}

function formatDuration(minutes: number): string {
  const abs = Math.abs(Math.round(minutes))
  const h = Math.floor(abs / 60)
  const m = abs % 60
  return `${h}h ${String(m).padStart(2, '0')}m`
}

/** Best-effort match of a jurisdiction to a tracked regulatory deadline (deadlines aren't stored per-country). */
function relevantRegulatoryDeadline(iso3: string, deadlines: IncidentDeadline[]): IncidentDeadline | undefined {
  const regulatory = deadlines.filter(d => d.kind === 'regulatory')
  if (regulatory.length === 0) return undefined

  if (GDPR_STYLE_ISO3.has(iso3)) {
    return regulatory.find(d => /gdpr|dpa|art\.?\s?33|ico/i.test(d.label)) || regulatory[0]
  }
  if (iso3 === 'USA') {
    return regulatory.find(d => /sec|8-k|state ag|breach notice/i.test(d.label))
  }
  return undefined
}

function deriveNotificationStatus(
  deadline: IncidentDeadline | undefined,
  incidentTime: number,
  regulatorEngaged: boolean,
  counselPresent: boolean,
  score: number
): NotificationStatus {
  if (deadline) {
    const remaining = deadline.dueAt - incidentTime
    if (deadline.missed || remaining < 0) return 'overdue'
    if (remaining <= 360) return 'notice_due' // within 6 simulated hours of the clock
    return regulatorEngaged || counselPresent ? 'assessing' : 'not_started'
  }

  if (regulatorEngaged && score >= 0.6) return 'filed'
  if (regulatorEngaged || counselPresent) return 'assessing'
  return 'not_started'
}

export function notificationStatusColor(status: NotificationStatus): string {
  switch (status) {
    case 'filed': return '#4ade80'
    case 'assessing': return '#60a5fa'
    case 'notice_due': return '#fbbf24'
    case 'overdue': return '#ef4444'
    default: return '#94a3b8'
  }
}

export function notificationStatusLabel(status: NotificationStatus): string {
  switch (status) {
    case 'not_started': return 'Not Started'
    case 'assessing': return 'Assessing'
    case 'notice_due': return 'Notice Due'
    case 'filed': return 'Filed'
    case 'overdue': return 'Overdue'
    default: return status
  }
}

export function regulatoryPressureColor(pressure: number): string {
  if (pressure >= 0.66) return '#ef4444'
  if (pressure >= 0.33) return '#fbbf24'
  return '#4ade80'
}

function deriveClockHint(deadline: IncidentDeadline | undefined, incidentTime: number): string {
  if (!deadline) return 'No jurisdiction-specific clock tracked'
  const remaining = deadline.dueAt - incidentTime
  if (deadline.missed || remaining < 0) return `${deadline.label} — missed by ${formatDuration(remaining)}`
  return `${deadline.label} — ${formatDuration(remaining)} remaining`
}

/**
 * Compute jurisdiction status (no letter grades) for a single country given its
 * current map value. `state` is optional so hover/preview UI can call this before
 * a full incident state exists.
 */
export function getJurisdictionStatus(
  iso3: string,
  value: number,
  state?: State,
  countryNameOverride?: string
): JurisdictionStatus | null {
  const countryData = getCountryData(iso3, countryNameOverride)
  if (!countryData) return null

  const baseScore = countryData.baselineScore
  const score = clamp01(baseScore + value * 0.5)

  const deadlines = state?.deadlines || []
  const incidentTime = state?.incidentTime || 0
  const regulatorEngaged = !!state?.flags?.regulatorEngaged
  const counselPresent = !!state?.flags?.counselPresent
  const factsConfidence = state?.metrics?.unmeasured?.factsConfidence ?? 0.5
  const regulatoryExposure = state?.metrics?.unmeasured?.regulatoryExposure ?? (1 - score)

  const deadline = relevantRegulatoryDeadline(iso3, deadlines)

  return {
    iso3,
    name: countryData.name,
    score,
    notificationStatus: deriveNotificationStatus(deadline, incidentTime, regulatorEngaged, counselPresent, score),
    clockHint: deriveClockHint(deadline, incidentTime),
    confidence: clamp01(factsConfidence),
    regulatoryPressure: clamp01(regulatoryExposure * 0.6 + (1 - score) * 0.4),
  }
}

/**
 * Jurisdiction status for every "in play" country in the current state, sorted by
 * regulatory pressure (highest first) so the most urgent jurisdictions surface first.
 */
export function calculateJurisdictionStatuses(state: State): JurisdictionStatus[] {
  const statuses: JurisdictionStatus[] = []

  Object.entries(state.map.regionValues).forEach(([iso3, value]) => {
    if (!IN_PLAY_ISO3.has(iso3)) return
    const status = getJurisdictionStatus(iso3, value, state)
    if (status) statuses.push(status)
  })

  return statuses.sort((a, b) => b.regulatoryPressure - a.regulatoryPressure)
}

/**
 * Average jurisdiction posture score across in-play countries — used as an input
 * to the overall run score, not surfaced directly as a grade in the UI.
 */
export function calculateAverageJurisdictionPosture(state: State): number {
  const statuses = calculateJurisdictionStatuses(state)
  if (statuses.length === 0) return 0

  const total = statuses.reduce((sum, s) => sum + s.score, 0)
  return total / statuses.length
}
