// Glossary of key terms with definitions for contextual tooltips

export interface GlossaryTerm {
  term: string
  definition: string
  category: 'metric' | 'concept' | 'mechanic' | 'phase'
}

export const glossary: Record<string, GlossaryTerm> = {
  'welfareDebt': {
    term: 'Welfare Debt',
    definition: 'Hidden costs and compromises that accumulate over time when welfare decisions prioritize short-term efficiency over long-term animal wellbeing. Like technical debt in software, it compounds silently.',
    category: 'concept'
  },
  'enforcementGap': {
    term: 'Enforcement Gap',
    definition: 'The difference between what welfare policies require and what actually happens in practice. Gaps widen when oversight is underfunded or industry influence grows.',
    category: 'concept'
  },
  'regulatoryCapture': {
    term: 'Regulatory Capture',
    definition: 'When industry interests influence regulators to prioritize business concerns over animal welfare. Often happens gradually through lobbying, revolving doors, or resource constraints.',
    category: 'concept'
  },
  'systemIrreversibility': {
    term: 'System Irreversibility',
    definition: 'How difficult it becomes to reverse or change welfare systems once they\'re established. High irreversibility means you\'re locked into paths that may be hard to undo.',
    category: 'concept'
  },
  'sentienceKnowledgeGap': {
    term: 'Sentience Knowledge Gap',
    definition: 'Uncertainty about which animals are sentient and to what degree. Gaps can delay protections or lead to inconsistent treatment across species.',
    category: 'concept'
  },
  'welfareStandardAdoption': {
    term: 'Welfare Standard Adoption',
    definition: 'How widely welfare standards are actually implemented across regions and industries. High adoption means more animals benefit, but may increase costs.',
    category: 'metric'
  },
  'productionEfficiency': {
    term: 'Production Efficiency',
    definition: 'Output per unit of input (animals, feed, resources). Higher efficiency can reduce costs but may conflict with welfare if achieved through intensive methods.',
    category: 'metric'
  },
  'welfareIncidentRate': {
    term: 'Welfare Incident Rate',
    definition: 'Frequency of disease, injury, mortality, or other welfare problems. Lower is better, but incidents may be underreported or hidden.',
    category: 'metric'
  },
  'costPerUnit': {
    term: 'Cost Per Unit',
    definition: 'Production cost per unit of output. Lower costs can make welfare improvements harder to justify economically, creating tension with welfare goals.',
    category: 'metric'
  },
  'successIndex': {
    term: 'Success Index',
    definition: 'Combined measure of welfare standard adoption, low incident rates, and reasonable costs. Higher means better measured outcomes, but doesn\'t capture hidden debt.',
    category: 'metric'
  },
  'debtIndex': {
    term: 'Debt Index',
    definition: 'Combined measure of accumulated welfare debt, enforcement gaps, regulatory capture, and system irreversibility. Higher means more hidden risks that could cause problems later.',
    category: 'metric'
  },
  'assumptions': {
    term: 'Assumptions',
    definition: 'Your stated beliefs about what matters in welfare governance. These can decay over time if not reaffirmed, weakening your decision-making foundation.',
    category: 'mechanic'
  },
  'memoryDecay': {
    term: 'Memory Decay',
    definition: 'How institutional knowledge and assumptions fade over time. Without reaffirmation, your stated values may weaken, making it harder to maintain welfare standards.',
    category: 'mechanic'
  },
  'phaseTransition': {
    term: 'Phase Transition',
    definition: 'Moving from one governance stage to another (Foundation → Scale → Enforcement → Integration → Irreversibility). Each phase introduces new challenges and tradeoffs.',
    category: 'phase'
  },
  'measuredMetrics': {
    term: 'Measured Metrics',
    definition: 'Outcomes that organizations typically track: efficiency, costs, incident rates, adoption rates. These are visible but may miss hidden problems.',
    category: 'concept'
  },
  'unmeasuredMetrics': {
    term: 'Unmeasured Metrics',
    definition: 'Hidden costs and risks that accumulate over time: welfare debt, enforcement gaps, regulatory capture. These compound silently and may not show up until later.',
    category: 'concept'
  }
}

export function getGlossaryTerm(key: string): GlossaryTerm | null {
  return glossary[key] || null
}

export function wrapWithTooltip(text: string, termKey: string): React.ReactNode {
  const term = getGlossaryTerm(termKey)
  if (!term) return text
  
  // This will be used with ContextualTooltip component
  return text
}
