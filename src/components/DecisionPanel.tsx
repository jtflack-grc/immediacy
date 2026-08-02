import { useState, useEffect, useCallback, useMemo } from 'react'
import { Node, State } from '../engine/scenarioTypes'
import AdvisorPanel from './AdvisorPanel'
import { calculateImpactPreview } from '../utils/impactPreview'
import { getRelevantAnglesForNode } from '../utils/longtermismMatching'
import QuickStartHelper from './QuickStartHelper'
import ContextualTooltip from './ContextualTooltip'
import MoralUncertaintyNote from './MoralUncertaintyNote'
import { glossary } from '../utils/glossary'
import { shuffleWithIndices } from '../utils/shuffle'
import AIChatInterface from './AIChatInterface'

// Header status-indicator animations
const tempoAnimations = document.createElement('style')
tempoAnimations.textContent = `
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.7;
      transform: scale(0.95);
    }
  }
  @keyframes ripple {
    0% {
      transform: scale(1);
      opacity: 0.6;
    }
    100% {
      transform: scale(2);
      opacity: 0;
    }
  }
  @keyframes shimmer {
    0%, 100% {
      opacity: 0.6;
      transform: translateX(-100%) translateY(-100%);
    }
    50% {
      opacity: 0.8;
      transform: translateX(100%) translateY(100%);
    }
  }
`
if (!document.head.querySelector('style[data-tempo-animations]')) {
  tempoAnimations.setAttribute('data-tempo-animations', 'true')
  document.head.appendChild(tempoAnimations)
}

interface DecisionPanelProps {
  node: Node | null
  state: State | null
  onChoice: (choiceIndex: number, ownerRole: string, rationale: string, assumptions: string, preserveAssumptions: boolean) => void
  turn: number
  onReset: () => void
}

const OWNER_ROLES = [
  'Incident Commander',
  'CISO',
  'Crisis Counsel',
  'Comms Lead',
  'Privacy Officer',
  'IR Lead',
  'Board Liaison',
  'Privacy Counsel',
  'SOC Manager',
  'Customer Trust Lead',
]

