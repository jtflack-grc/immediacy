/** User-facing labels for engine metric keys (IMMEDIACY remaps). */
export const METRIC_DISPLAY_LABELS: Record<string, string> = {
  productionEfficiency: 'Operational Control',
  welfareStandardAdoption: 'Disclosure Posture',
  costPerUnit: 'Response Burn',
  welfareIncidentRate: 'Exposure Severity',
  welfareDebt: 'Disclosure Debt',
  enforcementGap: 'Regulatory Clock Lag',
  regulatoryCapture: 'Narrative Capture',
  sentienceKnowledgeGap: 'Facts Gap',
  systemIrreversibility: 'Commitment Lock',
}

export function metricLabel(key: string): string {
  return METRIC_DISPLAY_LABELS[key] || key
}
