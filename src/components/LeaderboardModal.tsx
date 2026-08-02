import { useState, useEffect } from 'react'
import { getLeaderboard, getTopEntries, LeaderboardEntry, formatScore } from '../utils/socialFeatures'

interface LeaderboardModalProps {
  onClose: () => void
  currentScore?: number
  currentEntryId?: string
}

export default function LeaderboardModal({ onClose, currentScore, currentEntryId }: LeaderboardModalProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [playerRank, setPlayerRank] = useState<number>(-1)

  useEffect(() => {
    setLeaderboard(getTopEntries(20))
    if (currentEntryId) {
      const rank = getLeaderboard().findIndex(e => e.id === currentEntryId) + 1
      setPlayerRank(rank > 0 ? rank : -1)
    }
  }, [currentEntryId])

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }

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
      zIndex: 2000,
      padding: '20px'
    }} onClick={onClose}>
      <div style={{
        backgroundColor: '#000000',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        maxWidth: '700px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '24px'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#fff', margin: 0 }}>
            🏆 Leaderboard
          </h2>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0',
              width: '32px',
              height: '32px'
            }}
          >
            ×
          </button>
        </div>

        {/* Current Score Display */}
        {currentScore !== undefined && (
          <div style={{
            padding: '16px',
            backgroundColor: '#111111',
            borderRadius: '8px',
            marginBottom: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ fontSize: '14px', color: '#888', marginBottom: '8px' }}>Your Score</div>
            <div style={{ fontSize: '24px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
              {formatScore(currentScore)}
            </div>
            {playerRank > 0 && (
              <div style={{ fontSize: '12px', color: '#aaa' }}>
                Rank: #{playerRank} of {leaderboard.length}
              </div>
            )}
          </div>
        )}

        {/* Leaderboard Table */}
        <div style={{
          backgroundColor: '#111111',
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#888', fontWeight: 600 }}>Rank</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#888', fontWeight: 600 }}>Player</th>
                <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', color: '#888', fontWeight: 600 }}>Score</th>
                <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', color: '#888', fontWeight: 600 }}>Success</th>
                <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', color: '#888', fontWeight: 600 }}>Debt</th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#888', fontWeight: 600 }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
                    No entries yet. Complete a scenario to appear on the leaderboard!
                  </td>
                </tr>
              ) : (
                leaderboard.map((entry, idx) => (
                  <tr
                    key={entry.id}
                    style={{
                      borderBottom: idx < leaderboard.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                      backgroundColor: entry.id === currentEntryId ? 'rgba(37, 99, 235, 0.1)' : 'transparent'
                    }}
                  >
                    <td style={{ padding: '12px', fontSize: '14px', fontWeight: 600, color: '#fff' }}>
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </td>
                    <td style={{ padding: '12px', fontSize: '13px', color: '#fff', fontWeight: entry.id === currentEntryId ? 600 : 400 }}>
                      {entry.playerName}
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', color: '#4ade80', fontWeight: 600, textAlign: 'right' }}>
                      {formatScore(entry.totalScore)}
                    </td>
                    <td style={{ padding: '12px', fontSize: '12px', color: '#aaa', textAlign: 'right' }}>
                      {(entry.measuredSuccess * 100).toFixed(0)}%
                    </td>
                    <td style={{ padding: '12px', fontSize: '12px', color: '#aaa', textAlign: 'right' }}>
                      {(entry.governanceDebt * 100).toFixed(0)}%
                    </td>
                    <td style={{ padding: '12px', fontSize: '11px', color: '#666', textAlign: 'center' }}>
                      {formatDate(entry.timestamp)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '16px', fontSize: '11px', color: '#666', textAlign: 'center' }}>
          Leaderboard stores top {leaderboard.length} entries locally
        </div>
      </div>
    </div>
  )
}
