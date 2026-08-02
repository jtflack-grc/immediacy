import { State, Scenario } from '../engine/scenarioTypes'
import { getPhaseByNodeId } from '../engine/scenarioLoader'
import { calculateMeasuredSuccessIndex, calculateGovernanceDebtIndex } from '../engine/scoring'
import { getRelevantAnglesForPhase } from '../utils/longtermismMatching'

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

  // Get decisions made in this phase
  const phaseNodes = phase.nodes.map(n => n.id)
  const phaseDecisions = state.auditTrail.filter(record => 
    phaseNodes.includes(record.nodeId)
  )

  // Generate learning insights based on phase and metrics
  const getLearningInsights = () => {
    const insights: string[] = []
    
    if (phaseId === 'P1_FOUNDATION') {
      insights.push('Foundation decisions set the baseline for all future welfare protections.')
      insights.push('Early recognition of animal sentience creates stronger legal frameworks.')
      if (state.metrics.unmeasured.sentienceKnowledgeGap < 0.2) {
        insights.push('Your focus on research has reduced knowledge gaps about animal sentience.')
      }
      if (state.metrics.measured.welfareStandardAdoption > 0.6) {
        insights.push('Strong early adoption of welfare standards creates momentum for future improvements.')
      }
    } else if (phaseId === 'P2_IMPLEMENTATION') {
      insights.push('Implementation phase tests whether policies translate into real-world outcomes.')
      insights.push('Balancing enforcement with industry cooperation is critical during this phase.')
      if (state.metrics.unmeasured.enforcementGap < 0.2) {
        insights.push('Effective enforcement mechanisms are reducing the gap between policy and practice.')
      }
      if (state.metrics.unmeasured.regulatoryCapture > 0.5) {
        insights.push('High regulatory capture suggests industry influence may be compromising welfare goals.')
      }
    } else if (phaseId === 'P3_SCALING') {
      insights.push('Scaling requires balancing efficiency with welfare standards across diverse contexts.')
      insights.push('Global coordination becomes more important as systems expand.')
      if (state.metrics.measured.productionEfficiency > 0.7 && state.metrics.measured.welfareIncidentRate < 0.2) {
        insights.push('You\'ve achieved a strong balance between efficiency and welfare outcomes.')
      }
      if (state.metrics.unmeasured.welfareDebt > 0.5) {
        insights.push('Accumulated welfare debt suggests some decisions prioritized short-term gains over long-term welfare.')
      }
    } else if (phaseId === 'P4_ADAPTATION') {
      insights.push('Adaptation phase tests system resilience and ability to respond to new challenges.')
      insights.push('Flexibility becomes critical as systems mature and face unexpected pressures.')
      if (state.metrics.unmeasured.systemIrreversibility > 0.7) {
        insights.push('Low system irreversibility means you\'ve maintained flexibility for future changes.')
      } else {
        insights.push('High system irreversibility suggests some paths may be difficult to reverse.')
      }
    } else if (phaseId === 'P5_LEGACY') {
      insights.push('Legacy phase determines the long-term impact of your governance decisions.')
      insights.push('The choices made here will shape animal welfare for years to come.')
      if (measuredIndex > 0.7 && debtIndex < 0.3) {
        insights.push('Excellent balance: high measured success with low governance debt.')
      }
      if (debtIndex > 0.6) {
        insights.push('High governance debt indicates hidden costs that may emerge over time.')
      }
    }

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
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Success Index</div>
              <div style={{ fontSize: '28px', fontWeight: 600, color: '#4ade80' }}>
                {(measuredIndex * 100).toFixed(0)}%
              </div>
            </div>
            <div style={{ padding: '16px', backgroundColor: '#111111', borderRadius: '8px', border: '1px solid rgba(251, 146, 60, 0.2)' }}>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Debt Index</div>
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
