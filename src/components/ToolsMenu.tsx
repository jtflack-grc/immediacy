import { useState } from 'react'
import { t } from '../utils/i18n'

interface ToolsMenuProps {
  onShowVariation?: () => void
  onShowSaveLoad?: () => void
  onShowComparison?: () => void
  onShowPolicyComparison?: () => void
  onShowDebtTimeline?: () => void
  onShowMetaAnalysis?: () => void
  onShowAssumptionTimeline?: () => void
  onShowDecisionTree?: () => void
  onShowCredits?: () => void
  onShowResearchBibliography?: () => void
}

export default function ToolsMenu({
  onShowVariation,
  onShowSaveLoad,
  onShowComparison,
  onShowPolicyComparison,
  onShowDebtTimeline,
  onShowMetaAnalysis,
  onShowAssumptionTimeline,
  onShowDecisionTree,
  onShowCredits
}: ToolsMenuProps) {
  const [showMenu, setShowMenu] = useState(false)

  const hasAnyTool = onShowVariation || onShowSaveLoad || onShowComparison || 
                     onShowPolicyComparison || onShowDebtTimeline || 
                     onShowMetaAnalysis || onShowAssumptionTimeline || 
                     onShowDecisionTree || onShowCredits

  if (!hasAnyTool) return null

  return (
    <div style={{ 
      marginBottom: '20px',
      position: 'relative'
    }}>
      <div 
        style={{ position: 'relative', display: 'block', width: '100%' }}
        onMouseEnter={() => setShowMenu(true)}
        onMouseLeave={() => setShowMenu(false)}
      >
        <button
          onClick={() => setShowMenu(!showMenu)}
          style={{
            padding: '8px 14px',
            fontSize: '13px',
            fontWeight: 600,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            width: '100%',
            justifyContent: 'center',
            position: 'relative'
          }}
          title="Analysis tools and options"
        >
          <span>⚙️ Tools</span>
          <span style={{ fontSize: '10px', opacity: 0.6, position: 'absolute', right: '14px' }}>▼</span>
        </button>
        {showMenu && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '4px',
            backgroundColor: '#111111',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '6px',
            padding: '4px',
            zIndex: 1000,
            minWidth: '200px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
          }}>
            {onShowVariation && (
              <button
                onClick={() => {
                  onShowVariation()
                  setShowMenu(false)
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '12px',
                  backgroundColor: 'transparent',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                ⚙️ Variations
              </button>
            )}
            {onShowSaveLoad && (
              <button
                onClick={() => {
                  onShowSaveLoad()
                  setShowMenu(false)
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '12px',
                  backgroundColor: 'transparent',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                💾 Save/Load
              </button>
            )}
            {(onShowVariation || onShowSaveLoad) && (
              <div style={{
                height: '1px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                margin: '4px 0'
              }} />
            )}
            {onShowComparison && (
              <button
                onClick={() => {
                  onShowComparison()
                  setShowMenu(false)
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '12px',
                  backgroundColor: 'transparent',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                📊 Compare Runs
              </button>
            )}
            {onShowPolicyComparison && (
              <button
                onClick={() => {
                  onShowPolicyComparison()
                  setShowMenu(false)
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '12px',
                  backgroundColor: 'transparent',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                ⚖️ Policy Compare
              </button>
            )}
            {onShowDebtTimeline && (
              <button
                onClick={() => {
                  onShowDebtTimeline()
                  setShowMenu(false)
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '12px',
                  backgroundColor: 'transparent',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                📈 Debt Timeline
              </button>
            )}
            {onShowMetaAnalysis && (
              <button
                onClick={() => {
                  onShowMetaAnalysis()
                  setShowMenu(false)
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '12px',
                  backgroundColor: 'transparent',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                📊 Meta-Analysis
              </button>
            )}
            {onShowAssumptionTimeline && (
              <button
                onClick={() => {
                  onShowAssumptionTimeline()
                  setShowMenu(false)
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '12px',
                  backgroundColor: 'transparent',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                📋 Assumptions
              </button>
            )}
            {onShowDecisionTree && (
              <button
                onClick={() => {
                  onShowDecisionTree()
                  setShowMenu(false)
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '12px',
                  backgroundColor: 'transparent',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                🌳 Decision Tree
              </button>
            )}
            {onShowResearchBibliography && (
              <button
                onClick={() => {
                  onShowResearchBibliography()
                  setShowMenu(false)
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '12px',
                  backgroundColor: 'transparent',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                📚 Research Bibliography
              </button>
            )}
            {onShowCredits && (
              <>
                <div style={{
                  height: '1px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  margin: '4px 0'
                }} />
                <button
                  onClick={() => {
                    onShowCredits()
                    setShowMenu(false)
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '12px',
                    backgroundColor: 'transparent',
                    color: '#666',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  Credits
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
