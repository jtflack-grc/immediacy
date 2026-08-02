// Generate human-readable explanations for why metrics changed

export function getMetricChangeReason(metricKey: string, change: number, choiceContext?: string): string {
  const isIncrease = change > 0
  
  // Measured metrics
  if (metricKey === 'productionEfficiency') {
    return isIncrease
      ? 'New production methods or technologies increased output per unit of input.'
      : 'Welfare improvements or regulatory requirements reduced production efficiency.'
  }
  
  if (metricKey === 'welfareStandardAdoption') {
    return isIncrease
      ? 'Higher welfare standards were mandated or adopted across more operations and regions.'
      : 'Standards were weakened, delayed, or faced lower adoption rates.'
  }
  
  if (metricKey === 'costPerUnit') {
    return isIncrease
      ? 'Welfare improvements, enforcement, or regulations increased production costs.'
      : 'Efficiency gains, industry optimization, or relaxed standards reduced costs.'
  }
  
  if (metricKey === 'welfareIncidentRate') {
    return isIncrease
      ? 'Disease, injury, or mortality rates increased due to inadequate standards or enforcement.'
      : 'Better welfare standards and practices reduced incidents of disease, injury, and mortality.'
  }
  
  // Unmeasured metrics (governance debt)
  if (metricKey === 'welfareDebt') {
    return isIncrease
      ? 'Short-term compromises on animal welfare created hidden costs that will compound over time.'
      : 'Decisions prioritized long-term welfare outcomes, reducing accumulated welfare compromises.'
  }
  
  if (metricKey === 'enforcementGap') {
    return isIncrease
      ? 'Enforcement capacity failed to keep pace with new standards, creating a gap between policy and practice.'
      : 'Investment in enforcement infrastructure or simpler standards reduced the enforcement gap.'
  }
  
  if (metricKey === 'regulatoryCapture') {
    return isIncrease
      ? 'Industry influence over policymaking increased, potentially prioritizing business concerns over welfare.'
      : 'Independent oversight or stronger government regulation reduced industry capture of policymaking.'
  }
  
  if (metricKey === 'sentienceKnowledgeGap') {
    return isIncrease
      ? 'Scientific understanding of animal sentience failed to advance or policy excluded certain species.'
      : 'Research investment or broader recognition of sentience reduced uncertainty about animal needs.'
  }
  
  if (metricKey === 'systemIrreversibility') {
    return isIncrease
      ? 'Economic dependencies and infrastructure investments made current systems harder to change or unwind.'
      : 'Flexibility was preserved or alternative systems were developed, maintaining options for future change.'
  }
  
  return 'This metric was affected by your decision.'
}
