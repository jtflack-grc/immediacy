// Governance debt report generator - detailed analysis of debt accumulation

import { State, AuditRecord } from '../engine/scenarioTypes'
import { calculateGovernanceDebtIndex } from '../engine/scoring'

export interface DebtEvent {
  turn: number
  nodeTitle: string
  choice: string
  debtType: 'welfareDebt' | 'enforcementGap' | 'regulatoryCapture' | 'sentienceKnowledgeGap' | 'systemIrreversibility'
  magnitude: number
  cumulativeDebt: number
  description: string
}

export interface DebtReport {
  title: string
  summary: {
    totalDebtIndex: number
    totalEvents: number
    peakDebt: number
    peakTurn: number
    debtByType: Record<string, number>
  }
  timeline: DebtEvent[]
  analysis: {
    criticalPeriods: Array<{ turn: number; description: string }>
    recommendations: string[]
    trends: string[]
  }
}

/**
 * Generate governance debt report from state
 */
export function generateDebtReport(state: State): DebtReport {
  const debtIndex = calculateGovernanceDebtIndex(state.metrics.unmeasured)
  
  // Build timeline of debt events from audit trail
  const timeline = buildDebtTimeline(state)
  
  // Calculate summary statistics
  const summary = calculateDebtSummary(state, timeline)
  
  // Generate analysis
  const analysis = analyzeDebtPatterns(state, timeline)

  return {
    title: `Governance Debt Report - Turn ${state.turn}`,
    summary,
    timeline,
    analysis
  }
}

/**
 * Build timeline of debt accumulation events
 */
function buildDebtTimeline(state: State): DebtEvent[] {
  const events: DebtEvent[] = []
  let cumulativeDebt = 0

  state.auditTrail.forEach((record, idx) => {
    // Get metrics snapshot if available, otherwise use current metrics
    const metrics = record.metricsSnapshot?.unmeasured || state.metrics.unmeasured
    
    // Calculate debt changes (simplified - compare to previous record)
    const prevMetrics = idx > 0 && state.auditTrail[idx - 1].metricsSnapshot?.unmeasured
      ? state.auditTrail[idx - 1].metricsSnapshot!.unmeasured
      : state.initialMetrics?.unmeasured || {
          welfareDebt: 0,
          enforcementGap: 0,
          regulatoryCapture: 0,
          sentienceKnowledgeGap: 0,
          systemIrreversibility: 0
        }

    const debtTypes: Array<keyof typeof metrics> = [
      'welfareDebt',
      'enforcementGap',
      'regulatoryCapture',
      'sentienceKnowledgeGap',
      'systemIrreversibility'
    ]

    debtTypes.forEach(debtType => {
      const change = metrics[debtType] - prevMetrics[debtType]
      if (change > 0.05) { // Only record significant changes (>5%)
        cumulativeDebt = calculateGovernanceDebtIndex(metrics)
        events.push({
          turn: record.turn,
          nodeTitle: record.nodeTitle,
          choice: record.chosenLabel,
          debtType,
          magnitude: change,
          cumulativeDebt,
          description: generateDebtDescription(debtType, change, record)
        })
      }
    })
  })

  return events
}

/**
 * Generate description for debt event
 */
function generateDebtDescription(
  debtType: DebtEvent['debtType'],
  magnitude: number,
  record: AuditRecord
): string {
  const magnitudePercent = (magnitude * 100).toFixed(0)
  
  const descriptions: Record<DebtEvent['debtType'], string> = {
    welfareDebt: `Welfare debt increased by ${magnitudePercent}% following the decision to "${record.chosenLabel}". This represents accumulated welfare compromises that were not fully addressed.`,
    enforcementGap: `Enforcement gap increased by ${magnitudePercent}% after "${record.chosenLabel}". This indicates a delay between policy implementation and effective enforcement capacity.`,
    regulatoryCapture: `Regulatory capture increased by ${magnitudePercent}% following "${record.chosenLabel}". This suggests increased industry influence on policy decisions.`,
    sentienceKnowledgeGap: `Sentience knowledge gap increased by ${magnitudePercent}% after "${record.chosenLabel}". This reflects gaps in understanding animal needs and welfare requirements.`,
    systemIrreversibility: `System irreversibility increased by ${magnitudePercent}% following "${record.chosenLabel}". This makes future course corrections more difficult.`
  }

  return descriptions[debtType]
}

/**
 * Calculate debt summary statistics
 */
