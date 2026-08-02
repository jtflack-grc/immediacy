// Policy brief generator - auto-generates policy brief from run

import { State } from '../engine/scenarioTypes'
import { calculateMeasuredSuccessIndex, calculateGovernanceDebtIndex } from '../engine/scoring'

export interface PolicyBrief {
  title: string
  executiveSummary: string
  keyDecisions: Array<{
    turn: number
    nodeTitle: string
    choice: string
    rationale: string
    impact: string
  }>
  outcomes: {
    measured: {
      welfareStandardAdoption: number
      productionEfficiency: number
      costPerUnit: number
      welfareIncidentRate: number
    }
    unmeasured: {
      welfareDebt: number
      enforcementGap: number
      regulatoryCapture: number
      systemIrreversibility: number
    }
  }
  recommendations: string[]
  risks: string[]
}

/**
 * Generate policy brief from current state
 */
export function generatePolicyBrief(state: State): PolicyBrief {
  const successIndex = calculateMeasuredSuccessIndex(state.metrics.measured)
  const debtIndex = calculateGovernanceDebtIndex(state.metrics.unmeasured)
  
  // Extract key decisions (first 5)
  const keyDecisions = state.auditTrail.slice(0, 5).map(record => ({
    turn: record.turn,
    nodeTitle: record.nodeTitle,
    choice: record.chosenLabel,
    rationale: record.rationale || 'No rationale provided',
    impact: record.unmeasuredImpact || 'Impact not specified'
  }))

  // Generate executive summary
  const executiveSummary = generateExecutiveSummary(state, successIndex, debtIndex)

  // Generate recommendations
  const recommendations = generateRecommendations(state, successIndex, debtIndex)

  // Identify risks
  const risks = identifyRisks(state, debtIndex)

  return {
    title: `Animal Welfare Governance Policy Brief - Turn ${state.turn}`,
    executiveSummary,
    keyDecisions,
    outcomes: {
      measured: state.metrics.measured,
      unmeasured: state.metrics.unmeasured
    },
    recommendations,
    risks
  }
}

/**
 * Generate executive summary
 */
function generateExecutiveSummary(state: State, successIndex: number, debtIndex: number): string {
  const totalDecisions = state.auditTrail.length
  const completedPhases = new Set(state.auditTrail.map(r => r.phaseId)).size
  
  let summary = `This policy brief summarizes ${totalDecisions} governance decisions made across ${completedPhases} phases. `
  
  if (successIndex > 0.7 && debtIndex < 0.4) {
    summary += `The governance approach achieved strong outcomes with a success index of ${(successIndex * 100).toFixed(0)}% and relatively low governance debt (${(debtIndex * 100).toFixed(0)}%). `
    summary += `This suggests a balanced approach that maintained both immediate welfare improvements and long-term governance health.`
  } else if (successIndex > 0.7 && debtIndex >= 0.4) {
    summary += `While achieving high success (${(successIndex * 100).toFixed(0)}%), governance debt has accumulated to ${(debtIndex * 100).toFixed(0)}%. `
    summary += `This indicates strong short-term outcomes but potential long-term sustainability challenges.`
  } else if (successIndex < 0.5 && debtIndex < 0.4) {
    summary += `The approach maintained low governance debt (${(debtIndex * 100).toFixed(0)}%) but achieved moderate success (${(successIndex * 100).toFixed(0)}%). `
    summary += `This suggests a cautious approach that prioritized governance stability over rapid change.`
  } else {
    summary += `The approach resulted in moderate success (${(successIndex * 100).toFixed(0)}%) with governance debt at ${(debtIndex * 100).toFixed(0)}%. `
    summary += `This indicates challenges in both immediate outcomes and long-term governance sustainability.`
  }

  return summary
}

/**
 * Generate recommendations based on current state
 */
