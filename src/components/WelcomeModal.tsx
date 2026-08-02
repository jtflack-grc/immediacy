import { useState, useEffect } from 'react'
import { t } from '../utils/i18n'

interface WelcomeModalProps {
  onClose: () => void
}

export default function WelcomeModal({ onClose }: WelcomeModalProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 300)
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '16px',
      boxSizing: 'border-box',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch' as any,
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.3s ease'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '700px',
        padding: '24px',
        backgroundColor: '#0a0a0a',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)'
      }}>
        <div style={{
          fontSize: '28px',
          fontWeight: 700,
          color: '#fff',
          marginBottom: '12px',
          textAlign: 'center'
        }}>
          IMMEDIACY
        </div>

        <div style={{
          fontSize: '13px',
          color: '#888',
          marginBottom: '30px',
          textAlign: 'center',
          fontStyle: 'italic'
        }}>
          Every second counts — a short-horizon disclosure war game
        </div>

        <div style={{
          marginBottom: '24px',
          padding: '20px',
          backgroundColor: 'rgba(96, 165, 250, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(96, 165, 250, 0.3)'
        }}>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#60a5fa', marginBottom: '12px' }}>
            {t('welcome.whatThisIs')}
          </div>
          <div style={{ fontSize: '14px', color: '#ddd', lineHeight: '1.6' }}>
            This is a <strong>seat-of-the-pants disclosure simulator</strong>, not a prediction engine.
            You sit in the crisis room while Legal, HR, Tech, Comms, and the Board pull in different directions.
            Silence is a choice. So is oversharing. Every delay, leak, and half-truth changes the clock.
          </div>
        </div>

        <div style={{
          marginBottom: '24px',
          padding: '20px',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(139, 92, 246, 0.3)'
        }}>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#8b5cf6', marginBottom: '12px' }}>
            Pressure, Not Perfect Plans
          </div>
          <div style={{ fontSize: '14px', color: '#ddd', lineHeight: '1.6' }}>
            Most governance sims ask what compounds over decades. Immediacy asks what breaks in the next hour.
            <strong> Disclosure debt</strong>, <strong>narrative integrity</strong>, and the <strong>clock</strong> track how
            fast you lose control of the story — and whether regulators, reporters, or threat actors get there first.
          </div>
        </div>

        <div style={{
          marginBottom: '24px',
          padding: '20px',
          backgroundColor: 'rgba(251, 146, 60, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(251, 146, 60, 0.3)'
        }}>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#fb923c', marginBottom: '12px' }}>
            {t('welcome.keyConcept')}
          </div>
          <div style={{ fontSize: '14px', color: '#ddd', lineHeight: '1.6' }}>
            Like technical debt, <strong>disclosure debt</strong> accumulates when you postpone hard statements,
            paper over facts, or hope the incident stays contained. Pressure archetypes — counsel, reporters,
            operators, extortion crews — will force the issue if you don't.
          </div>
        </div>

        <div style={{
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(168, 85, 247, 0.3)'
        }}>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#a855f7', marginBottom: '12px' }}>
            There's No "Winning"
          </div>
          <div style={{ fontSize: '14px', color: '#ddd', lineHeight: '1.6' }}>
            Every choice involves tradeoffs. The goal isn't a perfect press release — it's to
            <strong> feel how different values and priorities change who finds out, when, and at what cost</strong>.
            Explore, reflect, and learn.
          </div>
        </div>

        <div style={{
          marginBottom: '30px',
          padding: '16px',
          backgroundColor: 'rgba(74, 222, 128, 0.05)',
          borderRadius: '8px',
          border: '1px solid rgba(74, 222, 128, 0.2)',
          fontSize: '12px',
          color: '#aaa',
          lineHeight: '1.5'
        }}>
          <strong style={{ color: '#4ade80' }}>Scope.</strong> Short-horizon incident response and disclosure
          under adversarial pressure — FAIR-flavored impact, stakeholder jurisdictions on the globe, and
          OWASP teaching beats on each decision. Difficulty rails and the decision engine carry the game.
        </div>

        <div style={{
          marginTop: '12px',
          fontSize: '11px',
          color: '#888',
          textAlign: 'center',
          fontStyle: 'italic'
        }}>
          Regulatory clocks, OFAC screening, and insurance mechanics shown here are teaching simplifications, not legal advice.
        </div>

        <button
          onClick={handleClose}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: '#60a5fa',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#3b82f6'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#60a5fa'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          {t('buttons.begin')}
        </button>

        <div style={{
          marginTop: '20px',
          fontSize: '11px',
          color: '#666',
          textAlign: 'center'
        }}>
          Part of the i on GRC lab family
        </div>
      </div>
    </div>
  )
}
