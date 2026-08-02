// Export utilities for sharing and saving scenarios

import { State } from '../engine/scenarioTypes'
import { calculateMeasuredSuccessIndex, calculateGovernanceDebtIndex } from '../engine/scoring'

export interface ExportData {
  version: string
  timestamp: number
  state: State
  summary: {
    measuredSuccessIndex: number
    governanceDebtIndex: number
    totalDecisions: number
    finalTurn: number
  }
}

/**
 * Export state as JSON
 */
export function exportAsJSON(state: State): string {
  const measuredIndex = calculateMeasuredSuccessIndex(state.metrics.measured)
  const debtIndex = calculateGovernanceDebtIndex(state.metrics.unmeasured)
  
  const exportData: ExportData = {
    version: '1.0.0',
    timestamp: Date.now(),
    state: JSON.parse(JSON.stringify(state)), // Deep copy
    summary: {
      measuredSuccessIndex: measuredIndex,
      governanceDebtIndex: debtIndex,
      totalDecisions: state.auditTrail.length,
      finalTurn: state.turn,
    }
  }
  
  return JSON.stringify(exportData, null, 2)
}

/**
 * Export audit trail as CSV
 */
export function exportAsCSV(state: State): string {
  const headers = ['Turn', 'Phase', 'Node', 'Decision', 'Owner Role', 'Rationale', 'Assumptions', 'Unmeasured Impact', 'Timestamp']
  const rows = state.auditTrail.map(record => [
    record.turn.toString(),
    record.phaseId,
    record.nodeTitle,
    record.chosenLabel,
    record.ownerRole,
    `"${record.rationale.replace(/"/g, '""')}"`, // Escape quotes
    `"${record.assumptions.replace(/"/g, '""')}"`,
    `"${record.unmeasuredImpact.replace(/"/g, '""')}"`,
    new Date(record.timestamp).toISOString()
  ])
  
  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
}

/**
 * Generate shareable URL with state encoded
 */
export function generateShareableURL(state: State): string {
  const compressed = btoa(JSON.stringify(state))
  return `${window.location.origin}${window.location.pathname}?share=${compressed}`
}

/**
 * Load state from shareable URL
 */
export function loadFromShareableURL(): State | null {
  const params = new URLSearchParams(window.location.search)
  const share = params.get('share')
  if (!share) return null
  
  try {
    const state = JSON.parse(atob(share))
    return state as State
  } catch (e) {
    console.error('Failed to load from shareable URL:', e)
    return null
  }
}

/**
 * Download file
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