function generateRecommendations(state: State, successIndex: number, debtIndex: number): string[] {
  const recommendations: string[] = []

  // High debt recommendations
  if (debtIndex > 0.6) {
    recommendations.push('Prioritize building enforcement capacity to address accumulated governance debt.')
    recommendations.push('Consider policy adjustments that reduce enforcement gaps and regulatory capture.')
  }

  // Low success recommendations
  if (successIndex < 0.5) {
    recommendations.push('Focus on decisions that improve welfare standard adoption and production efficiency.')
    recommendations.push('Review early decisions that may have constrained later options.')
  }

  // System irreversibility
  if (state.metrics.unmeasured.systemIrreversibility > 0.7) {
    recommendations.push('High system irreversibility limits future flexibility. Consider maintaining options for mid-course corrections.')
  }

  // Enforcement gap
  if (state.metrics.unmeasured.enforcementGap > 0.6) {
    recommendations.push('Address enforcement capacity gaps to ensure policy effectiveness.')
  }

  // Regulatory capture
  if (state.metrics.unmeasured.regulatoryCapture > 0.6) {
    recommendations.push('Strengthen independent oversight mechanisms to reduce regulatory capture risks.')
  }

  // Welfare debt
  if (state.metrics.unmeasured.welfareDebt > 0.6) {
    recommendations.push('Address accumulated welfare compromises through targeted interventions.')
  }

  // If doing well, reinforce positive patterns
  if (successIndex > 0.7 && debtIndex < 0.4) {
    recommendations.push('Continue the balanced approach that has achieved strong outcomes with low debt.')
    recommendations.push('Maintain focus on both immediate welfare improvements and long-term governance health.')
  }

  return recommendations.length > 0 ? recommendations : ['Continue monitoring metrics and adjusting strategy as needed.']
}

/**
 * Identify risks based on current state
 */
function identifyRisks(state: State, debtIndex: number): string[] {
  const risks: string[] = []

  if (debtIndex > 0.7) {
    risks.push('High governance debt may limit future policy options and create enforcement challenges.')
  }

  if (state.metrics.unmeasured.systemIrreversibility > 0.8) {
    risks.push('Very high system irreversibility makes course corrections difficult. Future flexibility is constrained.')
  }

  if (state.metrics.unmeasured.enforcementGap > 0.7) {
    risks.push('Large enforcement gaps may lead to policy ineffectiveness and compliance failures.')
  }

  if (state.metrics.unmeasured.regulatoryCapture > 0.7) {
    risks.push('High regulatory capture risks undermining policy independence and effectiveness.')
  }

  if (state.metrics.measured.welfareIncidentRate > 0.6) {
    risks.push('High welfare incident rate indicates ongoing welfare challenges that need attention.')
  }

  if (state.metrics.measured.costPerUnit > 0.7) {
    risks.push('High production costs may create market pressures that undermine welfare standards.')
  }

  return risks.length > 0 ? risks : ['No major risks identified at this time.']
}

/**
 * Format policy brief as markdown
 */
