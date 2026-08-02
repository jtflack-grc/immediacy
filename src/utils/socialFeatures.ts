import { State } from '../engine/scenarioTypes'
import { calculateMeasuredSuccessIndex, calculateGovernanceDebtIndex } from '../engine/scoring'
import { calculateAverageCountryScore } from './countryGradeScoring'

export interface LeaderboardEntry {
  id: string
  playerName: string
  measuredSuccess: number
  governanceDebt: number
  totalScore: number
  turn: number
  timestamp: number
  shareableUrl: string
}

const LEADERBOARD_KEY = 'welfareGovernanceLeaderboard'
const MAX_LEADERBOARD_ENTRIES = 50

/**
 * Calculate total score for leaderboard
 * Higher measured success, lower debt, and better country grades = better score
 */
export function calculateScore(state: State): number {
  const measuredIndex = calculateMeasuredSuccessIndex(state.metrics.measured)
  const debtIndex = calculateGovernanceDebtIndex(state.metrics.unmeasured)
  const countryScore = calculateAverageCountryScore(state)
  
  // Score = (measured success * 0.5) - (debt * 0.2) + (country grades * 0.3)
  // This rewards high success, penalizes debt, and includes global impact
  return (measuredIndex * 0.5) - (debtIndex * 0.2) + (countryScore * 0.3)
}

/**
 * Submit score to leaderboard
 */
export function submitToLeaderboard(state: State, playerName: string, shareableUrl: string): LeaderboardEntry {
  const score = calculateScore(state)
  const measuredIndex = calculateMeasuredSuccessIndex(state.metrics.measured)
  const debtIndex = calculateGovernanceDebtIndex(state.metrics.unmeasured)
  
  const entry: LeaderboardEntry = {
    id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    playerName,
    measuredSuccess: measuredIndex,
    governanceDebt: debtIndex,
    totalScore: score,
    turn: state.turn,
    timestamp: Date.now(),
    shareableUrl
  }
  
  const leaderboard = getLeaderboard()
  leaderboard.push(entry)
  
  // Sort by score (descending) and keep top entries
  leaderboard.sort((a, b) => b.totalScore - a.totalScore)
  const topEntries = leaderboard.slice(0, MAX_LEADERBOARD_ENTRIES)
  
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(topEntries))
  
  return entry
}

/**
 * Get leaderboard entries
 */
export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const saved = localStorage.getItem(LEADERBOARD_KEY)
    if (!saved) return []
    return JSON.parse(saved)
  } catch {
    return []
  }
}

/**
 * Get top N entries
 */
export function getTopEntries(n: number = 10): LeaderboardEntry[] {
  return getLeaderboard().slice(0, n)
}

/**
 * Get player's rank
 */
export function getPlayerRank(entryId: string): number {
  const leaderboard = getLeaderboard()
  const index = leaderboard.findIndex(e => e.id === entryId)
  return index >= 0 ? index + 1 : -1
}

/**
 * Format score for display
 */
export function formatScore(score: number): string {
  return (score * 100).toFixed(1)
}
