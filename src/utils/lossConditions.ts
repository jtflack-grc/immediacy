import { State } from '../engine/scenarioTypes'
import { calculateMeasuredSuccessIndex, calculateGovernanceDebtIndex } from '../engine/scoring'

export type LossType = 'welfare_collapse' | 'debt_crisis' | 'enforcement_failure' | 'irreversibility_lock' | 'regulatory_capture' | null

export interface LossCondition {
  type: LossType
  name: string
  description: string
  checkCondition: (state: State) => boolean
  checkWarning: (state: State) => boolean // Check if approaching threshold
  message: string
  warningMessage: string
  color: string
}

export const LOSS_CONDITIONS: LossCondition[] = [
  {
    type: 'welfare_collapse',
    name: 'Welfare Collapse',
    description: 'Critical welfare metrics have dropped to dangerous levels',
    checkCondition: (state) => {
      const avgWelfare = Object.values(state.map.regionValues).reduce((a, b) => a + b, 0) / Object.values(state.map.regionValues).length
      const welfareIncidentRate = state.metrics.measured.welfareIncidentRate
      const lowWelfareCountries = Object.values(state.map.regionValues).filter(v => v < 0.2).length
      
      return avgWelfare < 0.2 && welfareIncidentRate > 0.6 && lowWelfareCountries >= 3
    },
    checkWarning: (state) => {
      const avgWelfare = Object.values(state.map.regionValues).reduce((a, b) => a + b, 0) / Object.values(state.map.regionValues).length
      const welfareIncidentRate = state.metrics.measured.welfareIncidentRate
      const lowWelfareCountries = Object.values(state.map.regionValues).filter(v => v < 0.3).length
      
      return avgWelfare < 0.3 && welfareIncidentRate > 0.5 && lowWelfareCountries >= 2
    },
    message: 'Welfare standards have collapsed across multiple regions. High incident rates and low adoption suggest systemic failure in governance. Recovery will require significant intervention.',
    warningMessage: 'Welfare standards are approaching critical levels. Multiple regions show declining adoption and increasing incident rates.',
    color: '#ef4444' // red
  },
  {
    type: 'debt_crisis',
    name: 'Governance Debt Crisis',
    description: 'Accumulated governance debt has reached unsustainable levels',
    checkCondition: (state) => {
      const debtIndex = calculateGovernanceDebtIndex(state.metrics.unmeasured)
      const welfareDebt = state.metrics.unmeasured.welfareDebt
      const systemIrreversibility = state.metrics.unmeasured.systemIrreversibility
      
      return debtIndex > 0.75 || (welfareDebt > 0.8 && systemIrreversibility > 0.7)
    },
    checkWarning: (state) => {
      const debtIndex = calculateGovernanceDebtIndex(state.metrics.unmeasured)
      const welfareDebt = state.metrics.unmeasured.welfareDebt
      const systemIrreversibility = state.metrics.unmeasured.systemIrreversibility
      
      return debtIndex > 0.6 || (welfareDebt > 0.65 && systemIrreversibility > 0.6)
    },
    message: 'Governance debt has reached crisis levels. Hidden costs, accumulated welfare debt, and system irreversibility have created a situation where meaningful reform may no longer be possible.',
    warningMessage: 'Governance debt is approaching critical levels. Hidden costs and system lock-in are accumulating rapidly.',
    color: '#f97316' // orange
  },
  {
    type: 'enforcement_failure',
    name: 'Enforcement Failure',
    description: 'Enforcement gap has become unmanageable',
    checkCondition: (state) => {
      const enforcementGap = state.metrics.unmeasured.enforcementGap
      const regulatoryCapture = state.metrics.unmeasured.regulatoryCapture
      const welfareIncidentRate = state.metrics.measured.welfareIncidentRate
      
      return enforcementGap > 0.7 && regulatoryCapture > 0.6 && welfareIncidentRate > 0.5
    },
    checkWarning: (state) => {
      const enforcementGap = state.metrics.unmeasured.enforcementGap
      const regulatoryCapture = state.metrics.unmeasured.regulatoryCapture
      const welfareIncidentRate = state.metrics.measured.welfareIncidentRate
      
      return enforcementGap > 0.55 && regulatoryCapture > 0.5 && welfareIncidentRate > 0.4
    },
    message: 'Enforcement systems have failed. The gap between policy and practice is unmanageable, regulatory capture is severe, and incident rates remain high despite standards.',
    warningMessage: 'Enforcement gap is widening. Regulatory capture and high incident rates suggest standards are not translating to practice.',
    color: '#eab308' // yellow
  },
  {
    type: 'irreversibility_lock',
    name: 'System Irreversibility Lock',
    description: 'System has become too locked-in to change',
    checkCondition: (state) => {
      const systemIrreversibility = state.metrics.unmeasured.systemIrreversibility
      // Derive rollback feasibility directly from irreversibility (high irreversibility -> low feasibility)
      const rollbackFeasibility = 1 - systemIrreversibility
      const avgWelfare = Object.values(state.map.regionValues).reduce((a, b) => a + b, 0) / Object.values(state.map.regionValues).length
      
      return systemIrreversibility > 0.85 && rollbackFeasibility < 0.15 && avgWelfare < 0.4
    },
    checkWarning: (state) => {
      const systemIrreversibility = state.metrics.unmeasured.systemIrreversibility
      const rollbackFeasibility = 1 - systemIrreversibility
      const avgWelfare = Object.values(state.map.regionValues).reduce((a, b) => a + b, 0) / Object.values(state.map.regionValues).length
      
      return systemIrreversibility > 0.7 && rollbackFeasibility < 0.25 && avgWelfare < 0.5
    },
    message: 'The system has become irreversibly locked in. Infrastructure, dependencies, and institutional momentum make meaningful change nearly impossible. You must live with the consequences of earlier decisions.',
    warningMessage: 'System irreversibility is approaching critical levels. Rollback feasibility is declining, suggesting the system is becoming locked in.',
    color: '#8b5cf6' // purple
  },
  {
    type: 'regulatory_capture',
    name: 'Regulatory Capture',
    description: 'Regulatory capture has reached dangerous levels',
    checkCondition: (state) => {
      const regulatoryCapture = state.metrics.unmeasured.regulatoryCapture
      const enforcementGap = state.metrics.unmeasured.enforcementGap
      const welfareDebt = state.metrics.unmeasured.welfareDebt
      
      return regulatoryCapture > 0.75 && enforcementGap > 0.6 && welfareDebt > 0.7
    },
    checkWarning: (state) => {
      const regulatoryCapture = state.metrics.unmeasured.regulatoryCapture
      const enforcementGap = state.metrics.unmeasured.enforcementGap
      const welfareDebt = state.metrics.unmeasured.welfareDebt
      
      return regulatoryCapture > 0.6 && enforcementGap > 0.5 && welfareDebt > 0.55
    },
    message: 'Regulatory capture has reached dangerous levels. Industry influence over governance has compromised enforcement and allowed welfare debt to accumulate unchecked.',
    warningMessage: 'Regulatory capture is increasing. Industry influence appears to be compromising enforcement effectiveness.',
    color: '#dc2626' // dark red
  }
]

/**
 * Check which loss conditions (if any) have been met
 */
export function checkLossConditions(state: State): LossType[] {
  const met: LossType[] = []
  
  for (const condition of LOSS_CONDITIONS) {
    if (condition.checkCondition(state)) {
      met.push(condition.type)
    }
  }
  
  return met
}

/**
 * Check which loss conditions are approaching (warnings)
 */
export function checkLossWarnings(state: State): Array<{ type: LossType; severity: 'warning' | 'critical' }> {
  const warnings: Array<{ type: LossType; severity: 'warning' | 'critical' }> = []
  
  for (const condition of LOSS_CONDITIONS) {
    const isMet = condition.checkCondition(state)
    const isWarning = condition.checkWarning(state)
    
    if (isMet) {
      warnings.push({ type: condition.type, severity: 'critical' })
    } else if (isWarning) {
      warnings.push({ type: condition.type, severity: 'warning' })
    }
  }
  
  return warnings
}

/**
 * Get loss condition details by type
 */
export function getLossCondition(type: LossType): LossCondition | null {
  return LOSS_CONDITIONS.find(c => c.type === type) || null
}
