// Core types for the scenario engine

export interface MeasuredMetrics {
  productionEfficiency: number      // 0-1, output per unit input (what org optimizes)
  costPerUnit: number               // 0-1, production cost, lower is better
  welfareIncidentRate: number       // 0-1, disease, injury, mortality, lower is better
  welfareStandardAdoption: number   // 0-3, adoption of welfare standards, can exceed 1.0
}

export interface UnmeasuredMetrics {
  welfareDebt: number              // 0-1, accumulated welfare compromises
  enforcementGap: number           // 0-1, delay between policy and enforcement
  regulatoryCapture: number        // 0-1, industry influence on policy
  sentienceKnowledgeGap: number    // 0-1, gaps in understanding animal needs
  // 0-1, how locked-in harmful systems are.
  // Higher values mean **more** irreversible (worse) and feed directly into governance debt.
  systemIrreversibility: number
}

export interface Metrics {
  measured: MeasuredMetrics
  unmeasured: UnmeasuredMetrics
}

export interface ArcDatum {
  id: string
  startLat: number
  startLng: number
  endLat: number
  endLng: number
  type: 'supply_chain' | 'regulatory_flow' | 'research_collaboration' | 'market_influence' | 'welfare_network'
  baseWeight: number
  label: string
  // Optional metadata: which decision node activated this arc
  triggeredByNodeId?: string
}

export interface HubDatum {
  id: string
  name: string
  lat: number
  lng: number
  iso3: string
  type: string
  // Optional rendering metadata used by selectors / globe
  _size?: number
  _brightness?: number
}

export interface RingDatum {
  id: string
  lat: number
  lng: number
  eventType: 'policy_shift' | 'welfare_incident' | 'regulatory_response' | 'market_change' | 'research_breakthrough' | 'public_pressure'
  ttl: number  // Time to live (turns remaining)
  createdTurn: number
  triggeredByNodeId?: string  // Which decision node spawned this ring
}

export interface MapState {
  mode: 'welfareStandards' | 'welfareDebt' | 'enforcement'
  regionValues: Record<string, number>  // keyed by ISO_A3
  activeArcs: ArcDatum[]
  activeHubs: HubDatum[]
  activeRings: RingDatum[]
}

export interface Assumption {
  text: string
  createdTurn: number
  lastReaffirmedTurn?: number
  strength: number  // 0-1, decays over time
}

export interface AuditRecord {
  turn: number
  phaseId: string
  nodeId: string
  nodeTitle: string
  chosenLabel: string
  ownerRole: string
  rationale: string
  assumptions: string
  unmeasuredImpact: string  // "what we did NOT measure"
  timestamp: number
  metricsSnapshot?: Metrics  // Snapshot of metrics at this turn for history tracking
}

export interface GreatPerson {
  id: string
  title: string
  description: string
  quote?: string
  unlockedTurn: number
}

export interface State {
  turn: number
  currentNodeId: string
  phaseId: string
  metrics: Metrics
  initialMetrics: Metrics  // Store initial metrics for history tracking
  map: MapState
  auditTrail: AuditRecord[]
  memory: {
    assumptionsBank: Assumption[]
  }
  flags: {
    isComplete: boolean
    showDebug: boolean
  }
  greatPeople?: GreatPerson[]  // Unlocked Great People
  achievements?: string[]  // Achievement IDs
  completedWonders?: string[]  // Wonder IDs
  researchedTechs?: string[]  // Tech IDs
  activeEvents?: any[]  // Random events (will be typed properly)
  victoryType?: 'welfare' | 'debt' | 'enforcement' | 'balance' | null
  lossWarnings?: Array<{
    type: 'welfare_collapse' | 'debt_crisis' | 'enforcement_failure' | 'irreversibility_lock' | 'regulatory_capture'
    severity: 'warning' | 'critical'
    turn: number
  }>
  lossConditionsMet?: Array<'welfare_collapse' | 'debt_crisis' | 'enforcement_failure' | 'irreversibility_lock' | 'regulatory_capture'>
  playerName?: string  // Player's name for personalization
}

export interface Delta {
  metrics?: {
    measured?: Partial<MeasuredMetrics>
    unmeasured?: Partial<UnmeasuredMetrics>
  }
  map?: {
    regionValues?: Record<string, number>  // Adjustments (additive)
    activateArcs?: string[]  // Arc IDs to activate
    activateHubs?: string[]  // Hub IDs to activate
    spawnRings?: Array<{
      lat: number
      lng: number
      eventType: RingDatum['eventType']
      ttl: number
    }>
  }
  locks?: string[]  // Choice IDs to disable if systemIrreversibility too high
}

export interface Choice {
  label: string
  delta: Delta
  nextNodeId: string
  quality?: 'best' | 'good' | 'neutral' | 'poor' | 'terrible' // Hidden metadata for authoring/analysis
}

export interface CaseStudy {
  title: string
  description: string
  source?: string
  url?: string
  year?: string
  analysis?: string
  outcomes?: string
  sourceType?: 'government' | 'peer-reviewed' | 'ngo' | 'industry' | 'news' | 'academic'
  archiveUrl?: string  // Archive.org fallback for historical documents
  doi?: string  // DOI for academic papers
  lastVerified?: string  // Date when URL was last verified (YYYY-MM-DD format)
}

export interface Node {
  id: string
  title: string
  prompt: string
  context: string
  choices: Choice[]
  caseStudies?: CaseStudy[]  // Real-world examples related to this decision
}

export interface Phase {
  id: string
  title: string
  description: string
  nodes: Node[]
}

export interface Scenario {
  version: string
  phases: Phase[]
}

export interface Advisor {
  id: string
  name: string
  title: string
  specialization: string[]
  color: string
  bio: string
  researchDomains: string[]
  imageUrl?: string
}

export interface ResearchCitation {
  text: string
  url?: string
  doi?: string
  authors?: string
  year?: number
  sourceType?: 'government' | 'peer-reviewed' | 'ngo' | 'industry' | 'news' | 'academic'
  abstract?: string  // Brief summary (2-3 sentences)
  archiveUrl?: string  // Archive.org fallback
  lastVerified?: string  // Date when URL was last verified (YYYY-MM-DD format)
}

export interface AdvisorRecommendation {
  advisorId: string
  choiceIndex: number
  reasoning: string
  researchCitations: (string | ResearchCitation)[]  // Support both string (legacy) and object format
  benefits?: string[]
  concerns?: string[]
}
