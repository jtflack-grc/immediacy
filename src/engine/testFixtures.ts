import { State, Metrics } from './scenarioTypes'

export function createMockMetrics(): Metrics {
  return {
    measured: {
      operationalControl: 0.45,
      financialBurn: 0.25,
      serviceDisruption: 0.22,
      disclosurePosture: 0.6,
      evidenceIntegrity: 0.7,
      stakeholderTrust: 0.6,
    },
    unmeasured: {
      disclosureDebt: 0.15,
      regulatoryExposure: 0.18,
      narrativeIntegrity: 0.8,
      factsConfidence: 0.65,
      commitmentLock: 0.12,
    },
  }
}

export function createMockState(overrides: Partial<State> = {}): State {
  const metrics = createMockMetrics()
  const base: State = {
    turn: 0,
    currentNodeId: 'N01_INITIAL',
    phaseId: 'P1_DEPLOY',
    metrics: JSON.parse(JSON.stringify(metrics)),
    initialMetrics: JSON.parse(JSON.stringify(metrics)),
    map: {
      mode: 'disclosurePosture',
      regionValues: { USA: 0.3, GBR: 0.4 },
      activeArcs: [],
      activeHubs: [],
      activeRings: [],
    },
    auditTrail: [],
    memory: {
      assumptionsBank: [],
    },
    flags: {
      isComplete: false,
      showCredits: false,
    },
    achievements: [],
    researchedTechs: [],
    outcomeType: null,
    lossWarnings: [],
    lossConditionsMet: [],
    playerName: undefined,
    incidentTime: 0,
    timeMode: 'simulated',
    evidence: [],
    deadlines: [],
    dispatches: [],
    dispatchLog: [],
    scenarioConditions: ['standard'],
    schemaVersion: '2.0.0',
  }

  return {
    ...base,
    ...overrides,
    metrics: overrides.metrics ?? base.metrics,
    flags: { ...base.flags, ...(overrides.flags || {}) },
  }
}