export function formatPolicyBriefAsMarkdown(brief: PolicyBrief): string {
  let markdown = `# ${brief.title}\n\n`
  markdown += `**Generated:** ${new Date().toLocaleDateString()}\n\n`
  markdown += `## Executive Summary\n\n${brief.executiveSummary}\n\n`
  
  markdown += `## Key Decisions\n\n`
  brief.keyDecisions.forEach((decision, idx) => {
    markdown += `### Decision ${idx + 1}: ${decision.nodeTitle} (Turn ${decision.turn})\n\n`
    markdown += `**Choice:** ${decision.choice}\n\n`
    markdown += `**Rationale:** ${decision.rationale}\n\n`
    markdown += `**Unmeasured Impact:** ${decision.impact}\n\n`
  })

  markdown += `## Outcomes\n\n`
  markdown += `### Measured Metrics\n\n`
  markdown += `- Welfare Standard Adoption: ${(brief.outcomes.measured.welfareStandardAdoption * 100).toFixed(1)}%\n`
  markdown += `- Production Efficiency: ${(brief.outcomes.measured.productionEfficiency * 100).toFixed(1)}%\n`
  markdown += `- Cost Per Unit: ${(brief.outcomes.measured.costPerUnit * 100).toFixed(1)}%\n`
  markdown += `- Welfare Incident Rate: ${(brief.outcomes.measured.welfareIncidentRate * 100).toFixed(1)}%\n\n`

  markdown += `### Governance Debt Metrics\n\n`
  markdown += `- Welfare Debt: ${(brief.outcomes.unmeasured.welfareDebt * 100).toFixed(1)}%\n`
  markdown += `- Enforcement Gap: ${(brief.outcomes.unmeasured.enforcementGap * 100).toFixed(1)}%\n`
  markdown += `- Regulatory Capture: ${(brief.outcomes.unmeasured.regulatoryCapture * 100).toFixed(1)}%\n`
  markdown += `- System Irreversibility: ${(brief.outcomes.unmeasured.systemIrreversibility * 100).toFixed(1)}%\n\n`

  markdown += `## Recommendations\n\n`
  brief.recommendations.forEach(rec => {
    markdown += `- ${rec}\n`
  })
  markdown += `\n`

  markdown += `## Risks\n\n`
  brief.risks.forEach(risk => {
    markdown += `- ${risk}\n`
  })
  markdown += `\n`

  markdown += `---\n\n`
  markdown += `*This policy brief was auto-generated from the Animal Welfare Governance Simulator.*\n`

  return markdown
}

/**
 * Format policy brief as plain text
 */
export function formatPolicyBriefAsText(brief: PolicyBrief): string {
  let text = `${brief.title}\n`
  text += `${'='.repeat(brief.title.length)}\n\n`
  text += `Generated: ${new Date().toLocaleDateString()}\n\n`
  text += `EXECUTIVE SUMMARY\n`
  text += `${'-'.repeat(20)}\n`
  text += `${brief.executiveSummary}\n\n`
  
  text += `KEY DECISIONS\n`
  text += `${'-'.repeat(20)}\n`
  brief.keyDecisions.forEach((decision, idx) => {
    text += `\nDecision ${idx + 1}: ${decision.nodeTitle} (Turn ${decision.turn})\n`
    text += `Choice: ${decision.choice}\n`
    text += `Rationale: ${decision.rationale}\n`
    text += `Unmeasured Impact: ${decision.impact}\n`
  })

  text += `\n\nOUTCOMES\n`
  text += `${'-'.repeat(20)}\n`
  text += `Measured Metrics:\n`
  text += `  - Welfare Standard Adoption: ${(brief.outcomes.measured.welfareStandardAdoption * 100).toFixed(1)}%\n`
  text += `  - Production Efficiency: ${(brief.outcomes.measured.productionEfficiency * 100).toFixed(1)}%\n`
  text += `  - Cost Per Unit: ${(brief.outcomes.measured.costPerUnit * 100).toFixed(1)}%\n`
  text += `  - Welfare Incident Rate: ${(brief.outcomes.measured.welfareIncidentRate * 100).toFixed(1)}%\n\n`
  text += `Governance Debt Metrics:\n`
  text += `  - Welfare Debt: ${(brief.outcomes.unmeasured.welfareDebt * 100).toFixed(1)}%\n`
  text += `  - Enforcement Gap: ${(brief.outcomes.unmeasured.enforcementGap * 100).toFixed(1)}%\n`
  text += `  - Regulatory Capture: ${(brief.outcomes.unmeasured.regulatoryCapture * 100).toFixed(1)}%\n`
  text += `  - System Irreversibility: ${(brief.outcomes.unmeasured.systemIrreversibility * 100).toFixed(1)}%\n\n`

  text += `RECOMMENDATIONS\n`
  text += `${'-'.repeat(20)}\n`
  brief.recommendations.forEach(rec => {
    text += `- ${rec}\n`
  })

  text += `\nRISKS\n`
  text += `${'-'.repeat(20)}\n`
  brief.risks.forEach(risk => {
    text += `- ${risk}\n`
  })

  text += `\n${'='.repeat(50)}\n`
  text += `This policy brief was auto-generated from the Animal Welfare Governance Simulator.\n`

  return text
}
