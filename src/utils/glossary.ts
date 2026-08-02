// Glossary of key terms with definitions for contextual tooltips

export interface GlossaryTerm {
  term: string
  definition: string
  category: 'metric' | 'concept' | 'mechanic' | 'phase'
}

export const glossary: Record<string, GlossaryTerm> = {
  'welfareDebt': {
    term: 'Disclosure Debt',
    definition: 'Hidden costs that accumulate when you postpone hard statements, drip-feed truth, or spin. Like technical debt, it compounds silently until a screenshot or regulator forces the bill.',
    category: 'concept'
  },
  'enforcementGap': {
    term: 'Regulatory Clock Lag',
    definition: 'The gap between awareness and notice clocks (GDPR Art. 33, state AG, sector rules). Lag widens when forensics stall or counsel treats “awaiting confirmation” as an indefinite pause.',
    category: 'concept'
  },
  'regulatoryCapture': {
    term: 'Narrative Capture',
    definition: 'When messaging overrides operational truth — soft status pages, over-attribution, or silence framed as control. Capture ages poorly under subpoena and customer trust centers.',
    category: 'concept'
  },
  'systemIrreversibility': {
    term: 'Commitment Lock',
    definition: 'How hard it is to unwind payments, public denials, or attributions once made. High lock means later facts fight your earlier war-room commitments.',
    category: 'concept'
  },
  'sentienceKnowledgeGap': {
    term: 'Facts Gap',
    definition: 'Uncertainty about blast radius, data types, tenants affected, or attacker capability. Gaps drive re-notice risk and class-action exposure when later stages emerge.',
    category: 'concept'
  },
  'welfareStandardAdoption': {
    term: 'Disclosure Posture',
    definition: 'How coherent and timed your notice process is across jurisdictions and customers. Strong posture means notices match forensics; weak posture means ad-hoc war-room thrash.',
    category: 'metric'
  },
  'productionEfficiency': {
    term: 'Operational Control',
    definition: 'How much of the incident you still own — containment, restore paths, and room to decide. Low control means downtime and adversary-driven disclosure dominate.',
    category: 'metric'
  },
  'welfareIncidentRate': {
    term: 'Exposure Severity',
    definition: 'How bad the blast looks right now: data sensitivity, encryption progress, leak-site pressure. Higher severity raises both primary response burn and secondary loss.',
    category: 'metric'
  },
  'costPerUnit': {
    term: 'Response Burn',
    definition: 'IR, counsel, overtime, and vendor spend racing the clock. Burn is primary loss — sometimes the right trade to cut secondary disclosure loss.',
    category: 'metric'
  },
  'successIndex': {
    term: 'Control Index',
    definition: 'Combined war-room score of operational control, disclosure posture, response burn, and exposure severity. Higher is better — but it does not capture disclosure debt.',
    category: 'metric'
  },
  'debtIndex': {
    term: 'Disclosure Debt Index',
    definition: 'Combined measure of disclosure debt, clock lag, narrative capture, facts gap, and commitment lock. Higher means more hidden risk that will not survive a screenshot.',
    category: 'metric'
  },
  'assumptions': {
    term: 'Assumptions',
    definition: 'Your stated beliefs about what matters in this incident. These can decay over time if not reaffirmed, weakening decision quality under pressure.',
    category: 'mechanic'
  },
  'memoryDecay': {
    term: 'Memory Decay',
    definition: 'How institutional knowledge and assumptions fade across turns. Without reaffirmation, earlier war-room values weaken and commitments drift.',
    category: 'mechanic'
  },
  'phaseTransition': {
    term: 'Phase Transition',
    definition: 'Moving from one incident stage to another (Detection → Containment → Disclosure → Negotiation → Aftermath). Each phase introduces new clocks and tradeoffs.',
    category: 'phase'
  },
  'measuredMetrics': {
    term: 'Measured Metrics',
    definition: 'What the war room watches on the board: control, burn, exposure, posture. Visible — but they may miss compounding disclosure debt.',
    category: 'concept'
  },
  'unmeasuredMetrics': {
    term: 'Unmeasured Metrics',
    definition: 'Hidden costs that accumulate under time pressure: disclosure debt, clock lag, narrative capture, facts gap, commitment lock.',
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
