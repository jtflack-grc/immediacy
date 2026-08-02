// Metric explanations and tooltips for educational context

export interface MetricExplanation {
  label: string
  description: string
  realWorldExample: string
  researchCitation?: string
  researchUrl?: string  // Direct link to research paper/document
  benchmark?: { level: string; description: string }
  alertThreshold?: number  // Threshold for warnings (0-1)
  alertMessage?: string  // Message to show when threshold exceeded
}

export const METRIC_EXPLANATIONS: Record<string, MetricExplanation> = {
  productionEfficiency: {
    label: 'Production Efficiency',
    description: 'Output per unit input - measures how efficiently resources are converted to animal products.',
    realWorldExample: 'EU farms average 65-75% efficiency. Intensive systems can reach 80%+ but often at welfare cost.',
    researchCitation: 'FAO, 2020. "Livestock Efficiency Metrics"',
    researchUrl: 'https://www.fao.org/animal-production/en',
    benchmark: { level: '65-75%', description: 'Typical EU farm efficiency' },
    alertThreshold: 0.85,
    alertMessage: 'Very high efficiency may indicate welfare compromises'
  },
  welfareStandardAdoption: {
    label: 'Welfare Standard Adoption',
    description: 'Adoption level of recognized welfare standards (0-3 scale). Higher values indicate broader, more comprehensive adoption.',
    realWorldExample: 'EU Directive 98/58 represents ~1.5 on this scale. UK Animal Welfare Act 2006 represents ~2.0.',
    researchCitation: 'European Commission, 2012. "Animal Welfare Legislation Review"',
    researchUrl: 'https://food.ec.europa.eu/animals/animal-welfare/eu-animal-welfare-legislation_en',
    benchmark: { level: '1.5-2.0', description: 'EU/UK baseline standards' }
  },
  costPerUnit: {
    label: 'Cost Per Unit',
    description: 'Production cost per unit output. Lower is better, but often correlates with reduced welfare spending.',
    realWorldExample: 'US factory farms achieve 20-30% lower costs than EU farms, but with higher welfare incident rates.',
    researchCitation: 'USDA Economic Research Service, 2019',
    benchmark: { level: '0.7-0.8', description: 'EU baseline cost level' }
  },
  welfareIncidentRate: {
    label: 'Welfare Incident Rate',
    description: 'Rate of disease, injury, and mortality incidents. Lower is better. Includes preventable suffering.',
    realWorldExample: 'Intensive systems show 2-3x higher incident rates than extensive systems, but lower per-unit costs.',
    researchCitation: 'Humane Society International, 2021. "Factory Farming Welfare Analysis"',
    researchUrl: 'https://www.hsi.org/issues/farm-animal-welfare/',
    benchmark: { level: '<0.2', description: 'Good welfare standard' },
    alertThreshold: 0.4,
    alertMessage: '⚠️ High incident rate indicates significant welfare problems'
  },
  welfareDebt: {
    label: 'Welfare Debt',
    description: 'Accumulated welfare compromises that compound over time. Like technical debt, but for animal suffering.',
    realWorldExample: 'Decades of prioritizing efficiency over welfare in US factory farming created massive welfare debt.',
    researchCitation: 'Animal Welfare Institute, 2020. "Historical Welfare Debt Analysis"',
    researchUrl: 'https://awionline.org/content/factory-farming',
    benchmark: { level: '<0.3', description: 'Manageable debt level' },
    alertThreshold: 0.7,
    alertMessage: '⚠️ Critical: Welfare debt is dangerously high. System may be approaching point of no return.'
  },
  enforcementGap: {
    label: 'Enforcement Gap',
    description: 'Delay between policy creation and actual enforcement. Higher values mean policies exist but aren\'t implemented.',
    realWorldExample: 'Many countries have welfare laws but lack inspectors. Gap can be 5-10 years between law and enforcement.',
    researchCitation: 'World Animal Protection, 2019. "Global Enforcement Analysis"',
    researchUrl: 'https://www.worldanimalprotection.org/',
    benchmark: { level: '<0.2', description: 'Effective enforcement' },
    alertThreshold: 0.6,
    alertMessage: '⚠️ Large enforcement gap - policies exist but aren\'t being enforced'
  },
  regulatoryCapture: {
    label: 'Regulatory Capture',
    description: 'Industry influence on policy-making. Higher values mean industry interests override welfare concerns.',
    realWorldExample: 'US agricultural lobby spending correlates with weaker welfare regulations despite public support.',
    researchCitation: 'OpenSecrets.org, 2020. "Agricultural Lobbying Impact"',
    researchUrl: 'https://www.opensecrets.org/industries/indus.php?ind=A01',
    benchmark: { level: '<0.3', description: 'Independent regulation' },
    alertThreshold: 0.7,
    alertMessage: '⚠️ High regulatory capture - industry interests dominating policy'
  },
  sentienceKnowledgeGap: {
    label: 'Sentience Knowledge Gap',
    description: 'Gaps in understanding animal needs and capabilities. Lower values mean better scientific understanding.',
    realWorldExample: 'Fish sentience was debated until 2010s. Many invertebrates still lack recognition despite evidence.',
    researchCitation: 'Cambridge Declaration on Consciousness, 2012',
    researchUrl: 'https://fcmconference.org/img/CambridgeDeclarationOnConsciousness.pdf',
    benchmark: { level: '<0.3', description: 'Good scientific consensus' }
  },
  systemIrreversibility: {
    label: 'System Irreversibility',
    description: 'Difficulty unwinding harmful systems. Higher values mean past decisions lock in poor welfare outcomes.',
    realWorldExample: 'Factory farming infrastructure investments create path dependency. Reversing requires massive capital.',
    researchCitation: 'EU Court of Auditors, 2018. "Animal Welfare in the EU: Closing the Gap Between Ambitious Goals and Practical Implementation"',
    researchUrl: 'https://www.eca.europa.eu/en/publications?did=47557',
    benchmark: { level: '<0.5', description: 'Reversible systems' },
    alertThreshold: 0.8,
    alertMessage: '🚨 Critical: System irreversibility is very high. Some choices may be permanently locked.'
  }
}

export function getMetricExplanation(key: string): MetricExplanation | null {
  return METRIC_EXPLANATIONS[key] || null
}