function calculateDebtSummary(state: State, timeline: DebtEvent[]): DebtReport['summary'] {
  const debtIndex = calculateGovernanceDebtIndex(state.metrics.unmeasured)
  
  // Calculate debt by type
  const debtByType: Record<string, number> = {
    welfareDebt: state.metrics.unmeasured.welfareDebt,
    enforcementGap: state.metrics.unmeasured.enforcementGap,
    regulatoryCapture: state.metrics.unmeasured.regulatoryCapture,
    sentienceKnowledgeGap: state.metrics.unmeasured.sentienceKnowledgeGap,
    systemIrreversibility: state.metrics.unmeasured.systemIrreversibility
  }

  // Find peak debt
  let peakDebt = 0
  let peakTurn = 0
  timeline.forEach(event => {
    if (event.cumulativeDebt > peakDebt) {
      peakDebt = event.cumulativeDebt
      peakTurn = event.turn
    }
  })

  return {
    totalDebtIndex: debtIndex,
    totalEvents: timeline.length,
    peakDebt,
    peakTurn,
    debtByType
  }
}

/**
 * Analyze debt patterns and generate insights
 */
function analyzeDebtPatterns(state: State, timeline: DebtEvent[]): DebtReport['analysis'] {
  const criticalPeriods: Array<{ turn: number; description: string }> = []
  const recommendations: string[] = []
  const trends: string[] = []

  // Identify critical periods (turns with multiple debt events)
  const eventsByTurn = new Map<number, DebtEvent[]>()
  timeline.forEach(event => {
    if (!eventsByTurn.has(event.turn)) {
      eventsByTurn.set(event.turn, [])
    }
    eventsByTurn.get(event.turn)!.push(event)
  })

  eventsByTurn.forEach((events, turn) => {
    if (events.length >= 2) {
      criticalPeriods.push({
        turn,
        description: `Turn ${turn} saw ${events.length} debt accumulation events, indicating a period of significant governance challenges.`
      })
    }
  })

  // Generate trends
  if (timeline.length > 0) {
    const earlyDebt = timeline.slice(0, Math.floor(timeline.length / 3))
      .reduce((sum, e) => sum + e.magnitude, 0)
    const lateDebt = timeline.slice(-Math.floor(timeline.length / 3))
      .reduce((sum, e) => sum + e.magnitude, 0)

    if (lateDebt > earlyDebt * 1.5) {
      trends.push('Debt accumulation accelerated in later turns, suggesting compounding governance challenges.')
    } else if (earlyDebt > lateDebt * 1.5) {
      trends.push('Debt accumulation was concentrated in early turns, with later turns showing more stability.')
    } else {
      trends.push('Debt accumulation was relatively consistent across turns.')
    }
  }

  // Generate recommendations based on debt types
  const debtByType = new Map<string, number>()
  timeline.forEach(event => {
    debtByType.set(event.debtType, (debtByType.get(event.debtType) || 0) + event.magnitude)
  })

  const maxDebtType = Array.from(debtByType.entries())
    .sort((a, b) => b[1] - a[1])[0]

  if (maxDebtType) {
    const recommendationsMap: Record<string, string> = {
      welfareDebt: 'Prioritize decisions that address accumulated welfare compromises. Consider targeted interventions to reduce welfare debt.',
      enforcementGap: 'Build enforcement capacity to close the gap between policy and implementation. Invest in inspection systems and oversight mechanisms.',
      regulatoryCapture: 'Strengthen independent oversight to reduce industry influence. Consider mechanisms that protect policy independence.',
      sentienceKnowledgeGap: 'Invest in research and knowledge-building to address gaps in understanding animal welfare needs.',
      systemIrreversibility: 'Maintain flexibility in governance systems. Avoid decisions that lock in problematic patterns too early.'
    }
    recommendations.push(recommendationsMap[maxDebtType[0]] || 'Monitor debt accumulation and adjust strategy as needed.')
  }

  if (state.metrics.unmeasured.welfareDebt > 0.6) {
    recommendations.push('High welfare debt requires immediate attention. Consider policy adjustments that directly address welfare compromises.')
  }

  if (state.metrics.unmeasured.enforcementGap > 0.6) {
    recommendations.push('Large enforcement gaps undermine policy effectiveness. Prioritize building enforcement capacity.')
  }

  if (state.metrics.unmeasured.systemIrreversibility > 0.7) {
    recommendations.push('High system irreversibility limits future options. Consider maintaining flexibility for mid-course corrections.')
  }

  return {
    criticalPeriods,
    recommendations: recommendations.length > 0 ? recommendations : ['Continue monitoring debt accumulation and adjust strategy as needed.'],
    trends: trends.length > 0 ? trends : ['Insufficient data to identify trends.']
  }
}

/**
 * Generate HTML for debt report (for PDF export)
 */
