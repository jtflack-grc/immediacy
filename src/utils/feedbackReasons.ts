// Generate human-readable explanations for why metrics changed

export function getMetricChangeReason(metricKey: string, change: number, choiceContext?: string): string {
  const isIncrease = change > 0
  
  if (metricKey === 'productionEfficiency') {
    return isIncrease
      ? 'Containment or restore actions strengthened operational control of the incident.'
      : 'Scope expanded, restore stalled, or isolation tradeoffs cut operational control.'
  }
  
  if (metricKey === 'welfareStandardAdoption') {
    return isIncrease
      ? 'Disclosure process tightened — notices, trust-center updates, or counsel checkpoints aligned.'
      : 'Disclosure posture slipped: delayed notices, inconsistent messaging, or ad-hoc war-room thrash.'
  }
  
  if (metricKey === 'costPerUnit') {
    return isIncrease
      ? 'IR, counsel, overtime, or vendor spend raised response burn.'
      : 'Burn eased as the room stabilized or expensive paths were deferred.'
  }
  
  if (metricKey === 'welfareIncidentRate') {
    return isIncrease
      ? 'Exposure severity rose — more sensitive data, encryption progress, or leak-site pressure.'
      : 'Exposure severity eased as containment held or blast radius clarified downward.'
  }
  
  if (metricKey === 'welfareDebt') {
    return isIncrease
      ? 'Silence, drip truth, or spin added disclosure debt that will compound until forced.'
      : 'Harder, earlier statements paid down disclosure debt.'
  }
  
  if (metricKey === 'enforcementGap') {
    return isIncrease
      ? 'Notice clocks slipped relative to awareness — regulatory clock lag widened.'
      : 'Timed disclosure checkpoints or counsel discipline closed regulatory clock lag.'
  }
  
  if (metricKey === 'regulatoryCapture') {
    return isIncrease
      ? 'Messaging drifted from operational truth — narrative capture increased.'
      : 'Facts-first updates reduced narrative capture.'
  }
  
  if (metricKey === 'sentienceKnowledgeGap') {
    return isIncrease
      ? 'Blast radius, data types, or attacker capability stayed unclear — facts gap widened.'
      : 'Forensics or scoping narrowed the facts gap.'
  }
  
  if (metricKey === 'systemIrreversibility') {
    return isIncrease
      ? 'Payments, denials, or attributions locked in — commitment lock rose.'
      : 'You preserved optionality; commitment lock eased.'
  }
  
  return 'This metric was affected by your decision.'
}
