/**
 * Longtermism research angles and system risk considerations
 * for deep reflection on animal welfare governance
 */

export interface LongtermismAngle {
  id: string
  title: string
  category: 'wildlife' | 'technology' | 'climate' | 'moral_expansion' | 'ecosystem' | 'existential'
  description: string
  keyQuestions: string[]
  researchAreas: string[]
  timeHorizon: 'decades' | 'centuries' | 'millennia' | 'indefinite'
  relevance: string
}

export const longtermismAngles: LongtermismAngle[] = [
  {
    id: 'wild_animal_suffering',
    title: 'Wild Animal Suffering',
    category: 'wildlife',
    description: 'Most animals live in the wild, not in human care. Natural ecosystems involve predation, disease, starvation, and other forms of suffering. As we gain more control over ecosystems, what obligations do we have to wild animals?',
    keyQuestions: [
      'Should we intervene in natural ecosystems to reduce wild animal suffering?',
      'How do conservation goals align with individual animal welfare?',
      'What are the long-term consequences of ecosystem management decisions?',
      'Can we improve wild animal welfare without destabilizing ecosystems?'
    ],
    researchAreas: [
      'Wildlife population dynamics and suffering',
      'Ecosystem intervention ethics',
      'Conservation vs. welfare tradeoffs',
      'Long-term ecosystem health metrics'
    ],
    timeHorizon: 'centuries',
    relevance: 'Decisions about wildlife management and conservation today shape ecosystems for generations. The scale of wild animal suffering may dwarf farmed animal suffering, but interventions are complex and poorly understood.'
  },
  {
    id: 'alternative_proteins',
    title: 'Alternative Protein Transition',
    category: 'technology',
    description: 'Lab-grown meat, plant-based proteins, and fermentation-based foods could replace traditional animal agriculture. But what are the long-term implications? How do we ensure this transition actually improves welfare rather than creating new problems?',
    keyQuestions: [
      'Will alternative proteins reduce total animal suffering or just shift it?',
      'What happens to billions of farmed animals during transition?',
      'How do we prevent new forms of exploitation in alternative protein production?',
      'What are the ecosystem impacts of scaling alternative proteins?'
    ],
    researchAreas: [
      'Transition economics and animal welfare',
      'Life cycle analysis of alternative proteins',
      'Market dynamics and welfare outcomes',
      'Long-term food system resilience'
    ],
    timeHorizon: 'decades',
    relevance: 'The next 20-50 years will likely see massive shifts in protein production. Governance decisions now determine whether this transition reduces suffering or creates new forms of it.'
  },
  {
    id: 'climate_animal_welfare',
    title: 'Climate Change and Animal Welfare',
    category: 'climate',
    description: 'Climate change will fundamentally alter ecosystems, habitats, and agricultural systems. Rising temperatures, extreme weather, and ecosystem collapse will affect billions of animals. How do we prepare?',
    keyQuestions: [
      'How will climate change affect wild animal populations and suffering?',
      'What adaptations are needed for farmed animals in a warming world?',
      'How do we balance climate mitigation with animal welfare?',
      'What are the long-term ecosystem consequences of climate-driven changes?'
    ],
    researchAreas: [
      'Climate impact modeling on animal populations',
      'Adaptation strategies for animal welfare',
      'Ecosystem resilience and animal suffering',
      'Intergenerational welfare impacts'
    ],
    timeHorizon: 'centuries',
    relevance: 'Climate decisions made today will affect animal welfare for centuries. The scale of impact is enormous but poorly understood.'
  },
  {
    id: 'moral_patient_expansion',
    title: 'Expanding the Moral Circle',
    category: 'moral_expansion',
    description: 'As we learn more about animal cognition and sentience, the moral circle may expand. What if we discover that many more species are sentient than we currently recognize? How do we prepare governance systems for this?',
    keyQuestions: [
      'How do we design governance systems that can adapt to new scientific discoveries?',
      'What if we discover sentience in unexpected species (insects, plants, AI)?',
      'How do we balance precaution with practical governance?',
      'What are the long-term implications of expanding moral consideration?'
    ],
    researchAreas: [
      'Sentience research and moral status',
      'Precautionary governance frameworks',
      'Adaptive policy design',
      'Long-term moral patient considerations'
    ],
    timeHorizon: 'indefinite',
    relevance: 'Scientific understanding of sentience is rapidly evolving. Governance systems that can\'t adapt may cause massive suffering if we discover new sentient beings.'
  },
  {
    id: 'ecosystem_health',
    title: 'Ecosystem Health and Animal Welfare',
    category: 'ecosystem',
    description: 'Healthy ecosystems support animal welfare, but ecosystem health and individual animal welfare can conflict. How do we balance these at scale over long time horizons?',
    keyQuestions: [
      'How do we measure ecosystem health in terms of animal welfare?',
      'What are the long-term consequences of prioritizing individual vs. ecosystem welfare?',
      'How do we manage ecosystem interventions for maximum welfare?',
      'What happens when ecosystem health and individual welfare conflict?'
    ],
    researchAreas: [
      'Ecosystem welfare metrics',
      'Population-level welfare interventions',
      'Long-term ecosystem management',
      'Biodiversity and welfare tradeoffs'
    ],
    timeHorizon: 'millennia',
    relevance: 'Ecosystem decisions have consequences that last millennia. Understanding how to optimize for long-term animal welfare at ecosystem scale is crucial.'
  },
  {
    id: 'existential_risks',
    title: 'Existential Risks to Animal Species',
    category: 'existential',
    description: 'Human activities pose existential risks to entire species and ecosystems. Climate change, habitat destruction, and other factors could cause mass extinctions. How do we prevent this?',
    keyQuestions: [
      'How do we prioritize preventing extinction vs. reducing suffering?',
      'What are the long-term consequences of species loss?',
      'How do we balance current welfare with future existence?',
      'What governance structures can prevent existential risks to animals?'
    ],
    researchAreas: [
      'Extinction risk assessment',
      'Species preservation strategies',
      'Long-term biodiversity conservation',
      'Existential risk governance'
    ],
    timeHorizon: 'indefinite',
    relevance: 'Some decisions today determine whether entire species exist in the future. The stakes are enormous but often invisible in short-term governance.'
  },
  {
    id: 'ai_animal_welfare',
    title: 'AI and Animal Welfare Governance',
    category: 'technology',
    description: 'AI systems are increasingly used in animal agriculture, wildlife monitoring, and welfare assessment. How do we ensure AI advances welfare rather than optimizing for the wrong metrics?',
    keyQuestions: [
      'How do we prevent AI from optimizing for efficiency at the expense of welfare?',
      'What are the long-term implications of AI-driven animal management?',
      'How do we ensure AI systems align with animal welfare goals?',
      'What happens when AI systems make welfare decisions autonomously?'
    ],
    researchAreas: [
      'AI alignment with animal welfare',
      'Automated welfare assessment',
      'Long-term AI governance',
      'Value alignment in animal systems'
    ],
    timeHorizon: 'decades',
    relevance: 'AI is rapidly being deployed in animal systems. Governance decisions now determine whether AI helps or harms welfare long-term.'
  },
  {
    id: 'intergenerational_debt',
    title: 'Intergenerational Welfare Debt',
    category: 'ecosystem',
    description: 'Decisions made today create welfare consequences that compound over generations. Infrastructure, market structures, and cultural norms lock in welfare outcomes. How do we account for this?',
    keyQuestions: [
      'How do we measure intergenerational welfare impacts?',
      'What governance structures can prevent welfare debt accumulation?',
      'How do we balance current and future animal welfare?',
      'What are the long-term consequences of current governance choices?'
    ],
    researchAreas: [
      'Intergenerational welfare accounting',
      'Long-term governance structures',
      'Welfare debt accumulation patterns',
      'Future welfare optimization'
    ],
    timeHorizon: 'centuries',
    relevance: 'Many governance decisions create path dependencies that last centuries. Understanding intergenerational impacts is crucial for long-term welfare.'
  }
]

/**
 * Get angles relevant to current state metrics
 */
export function getRelevantAngles(state: any): LongtermismAngle[] {
  // Return all angles for now - could filter based on state if needed
  return longtermismAngles
}