export default function DecisionPanel({ node, state, onChoice, turn, onReset }: DecisionPanelProps) {
  const [ownerRole, setOwnerRole] = useState(OWNER_ROLES[0])
  const [rationale, setRationale] = useState('')
  const [assumptions, setAssumptions] = useState('')
  const [preserveAssumptions, setPreserveAssumptions] = useState(false)
  const [hoveredChoice, setHoveredChoice] = useState<number | null>(null)
  const [isFirstTime, setIsFirstTime] = useState(() => {
    return !localStorage.getItem('hasUsedQuickStart')
  })
  const [choicesReady, setChoicesReady] = useState(false)

  const handleQuickStart = useCallback((quickRationale: string, quickAssumptions: string) => {
    setRationale(quickRationale)
    setAssumptions(quickAssumptions)
  }, [])

  // Shuffle choices deterministically based on node ID (same node always has same order)
  const shuffledChoices = useMemo(() => {
    if (!node) return []
    const seed = node.id // Deterministic per node - same node always has same order
    return shuffleWithIndices(node.choices, seed)
  }, [node?.id, node?.choices])

  const handleChoiceClick = useCallback((originalIndex: number) => {
    onChoice(originalIndex, ownerRole, rationale || 'No rationale provided', assumptions || 'No assumptions recorded', preserveAssumptions)
    // Reset form
    setRationale('')
    setAssumptions('')
    setPreserveAssumptions(false)
  }, [onChoice, ownerRole, rationale, assumptions, preserveAssumptions])

  // Reset choices ready when node changes
  useEffect(() => {
    setChoicesReady(false)
  }, [node?.id])

  // Keyboard shortcuts - memoize handler to avoid recreating listener
  useEffect(() => {
    if (!node || !state || shuffledChoices.length === 0 || !choicesReady) return

    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle if not typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }
      
      // Number keys 1-9 to select choices (mapped to shuffled positions)
      const choiceNum = parseInt(e.key)
      if (choiceNum >= 1 && choiceNum <= shuffledChoices.length) {
        const shuffledIndex = choiceNum - 1
        const { item: choice, originalIndex } = shuffledChoices[shuffledIndex]
        
        // Check if choice is locked
        const isLocked = state.metrics.unmeasured.systemIrreversibility > 0.8 && 
                        choice.delta.locks && choice.delta.locks.length > 0
        const choiceId = `C${originalIndex + 1}`
        const isThisChoiceLocked = isLocked && choice.delta.locks?.includes(choiceId)
        
        if (!isThisChoiceLocked) {
          handleChoiceClick(originalIndex)
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [node?.id, shuffledChoices, state?.metrics.unmeasured.systemIrreversibility, handleChoiceClick])

  if (!node) {
    return (
      <div>
        <h2 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: 600, color: '#fff' }}>
          IMMEDIACY
        </h2>
        <div style={{ color: '#888', padding: '20px' }}>
          No decision node available.
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* TEMPO — war-room briefing header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '24px',
        padding: '20px',
        paddingBottom: '20px',
        background: 'linear-gradient(135deg, rgba(15, 15, 15, 0.8) 0%, rgba(10, 10, 10, 0.9) 100%)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle background glow */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-20%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(96, 165, 250, 0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />
        
        {/* Premium Icon/Logo Element */}
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.2) 0%, rgba(139, 92, 246, 0.2) 50%, rgba(236, 72, 153, 0.15) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          position: 'relative',
          boxShadow: '0 4px 12px rgba(96, 165, 250, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          overflow: 'hidden'
        }}>
          {/* Animated gradient overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)',
            opacity: 0.6,
            animation: 'shimmer 3s ease-in-out infinite'
          }} />
          {/* Central icon element */}
          <div style={{
            width: '18px',
            height: '18px',
            borderRadius: '4px',
            background: 'linear-gradient(135deg, #60a5fa 0%, #8b5cf6 50%, #ec4899 100%)',
            boxShadow: '0 0 12px rgba(96, 165, 250, 0.6), 0 2px 4px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            zIndex: 1,
            transform: 'rotate(45deg)'
          }}>
            <div style={{
              position: 'absolute',
              inset: '2px',
              borderRadius: '2px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%)'
            }} />
          </div>
        </div>
        
        {/* Brand Name & Details */}
        <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '6px'
          }}>
            <h2 style={{
              fontSize: '22px',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.9) 50%, rgba(200, 200, 200, 0.8) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              letterSpacing: '-0.02em',
              margin: 0,
              lineHeight: 1.2,
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
            }}>
              TEMPO
            </h2>
            
            {/* Premium Status Indicator */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 10px',
              paddingLeft: '12px',
              borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '6px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{
                position: 'relative',
                width: '8px',
                height: '8px'
              }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  backgroundColor: '#4ade80',
                  boxShadow: '0 0 8px rgba(74, 222, 128, 0.6), 0 0 16px rgba(74, 222, 128, 0.3)',
                  animation: 'pulse 2s ease-in-out infinite'
                }} />
                <div style={{
                  position: 'absolute',
                  inset: '-2px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(74, 222, 128, 0.2)',
                  animation: 'ripple 2s ease-out infinite'
                }} />
              </div>
              <span style={{
                fontSize: '10px',
                fontWeight: 500,
                color: '#4ade80',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                textShadow: '0 0 8px rgba(74, 222, 128, 0.3)'
              }}>
                Live
              </span>
            </div>
          </div>
          
          {/* Premium Tagline */}
          <div style={{
            fontSize: '12px',
            fontWeight: 400,
            color: '#999',
            letterSpacing: '0.02em',
            marginTop: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>War-room briefing</span>
            <span style={{ color: '#555', fontSize: '10px' }}>•</span>
            <span style={{ 
              fontSize: '11px',
              color: '#666',
              fontStyle: 'italic'
            }}>
              Every second counts
            </span>
          </div>
        </div>
      </div>
      
      {/* Quick Start Helper */}
      <QuickStartHelper 
        node={node} 
        onQuickStart={handleQuickStart}
        isFirstTime={isFirstTime}
      />
      
      {/* Briefing feed — animations off by default */}
      <div style={{ 
        marginBottom: '20px', 
        backgroundColor: '#000000', 
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        minHeight: '400px',
        maxHeight: '600px',
        overflow: 'hidden'
      }}>
        <AIChatInterface
          node={node}
          turn={turn}
          state={state}
          skipAnimation={true}
          onChoicesReady={() => setChoicesReady(true)}
        />
      </div>

      {/* Advisor Recommendations */}
      <AdvisorPanel node={node} compact={true} />

      {/* Owner Role Selection */}
      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', fontSize: '11px', color: '#aaa', marginBottom: '4px' }}>
          Judgment Owner
        </label>
        <select
          value={ownerRole}
          onChange={(e) => setOwnerRole(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: '#000000',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
            fontSize: '13px'
          }}
        >
          {OWNER_ROLES.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>

      {/* Rationale Input */}
      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', fontSize: '11px', color: '#aaa', marginBottom: '4px' }}>
          Rationale <span style={{ fontSize: '10px', color: '#666' }}>(optional)</span>
        </label>
        <textarea
          value={rationale}
          onChange={(e) => setRationale(e.target.value)}
          placeholder="Why this choice? (optional - helps you reflect on your reasoning)"
          style={{
            width: '100%',
            padding: '6px',
            backgroundColor: '#000000',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
            fontSize: '12px',
            minHeight: '40px',
            resize: 'vertical'
          }}
        />
      </div>

      {/* Assumptions Input */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', fontSize: '11px', color: '#aaa', marginBottom: '4px' }}>
          <ContextualTooltip
            term={glossary.assumptions.term}
            definition={glossary.assumptions.definition}
            position="top"
          >
            <span>Assumptions</span>
          </ContextualTooltip> <span style={{ fontSize: '10px', color: '#666' }}>(optional)</span>
        </label>
        <textarea
          value={assumptions}
          onChange={(e) => setAssumptions(e.target.value)}
          placeholder="What assumptions are you making? (optional - but helps track your reasoning)"
          style={{
            width: '100%',
            padding: '6px',
            backgroundColor: '#000000',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
            fontSize: '12px',
            minHeight: '40px',
            resize: 'vertical'
          }}
        />
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginTop: '8px', 
          fontSize: '12px', 
          color: '#aaa',
          cursor: 'pointer'
        }}>
          <input
            type="checkbox"
            checked={preserveAssumptions}
            onChange={(e) => setPreserveAssumptions(e.target.checked)}
            style={{ marginRight: '6px', cursor: 'pointer' }}
          />
          Preserve assumptions (
          <ContextualTooltip
            term={glossary.memoryDecay.term}
            definition={glossary.memoryDecay.definition}
            position="top"
          >
            <span>reaffirm existing assumptions</span>
          </ContextualTooltip>
          )
        </label>
      </div>

      {/* Choice Buttons - Show after chat messages complete */}
      {choicesReady && (
        <div style={{
          backgroundColor: '#000000',
          paddingTop: '20px',
          marginTop: '20px',
          borderTop: '2px solid rgba(255, 255, 255, 0.15)',
          opacity: choicesReady ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}>
          <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            SELECT DECISION: <span style={{ fontSize: '10px', color: '#666', fontWeight: 400 }}>(Press 1-{shuffledChoices.length})</span>
          </div>
        {shuffledChoices.map(({ item: choice, originalIndex }, shuffledIdx) => {
        // Check if choice is locked (systemIrreversibility too high)
        const isLocked = state && state.metrics.unmeasured.systemIrreversibility > 0.8 && 
                        choice.delta.locks && choice.delta.locks.length > 0
        const choiceId = `C${originalIndex + 1}`
        const isThisChoiceLocked = isLocked && choice.delta.locks?.includes(choiceId)
        const isHovered = hoveredChoice === shuffledIdx
        const preview = isHovered && state ? calculateImpactPreview(state, choice.delta) : null
        
        return (
          <div key={`${node.id}-${originalIndex}`} style={{ marginBottom: '16px', position: 'relative' }}>
            <button
              onClick={() => !isThisChoiceLocked && handleChoiceClick(originalIndex)}
              disabled={isThisChoiceLocked || false}
              style={{
                width: '100%',
                padding: '20px 24px',
                background: isThisChoiceLocked 
                  ? '#111111' 
                  : 'linear-gradient(135deg, rgba(30, 30, 30, 0.95) 0%, rgba(20, 20, 20, 0.95) 100%)',
                color: isThisChoiceLocked ? '#666' : '#ffffff',
                border: isThisChoiceLocked 
                  ? '1px solid rgba(255, 255, 255, 0.1)' 
                  : '2px solid rgba(96, 165, 250, 0.4)',
                borderRadius: '12px',
                cursor: isThisChoiceLocked ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 600,
                transition: 'all 0.3s ease',
                boxShadow: isThisChoiceLocked 
                  ? 'none' 
                  : '0 4px 12px rgba(0, 0, 0, 0.6), 0 0 20px rgba(96, 165, 250, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                textAlign: 'center',
                opacity: isThisChoiceLocked ? 0.5 : 1,
                position: 'relative',
                lineHeight: '1.4',
                letterSpacing: '0.02em',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                if (!isThisChoiceLocked && state) {
                  setHoveredChoice(shuffledIdx)
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(40, 50, 70, 0.95) 0%, rgba(30, 40, 60, 0.95) 100%)'
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.8), 0 0 30px rgba(96, 165, 250, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                  e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.7)'
                }
              }}
              onMouseLeave={(e) => {
                setHoveredChoice(null)
                if (!isThisChoiceLocked) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(30, 30, 30, 0.95) 0%, rgba(20, 20, 20, 0.95) 100%)'
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.6), 0 0 20px rgba(96, 165, 250, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.4)'
                }
              }}
            >
              <span style={{ 
                fontSize: '14px', 
                opacity: 0.8, 
                marginRight: '12px', 
                fontWeight: 700,
                color: isThisChoiceLocked ? '#666' : '#60a5fa'
              }}>
                [{shuffledIdx + 1}]
              </span>
              {choice.label}
            </button>
            {isThisChoiceLocked && (
              <div style={{
                fontSize: '13px',
                color: '#ef4444',
                marginTop: '8px',
                padding: '10px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '6px',
                fontWeight: 500
              }}>
                Locked: <ContextualTooltip
                  term={glossary.systemIrreversibility.term}
                  definition={glossary.systemIrreversibility.definition}
                  position="top"
                >
                  <span>Irreversibility</span>
                </ContextualTooltip> &gt; 80%
              </div>
            )}
            
            {/* Impact Preview Tooltip */}
            {isHovered && preview && !isThisChoiceLocked && (
              <div style={{
                position: 'absolute',
                left: 'calc(100% + 12px)',
                top: 0,
                backgroundColor: '#000000',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '12px',
                minWidth: '250px',
                maxWidth: '300px',
                zIndex: 1000,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                pointerEvents: 'none'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
                  📊 Predicted Impact:
                </div>
                {preview.measured.length > 0 && (
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '10px', color: '#888', marginBottom: '4px' }}>Measured:</div>
                    {preview.measured.map((m, i) => (
                      <div key={i} style={{ fontSize: '11px', color: m.direction === 'up' ? '#4ade80' : '#f87171', marginLeft: '8px' }}>
                        {m.direction === 'up' ? '↑' : '↓'} {m.metric.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: {(m.change * 100).toFixed(0)}%
                      </div>
                    ))}
                  </div>
                )}
                {preview.unmeasured.length > 0 && (
                  <div>
                    <div style={{ fontSize: '10px', color: '#888', marginBottom: '4px' }}>Governance Debt:</div>
                    {preview.unmeasured.map((m, i) => (
                      <div key={i} style={{ fontSize: '11px', color: m.direction === 'up' ? '#fb923c' : '#4ade80', marginLeft: '8px' }}>
                        {m.direction === 'up' ? '↑' : '↓'} {m.metric.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: {(m.change * 100).toFixed(0)}%
                      </div>
                    ))}
                  </div>
                )}
                {preview.measured.length === 0 && preview.unmeasured.length === 0 && (
                  <div style={{ fontSize: '11px', color: '#888', fontStyle: 'italic' }}>
                    No significant metric changes
                  </div>
                )}
              </div>
            )}
          </div>
        )
        })}
        </div>
      )}

      {/* Reset Button */}
      <button
        onClick={onReset}
        style={{
          width: '100%',
          padding: '20px 24px',
          marginTop: '20px',
          background: 'linear-gradient(135deg, rgba(30, 30, 30, 0.95) 0%, rgba(20, 20, 20, 0.95) 100%)',
          color: '#ffffff',
          border: '2px solid rgba(96, 165, 250, 0.4)',
          borderRadius: '12px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 600,
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.6), 0 0 20px rgba(96, 165, 250, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          textAlign: 'center',
          position: 'relative',
          lineHeight: '1.4',
          letterSpacing: '0.02em',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(40, 50, 70, 0.95) 0%, rgba(30, 40, 60, 0.95) 100%)'
          e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)'
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.8), 0 0 30px rgba(96, 165, 250, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
          e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.7)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(30, 30, 30, 0.95) 0%, rgba(20, 20, 20, 0.95) 100%)'
          e.currentTarget.style.transform = 'translateY(0) scale(1)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.6), 0 0 20px rgba(96, 165, 250, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.4)'
        }}
      >
        Reset Run
      </button>

    </div>
  )
}
