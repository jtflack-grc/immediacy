// Utility for saving and comparing multiple runs

import { State, AuditRecord } from '../engine/scenarioTypes'

export interface RunSummary {
  id: string
  timestamp: number
  finalTurn: number
  successIndex: number
  debtIndex: number
  keyChoices: string[] // First 3 choice labels
  completedPhases: string[]
  // Enhanced data for meta-analysis (optional for backward compatibility)
  allChoices?: string[] // All choice labels in sequence
  nodeSequence?: string[] // Node IDs visited in order
  metricsHistory?: Array<{
    turn: number
    successIndex: number
    debtIndex: number
    measured: State['metrics']['measured']
    unmeasured: State['metrics']['unmeasured']
  }>
  auditTrail?: AuditRecord[] // Full audit trail for detailed analysis
}

const MAX_SAVED_RUNS = 5
const STORAGE_KEY = 'savedRuns'

export function saveCurrentRun(state: State): void {
  const savedRuns = getSavedRuns()
  
  // Calculate indices
  const successIndex = calculateSuccessIndex(state.metrics.measured)
  const debtIndex = calculateDebtIndex(state.metrics.unmeasured)
  
  // Extract key choices (first 3)
  const keyChoices = state.auditTrail.slice(0, 3).map(record => record.chosenLabel)
  
  // Get completed phases
  const completedPhases = Array.from(new Set(state.auditTrail.map(r => r.phaseId).filter(Boolean)))
  
  // Enhanced data for meta-analysis
  const allChoices = state.auditTrail.map(record => record.chosenLabel)
  const nodeSequence = state.auditTrail.map(record => record.nodeId)
  
  // Build metrics history from audit trail (using metricsSnapshot if available)
  const metricsHistory = state.auditTrail
    .filter(record => record.metricsSnapshot)
    .map(record => ({
      turn: record.turn,
      successIndex: calculateSuccessIndex(record.metricsSnapshot!.measured),
      debtIndex: calculateDebtIndex(record.metricsSnapshot!.unmeasured),
      measured: record.metricsSnapshot!.measured,
      unmeasured: record.metricsSnapshot!.unmeasured
    }))
  
  // Add final state if not already included
  const finalMetrics = {
    turn: state.turn,
    successIndex,
    debtIndex,
    measured: state.metrics.measured,
    unmeasured: state.metrics.unmeasured
  }
  if (metricsHistory.length === 0 || metricsHistory[metricsHistory.length - 1].turn !== state.turn) {
    metricsHistory.push(finalMetrics)
  }
  
  const newRun: RunSummary = {
    id: `run_${Date.now()}`,
    timestamp: Date.now(),
    finalTurn: state.turn,
    successIndex,
    debtIndex,
    keyChoices,
    completedPhases,
    allChoices,
    nodeSequence,
    metricsHistory,
    auditTrail: state.auditTrail
  }
  
  // Add to saved runs (keep only last MAX_SAVED_RUNS)
  const updated = [newRun, ...savedRuns].slice(0, MAX_SAVED_RUNS)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export function getSavedRuns(): RunSummary[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    return JSON.parse(stored)
  } catch {
    return []
  }
}

export function clearSavedRuns(): void {
  localStorage.removeItem(STORAGE_KEY)
}

function calculateSuccessIndex(measured: any): number {
  const { welfareStandardAdoption, productionEfficiency, welfareIncidentRate, costPerUnit } = measured
  // Normalize adoption (0-3 scale) to 0-1
  const normalizedAdoption = welfareStandardAdoption / 3
  // Lower is better for incident rate and cost
  const normalizedIncidents = 1 - welfareIncidentRate
  const normalizedCost = 1 - costPerUnit
  
  return (normalizedAdoption * 0.4 + productionEfficiency * 0.2 + normalizedIncidents * 0.3 + normalizedCost * 0.1)
}

function calculateDebtIndex(unmeasured: any): number {
  const { welfareDebt, enforcementGap, regulatoryCapture, sentienceKnowledgeGap, systemIrreversibility } = unmeasured
  return (welfareDebt * 0.3 + enforcementGap * 0.2 + regulatoryCapture * 0.2 + sentienceKnowledgeGap * 0.15 + systemIrreversibility * 0.15)
}
