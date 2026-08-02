import { useState } from 'react'
import { State } from '../engine/scenarioTypes'
import { calculateMeasuredSuccessIndex, calculateGovernanceDebtIndex } from '../engine/scoring'
import { getDegradedAssumptions } from '../engine/selectors'
import AssumptionTimeline from './AssumptionTimeline'
import { exportPostMortemAsPDF } from '../utils/pdfExport'
import LeaderboardModal from './LeaderboardModal'
import { submitToLeaderboard, calculateScore } from '../utils/socialFeatures'
import { generateShareableURL } from '../utils/exportUtils'
import IndexExplainerModal from './IndexExplainerModal'
import { calculateCountryGrades, calculateAverageCountryScore } from '../utils/countryGradeScoring'
import { checkVictoryConditions, getVictoryCondition } from '../utils/victoryConditions'
import { getLossCondition } from '../utils/lossConditions'
import AchievementBadge from './AchievementBadge'
import { getAchievement } from '../utils/achievements'
import TimelineView from './TimelineView'

interface PostMortemModalProps {
  state: State
  onClose: () => void
}

export default function PostMortemModal({ state, onClose }: PostMortemModalProps) {
  const [showAssumptionTimeline, setShowAssumptionTimeline] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [showSubmitForm, setShowSubmitForm] = useState(true)
  const [playerName, setPlayerName] = useState('')
  const [submittedEntryId, setSubmittedEntryId] = useState<string | null>(null)
  const [showIndexExplainer, setShowIndexExplainer] = useState<'success' | 'debt' | null>(null)
  const [showTimeline, setShowTimeline] = useState(false)
  const measuredIndex = calculateMeasuredSuccessIndex(state.metrics.measured)
  const debtIndex = calculateGovernanceDebtIndex(state.metrics.unmeasured)
  const degradedAssumptions = getDegradedAssumptions(state)
  const totalScore = calculateScore(state)
  const countryGrades = calculateCountryGrades(state)
  const averageCountryScore = calculateAverageCountryScore(state)
  const victoryType = state.victoryType || checkVictoryConditions(state)
  const victory = victoryType ? getVictoryCondition(victoryType) : null

  const handleSubmitToLeaderboard = () => {
    if (!playerName.trim()) {
      alert('Please enter your name')
      return
    }
    const shareableUrl = generateShareableURL(state)
    const entry = submitToLeaderboard(state, playerName.trim(), shareableUrl)
    setSubmittedEntryId(entry.id)
    setShowSubmitForm(false)
    alert('Score submitted to leaderboard!')
  }
  
  // Find top 3 decisions that increased welfare debt
  const welfareDebtDecisions = state.auditTrail
    .filter(record => record.unmeasuredImpact.includes('welfare debt') || record.unmeasuredImpact.includes('welfareDebt'))
    .slice(0, 3)

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
      zIndex: 1000,
      padding: '20px'
    }} onClick={onClose}>
      <div style={{
        backgroundColor: '#000000',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '32px'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#fff', margin: 0 }}>
            Post-Mortem Report
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => exportPostMortemAsPDF(state, measuredIndex, debtIndex)}
              style={{
                padding: '8px 16px',
                fontSize: '12px',
                backgroundColor: '#111111',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              📄 Export PDF
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                color: '#888',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Close
            </button>
          </div>
        </div>

        {/* Score and Leaderboard */}
        <div style={{ marginBottom: '32px', padding: '20px', backgroundColor: '#111111', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Total Score</div>
              <div style={{ fontSize: '32px', fontWeight: 600, color: '#4ade80' }}>
                {(totalScore * 100).toFixed(1)}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {showSubmitForm && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#000000',
                      color: '#fff',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '4px',
                      fontSize: '12px',
                      width: '150px'
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSubmitToLeaderboard()
                      }
                    }}
                  />
                  <button
                    onClick={handleSubmitToLeaderboard}
                    style={{
                      padding: '8px 16px',
                      fontSize: '12px',
                      backgroundColor: '#1a1a1a',
                      color: '#fff',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    Submit Score
                  </button>
                </div>
              )}
              <button
                onClick={() => setShowLeaderboard(true)}
                style={{
                  padding: '8px 16px',
                  fontSize: '12px',
                  backgroundColor: '#1a1a1a',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                🏆 View Leaderboard
              </button>
            </div>
          </div>
        </div>

        {/* Country Grades Summary */}
        {countryGrades.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>
              Global Impact: Country Welfare Grades
            </h3>
            <div style={{ 
              padding: '16px', 
              backgroundColor: '#111111', 
              borderRadius: '8px',
              marginBottom: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Average Country Score</div>
              <div style={{ fontSize: '28px', fontWeight: 600, color: '#4ade80' }}>
                {(averageCountryScore * 100).toFixed(1)}%
              </div>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                Based on welfare improvements across all tracked countries
              </div>
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
              gap: '10px',
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              {countryGrades.map(country => (
                <div 
                  key={country.iso3}
                  style={{
                    padding: '10px',
                    backgroundColor: '#000000',
                    borderRadius: '6px',
                    border: `2px solid ${country.gradeColor}`,
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>
                    {country.name}
                  </div>
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: 700, 
                    color: country.gradeColor,
                    marginBottom: '4px',
                    textShadow: `0 0 8px ${country.gradeColor}60`
                  }}>
                    {country.grade}
                  </div>
                  <div style={{ fontSize: '10px', color: country.change >= 0 ? '#4ade80' : '#ef4444' }}>
                    {country.change >= 0 ? '↑' : '↓'} {Math.abs(country.change * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        {state.achievements && state.achievements.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>
              Achievements Unlocked ({state.achievements.length})
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
              gap: '12px'
            }}>
              {state.achievements.map(achievementId => {
                const achievement = getAchievement(achievementId)
                return achievement ? (
                  <AchievementBadge key={achievementId} achievement={achievement} unlocked={true} />
                ) : null
              })}
            </div>
          </div>
        )}

        {/* Victory/Loss Conditions */}
        {(victory || (state.lossConditionsMet && state.lossConditionsMet.length > 0)) && (
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>
              Outcome Assessment
            </h3>
            {victory && (
              <div style={{
                padding: '16px',
                backgroundColor: '#111111',
                borderRadius: '8px',
                border: `2px solid ${victory.color}`,
                marginBottom: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '20px' }}>✓</span>
                  <span style={{ fontSize: '16px', fontWeight: 600, color: victory.color }}>
                    {victory.name}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#aaa', lineHeight: '1.5' }}>
                  {victory.message}
                </div>
              </div>
            )}
            {state.lossConditionsMet && state.lossConditionsMet.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {state.lossConditionsMet.map((lossType) => {
                  const condition = getLossCondition(lossType)
                  if (!condition) return null
                  
                  return (
                    <div
                      key={lossType}
                      style={{
                        padding: '16px',
                        backgroundColor: '#111111',
                        borderRadius: '8px',
                        border: `2px solid ${condition.color}`,
                        borderLeft: `4px solid ${condition.color}`
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '20px' }}>✗</span>
                        <span style={{ fontSize: '16px', fontWeight: 600, color: condition.color }}>
                          {condition.name}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#aaa', lineHeight: '1.5' }}>
                        {condition.message}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Summary Metrics */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>
            Final Metrics
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ padding: '16px', backgroundColor: '#111111', borderRadius: '8px', border: '1px solid rgba(74, 222, 128, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#888', marginBottom: '8px' }}>
                Measured Success Index
                <button
                  onClick={() => setShowIndexExplainer('success')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#4ade80',
                    cursor: 'pointer',
                    fontSize: '12px',
                    padding: '0',
                    display: 'flex',
                    alignItems: 'center',
                    lineHeight: '1'
                  }}
                  title="Learn about Success Index"
                >
                  ℹ️
                </button>
              </div>
              <div style={{ fontSize: '32px', fontWeight: 600, color: '#4ade80' }}>
                {(measuredIndex * 100).toFixed(0)}%
              </div>
            </div>
            <div style={{ padding: '16px', backgroundColor: '#111111', borderRadius: '8px', border: '1px solid rgba(251, 146, 60, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#888', marginBottom: '8px' }}>
                Governance Debt Index
                <button
                  onClick={() => setShowIndexExplainer('debt')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#fb923c',
                    cursor: 'pointer',
                    fontSize: '12px',
                    padding: '0',
                    display: 'flex',
                    alignItems: 'center',
                    lineHeight: '1'
                  }}
                  title="Learn about Debt Index"
                >
                  ℹ️
                </button>
              </div>
              <div style={{ fontSize: '32px', fontWeight: 600, color: '#fb923c' }}>
                {(debtIndex * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        {/* Trajectory Visualization */}
        {state.auditTrail.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>
              Trajectory Over Time
            </h3>
            <div style={{ padding: '16px', backgroundColor: '#111111', borderRadius: '8px' }}>
              <div style={{ display: 'flex', gap: '24px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px' }}>Measured Success</div>
                  <div style={{ height: '60px', position: 'relative', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    {state.auditTrail.map((_record, idx) => {
                      const progress = (idx + 1) / Math.max(state.auditTrail.length, 1)
                      const estimatedValue = measuredIndex * progress
                      return (
                        <div
                          key={idx}
                          style={{
                            position: 'absolute',
                            left: `${progress * 100}%`,
                            bottom: `${estimatedValue * 100}%`,
                            width: '4px',
                            height: '4px',
                            backgroundColor: '#4ade80',
                            borderRadius: '50%',
                            transform: 'translate(-50%, 50%)'
                          }}
                        />
                      )
                    })}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px' }}>Governance Debt</div>
                  <div style={{ height: '60px', position: 'relative', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    {state.auditTrail.map((_record, idx) => {
                      const progress = (idx + 1) / Math.max(state.auditTrail.length, 1)
                      const estimatedValue = debtIndex * progress
                      return (
                        <div
                          key={idx}
                          style={{
                            position: 'absolute',
                            left: `${progress * 100}%`,
                            bottom: `${estimatedValue * 100}%`,
                            width: '4px',
                            height: '4px',
                            backgroundColor: '#fb923c',
                            borderRadius: '50%',
                            transform: 'translate(-50%, 50%)'
                          }}
                        />
                      )
                    })}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '11px', color: '#666', fontStyle: 'italic' }}>
                Note: Trajectory is approximated from decision points. Full historical tracking would require state snapshots.
              </div>
            </div>
          </div>
        )}

        {/* System Irreversibility */}
        <div style={{ marginBottom: '32px', padding: '16px', backgroundColor: '#1a1d29', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>
            Irreversibility Analysis
          </h3>
          <div style={{ fontSize: '14px', color: '#aaa', lineHeight: '1.6' }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>System Irreversibility:</strong> {(state.metrics.unmeasured.systemIrreversibility * 100).toFixed(0)}%
            </div>
            {state.metrics.unmeasured.systemIrreversibility > 0.8 ? (
              <div style={{ color: '#ef4444', marginTop: '8px' }}>
                ⚠️ The system has become difficult to unwind. Changes would require significant coordination and may be prohibitively expensive.
              </div>
            ) : (
              <div style={{ color: '#10b981', marginTop: '8px' }}>
                ✓ The system maintains reasonable flexibility for future changes.
              </div>
            )}
          </div>
        </div>

        {/* Top Welfare Debt Decisions */}
        {welfareDebtDecisions.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>
              Top Decisions Increasing Welfare Debt
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {welfareDebtDecisions.map((record, idx) => (
                <div key={idx} style={{ padding: '12px', backgroundColor: '#111111', borderRadius: '6px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                    Turn {record.turn}: {record.nodeTitle}
                  </div>
                  <div style={{ fontSize: '12px', color: '#aaa' }}>{record.chosenLabel}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Degraded Assumptions */}
        {degradedAssumptions.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', margin: 0 }}>
                Degraded Assumptions
              </h3>
              <button
                onClick={() => setShowAssumptionTimeline(true)}
                style={{
                  padding: '6px 12px',
                  fontSize: '11px',
                  backgroundColor: '#111111',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                View Timeline →
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {degradedAssumptions.map((assumption, idx) => (
                <div key={idx} style={{ padding: '12px', backgroundColor: '#111111', borderRadius: '6px', border: '1px solid rgba(251, 146, 60, 0.2)' }}>
                  <div style={{ fontSize: '12px', color: '#fb923c', marginBottom: '4px' }}>
                    Strength: {(assumption.strength * 100).toFixed(0)}% (Created Turn {assumption.createdTurn})
                  </div>
                  <div style={{ fontSize: '13px', color: '#aaa' }}>{assumption.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Decision Summary */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>
            Decision Summary
          </h3>
          <div style={{ fontSize: '14px', color: '#aaa' }}>
            <div>Total Decisions: {state.auditTrail.length}</div>
            <div>Total Turns: {state.turn}</div>
            <div>Final Phase: {state.phaseId}</div>
          </div>
        </div>

        {/* References Section */}
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>
            📚 Research References
          </h3>
          <div style={{
            padding: '16px',
            backgroundColor: '#111111',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px', fontStyle: 'italic' }}>
              Research papers and sources referenced throughout your decision-making process:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {state.auditTrail.map((record, idx) => {
                // In a real implementation, we'd load advisor recommendations for each node
                // For now, we'll show case study links if available
                return (
                  <div key={idx} style={{
                    padding: '12px',
                    backgroundColor: '#000000',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                  }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                      Turn {record.turn}: {record.nodeTitle}
                    </div>
                    <div style={{ fontSize: '11px', color: '#aaa' }}>
                      Decision: {record.chosenLabel}
                    </div>
                    {/* Note: To show actual research citations, we'd need to load advisor recommendations
                        for each node in the audit trail. This would require async loading. */}
                  </div>
                )
              })}
              {state.auditTrail.length === 0 && (
                <div style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                  No decisions made yet. Research references will appear here as you make decisions.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Assumption Timeline Modal */}
      {showAssumptionTimeline && (
        <AssumptionTimeline
          state={state}
          onClose={() => setShowAssumptionTimeline(false)}
        />
      )}

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <LeaderboardModal
          onClose={() => setShowLeaderboard(false)}
          currentScore={totalScore}
          currentEntryId={submittedEntryId || undefined}
        />
      )}

      {/* Index Explainer Modal */}
      {showIndexExplainer && (
        <IndexExplainerModal
          type={showIndexExplainer}
          onClose={() => setShowIndexExplainer(null)}
        />
      )}
    </div>
  )
}
