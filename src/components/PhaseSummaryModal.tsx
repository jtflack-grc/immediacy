import { State, Scenario } from '../engine/scenarioTypes'
import { calculateMeasuredSuccessIndex, calculateGovernanceDebtIndex } from '../engine/scoring'
import { getRelevantSecurityCardsForPhase } from '../utils/securityResearchMatching'

interface PhaseSummaryModalProps {
  phaseId: string | null
  scenario: Scenario | null
  state: State | null
  onClose: () => void
}

export default function PhaseSummaryModal({ phaseId, scenario, state, onClose }: PhaseSummaryModalProps) {
  if (!phaseId || !scenario || !state) return null

  const phase = scenario.phases.find(p => p.id === phaseId)
  if (!phase) return null

  const measuredIndex = calculateMeasuredSuccessIndex(state.metrics.measured)
  const debtIndex = calculateGovernanceDebtIndex(state.metrics.unmeasured)
  const researchCards = getRelevantSecurityCardsForPhase(phaseId, state)

  const phaseNodes = phase.nodes.map(n => n.id)
  const phaseDecisions = state.auditTrail.filter(record =>
    phaseNodes.includes(record.nodeId)
  )

  const getLearningInsights = () => {
    const insights: string[] = []

    if (phaseId.includes('DETECTION')) {
      insights.push('Detection choices set whether the war room owns the clock — or the adversary does.')
      insights.push('Under-scoping feels calm; it often becomes disclosure debt.')
      if (state.metrics.unmeasured.sentienceKnowledgeGap < 0.25) {
        insights.push('Facts gap is tightening — notice content can get more specific.')
      }
      if (state.metrics.measured.welfareStandardAdoption > 0.8) {
        insights.push('Disclosure posture is strengthening early — keep timed checkpoints.')
      }
    } else if (phaseId.includes('CONTAINMENT')) {
      insights.push('Containment trades uptime for blast-radius control. Misconfiguration debt shows up here.')
      insights.push('Extortion notes force adversary-driven disclosure timelines.')
      if (state.metrics.measured.productionEfficiency > 0.55) {
        insights.push('Operational control is holding under pressure.')
      }
      if (state.metrics.unmeasured.systemIrreversibility > 0.4) {
        insights.push('Commitment lock is rising — payments and hard statements get expensive to unwind.')
      }
    } else if (phaseId.includes('DISCLOSURE')) {
      insights.push('Regulator clocks, board slides, and the first public sentence are commitment locks.')
      insights.push('FAIR ranges beat false precision when facts are incomplete.')
      if (state.metrics.unmeasured.enforcementGap < 0.25) {
        insights.push('Regulatory clock lag is under control — document the awareness rationale.')
      }
      if (state.metrics.unmeasured.regulatoryCapture > 0.45) {
        insights.push('Narrative capture is high — messaging may be drifting from operational truth.')
      }
    } else if (phaseId.includes('STAKEHOLDER')) {
      insights.push('Employees, insurers, press, and customers are parallel disclosure channels.')
      insights.push('Fairness across similarly situated customers is part of the control.')
      if (state.metrics.unmeasured.welfareDebt > 0.45) {
        insights.push('Disclosure debt is compounding — silence and drip truth are catching up.')
      }
    } else if (phaseId.includes('AFTERMATH')) {
      insights.push('Aftermath locks what becomes permanent posture vs theater.')
      insights.push('Attribution and vendor blame narratives are easy commitment locks.')
      if (measuredIndex > 0.65 && debtIndex < 0.35) {
        insights.push('Strong balance: control holding with manageable disclosure debt.')
      }
      if (debtIndex > 0.55) {
        insights.push('High disclosure debt — the story may not survive the next screenshot.')
      }
    } else {
      insights.push('Every second counted. Review research-lab frameworks for the next phase.')
    }

    researchCards.slice(0, 2).forEach(card => {
      insights.push(`${card.framework}: ${card.title} — ${card.keyQuestions[0]}`)
    })

    return insights
  }

  const insights = getLearningInsights()

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }} onClick={onClose}>
      <div style={{
        backgroundColor: '#000000',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        maxWidth: '700px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '32px'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#fff', margin: 0 }}>
            Phase Complete: {phase.title}
          </h2>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '28px',
              cursor: 'pointer',
              padding: '0',
              width: '32px',
              height: '32px',
              lineHeight: '1'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#111111', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div style={{ fontSize: '14px', color: '#aaa', lineHeight: '1.6' }}>
            {phase.description}
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>
            Decisions Made
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {phaseDecisions.length > 0 ? (
              phaseDecisions.map((decision, idx) => (
                <div key={idx} style={{
                  padding: '12px',
                  backgroundColor: '#111111',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                    {decision.nodeTitle}
                  </div>
                  <div style={{ fontSize: '13px', color: '#aaa' }}>
                    {decision.chosenLabel}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ fontSize: '13px', color: '#666', fontStyle: 'italic' }}>
                No decisions recorded in this phase.
              </div>
            )}
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>
            Current Metrics
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ padding: '16px', backgroundColor: '#111111', borderRadius: '8px', border: '1px solid rgba(74, 222, 128, 0.2)' }}>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Control Index</div>
              <div style={{ fontSize: '28px', fontWeight: 600, color: '#4ade80' }}>
                {(measuredIndex * 100).toFixed(0)}%
              </div>
            </div>
            <div style={{ padding: '16px', backgroundColor: '#111111', borderRadius: '8px', border: '1px solid rgba(251, 146, 60, 0.2)' }}>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Disclosure Debt</div>
              <div style={{ fontSize: '28px', fontWeight: 600, color: '#fb923c' }}>
                {(debtIndex * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>
            Key Learnings
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {insights.map((insight, idx) => (
              <div key={idx} style={{
                padding: '14px',
                backgroundColor: '#111111',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <div style={{ fontSize: '18px', color: '#4ade80', flexShrink: 0, fontWeight: 600 }}>•</div>
                <div style={{ fontSize: '14px', color: '#ccc', lineHeight: '1.6', flex: 1 }}>
                  {insight}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: '#111111',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: 600
          }}
        >
          Continue to Next Phase
        </button>
      </div>
    </div>
  )
}
