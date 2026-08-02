import { LongtermismAngle, longtermismAngles } from './longtermismResearch'
import { Node, State } from '../engine/scenarioTypes'

/**
 * Match longtermism angles to decision nodes based on node ID patterns
 */
export function getRelevantAnglesForNode(nodeId: string): LongtermismAngle[] {
  const relevant: LongtermismAngle[] = []
  
  // Match angles based on node ID patterns
  if (nodeId.includes('SENTIENCE') || nodeId.includes('RECOGNITION')) {
    relevant.push(longtermismAngles.find(a => a.id === 'moral_patient_expansion')!)
    relevant.push(longtermismAngles.find(a => a.id === 'wild_animal_suffering')!)
  }
  
  if (nodeId.includes('FARM') || nodeId.includes('PRODUCTION') || nodeId.includes('STANDARD')) {
    relevant.push(longtermismAngles.find(a => a.id === 'alternative_proteins')!)
    relevant.push(longtermismAngles.find(a => a.id === 'intergenerational_debt')!)
  }
  
  if (nodeId.includes('ENFORCEMENT') || nodeId.includes('REGULATORY') || nodeId.includes('OVERSIGHT')) {
    relevant.push(longtermismAngles.find(a => a.id === 'ai_animal_welfare')!)
    relevant.push(longtermismAngles.find(a => a.id === 'intergenerational_debt')!)
  }
  
  if (nodeId.includes('SCALING') || nodeId.includes('GLOBAL') || nodeId.includes('EXPANSION')) {
    relevant.push(longtermismAngles.find(a => a.id === 'ecosystem_health')!)
    relevant.push(longtermismAngles.find(a => a.id === 'climate_animal_welfare')!)
  }
  
  if (nodeId.includes('ADAPTATION') || nodeId.includes('RESILIENCE') || nodeId.includes('FLEXIBILITY')) {
    relevant.push(longtermismAngles.find(a => a.id === 'existential_risks')!)
    relevant.push(longtermismAngles.find(a => a.id === 'ecosystem_health')!)
  }
  
  // Always include intergenerational debt for context
  if (!relevant.find(a => a.id === 'intergenerational_debt')) {
    relevant.push(longtermismAngles.find(a => a.id === 'intergenerational_debt')!)
  }
  
  return relevant.filter(Boolean).slice(0, 2) // Return top 2 most relevant
}

/**
 * Get longtermism angles relevant to a phase
 */
export function getRelevantAnglesForPhase(phaseId: string, state: State): LongtermismAngle[] {
  const relevant: LongtermismAngle[] = []
  
  if (phaseId === 'P1_FOUNDATION') {
    relevant.push(longtermismAngles.find(a => a.id === 'moral_patient_expansion')!)
    relevant.push(longtermismAngles.find(a => a.id === 'intergenerational_debt')!)
  } else if (phaseId === 'P2_IMPLEMENTATION') {
    relevant.push(longtermismAngles.find(a => a.id === 'ai_animal_welfare')!)
    relevant.push(longtermismAngles.find(a => a.id === 'intergenerational_debt')!)
  } else if (phaseId === 'P3_SCALING') {
    relevant.push(longtermismAngles.find(a => a.id === 'alternative_proteins')!)
    relevant.push(longtermismAngles.find(a => a.id === 'ecosystem_health')!)
  } else if (phaseId === 'P4_ADAPTATION') {
    relevant.push(longtermismAngles.find(a => a.id === 'climate_animal_welfare')!)
    relevant.push(longtermismAngles.find(a => a.id === 'existential_risks')!)
  } else if (phaseId === 'P5_LEGACY') {
    relevant.push(longtermismAngles.find(a => a.id === 'intergenerational_debt')!)
    relevant.push(longtermismAngles.find(a => a.id === 'existential_risks')!)
  }
  
  // Add angles based on metrics
  if (state.metrics.unmeasured.sentienceKnowledgeGap > 0.4) {
    relevant.push(longtermismAngles.find(a => a.id === 'moral_patient_expansion')!)
  }
  if (state.metrics.unmeasured.welfareDebt > 0.5) {
    relevant.push(longtermismAngles.find(a => a.id === 'intergenerational_debt')!)
  }
  if (state.metrics.unmeasured.systemIrreversibility < 0.3) {
    relevant.push(longtermismAngles.find(a => a.id === 'existential_risks')!)
  }
  
  return relevant.filter(Boolean).slice(0, 2) // Return top 2 most relevant
}
