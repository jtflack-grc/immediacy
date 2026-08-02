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
    name: 'Containment Collapse',
    description: 'Operational control and jurisdiction posture have collapsed under exposure',
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
    message: 'Containment and jurisdiction posture have collapsed across multiple regions. Exposure severity is high and disclosure process is failing. Recovery will require significant intervention.',
    warningMessage: 'Jurisdiction posture is approaching critical levels. Multiple regions show declining posture and rising exposure severity.',
    color: '#ef4444' // red
  },
  {
    type: 'debt_crisis',
    name: 'Disclosure Debt Crisis',
    description: 'Accumulated disclosure debt has reached unsustainable levels',
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
    message: 'Disclosure debt has reached crisis levels. Silence, spin, and commitment locks have created a situation where an honest recovery narrative may no longer be possible.',
    warningMessage: 'Disclosure debt is approaching critical levels. Narrative capture and commitment lock are accumulating rapidly.',
    color: '#f97316' // orange
  },
  {
    type: 'enforcement_failure',
    name: 'Regulatory Clock Failure',
    description: 'Regulatory clock lag has become unmanageable',
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
    message: 'Regulatory clocks have slipped past credibility. Narrative capture is severe, and exposure remains high despite process theater.',
    warningMessage: 'Regulatory clock lag is widening. Narrative capture and high exposure suggest notices are not matching reality.',
    color: '#eab308' // yellow
  },
  {
    type: 'irreversibility_lock',
    name: 'Commitment Lock',
    description: 'Statements, payments, or postures have become too locked-in to unwind',
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
    message: 'Commitment lock is extreme. Payments, public denials, or attributions cannot be walked back. You must live with the consequences of earlier war-room choices.',
    warningMessage: 'Commitment lock is approaching critical levels. Rollback feasibility is declining — statements and deals are hardening.',
    color: '#8b5cf6' // purple
  },
  {
    type: 'regulatory_capture',
    name: 'Narrative Capture',
    description: 'Spin and selective storytelling have overridden operational truth',
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
    message: 'Narrative capture has reached dangerous levels. Messaging has overridden facts, clocks have slipped, and disclosure debt is compounding unchecked.',
    warningMessage: 'Narrative capture is increasing. Public statements appear to be drifting from operational truth.',
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
