import { useState } from 'react'
import { securityResearchCards } from '../utils/securityResearch'

const frameworkColor: Record<string, string> = {
  OWASP: '#f97316',
  MITRE: '#a78bfa',
  NIST: '#60a5fa',
  CISA: '#4ade80',
  FAIR: '#fbbf24',
  Regulatory: '#fb7185',
}

export default function SecurityResearchPanel() {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [filter, setFilter] = useState<string>('ALL')

  const frameworks = ['ALL', 'OWASP', 'MITRE', 'NIST', 'CISA', 'FAIR', 'Regulatory']
  const cards = filter === 'ALL'
    ? securityResearchCards
    : securityResearchCards.filter(c => c.framework === filter)

  return (
    <div style={{
      marginTop: '32px',
      padding: '16px',
      backgroundColor: '#111111',
      borderRadius: '8px',
      border: '1px solid rgba(249, 115, 22, 0.25)'
    }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: isCollapsed ? '0' : '12px',
          cursor: 'pointer'
        }}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h3 style={{
          fontSize: '14px',
          fontWeight: 600,
          color: '#f97316',
          margin: 0
        }}>
          Security Research Lab
        </h3>
        <div style={{ fontSize: '12px', color: '#888' }}>
          {isCollapsed ? '▼' : '▲'}
        </div>
      </div>

      {!isCollapsed && (
        <>
          <p style={{
            fontSize: '11px',
            color: '#888',
            lineHeight: '1.5',
            marginBottom: '12px',
            fontStyle: 'italic'
          }}>
            OWASP, MITRE ATT&CK, NIST, CISA, and FAIR cards for the war room. Expand a card — links open primary sources.
          </p>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            marginBottom: '12px'
          }}>
            {frameworks.map(fw => (
              <button
                key={fw}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setFilter(fw)
                }}
                style={{
                  padding: '4px 8px',
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  border: filter === fw
                    ? `1px solid ${fw === 'ALL' ? '#f97316' : (frameworkColor[fw] || '#888')}`
                    : '1px solid rgba(255,255,255,0.1)',
                  backgroundColor: filter === fw ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: filter === fw
                    ? (fw === 'ALL' ? '#f97316' : (frameworkColor[fw] || '#fff'))
                    : '#888'
                }}
              >
                {fw}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {cards.map(card => {
              const accent = frameworkColor[card.framework] || '#60a5fa'
              const open = expandedId === card.id
              return (
                <div
                  key={card.id}
                  style={{
                    padding: '12px',
                    backgroundColor: open ? '#1a1a1a' : '#000000',
                    borderRadius: '6px',
                    border: `1px solid ${open ? accent + '55' : 'rgba(255, 255, 255, 0.1)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => setExpandedId(open ? null : card.id)}
                >
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#fff',
                    marginBottom: '4px'
                  }}>
                    {card.title}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#888',
                    marginBottom: '6px',
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap'
                  }}>
                    <span style={{ color: accent, fontWeight: 600 }}>{card.framework}</span>
                    <span>•</span>
                    <span>{card.horizon}</span>
                  </div>
                  {open && (
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <div style={{ fontSize: '12px', color: '#ccc', lineHeight: '1.6', marginBottom: '12px' }}>
                        {card.description}
                      </div>
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px', fontWeight: 600 }}>
                          War-room questions
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '11px', color: '#aaa', lineHeight: '1.6' }}>
                          {card.keyQuestions.slice(0, 3).map((q, i) => (
                            <li key={i} style={{ marginBottom: '4px' }}>{q}</li>
                          ))}
                        </ul>
                      </div>
                      <div style={{ fontSize: '11px', color: '#666', fontStyle: 'italic', marginBottom: card.url ? '10px' : 0 }}>
                        {card.relevance}
                      </div>
                      {card.url && (
                        <a
                          href={card.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            fontSize: '11px',
                            color: accent,
                            textDecoration: 'none',
                            fontWeight: 600
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline' }}
                          onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none' }}
                        >
                          Open primary source →
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
