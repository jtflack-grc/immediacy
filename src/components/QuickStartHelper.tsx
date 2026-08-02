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

    if (nodeTitle.includes('sentience')) {
      rationale = 'Recognizing sentience broadly establishes a stronger legal foundation for future protections, even if it requires more political capital upfront.'
      assumptions = 'I assume that legal recognition of sentience will enable stronger welfare protections over time, and that political resistance can be managed through careful framing.'
    } else if (nodeTitle.includes('farm') || nodeTitle.includes('standard')) {
      rationale = 'Mandatory baseline standards ensure consistent welfare improvements across regions, though enforcement will be challenging.'
      assumptions = 'I assume that mandatory standards will be more effective than voluntary ones, and that industry will adapt rather than resist strongly.'
    } else if (nodeTitle.includes('factory') || nodeTitle.includes('intensive')) {
      rationale = 'Phased mandatory standards balance welfare improvements with industry transition needs, reducing resistance while making progress.'
      assumptions = 'I assume that gradual implementation allows industry to adapt, and that transition support reduces economic disruption.'
    } else if (nodeTitle.includes('alternative') || nodeTitle.includes('protein')) {
      rationale = 'Supporting alternative proteins reduces long-term animal suffering while maintaining food security during transition.'
      assumptions = 'I assume that alternative proteins will scale effectively, and that supporting them now accelerates adoption without creating dependency.'
    } else if (nodeTitle.includes('wildlife') || nodeTitle.includes('conservation')) {
      rationale = 'Balancing conservation with welfare recognizes that wild animals deserve protection while maintaining ecosystem health.'
      assumptions = 'I assume that conservation and welfare goals can be aligned, and that protecting wildlife habitats benefits both wild and farmed animals.'
    } else if (nodeTitle.includes('enforcement')) {
      rationale = 'Building enforcement capacity ensures policies translate into real-world outcomes, though it requires sustained investment.'
      assumptions = 'I assume that enforcement capacity is critical for policy effectiveness, and that underfunding creates gaps that undermine welfare goals.'
    } else if (nodeTitle.includes('international') || nodeTitle.includes('standard')) {
      rationale = 'International coordination creates consistent welfare standards, reducing regulatory arbitrage and improving global outcomes.'
      assumptions = 'I assume that international standards can be harmonized despite different contexts, and that coordination reduces race-to-the-bottom dynamics.'
    } else {
      // Generic fallback
      rationale = 'This decision balances immediate welfare improvements with long-term system sustainability, considering both measured outcomes and hidden costs.'
      assumptions = 'I assume that decisions made now will compound over time, and that balancing short-term gains with long-term welfare is essential.'
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
