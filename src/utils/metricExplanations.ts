// Metric explanations — IMMEDIACY disclosure war game
// Engine keys are inherited; labels are disclosure-native.

export interface MetricExplanation {
  label: string
  description: string
  realWorldExample: string
  researchCitation?: string
  researchUrl?: string
  benchmark?: { level: string; description: string }
  alertThreshold?: number
  alertMessage?: string
}

export const METRIC_EXPLANATIONS: Record<string, MetricExplanation> = {
  operationalControl: {
    label: 'Operational Control',
    description: 'How firmly you contain the incident — segmentation, identity lock-down, and evidence integrity. Higher is better.',
    realWorldExample: 'Aggressive isolation in ransomware events often trades short-term downtime for lower encryption blast radius.',
    researchCitation: 'CISA StopRansomware guidance',
    researchUrl: 'https://www.cisa.gov/stopransomware',
    benchmark: { level: '0.6+', description: 'Credible containment under way' },
    alertThreshold: 0.25,
    alertMessage: 'Operational control is collapsing — dwell time is working against you'
  },
  disclosurePosture: {
    label: 'Disclosure Posture',
    description: 'Maturity of your notice process: timed checkpoints, consistent facts packages, regulator/customer fairness (0–3 scale).',
    realWorldExample: 'Firms with rehearsed trust centers and Art. 33 playbooks notify with less narrative thrash than ad-hoc war rooms.',
    researchCitation: 'GDPR Article 33',
    researchUrl: 'https://gdpr-info.eu/art-33-gdpr/',
    benchmark: { level: '1.5–2.0', description: 'Documented, timed disclosure process' }
  },
  financialBurn: {
    label: 'Response Burn',
    description: 'Cash and attention cost of the response (IR, counsel, downtime, monitoring). Higher means the meter is running hotter.',
    realWorldExample: 'Panel IR + outside counsel + customer monitoring can dominate primary technical remediation cost.',
    researchCitation: 'FAIR — secondary loss often exceeds primary loss',
    researchUrl: 'https://www.fairinstitute.org/',
    benchmark: { level: '<0.5', description: 'Burn still governable' }
  },
  serviceDisruption: {
    label: 'Exposure Severity',
    description: 'How bad the underlying event looks — encryption, exfil likelihood, customer harm signals. Lower is better.',
    realWorldExample: 'Proof-of-exfil samples on a leak site spike severity even before full forensics finish.',
    researchCitation: 'CISA AA23-158A MOVEit / Cl0p',
    researchUrl: 'https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-158a',
    benchmark: { level: '<0.3', description: 'Contained or limited exposure' },
    alertThreshold: 0.45,
    alertMessage: 'Exposure severity is high — assume adversary-driven disclosure risk'
  },
  disclosureDebt: {
    label: 'Disclosure Debt',
    description: 'Accumulated cost of silence, drip truth, or spin. Compounds like technical debt when facts and statements diverge.',
    realWorldExample: 'Uber 2016: pay + conceal turned a breach into criminal exposure for leadership.',
    researchCitation: 'DOJ — Uber CSO conviction (2016 breach cover-up)',
    researchUrl: 'https://www.justice.gov/opa/pr/former-chief-security-officer-uber-convicted-federal-charges-covering-2016-data-breach',
    benchmark: { level: '<0.3', description: 'Manageable debt' },
    alertThreshold: 0.65,
    alertMessage: 'Critical disclosure debt — your story will not survive a screenshot'
  },
  regulatoryExposure: {
    label: 'Regulatory Clock Lag',
    description: 'Distance between legal awareness and actual notice to regulators/individuals. Higher = the clock is running unpaid.',
    realWorldExample: 'Equifax\'s disclosure lag became as infamous as the patch failure.',
    researchCitation: 'US House Oversight — Equifax breach report',
    researchUrl: 'https://oversight.house.gov/report/the-equifax-data-breach/',
    benchmark: { level: '<0.25', description: 'Clocks owned with documentation' },
    alertThreshold: 0.55,
    alertMessage: 'Regulatory clock lag is dangerous — document awareness or notify'
  },
  narrativeIntegrity: {
    label: 'Narrative Integrity',
    description: 'How closely PR/messaging tracks operational truth, rather than spin or selective storytelling. Higher is better.',
    realWorldExample: 'Status pages that say "degradation" during confirmed ransomware are classic narrative capture — low narrative integrity.',
    researchCitation: 'NIST SP 800-61 — coordination & accurate information sharing',
    researchUrl: 'https://csrc.nist.gov/pubs/sp/800/61/r2/final',
    benchmark: { level: '>0.7', description: 'Truth-aligned messaging' },
    alertThreshold: 0.4,
    alertMessage: 'Narrative integrity is low — statements are drifting from facts'
  },
  factsConfidence: {
    label: 'Facts Confidence',
    description: 'How much you know: blast radius, data types, persistence, integrity of backups. Higher is better.',
    realWorldExample: 'LastPass staged disclosures tracked a shrinking facts-confidence picture as later stages emerged.',
    researchCitation: 'LastPass security incident updates (2022–2023)',
    researchUrl: 'https://blog.lastpass.com/2023/03/security-incident-update-recommended-actions/',
    benchmark: { level: '>0.65', description: 'Enough facts for honest notice' }
  },
  commitmentLock: {
    label: 'Commitment Lock',
    description: 'How hard it is to unwind statements, payments, privilege postures, or public attributions already made.',
    realWorldExample: 'Ransom payment and hard public denials are difficult to walk back when new facts arrive.',
    researchCitation: 'CISA — Colonial Pipeline lessons',
    researchUrl: 'https://www.cisa.gov/news-events/news/attack-colonial-pipeline-what-weve-learned-what-weve-done-over-past-two-years',
    benchmark: { level: '<0.5', description: 'Decisions still reversible' },
    alertThreshold: 0.75,
    alertMessage: 'Commitment lock is critical — some choices are now permanent'
  },
  evidenceIntegrity: {
    label: 'Evidence Integrity',
    description: 'Quality of preservation for logs, images, and chain of custody. Higher is better.',
    realWorldExample: 'Restoring before imaging destroys the evidence you need for scoping and litigation.',
    researchCitation: 'NIST SP 800-86 — forensic technique integration',
    researchUrl: 'https://csrc.nist.gov/pubs/sp/800/86/final',
    benchmark: { level: '>0.6', description: 'Defensible evidence trail' },
    alertThreshold: 0.3,
    alertMessage: 'Evidence integrity is degrading — forensic conclusions will be contestable'
  },
  stakeholderTrust: {
    label: 'Stakeholder Trust',
    description: 'Trust held by customers, staff, and the board through the incident. Higher is better.',
    realWorldExample: 'Consistent, honest updates preserve trust even when the news itself is bad.',
    researchCitation: 'Edelman Trust Barometer — crisis communication research',
    researchUrl: 'https://www.edelman.com/trust-barometer',
    benchmark: { level: '>0.5', description: 'Stakeholders still extending good faith' },
    alertThreshold: 0.25,
    alertMessage: 'Stakeholder trust is collapsing — expect churn and adversarial posture'
  }
}

export function getMetricExplanation(key: string): MetricExplanation | null {
  return METRIC_EXPLANATIONS[key] || null
}
