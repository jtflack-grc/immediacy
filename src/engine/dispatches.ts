import { State, IncidentDispatch, EvidenceFact, IncidentDeadline, SCHEMA_VERSION } from './scenarioTypes'

/** Built-in dispatch templates evaluated against state after each decision / time advance */
export const DISPATCH_TEMPLATES: IncidentDispatch[] = [
  {
    id: 'counsel_joins',
    at: 45,
    source: 'Outside Counsel',
    body: 'Outside counsel joins the war room and asks when awareness began for personal data.',
    effects: {
      addDeadlines: [{
        id: 'gdpr_72h',
        label: 'GDPR Art. 33 — 72h from awareness',
        kind: 'regulatory',
        dueAt: 72 * 60,
      }],
      setFlags: { counselPresent: true },
    },
  },
  {
    id: 'threat_proof',
    at: 90,
    source: 'Threat Actor',
    body: 'Adversary posts sample files on a leak site — proof of exfiltration.',
    requires: { delayedEscalation: true },
    effects: {
      metrics: { unmeasured: { disclosureDebt: 0.08, factsConfidence: -0.05 }, measured: { stakeholderTrust: -0.06 } },
      setFlags: { leakSiteActive: true, adversaryDisclosedFirst: true },
      addDeadlines: [{
        id: 'adversary_deadline',
        label: 'Adversary payment / leak deadline',
        kind: 'adversary',
        dueAt: 48 * 60,
      }],
    },
  },
  {
    id: 'reporter_request',
    at: 120,
    source: 'Reporter',
    body: 'A reporter requests comment on “an incident at Northline.” They have a source.',
    requires: { narrativeSoft: true },
    effects: {
      addDeadlines: [{
        id: 'reporter_deadline',
        label: 'Reporter deadline for comment',
        kind: 'reporter',
        dueAt: 130,
      }],
      setFlags: { pressAware: true },
    },
  },
  {
    id: 'customer_disruption',
    at: 60,
    source: 'Customer Success',
    body: 'A critical customer detects service disruption and asks if you are “having an incident.”',
    requires: { aggressiveIsolation: true },
    effects: {
      metrics: { measured: { serviceDisruption: 0.05, stakeholderTrust: -0.04 } },
      setFlags: { customerDetected: true },
    },
  },
  {
    id: 'employee_leak',
    at: 150,
    source: 'HR / Internal',
    body: 'Staff learn about the incident from the press or Slack rumor — not from leadership.',
    requires: { employeeSilence: true },
    effects: {
      metrics: { measured: { stakeholderTrust: -0.1 }, unmeasured: { disclosureDebt: 0.06 } },
      setFlags: { staffLearnedFromPress: true },
    },
  },
  {
    id: 'insurer_preservation',
    at: 100,
    source: 'Cyber Insurer',
    body: 'Insurer questions evidence preservation and when they were notified.',
    requires: { lateInsurerNotice: true },
    effects: {
      metrics: { measured: { evidenceIntegrity: -0.08 }, unmeasured: { regulatoryExposure: 0.05 } },
      setFlags: { coverageAtRisk: true },
      addDeadlines: [{
        id: 'insurer_notice',
        label: 'Insurer notice / cooperation window',
        kind: 'insurer',
        dueAt: 110,
      }],
    },
  },
  {
    id: 'regulator_awareness',
    at: 80,
    source: 'DPA / Regulator',
    body: 'Regulator asks when awareness began and what personal data is in scope.',
    effects: {
      setFlags: { regulatorEngaged: true },
    },
  },
  {
    id: 'board_demand',
    at: 110,
    source: 'Board',
    body: 'Board demands a recommendation: contain, disclose, pay, or hold.',
    effects: {
      addDeadlines: [{
        id: 'board_brief',
        label: 'Board briefing',
        kind: 'board',
        dueAt: 125,
      }],
      setFlags: { boardDemandsRec: true },
    },
  },
  {
    id: 'vendor_dispute',
    at: 140,
    source: 'Cloud Vendor',
    body: 'Vendor disputes responsibility for the misconfiguration path under investigation.',
    requires: { underScoped: true },
    effects: {
      metrics: { unmeasured: { factsConfidence: -0.06 } },
      setFlags: { vendorDispute: true },
    },
  },
  {
    id: 'forensics_revise',
    at: 160,
    source: 'Forensics',
    body: 'Forensics revises scope upward — more tenants and data types than initially briefed.',
    requires: { prematureCertainty: true },
    effects: {
      metrics: { unmeasured: { factsConfidence: -0.12, disclosureDebt: 0.07 }, measured: { stakeholderTrust: -0.05 } },
      setFlags: { scopeRevisedUp: true },
      addFacts: [{
        id: 'fact_scope_revision',
        text: 'Scope revised: additional tenants and sensitive fields confirmed in exfil path.',
        kind: 'verified',
        source: 'Forensics',
        timestamp: 160,
        confidence: 0.85,
        verificationStatus: 'corroborated',
      }],
    },
  },
]

