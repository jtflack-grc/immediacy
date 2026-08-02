import { useState, useEffect } from 'react'
import { Node } from '../engine/scenarioTypes'

interface QuickStartHelperProps {
  node: Node | null
  onQuickStart: (rationale: string, assumptions: string) => void
  isFirstTime: boolean
}

export default function QuickStartHelper({ node, onQuickStart, isFirstTime }: QuickStartHelperProps) {
  const [showHelper, setShowHelper] = useState(false)
  const [hasUsedQuickStart, setHasUsedQuickStart] = useState(() => {
    return localStorage.getItem('hasUsedQuickStart') === 'true'
  })

  useEffect(() => {
    // Show helper on first visit or if user hasn't used quick start yet
    if (isFirstTime && !hasUsedQuickStart && node) {
      setShowHelper(true)
    } else {
      setShowHelper(false)
    }
  }, [isFirstTime, hasUsedQuickStart, node])

  if (!node || !showHelper) return null

  const generateQuickStartContent = () => {
    // Generate context-aware quick start suggestions based on the node
    const nodeTitle = node.title.toLowerCase()
    
    let rationale = ''
    let assumptions = ''

    if (nodeTitle.includes('detect') || nodeTitle.includes('triage') || nodeTitle.includes('scope')) {
      rationale = 'Clarify blast radius and data types early so disclosure clocks start from real awareness, not optimistic silence.'
      assumptions = 'I assume incomplete forensics still beat invented certainty, and that facts gap compounds faster than burn.'
    } else if (nodeTitle.includes('contain') || nodeTitle.includes('isolate') || nodeTitle.includes('restore')) {
      rationale = 'Spend primary burn to regain operational control before adversary-driven disclosure writes the narrative.'
      assumptions = 'I assume containment that preserves evidence is worth short-term disruption if secondary loss drops.'
    } else if (nodeTitle.includes('disclos') || nodeTitle.includes('notice') || nodeTitle.includes('notify')) {
      rationale = 'Timed, factual notice pays down disclosure debt even when counsel wants more certainty.'
      assumptions = 'I assume regulators and customers punish drip truth more than imperfect-but-honest first notices.'
    } else if (nodeTitle.includes('ransom') || nodeTitle.includes('pay') || nodeTitle.includes('negotiat')) {
      rationale = 'Payment and public denial are commitment locks — price the secondary loss before locking the path.'
      assumptions = 'I assume FAIR-style ranges beat optimism-as-fiduciary-duty under extortion pressure.'
    } else if (nodeTitle.includes('board') || nodeTitle.includes('comms') || nodeTitle.includes('customer')) {
      rationale = 'Keep messaging aligned with ops truth to avoid narrative capture that will not survive a screenshot.'
      assumptions = 'I assume soft status pages age poorly under subpoena and trust-center scrutiny.'
    } else if (nodeTitle.includes('enforc') || nodeTitle.includes('regulat') || nodeTitle.includes('gdpr') || nodeTitle.includes('sec')) {
      rationale = 'Close regulatory clock lag relative to awareness; document the rationale either way.'
      assumptions = 'I assume “awaiting forensics” is a control only when it has a deadline, not an indefinite stall.'
    } else if (nodeTitle.includes('cross') || nodeTitle.includes('jurisdict') || nodeTitle.includes('global')) {
      rationale = 'Coordinate multi-jurisdiction notices so selective briefing does not create disclosure debt.'
      assumptions = 'I assume similarly situated customers deserve the same factual package across regions.'
    } else {
      rationale = 'This decision balances response burn against secondary disclosure loss — silence is still a choice.'
      assumptions = 'I assume choices compound on FAIR ranges: primary burn now can cut secondary loss later.'
    }

    return { rationale, assumptions }
  }

  const handleQuickStart = () => {
    const { rationale, assumptions } = generateQuickStartContent()
    onQuickStart(rationale, assumptions)
    setHasUsedQuickStart(true)
    setShowHelper(false)
    // Remember that user has used quick start
    localStorage.setItem('hasUsedQuickStart', 'true')
  }

  const handleDismiss = () => {
    setShowHelper(false)
    localStorage.setItem('hasUsedQuickStart', 'true')
  }

  return (
    <div style={{
      marginBottom: '20px',
      padding: '16px',
      backgroundColor: 'rgba(96, 165, 250, 0.1)',
      border: '1px solid rgba(96, 165, 250, 0.3)',
      borderRadius: '8px',
      position: 'relative'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '12px'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#60a5fa',
            marginBottom: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>⚡ Quick Start</span>
          </div>
          <div style={{
            fontSize: '12px',
            color: '#ccc',
            lineHeight: '1.5'
          }}>
            New to this? Click "Use Quick Start" to auto-fill reasonable assumptions and rationale for this decision. 
            You can still edit them before submitting.
          </div>
        </div>
        <button
          onClick={handleDismiss}
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
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          ×
        </button>
      </div>
      <button
        onClick={handleQuickStart}
        style={{
          padding: '8px 16px',
          fontSize: '13px',
          fontWeight: 600,
          backgroundColor: '#60a5fa',
          color: '#000',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#4a9eff'
          e.currentTarget.style.transform = 'scale(1.02)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#60a5fa'
          e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        Use Quick Start
      </button>
    </div>
  )
}
