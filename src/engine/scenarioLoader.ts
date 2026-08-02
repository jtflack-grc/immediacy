import { Scenario, Node, State } from './scenarioTypes'
import { applyIncidentConditions, DEFAULT_INCIDENT_CONDITIONS } from '../utils/scenarioVariations'

// Export function to clear cache (useful for development)
export function clearScenarioCache(): void {
  cachedScenario = null
}

let cachedScenario: Scenario | null = null

/**
 * Load scenario data from JSON file
 * @param forceReload If true, bypasses cache and reloads from file
 */
export async function loadScenario(forceReload: boolean = false): Promise<Scenario> {
  if (cachedScenario && !forceReload) {
    return cachedScenario
  }

  try {
    // Add cache-busting query parameter to force reload
    const cacheBuster = forceReload ? `?t=${Date.now()}` : ''
    // Use relative path so this works on GitHub Pages project pages
    const response = await fetch(`scenario.v1.json${cacheBuster}`)
    if (!response.ok) {
      throw new Error(`Failed to load scenario: ${response.status}`)
    }
    const data = await response.json()
    cachedScenario = data as Scenario
    return cachedScenario
  } catch (error) {
    console.error('Error loading scenario:', error)
    // Return a minimal fallback scenario
    return {
      version: '2.0.0',
      phases: [],
    }
  }
}

/**
 * Get a node by ID from the scenario
 */
export function getNodeById(scenario: Scenario, nodeId: string): Node | null {
  if (!scenario || !scenario.phases) {
    console.error('Invalid scenario structure:', scenario)
    return null
  }
  
  for (const phase of scenario.phases) {
    if (!phase.nodes) continue
    const node = phase.nodes.find(n => n.id === nodeId)
    if (node) {
      console.log(`Found node ${nodeId} in phase ${phase.id}`)
      return node
    }
  }
  
  console.warn(`Node ${nodeId} not found in scenario. Available nodes:`, 
    scenario.phases.flatMap(p => p.nodes.map(n => n.id)))
  return null
}

/**
 * Get the phase that contains a given node
 */
export function getPhaseByNodeId(scenario: Scenario, nodeId: string): string | null {
  for (const phase of scenario.phases) {
    if (phase.nodes.some(n => n.id === nodeId)) {
      return phase.id
    }
  }
  return null
}

/**
 * Create initial state from scenario
 * @param scenario The scenario definition
 * @param conditions Optional incident condition flags (defaults to ['standard'])
 */
export function createInitialState(
  scenario: Scenario,
  conditions: string[] = DEFAULT_INCIDENT_CONDITIONS
): State {
  const firstPhase = scenario.phases[0]
  const firstNode = firstPhase?.nodes[0]

  let initialMetrics = {
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

  // Apply incident condition flags (staffing, telemetry, jurisdiction, pressure, etc.)
  initialMetrics = applyIncidentConditions(initialMetrics, conditions)

  // Initial jurisdiction pressure / disclosure posture by country
  const regionValues = {
    // Americas
    'USA': 0.3,
    'CAN': 0.2,
    'MEX': 0.25,
    'ARG': 0.32,
    'CHL': 0.3,
    'BRA': 0.4,
    // Europe
    'GBR': 0.4,
    'FRA': 0.35,
    'DEU': 0.3,
    'ITA': 0.35,
    'ESP': 0.32,
    'NLD': 0.42,
    'POL': 0.28,
    'SWE': 0.48,
    'DNK': 0.4,
    'IRL': 0.45,
    // Asia
    'IND': 0.5,
    'CHN': 0.45,
    'JPN': 0.32,
    'KOR': 0.3,
    'THA': 0.28,
    'IDN': 0.3,
    'PHL': 0.28,
    'MYS': 0.3,
    'SGP': 0.4,
    // Africa & Middle East
    'ZAF': 0.35,
    'EGY': 0.28,
    'KEN': 0.3,
    'NGA': 0.28,
    'SAU': 0.3,
    'TUR': 0.32,
    'ISR': 0.35,
    // Oceania
    'AUS': 0.3,
    'NZL': 0.45,
  }

  return {
    turn: 0,
    currentNodeId: firstNode?.id || 'N01_INITIAL',
    phaseId: firstPhase?.id || 'P1_DEPLOY',
    metrics: JSON.parse(JSON.stringify(initialMetrics)), // Deep copy
    initialMetrics: JSON.parse(JSON.stringify(initialMetrics)), // Store initial for history
    map: {
      mode: 'disclosurePosture',
      regionValues,
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
    playerName: undefined,  // Will be set during Turn U
    incidentTime: 0,
    timeMode: 'simulated',
    evidence: [
      {
        id: 'fact_seed_soc_alert',
        text: '02:13 UTC — SOC ALERT: identity monitoring detected impossible travel across three privileged accounts; customer telemetry is beginning to fail.',
        kind: 'preliminary',
        source: 'SOC',
        timestamp: 0,
        confidence: 0.4,
        verificationStatus: 'unverified',
      },
      {
        id: 'fact_seed_detection',
        text: 'SOC flagged anomalous exfil-pattern traffic at T+0 — awareness time not yet certified.',
        kind: 'preliminary',
        source: 'SOC',
        timestamp: 0,
        confidence: 0.35,
        verificationStatus: 'unverified',
      },
      {
        id: 'fact_seed_scope',
        text: 'Initial triage suggests a single tenant affected — scope not yet confirmed by forensics.',
        kind: 'assumption',
        source: 'Incident Commander',
        timestamp: 0,
        confidence: 0.25,
        verificationStatus: 'unverified',
      },
    ],
    deadlines: [],
    dispatches: [],
    dispatchLog: [],
    scenarioConditions: conditions,
    schemaVersion: '2.0.0',
  }
}
