// Generate human-readable explanations for why metrics changed

export function getMetricChangeReason(metricKey: string, change: number, choiceContext?: string): string {
  const isIncrease = change > 0
  
  if (metricKey === 'operationalControl') {
    return isIncrease
      ? 'Containment or restore actions strengthened operational control of the incident.'
      : 'Scope expanded, restore stalled, or isolation tradeoffs cut operational control.'
  }
  
  if (metricKey === 'disclosurePosture') {
    return isIncrease
      ? 'Disclosure process tightened — notices, trust-center updates, or counsel checkpoints aligned.'
      : 'Disclosure posture slipped: delayed notices, inconsistent messaging, or ad-hoc war-room thrash.'
  }
  
  if (metricKey === 'financialBurn') {
    return isIncrease
      ? 'IR, counsel, overtime, or vendor spend raised response burn.'
      : 'Burn eased as the room stabilized or expensive paths were deferred.'
  }
  
  if (metricKey === 'serviceDisruption') {
    return isIncrease
      ? 'Exposure severity rose — more sensitive data, encryption progress, or leak-site pressure.'
      : 'Exposure severity eased as containment held or blast radius clarified downward.'
  }
  
  if (metricKey === 'disclosureDebt') {
    return isIncrease
      ? 'Silence, drip truth, or spin added disclosure debt that will compound until forced.'
      : 'Harder, earlier statements paid down disclosure debt.'
  }
  
  if (metricKey === 'regulatoryExposure') {
    return isIncrease
      ? 'Notice clocks slipped relative to awareness — regulatory clock lag widened.'
      : 'Timed disclosure checkpoints or counsel discipline closed regulatory clock lag.'
  }
  
  if (metricKey === 'narrativeIntegrity') {
    return isIncrease
      ? 'Facts-first updates realigned messaging with operational truth.'
      : 'Messaging drifted from operational truth — narrative integrity fell.'
  }
  
  if (metricKey === 'factsConfidence') {
    return isIncrease
      ? 'Forensics or scoping narrowed the facts gap — confidence rose.'
      : 'Blast radius, data types, or attacker capability stayed unclear — facts confidence fell.'
  }
  
  if (metricKey === 'commitmentLock') {
    return isIncrease
      ? 'Payments, denials, or attributions locked in — commitment lock rose.'
      : 'You preserved optionality; commitment lock eased.'
  }
  
  return 'This metric was affected by your decision.'
}
