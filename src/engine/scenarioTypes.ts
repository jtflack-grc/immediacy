// Core types for the IMMEDIACY scenario engine (schema v2 — incident-native)

export interface MeasuredMetrics {
  operationalControl: number   // 0-1, containment / restore ownership (higher better)
  financialBurn: number        // 0-1, IR/counsel/vendor spend (higher worse)
  serviceDisruption: number    // 0-1, downtime / customer impact (higher worse)
  disclosurePosture: number    // 0-3, notice process coherence (higher better)
  evidenceIntegrity: number    // 0-1, preservation quality (higher better)
  stakeholderTrust: number     // 0-1, trust with customers/staff/board (higher better)
}

export interface UnmeasuredMetrics {
  disclosureDebt: number       // 0-1, silence / drip / spin debt (higher worse)
  regulatoryExposure: number   // 0-1, clock lag / fine / order risk (higher worse)
  narrativeIntegrity: number   // 0-1, messaging matches ops truth (higher better)
  factsConfidence: number      // 0-1, confidence in blast radius / data types (higher better)
  commitmentLock: number       // 0-1, irreversible statements / payments (higher worse)
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
  type: 'supply_chain' | 'regulatory_flow' | 'research_collaboration' | 'market_influence' | 'incident_link' | 'trust_sync'
  baseWeight: number
  label: string
  triggeredByNodeId?: string
}

export interface HubDatum {
  id: string
  name: string
  lat: number
  lng: number
  iso3: string
  type: string
  _size?: number
  _brightness?: number
}

export interface RingDatum {
  id: string
  lat: number
  lng: number
  eventType: 'policy_shift' | 'breach_notice' | 'regulatory_response' | 'market_change' | 'research_breakthrough' | 'public_pressure' | 'leak_site' | 'customer_report'
  ttl: number
  createdTurn: number
  triggeredByNodeId?: string
}

export type MapMode = 'disclosurePosture' | 'disclosureDebt' | 'regulatoryExposure'

export interface MapState {
  mode: MapMode
  regionValues: Record<string, number>
  activeArcs: ArcDatum[]
  activeHubs: HubDatum[]
  activeRings: RingDatum[]
}

export interface Assumption {
  text: string
  createdTurn: number
  lastReaffirmedTurn?: number
  strength: number
}

export type FactKind =
  | 'verified'
  | 'preliminary'
  | 'assumption'
  | 'third_party'
  | 'adversary'
  | 'legal'
  | 'executive'

export interface EvidenceFact {
  id: string
  text: string
  kind: FactKind
  source: string
  supplier?: string
  timestamp: number // incident minutes from T0
  confidence: number // 0-1
  verificationStatus: 'unverified' | 'corroborated' | 'refuted' | 'revised'
  conflictsWith?: string[]
  reliedOnByDecisionIds?: string[]
  revisedFrom?: string
}

export interface IncidentDeadline {
  id: string
  label: string
  kind: 'regulatory' | 'adversary' | 'reporter' | 'board' | 'insurer' | 'customer' | 'internal'
  dueAt: number // incident minutes from T0
  missed?: boolean
}

export interface IncidentDispatch {
  id: string
  at: number // incident minutes from T0
  source: string
  body: string
  requires?: Record<string, boolean | number | string>
  effects?: {
    metrics?: Delta['metrics']
    addFacts?: EvidenceFact[]
    addDeadlines?: IncidentDeadline[]
    unlockChoiceLabels?: string[]
    lockChoiceLabels?: string[]
    setFlags?: Record<string, boolean>
  }
  delivered?: boolean
}

export type TimeMode = 'learning' | 'exercise' | 'accessibility' | 'simulated'

export interface DecisionMapImpact {
  regionDeltas: Record<string, number>
  activatedArcIds: string[]
  activatedHubIds: string[]
  spawnedRings: RingDatum[]
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
  unmeasuredImpact: string
  timestamp: number
  incidentTime?: number
  delta?: Delta
  mapImpact?: DecisionMapImpact
  alternativesConsidered?: string[]
  immediateConsequence?: string
  laterConsequence?: string
  revisited?: boolean
  factsChangedUnderneath?: boolean
  factsAvailable?: string[]
  metricsSnapshot?: Metrics
}

export interface State {
  turn: number
  currentNodeId: string
  phaseId: string
  metrics: Metrics
  initialMetrics: Metrics
  map: MapState
  auditTrail: AuditRecord[]
  memory: {
    assumptionsBank: Assumption[]
  }
  flags: {
    isComplete: boolean
    showCredits: boolean
    [key: string]: boolean
  }
  achievements?: string[]
  researchedTechs?: string[]
  outcomeType?: 'control' | 'debt' | 'enforcement' | 'balance' | null
  lossWarnings?: Array<{
    type: LossType
    severity: 'warning' | 'critical'
    turn: number
  }>
  lossConditionsMet?: LossType[]
  playerName?: string
  // v2 incident simulation
  incidentTime: number // minutes from T0
  timeMode: TimeMode
  evidence: EvidenceFact[]
  deadlines: IncidentDeadline[]
  dispatches: IncidentDispatch[]
  dispatchLog: IncidentDispatch[]
  scenarioConditions: string[]
  schemaVersion: string
}

export type LossType =
  | 'containment_collapse'
  | 'debt_crisis'
  | 'enforcement_failure'
  | 'irreversibility_lock'
  | 'narrative_collapse'

export interface Delta {
  metrics?: {
    measured?: Partial<MeasuredMetrics>
    unmeasured?: Partial<UnmeasuredMetrics>
  }
  map?: {
    regionValues?: Record<string, number>
    activateArcs?: string[]
    activateHubs?: string[]
    spawnRings?: Array<{
      lat: number
      lng: number
      eventType: RingDatum['eventType']
      ttl: number
    }>
  }
  locks?: string[]
  timeCost?: number // incident minutes consumed by this choice
  setFlags?: Record<string, boolean>
  addDispatches?: string[] // dispatch template ids to queue
  nextWhen?: Array<{ when: string; nextNodeId: string }> // conditional next (Phase 1)
}

export interface Choice {
  label: string
  delta: Delta
  nextNodeId: string
  requires?: Record<string, boolean | number | string>
  locksWhen?: Record<string, boolean | number | string>
  timeCost?: number
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
  archiveUrl?: string
  doi?: string
  lastVerified?: string
  teachingNote?: string // legal requirement vs teaching simplification
}

export interface Node {
  id: string
  title: string
  prompt: string
  context: string
  choices: Choice[]
  caseStudies?: CaseStudy[]
  entryRequires?: Record<string, boolean | number | string>
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
  dispatchTemplates?: IncidentDispatch[]
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
  abstract?: string
  archiveUrl?: string
  lastVerified?: string
}

export interface AdvisorRecommendation {
  advisorId: string
  choiceIndex: number
  reasoning: string
  researchCitations: (string | ResearchCitation)[]
  benefits?: string[]
  concerns?: string[]
}

export const SCHEMA_VERSION = '2.0.0'
