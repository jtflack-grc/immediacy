import { useState, useEffect } from 'react'
import { State } from '../engine/scenarioTypes'
import { exportAsJSON, exportAsCSV, generateShareableURL, downloadFile } from '../utils/exportUtils'
import { generatePolicyBrief, formatPolicyBriefAsMarkdown, formatPolicyBriefAsText } from '../utils/policyBrief'
import { exportDebtReportAsPDF } from '../utils/debtReport'
import { t, getLanguage, setLanguage, Language } from '../utils/i18n'

interface HeaderBarProps {
  state: State
  onToggleDebug: () => void
  onShowTutorial?: () => void
  onShowCredits?: () => void
}

export default function HeaderBar({ state, onToggleDebug, onShowTutorial, onShowCredits }: HeaderBarProps) {
  const [currentLang, setCurrentLang] = useState<Language>(getLanguage())
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  
  useEffect(() => {
    setLanguage(currentLang)
  }, [currentLang])
  
  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' }
  ]
  const handleExportJSON = () => {
    const json = exportAsJSON(state)
    downloadFile(json, `welfare-governance-${Date.now()}.json`, 'application/json')
  }
  
  const handleExportCSV = () => {
    const csv = exportAsCSV(state)
    downloadFile(csv, `welfare-governance-${Date.now()}.csv`, 'text/csv')
  }
  
  const handleShare = () => {
    const url = generateShareableURL(state)
    navigator.clipboard.writeText(url).then(() => {
      alert('Shareable URL copied to clipboard!')
    }).catch(() => {
      prompt('Copy this URL to share:', url)
    })
  }

  const handleExportPolicyBrief = () => {
    try {
      const brief = generatePolicyBrief(state)
      const markdown = formatPolicyBriefAsMarkdown(brief)
      downloadFile(markdown, `policy-brief-turn-${state.turn}-${Date.now()}.md`, 'text/markdown')
    } catch (error) {
      console.error('Error exporting policy brief:', error)
      alert('Error generating policy brief. Please try again.')
    }
  }

  const handleExportPolicyBriefText = () => {
    try {
      const brief = generatePolicyBrief(state)
      const text = formatPolicyBriefAsText(brief)
      downloadFile(text, `policy-brief-turn-${state.turn}-${Date.now()}.txt`, 'text/plain')
    } catch (error) {
      console.error('Error exporting policy brief:', error)
      alert('Error generating policy brief. Please try again.')
    }
  }

  const handleExportDebtReport = () => {
    try {
      exportDebtReportAsPDF(state)
    } catch (error) {
      console.error('Error exporting debt report:', error)
      alert('Error generating debt report. Please try again.')
    }
  }
  return (
    <div style={{
      height: '60px',
      backgroundColor: '#000000',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Left spacer */}
      <div style={{ flex: 1 }}></div>
      
      {/* Centered Title */}
      <h1 
        title="an animal governance and risk simulator"
        style={{ 
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '44px', 
          fontWeight: 700, 
          color: '#fff',
          margin: 0,
          cursor: 'default',
          letterSpacing: '0.15em',
          lineHeight: 1,
          textTransform: 'uppercase',
          fontFamily: '"Times New Roman", Times, serif',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
          whiteSpace: 'nowrap'
        }}
      >
        {t('app.title')}
      </h1>
      
      {/* Right side buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative', flex: 1, justifyContent: 'flex-end' }}>
        {/* Language Selector - Premium */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(96, 165, 250, 0.1)'
              e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(15, 15, 15, 0.6)'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)'
            }}
            style={{
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: 500,
              backgroundColor: 'rgba(15, 15, 15, 0.6)',
              backdropFilter: 'blur(10px)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              minWidth: '60px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
            }}
            title="Change language"
          >
            <span style={{ fontSize: '14px' }}>{languages.find(l => l.code === currentLang)?.flag || '🌐'}</span>
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px' }}>{languages.find(l => l.code === currentLang)?.code.toUpperCase() || 'EN'}</span>
          </button>
          {showLangMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '6px',
              background: 'linear-gradient(135deg, rgba(15, 15, 15, 0.95) 0%, rgba(10, 10, 10, 0.98) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '10px',
              padding: '6px',
              minWidth: '160px',
              zIndex: 1000,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
            }}>
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setCurrentLang(lang.code)
                    setShowLangMenu(false)
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '13px',
                    fontWeight: currentLang === lang.code ? 600 : 400,
                    background: currentLang === lang.code 
                      ? 'linear-gradient(135deg, rgba(96, 165, 250, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)'
                      : 'transparent',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (currentLang !== lang.code) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentLang !== lang.code) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {onShowTutorial && (
          <button
            onClick={onShowTutorial}
            style={{
              padding: '6px 10px',
              fontSize: '13px',
              fontWeight: 500,
              backgroundColor: 'transparent',
              color: '#60a5fa',
              border: '1px solid rgba(96, 165, 250, 0.2)',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title="Show tutorial"
          >
            📖
          </button>
        )}
        {/* Export Menu */}
        <div 
          style={{ position: 'relative', display: 'inline-block' }}
          onMouseEnter={() => setShowExportMenu(true)}
          onMouseLeave={() => setShowExportMenu(false)}
        >
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.15)'
              e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)'
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.2)'
            }}
            onMouseLeave={(e) => {
              if (!showExportMenu) {
                e.currentTarget.style.backgroundColor = 'rgba(15, 15, 15, 0.6)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
              }
            }}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: showExportMenu ? 'rgba(139, 92, 246, 0.15)' : 'rgba(15, 15, 15, 0.6)',
              backdropFilter: 'blur(10px)',
              color: '#fff',
              border: showExportMenu ? '1px solid rgba(139, 92, 246, 0.5)' : '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: showExportMenu 
                ? '0 4px 12px rgba(139, 92, 246, 0.2)' 
                : '0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
              letterSpacing: '0.3px'
            }}
            title="Export options"
          >
            Export
          </button>
          {showExportMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '4px',
              backgroundColor: '#111111',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              padding: '4px',
              zIndex: 1000,
              minWidth: '180px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
            }}>
            <button
              onClick={handleExportJSON}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px 14px',
                fontSize: '13px',
                fontWeight: 400,
                backgroundColor: 'transparent',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              Export JSON
            </button>
            <button
              onClick={handleExportCSV}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px 14px',
                fontSize: '13px',
                fontWeight: 400,
                backgroundColor: 'transparent',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              Export CSV
            </button>
            <button
              onClick={handleShare}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px 14px',
                fontSize: '13px',
                fontWeight: 400,
                backgroundColor: 'transparent',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              Share URL
            </button>
            <div style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)',
              margin: '6px 0'
            }} />
            <button
              onClick={handleExportPolicyBrief}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px 14px',
                fontSize: '13px',
                fontWeight: 400,
                backgroundColor: 'transparent',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              Policy Brief (Markdown)
            </button>
            <button
              onClick={handleExportPolicyBriefText}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px 14px',
                fontSize: '13px',
                fontWeight: 400,
                backgroundColor: 'transparent',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              Policy Brief (Text)
            </button>
            <button
              onClick={handleExportDebtReport}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px 14px',
                fontSize: '13px',
                fontWeight: 400,
                backgroundColor: 'transparent',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              Debt Report (PDF)
            </button>
            </div>
          )}
        </div>
        
        {/* Credits Button */}
        {onShowCredits && (
          <button
            onClick={onShowCredits}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(236, 72, 153, 0.15)'
              e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.5)'
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(236, 72, 153, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(15, 15, 15, 0.6)'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
            }}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: 'rgba(15, 15, 15, 0.6)',
              backdropFilter: 'blur(10px)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
              letterSpacing: '0.3px'
            }}
            title="Credits"
          >
            Credits
          </button>
        )}
      </div>
    </div>
  )
}
