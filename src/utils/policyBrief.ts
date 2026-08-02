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
      disclosurePosture: number
      operationalControl: number
      financialBurn: number
      serviceDisruption: number
    }
    unmeasured: {
      disclosureDebt: number
      regulatoryExposure: number
      narrativeIntegrity: number
      commitmentLock: number
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
    title: `IMMEDIACY Disclosure Brief - Turn ${state.turn}`,
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
  
  let summary = `This brief summarizes ${totalDecisions} war-room decisions across ${completedPhases} incident phases. `
  
  if (successIndex > 0.7 && debtIndex < 0.4) {
    summary += `The approach achieved strong outcomes with a control index of ${(successIndex * 100).toFixed(0)}% and relatively low disclosure debt (${(debtIndex * 100).toFixed(0)}%). `
    summary += `This suggests a balanced approach that held operational control while paying down secondary disclosure loss.`
  } else if (successIndex > 0.7 && debtIndex >= 0.4) {
    summary += `While achieving high control (${(successIndex * 100).toFixed(0)}%), disclosure debt has accumulated to ${(debtIndex * 100).toFixed(0)}%). `
    summary += `This indicates strong short-horizon containment but secondary loss risk from silence, spin, or clock lag.`
  } else if (successIndex < 0.5 && debtIndex < 0.4) {
    summary += `The approach kept disclosure debt low (${(debtIndex * 100).toFixed(0)}%) but achieved only moderate control (${(successIndex * 100).toFixed(0)}%). `
    summary += `This suggests caution on narrative at the expense of operational tempo.`
  } else {
    summary += `The approach resulted in moderate control (${(successIndex * 100).toFixed(0)}%) with disclosure debt at ${(debtIndex * 100).toFixed(0)}%. `
    summary += `This indicates challenges in both containment and disclosure discipline.`
  }

  return summary
}

/**
 * Generate recommendations based on current state
 */
function generateRecommendations(state: State, successIndex: number, debtIndex: number): string[] {
  const recommendations: string[] = []

  if (debtIndex > 0.6) {
    recommendations.push('Prioritize paying down disclosure debt — silence and spin compound faster than most technical loss.')
    recommendations.push('Close regulatory clock lag and narrative capture with timed, facts-first notices.')
  }

  if (successIndex < 0.5) {
    recommendations.push('Focus on decisions that restore operational control and coherent disclosure posture.')
    recommendations.push('Review early choices that may have locked burn or facts gap too high.')
  }

  if (state.metrics.unmeasured.commitmentLock > 0.7) {
    recommendations.push('Commitment lock is high. Avoid new irreversible payments or denials until facts stabilize.')
  }

  if (state.metrics.unmeasured.regulatoryExposure > 0.6) {
    recommendations.push('Address regulatory clock lag — document awareness and hit notice deadlines.')
  }

  if (state.metrics.unmeasured.narrativeIntegrity < 0.4) {
    recommendations.push('Align messaging with ops truth to reduce narrative capture before regulators or customers force it.')
  }

  if (state.metrics.unmeasured.disclosureDebt > 0.6) {
    recommendations.push('Address accumulated disclosure debt with clearer, earlier statements even if imperfect.')
  }

  if (successIndex > 0.7 && debtIndex < 0.4) {
    recommendations.push('Continue balancing response burn against secondary disclosure loss.')
    recommendations.push('Keep FAIR ranges on the board — dollars create urgency the room understands.')
  }

  return recommendations.length > 0 ? recommendations : ['Continue monitoring metrics and adjusting strategy as needed.']
}

/**
 * Identify risks based on current state
 */
function identifyRisks(state: State, debtIndex: number): string[] {
  const risks: string[] = []

  if (debtIndex > 0.7) {
    risks.push('High disclosure debt may force adversary- or regulator-driven narrative before you are ready.')
  }

  if (state.metrics.unmeasured.commitmentLock > 0.8) {
    risks.push('Very high commitment lock makes course corrections difficult. Payments and denials will fight new facts.')
  }

  if (state.metrics.unmeasured.regulatoryExposure > 0.7) {
    risks.push('Large regulatory clock lag invites fines, orders, and loss of customer trust.')
  }

  if (state.metrics.unmeasured.narrativeIntegrity < 0.3) {
    risks.push('High narrative capture risks undermining credibility when screenshots surface.')
  }

  if (state.metrics.measured.serviceDisruption > 0.6) {
    risks.push('High exposure severity indicates ongoing blast-radius and leak-site pressure.')
  }

  if (state.metrics.measured.financialBurn > 0.7) {
    risks.push('High response burn may strain the room — watch that spend still cuts secondary loss.')
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
  markdown += `- Disclosure Posture: ${(brief.outcomes.measured.disclosurePosture * 100).toFixed(1)}%\n`
  markdown += `- Operational Control: ${(brief.outcomes.measured.operationalControl * 100).toFixed(1)}%\n`
  markdown += `- Response Burn: ${(brief.outcomes.measured.financialBurn * 100).toFixed(1)}%\n`
  markdown += `- Exposure Severity: ${(brief.outcomes.measured.serviceDisruption * 100).toFixed(1)}%\n\n`

  markdown += `### Disclosure Debt Metrics\n\n`
  markdown += `- Disclosure Debt: ${(brief.outcomes.unmeasured.disclosureDebt * 100).toFixed(1)}%\n`
  markdown += `- Regulatory Clock Lag: ${(brief.outcomes.unmeasured.regulatoryExposure * 100).toFixed(1)}%\n`
  markdown += `- Narrative Capture: ${((1 - brief.outcomes.unmeasured.narrativeIntegrity) * 100).toFixed(1)}%\n`
  markdown += `- Commitment Lock: ${(brief.outcomes.unmeasured.commitmentLock * 100).toFixed(1)}%\n\n`

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
  markdown += `*This brief was auto-generated from IMMEDIACY.*\n`

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
  text += `  - Disclosure Posture: ${(brief.outcomes.measured.disclosurePosture * 100).toFixed(1)}%\n`
  text += `  - Operational Control: ${(brief.outcomes.measured.operationalControl * 100).toFixed(1)}%\n`
  text += `  - Response Burn: ${(brief.outcomes.measured.financialBurn * 100).toFixed(1)}%\n`
  text += `  - Exposure Severity: ${(brief.outcomes.measured.serviceDisruption * 100).toFixed(1)}%\n\n`
  text += `Disclosure Debt Metrics:\n`
  text += `  - Disclosure Debt: ${(brief.outcomes.unmeasured.disclosureDebt * 100).toFixed(1)}%\n`
  text += `  - Regulatory Clock Lag: ${(brief.outcomes.unmeasured.regulatoryExposure * 100).toFixed(1)}%\n`
  text += `  - Narrative Capture: ${((1 - brief.outcomes.unmeasured.narrativeIntegrity) * 100).toFixed(1)}%\n`
  text += `  - Commitment Lock: ${(brief.outcomes.unmeasured.commitmentLock * 100).toFixed(1)}%\n\n`

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
  text += `This brief was auto-generated from IMMEDIACY.\n`

  return text
}
