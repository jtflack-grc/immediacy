import { useEffect, useState } from 'react'
import { State } from '../engine/scenarioTypes'
import { exportAsJSON, exportAsCSV, generateShareableURL, downloadFile } from '../utils/exportUtils'
import { generatePolicyBrief, formatPolicyBriefAsMarkdown, formatPolicyBriefAsText } from '../utils/policyBrief'
import { exportDebtReportAsPDF } from '../utils/debtReport'
import { getLanguage, setLanguage, Language } from '../utils/i18n'

interface HeaderBarProps {
  state: State
  onToggleDebug: () => void
  onShowHelp?: () => void
  onShowCredits?: () => void
  onShowScenarioConditions?: () => void
}

const buttonStyle: React.CSSProperties = {
  padding: '7px 11px',
  fontSize: '12px',
  fontWeight: 500,
  backgroundColor: '#0d1115',
  color: '#dfe5ea',
  border: '1px solid #303841',
  borderRadius: '4px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
}

const menuStyle: React.CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 6px)',
  right: 0,
  minWidth: '190px',
  padding: '5px',
  backgroundColor: '#0d1115',
  border: '1px solid #303841',
  borderRadius: '6px',
  zIndex: 1000,
}

const menuButtonStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '9px 10px',
  fontSize: '12px',
  fontWeight: 400,
  backgroundColor: 'transparent',
  color: '#dfe5ea',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  textAlign: 'left',
}

export default function HeaderBar({
  state,
  onToggleDebug,
  onShowHelp,
  onShowCredits,
  onShowScenarioConditions,
}: HeaderBarProps) {
  const [currentLang, setCurrentLang] = useState<Language>(getLanguage())
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)

  useEffect(() => {
    setLanguage(currentLang)
  }, [currentLang])

  const languages: { code: Language; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'zh', name: '中文' },
    { code: 'pt', name: 'Português' },
    { code: 'ja', name: '日本語' },
  ]

  const handleExportJSON = () => {
    downloadFile(exportAsJSON(state), `immediacy-${Date.now()}.json`, 'application/json')
    setShowExportMenu(false)
  }

  const handleExportCSV = () => {
    downloadFile(exportAsCSV(state), `immediacy-${Date.now()}.csv`, 'text/csv')
    setShowExportMenu(false)
  }

  const handleShare = () => {
    const url = generateShareableURL(state)
    navigator.clipboard
      .writeText(url)
      .then(() => alert('Shareable URL copied to clipboard.'))
      .catch(() => prompt('Copy this URL to share:', url))
    setShowExportMenu(false)
  }

  const handleExportPolicyBrief = () => {
    const brief = generatePolicyBrief(state)
    downloadFile(
      formatPolicyBriefAsMarkdown(brief),
      `policy-brief-turn-${state.turn}-${Date.now()}.md`,
      'text/markdown'
    )
    setShowExportMenu(false)
  }

  const handleExportPolicyBriefText = () => {
    const brief = generatePolicyBrief(state)
    downloadFile(
      formatPolicyBriefAsText(brief),
      `policy-brief-turn-${state.turn}-${Date.now()}.txt`,
      'text/plain'
    )
    setShowExportMenu(false)
  }

  const handleExportDebtReport = () => {
    exportDebtReportAsPDF(state)
    setShowExportMenu(false)
  }

  return (
    <header
      style={{
        minHeight: '58px',
        backgroundColor: '#07090b',
        borderBottom: '1px solid #20262d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '18px',
        padding: '9px 18px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
          <h1
            style={{
              margin: 0,
              fontSize: '20px',
              lineHeight: 1,
              fontWeight: 600,
              letterSpacing: '0.12em',
              color: '#f2f5f7',
              whiteSpace: 'nowrap',
            }}
          >
            IMMEDIACY
          </h1>
          <span
            style={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: '10px',
              color: '#8b949e',
              whiteSpace: 'nowrap',
            }}
          >
            SHORT-HORIZON DISCLOSURE WAR ROOM
          </span>
        </div>
        <div style={{ marginTop: '3px', fontSize: '11px', color: '#8b949e' }}>
          Every second counts · Turn {state.turn} · T+{state.incidentTime}m
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {onShowScenarioConditions && (
          <button type="button" onClick={onShowScenarioConditions} style={buttonStyle}>
            Scenario
          </button>
        )}

        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => {
              setShowLangMenu((value) => !value)
              setShowExportMenu(false)
            }}
            style={buttonStyle}
            aria-expanded={showLangMenu}
          >
            {currentLang.toUpperCase()}
          </button>
          {showLangMenu && (
            <div style={menuStyle}>
              {languages.map((lang) => (
                <button
                  type="button"
                  key={lang.code}
                  onClick={() => {
                    setCurrentLang(lang.code)
                    setShowLangMenu(false)
                  }}
                  style={{
                    ...menuButtonStyle,
                    color: currentLang === lang.code ? '#f2f5f7' : '#aeb7c0',
                    backgroundColor: currentLang === lang.code ? '#151b21' : 'transparent',
                  }}
                >
                  {lang.name} · {lang.code.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => {
              setShowExportMenu((value) => !value)
              setShowLangMenu(false)
            }}
            style={buttonStyle}
            aria-expanded={showExportMenu}
          >
            Export
          </button>
          {showExportMenu && (
            <div style={{ ...menuStyle, minWidth: '220px' }}>
              <button type="button" onClick={handleExportJSON} style={menuButtonStyle}>
                Run state · JSON
              </button>
              <button type="button" onClick={handleExportCSV} style={menuButtonStyle}>
                Decision trail · CSV
              </button>
              <button type="button" onClick={handleShare} style={menuButtonStyle}>
                Copy shareable URL
              </button>
              <div style={{ height: '1px', margin: '5px 4px', backgroundColor: '#20262d' }} />
              <button type="button" onClick={handleExportPolicyBrief} style={menuButtonStyle}>
                Policy brief · Markdown
              </button>
              <button type="button" onClick={handleExportPolicyBriefText} style={menuButtonStyle}>
                Policy brief · Text
              </button>
              <button type="button" onClick={handleExportDebtReport} style={menuButtonStyle}>
                Disclosure debt report · PDF
              </button>
              <div style={{ height: '1px', margin: '5px 4px', backgroundColor: '#20262d' }} />
              <button
                type="button"
                onClick={() => {
                  onToggleDebug()
                  setShowExportMenu(false)
                }}
                style={menuButtonStyle}
              >
                {state.flags.showDebug ? 'Hide diagnostics' : 'Show diagnostics'}
              </button>
            </div>
          )}
        </div>

        {onShowHelp && (
          <button type="button" onClick={onShowHelp} style={buttonStyle}>
            Help
          </button>
        )}
        {onShowCredits && (
          <button type="button" onClick={onShowCredits} style={buttonStyle}>
            Method
          </button>
        )}
      </div>
    </header>
  )
}