export function generateDebtReportHTML(report: DebtReport): string {
  const date = new Date().toLocaleDateString()
  
  return `
<!DOCTYPE html>
<html>
<head>
  <title>${report.title}</title>
  <style>
    @media print {
      @page {
        size: A4;
        margin: 2cm;
      }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif;
      color: #000;
      background: #fff;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
      line-height: 1.6;
    }
    h1 { color: #000; font-size: 28px; margin-bottom: 10px; }
    h2 { color: #333; font-size: 20px; margin-top: 30px; margin-bottom: 15px; border-bottom: 2px solid #333; padding-bottom: 5px; }
    h3 { color: #555; font-size: 16px; margin-top: 20px; margin-bottom: 10px; }
    .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .metric { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .metric-label { font-weight: 600; }
    .metric-value { color: #666; }
    .event { background: #f9f9f9; padding: 15px; margin: 10px 0; border-left: 4px solid #fb923c; border-radius: 4px; }
    .event-title { font-weight: 600; margin-bottom: 5px; }
    .event-details { font-size: 12px; color: #666; }
    .debt-type { display: inline-block; padding: 4px 8px; background: #fff3cd; border-radius: 4px; font-size: 11px; font-weight: 600; margin-right: 8px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f5f5f5; font-weight: 600; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #333; font-size: 12px; color: #666; text-align: center; }
    .recommendation { background: #e7f3ff; padding: 12px; margin: 8px 0; border-left: 4px solid #2563eb; border-radius: 4px; }
    .trend { background: #fff3cd; padding: 12px; margin: 8px 0; border-left: 4px solid #ffc107; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>${report.title}</h1>
  <div style="color: #666; margin-bottom: 30px;">Generated ${date}</div>
  
  <div class="summary">
    <h2>Executive Summary</h2>
    <div class="metric">
      <span class="metric-label">Total Debt Index:</span>
      <span class="metric-value">${(report.summary.totalDebtIndex * 100).toFixed(1)}%</span>
    </div>
    <div class="metric">
      <span class="metric-label">Total Debt Events:</span>
      <span class="metric-value">${report.summary.totalEvents}</span>
    </div>
    <div class="metric">
      <span class="metric-label">Peak Debt:</span>
      <span class="metric-value">${(report.summary.peakDebt * 100).toFixed(1)}% (Turn ${report.summary.peakTurn})</span>
    </div>
  </div>

  <h2>Debt by Type</h2>
  <table>
    <thead>
      <tr>
        <th>Debt Type</th>
        <th>Value</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Welfare Debt</td>
        <td>${(report.summary.debtByType.welfareDebt * 100).toFixed(1)}%</td>
      </tr>
      <tr>
        <td>Enforcement Gap</td>
        <td>${(report.summary.debtByType.enforcementGap * 100).toFixed(1)}%</td>
      </tr>
      <tr>
        <td>Regulatory Capture</td>
        <td>${(report.summary.debtByType.regulatoryCapture * 100).toFixed(1)}%</td>
      </tr>
      <tr>
        <td>Sentience Knowledge Gap</td>
        <td>${(report.summary.debtByType.sentienceKnowledgeGap * 100).toFixed(1)}%</td>
      </tr>
      <tr>
        <td>System Irreversibility</td>
        <td>${(report.summary.debtByType.systemIrreversibility * 100).toFixed(1)}%</td>
      </tr>
    </tbody>
  </table>

  <h2>Debt Accumulation Timeline</h2>
  ${report.timeline.map(event => `
    <div class="event">
      <div class="event-title">Turn ${event.turn}: ${event.nodeTitle}</div>
      <div class="event-details">
        <span class="debt-type">${event.debtType}</span>
        <strong>Choice:</strong> ${event.choice}<br>
        <strong>Magnitude:</strong> +${(event.magnitude * 100).toFixed(1)}%<br>
        <strong>Cumulative Debt:</strong> ${(event.cumulativeDebt * 100).toFixed(1)}%<br>
        <strong>Description:</strong> ${event.description}
      </div>
    </div>
  `).join('')}

  <h2>Analysis</h2>
  
  <h3>Critical Periods</h3>
  ${report.analysis.criticalPeriods.length > 0 
    ? report.analysis.criticalPeriods.map(period => `
      <div class="trend">
        <strong>Turn ${period.turn}:</strong> ${period.description}
      </div>
    `).join('')
    : '<p>No critical periods identified.</p>'
  }

  <h3>Trends</h3>
  ${report.analysis.trends.map(trend => `
    <div class="trend">${trend}</div>
  `).join('')}

  <h3>Recommendations</h3>
  ${report.analysis.recommendations.map(rec => `
    <div class="recommendation">${rec}</div>
  `).join('')}

  <div class="footer">
    <p>Generated by Animal Welfare Governance Simulator</p>
    <p>This report analyzes governance debt accumulation patterns and provides recommendations for improvement.</p>
  </div>
</body>
</html>
  `
}

/**
 * Export debt report as PDF (using browser print)
 */
export function exportDebtReportAsPDF(state: State) {
  const report = generateDebtReport(state)
  const html = generateDebtReportHTML(report)
  
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Please allow popups to export PDF')
    return
  }
  
  printWindow.document.write(html)
  printWindow.document.close()
  
  setTimeout(() => {
    printWindow.print()
  }, 250)
}