function flagMatch(state: State, requires?: Record<string, boolean | number | string>): boolean {
  if (!requires) return true
  for (const [k, v] of Object.entries(requires)) {
    if (state.scenarioConditions?.includes(k)) continue
    const flagVal = state.flags[k]
    if (typeof v === 'boolean') {
      if (Boolean(flagVal) !== v) return false
    } else if (state.flags[k] !== v && state.scenarioConditions?.indexOf(String(v)) === -1) {
      // also allow condition ids
      if (!state.scenarioConditions?.includes(k)) return false
    }
  }
  // For requires like { delayedEscalation: true }, need flag true
  for (const [k, v] of Object.entries(requires)) {
    if (typeof v === 'boolean' && v === true) {
      if (state.scenarioConditions?.includes(k)) continue
      if (!state.flags[k]) return false
    }
  }
  return true
}

export function deliverDueDispatches(state: State): State {
  const deliveredIds = new Set(state.dispatchLog.map(d => d.id))
  const pending = DISPATCH_TEMPLATES.filter(d => !deliveredIds.has(d.id) && state.incidentTime >= d.at && flagMatch(state, d.requires))

  if (pending.length === 0) return state

  let next: State = { ...state }
  const newLog = [...state.dispatchLog]
  const newDeadlines = [...(state.deadlines || [])]
  const newEvidence = [...(state.evidence || [])]
  const newFlags = { ...state.flags }

  for (const d of pending) {
    newLog.push({ ...d, delivered: true, at: state.incidentTime })
    if (d.effects?.setFlags) Object.assign(newFlags, d.effects.setFlags)
    if (d.effects?.addDeadlines) newDeadlines.push(...d.effects.addDeadlines)
    if (d.effects?.addFacts) newEvidence.push(...d.effects.addFacts)
    if (d.effects?.metrics) {
      const m = next.metrics
      const dm = d.effects.metrics.measured || {}
      const du = d.effects.metrics.unmeasured || {}
      next = {
        ...next,
        metrics: {
          measured: {
            ...m.measured,
            ...Object.fromEntries(
              Object.entries(dm).map(([k, v]) => [k, clamp01((m.measured as any)[k] + (v as number), k === 'disclosurePosture' ? 3 : 1)])
            ),
          } as State['metrics']['measured'],
          unmeasured: {
            ...m.unmeasured,
            ...Object.fromEntries(
              Object.entries(du).map(([k, v]) => [k, clamp01((m.unmeasured as any)[k] + (v as number), 1)])
            ),
          } as State['metrics']['unmeasured'],
        },
      }
    }
  }

  return {
    ...next,
    flags: newFlags,
    deadlines: newDeadlines,
    evidence: newEvidence,
    dispatchLog: newLog,
    dispatches: pending,
    schemaVersion: SCHEMA_VERSION,
  }
}

function clamp01(n: number, max = 1) {
  return Math.max(0, Math.min(max, n))
}

export function inferFlagsFromChoice(label: string, rationale: string): Record<string, boolean> {
  const t = `${label} ${rationale}`.toLowerCase()
  const flags: Record<string, boolean> = {}
  if (/wait|monitor|observe|delay|hold|silence|say nothing/.test(t)) flags.delayedEscalation = true
  if (/isolat|segment|cut|take offline|aggressive contain/.test(t)) flags.aggressiveIsolation = true
  if (/certain|definitive|nation.state|all clear|no personal/.test(t)) flags.prematureCertainty = true
  if (/insurer|broker/.test(t) && /later|after|delay|tomorrow/.test(t)) flags.lateInsurerNotice = true
  if (/employee|staff|internal/.test(t) && /silence|later|not yet|hold/.test(t)) flags.employeeSilence = true
  if (/pay|ransom|bitcoin|transfer/.test(t)) flags.paidRansom = true
  if (/bounded|limited|careful disclos|narrow notice/.test(t)) flags.boundedEarlyDisclosure = true
  if (/under.?scope|only one|minimal scope|narrow scope/.test(t)) flags.underScoped = true
  if (/soft|status page|investigat(ing|ion)|no confirm/.test(t)) flags.narrativeSoft = true
  return flags
}
