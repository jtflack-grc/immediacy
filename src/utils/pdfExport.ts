/**
 * Export post-mortem report as PDF
 * Uses browser's print functionality for simplicity
 */

export function exportPostMortemAsPDF(state: any, measuredIndex: number, debtIndex: number) {
  // Create a printable HTML document
  const html = generatePostMortemHTML(state, measuredIndex, debtIndex)
  
  // Create a new window and print
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Please allow popups to export PDF')
    return
  }
  
  printWindow.document.write(html)
  printWindow.document.close()
  
  // Wait for content to load, then print
  setTimeout(() => {
    printWindow.print()
  }, 250)
}

function generatePostMortemHTML(state: any, measuredIndex: number, debtIndex: number): string {
  const date = new Date().toLocaleDateString()
  
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Animal Welfare Governance - Post-Mortem Report</title>
  <style>
    @media print {
      @page {
        size: A4;
        margin: 2cm;
      }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #000;
      background: #fff;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    h1 { color: #000; font-size: 28px; margin-bottom: 10px; }
    h2 { color: #333; font-size: 20px; margin-top: 30px; margin-bottom: 15px; border-bottom: 2px solid #333; padding-bottom: 5px; }
    h3 { color: #555; font-size: 16px; margin-top: 20px; margin-bottom: 10px; }
    .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .metric { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .metric-label { font-weight: 600; }
    .metric-value { color: #666; }
    .decision { background: #f9f9f9; padding: 15px; margin: 10px 0; border-left: 4px solid #2563eb; border-radius: 4px; }
    .decision-title { font-weight: 600; margin-bottom: 5px; }
    .decision-details { font-size: 12px; color: #666; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f5f5f5; font-weight: 600; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #333; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <h1>Animal Welfare Governance Simulator</h1>
  <div style="color: #666; margin-bottom: 30px;">Post-Mortem Report - Generated ${date}</div>
  
  <div class="summary">
    <h2>Executive Summary</h2>
    <div class="metric">
      <span class="metric-label">Total Decisions:</span>
      <span class="metric-value">${state.auditTrail.length}</span>
    </div>
    <div class="metric">
      <span class="metric-label">Total Turns:</span>
      <span class="metric-value">${state.turn}</span>
    </div>
    <div class="metric">
      <span class="metric-label">Final Phase:</span>
      <span class="metric-value">${state.phaseId}</span>
    </div>
    <div class="metric">
      <span class="metric-label">Measured Success Index:</span>
      <span class="metric-value">${(measuredIndex * 100).toFixed(1)}%</span>
    </div>
    <div class="metric">
      <span class="metric-label">Governance Debt Index:</span>
      <span class="metric-value">${(debtIndex * 100).toFixed(1)}%</span>
    </div>
  </div>

  <h2>Decision Timeline</h2>
  ${state.auditTrail.map((record: any) => `
    <div class="decision">
      <div class="decision-title">Turn ${record.turn}: ${record.nodeTitle}</div>
      <div class="decision-details">
        <strong>Choice:</strong> ${record.chosenLabel}<br>
        <strong>Owner:</strong> ${record.ownerRole}<br>
        <strong>Rationale:</strong> ${record.rationale || 'N/A'}<br>
        <strong>Assumptions:</strong> ${record.assumptions || 'None'}<br>
        <strong>Unmeasured Impact:</strong> ${record.unmeasuredImpact}
      </div>
    </div>
  `).join('')}

  <h2>Final Metrics</h2>
  <table>
    <thead>
      <tr>
        <th>Metric</th>
        <th>Value</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Production Efficiency</td>
        <td>${(state.metrics.measured.productionEfficiency * 100).toFixed(1)}%</td>
      </tr>
      <tr>
        <td>Welfare Standard Adoption</td>
        <td>${(state.metrics.measured.welfareStandardAdoption * 100).toFixed(1)}%</td>
      </tr>
      <tr>
        <td>Cost Per Unit</td>
        <td>${(state.metrics.measured.costPerUnit * 100).toFixed(1)}%</td>
      </tr>
      <tr>
        <td>Welfare Incident Rate</td>
        <td>${(state.metrics.measured.welfareIncidentRate * 100).toFixed(1)}%</td>
      </tr>
      <tr>
        <td>Welfare Debt</td>
        <td>${(state.metrics.unmeasured.welfareDebt * 100).toFixed(1)}%</td>
      </tr>
      <tr>
        <td>Enforcement Gap</td>
        <td>${(state.metrics.unmeasured.enforcementGap * 100).toFixed(1)}%</td>
      </tr>
      <tr>
        <td>Regulatory Capture</td>
        <td>${(state.metrics.unmeasured.regulatoryCapture * 100).toFixed(1)}%</td>
      </tr>
      <tr>
        <td>System Irreversibility</td>
        <td>${(state.metrics.unmeasured.systemIrreversibility * 100).toFixed(1)}%</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <p>Generated by Animal Welfare Governance Simulator</p>
    <p>This report represents a simulation of governance decisions and their impacts.</p>
  </div>
</body>
</html>
  `
}
