import { useState, useEffect, useMemo } from 'react'
import { Node, State, Scenario } from '../engine/scenarioTypes'
import { getPhaseByNodeId } from '../engine/scenarioLoader'
import ContextualTooltip from './ContextualTooltip'
import { glossary } from '../utils/glossary'

interface LearningSidebarProps {
  node: Node | null
  state: State | null
  scenario: Scenario | null
  isCollapsed: boolean
  onToggle: () => void
}

export default function LearningSidebar({ node, state, scenario, isCollapsed, onToggle }: LearningSidebarProps) {
  const [currentConcepts, setCurrentConcepts] = useState<string[]>([])

  // Determine what concepts are relevant based on current node and phase
  useEffect(() => {
    if (!node || !state || !scenario) {
      setCurrentConcepts([])
      return
    }

    const phaseId = getPhaseByNodeId(scenario, node.id) || state.phaseId
    const phase = scenario.phases.find(p => p.id === phaseId)
    const concepts: string[] = []

    // Phase-specific concepts
    if (phaseId === 'P1_FOUNDATION') {
      concepts.push('sentienceKnowledgeGap', 'welfareStandardAdoption', 'assumptions')
    } else if (phaseId === 'P2_SCALE') {
      concepts.push('welfareDebt', 'productionEfficiency', 'enforcementGap')
    } else if (phaseId === 'P3_ENFORCEMENT') {
      concepts.push('enforcementGap', 'regulatoryCapture', 'measuredMetrics', 'unmeasuredMetrics')
    } else if (phaseId === 'P4_INTEGRATION') {
      concepts.push('systemIrreversibility', 'welfareDebt', 'memoryDecay')
    } else if (phaseId === 'P5_IRREVERSIBILITY') {
      concepts.push('systemIrreversibility', 'debtIndex', 'successIndex')
    }

    // Node-specific concepts based on title/content
    const nodeTitle = node.title.toLowerCase()
    if (nodeTitle.includes('sentience')) {
      concepts.push('sentienceKnowledgeGap')
    }
    if (nodeTitle.includes('enforcement') || nodeTitle.includes('compliance')) {
      concepts.push('enforcementGap', 'regulatoryCapture')
    }
    if (nodeTitle.includes('alternative') || nodeTitle.includes('protein')) {
      concepts.push('welfareDebt', 'systemIrreversibility')
    }
    if (nodeTitle.includes('international') || nodeTitle.includes('standard')) {
      concepts.push('regulatoryCapture', 'welfareStandardAdoption')
    }

    // Add metrics that are currently being affected
    if (state.metrics.unmeasured.welfareDebt > 0.3) {
      concepts.push('welfareDebt')
    }
    if (state.metrics.unmeasured.enforcementGap > 0.3) {
      concepts.push('enforcementGap')
    }
    if (state.metrics.unmeasured.systemIrreversibility > 0.5) {
      concepts.push('systemIrreversibility')
    }

    // Remove duplicates
    setCurrentConcepts([...new Set(concepts)])
  }, [node?.id, state?.phaseId, state?.metrics, scenario])

  const phase = useMemo(() => {
    if (!scenario || !node || !state) return null
    const phaseId = getPhaseByNodeId(scenario, node.id) || state.phaseId
    return scenario.phases.find(p => p.id === phaseId) || null
  }, [scenario, node, state])

  const learningObjectives = useMemo(() => {
    if (!phase) return []
    
    const phaseId = phase.id
    if (phaseId === 'P1_FOUNDATION') {
      return [
        'How early decisions set the foundation for all future welfare protections',
        'Why recognizing animal sentience legally matters for long-term outcomes',
        'How assumptions about welfare can decay if not reaffirmed'
      ]
    } else if (phaseId === 'P2_SCALE') {
      return [
        'How scaling welfare systems creates new challenges and tradeoffs',
        'Why efficiency gains can conflict with welfare improvements',
        'How welfare debt accumulates even when measured outcomes look good'
      ]
    } else if (phaseId === 'P3_ENFORCEMENT') {
      return [
        'Why enforcement gaps emerge between policy and practice',
        'How regulatory capture can undermine welfare goals',
        'The difference between measured outcomes and hidden risks'
      ]
    } else if (phaseId === 'P4_INTEGRATION') {
      return [
        'How systems become harder to change as they mature',
        'Why integration creates dependencies that are hard to reverse',
        'How memory decay weakens institutional commitment to welfare'
      ]
    } else if (phaseId === 'P5_IRREVERSIBILITY') {
      return [
        'How governance decisions compound into long-term system constraints',
        'Why reversing welfare systems becomes difficult over time',
        'The relationship between success metrics and hidden debt'
      ]
    }
    return []
  }, [phase])

  // Don't render if essential data is missing (after hooks)
  if (!scenario || !state || !node) {
    return null
  }

  if (isCollapsed) {
    return (
      <div style={{
        position: 'fixed',
        right: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 1000,
        cursor: 'pointer'
      }}
      onClick={onToggle}
      >
        <div style={{
          backgroundColor: 'rgba(96, 165, 250, 0.2)',
          border: '1px solid rgba(96, 165, 250, 0.4)',
          borderRadius: '8px 0 0 8px',
          padding: '12px 8px',
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          color: '#60a5fa',
          fontSize: '12px',
          fontWeight: 600,
          letterSpacing: '1px'
        }}>
          What am I learning?
        </div>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      right: 0,
      top: '60px', // Below header
      bottom: 0,
      width: '320px',
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
      zIndex: 1000,
      overflowY: 'auto',
      backdropFilter: 'blur(10px)',
      boxShadow: '-4px 0 12px rgba(0, 0, 0, 0.5)'
    }}>
      <div style={{
        padding: '20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        zIndex: 10
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: 600,
          color: '#60a5fa',
          margin: 0
        }}>
          What am I learning?
        </h3>
        <button
          onClick={onToggle}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#888',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '0',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Current Phase */}
        {phase && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              fontSize: '11px',
              color: '#888',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '8px'
            }}>
              Current Phase
            </div>
            <div style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#fff',
              marginBottom: '4px'
            }}>
              {phase.title}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#aaa',
              lineHeight: '1.5'
            }}>
              {phase.description}
            </div>
          </div>
        )}

        {/* Learning Objectives */}
        {learningObjectives.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              fontSize: '11px',
              color: '#888',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '12px'
            }}>
              Learning Objectives
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {learningObjectives.map((objective, idx) => (
                <div key={idx} style={{
                  padding: '10px',
                  backgroundColor: 'rgba(96, 165, 250, 0.1)',
                  borderRadius: '6px',
                  border: '1px solid rgba(96, 165, 250, 0.2)',
                  fontSize: '12px',
                  color: '#ccc',
                  lineHeight: '1.5',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}>
                  <span style={{ color: '#60a5fa', fontSize: '14px', flexShrink: 0 }}>•</span>
                  <span>{objective}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Concepts */}
        {currentConcepts.length > 0 && (
          <div>
            <div style={{
              fontSize: '11px',
              color: '#888',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '12px'
            }}>
              Key Concepts
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {currentConcepts.map((conceptKey) => {
                const term = glossary[conceptKey]
                if (!term) return null
                
                return (
                  <ContextualTooltip
                    key={conceptKey}
                    term={term.term}
                    definition={term.definition}
                    position="left"
                  >
                    <div style={{
                      padding: '10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '6px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      fontSize: '12px',
                      color: '#fff',
                      cursor: 'help'
                    }}>
                      <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                        {term.term}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: '#aaa',
                        lineHeight: '1.4'
                      }}>
                        {term.definition.substring(0, 100)}...
                      </div>
                    </div>
                  </ContextualTooltip>
                )
              })}
            </div>
          </div>
        )}

        {/* Helpful Tip */}
        <div style={{
          marginTop: '24px',
          padding: '12px',
          backgroundColor: 'rgba(74, 222, 128, 0.1)',
          borderRadius: '6px',
          border: '1px solid rgba(74, 222, 128, 0.2)',
          fontSize: '11px',
          color: '#4ade80',
          lineHeight: '1.5'
        }}>
          <strong>Tip:</strong> Hover over underlined terms throughout the app to see detailed definitions. Your decisions affect both measured outcomes and hidden governance debt.
        </div>
      </div>
    </div>
  )
}
