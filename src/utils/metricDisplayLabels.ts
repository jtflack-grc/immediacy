/** User-facing labels for incident-native metric keys */
export const METRIC_DISPLAY_LABELS: Record<string, string> = {
  operationalControl: 'Operational Control',
  financialBurn: 'Financial Burn',
  serviceDisruption: 'Service Disruption',
  disclosurePosture: 'Disclosure Posture',
  evidenceIntegrity: 'Evidence Integrity',
  stakeholderTrust: 'Stakeholder Trust',
  disclosureDebt: 'Disclosure Debt',
  regulatoryExposure: 'Regulatory Exposure',
  narrativeIntegrity: 'Narrative Integrity',
  factsConfidence: 'Facts Confidence',
  commitmentLock: 'Commitment Lock',
}

export function metricLabel(key: string): string {
  return METRIC_DISPLAY_LABELS[key] || key
}
