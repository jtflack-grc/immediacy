import { State } from '../engine/scenarioTypes'
import { getCountryData, getWelfareGrade, getGradeColor } from './countryWelfareData'

export interface CountryGradeSummary {
  iso3: string
  name: string
  grade: string
  gradeColor: string
  score: number
  change: number // Change from baseline
}

/**
 * Calculate country grades based on current state
 */
export function calculateCountryGrades(state: State): CountryGradeSummary[] {
  const summaries: CountryGradeSummary[] = []
  
  Object.entries(state.map.regionValues).forEach(([iso3, value]) => {
    const countryData = getCountryData(iso3)
    if (!countryData) return
    
    const baseScore = countryData.baselineScore
    // Combine baseline with current value (weighted average)
    const currentScore = Math.min(1, Math.max(0, baseScore + (value * 0.5)))
    const grade = getWelfareGrade(currentScore)
    const gradeColor = getGradeColor(grade)
    const change = currentScore - baseScore
    
    summaries.push({
      iso3,
      name: countryData.name,
      grade,
      gradeColor,
      score: currentScore,
      change
    })
  })
  
  // Sort by score (highest first)
  return summaries.sort((a, b) => b.score - a.score)
}

/**
 * Calculate average country grade score
 */
export function calculateAverageCountryScore(state: State): number {
  const grades = calculateCountryGrades(state)
  if (grades.length === 0) return 0
  
  const total = grades.reduce((sum, g) => sum + g.score, 0)
  return total / grades.length
}

/**
 * Get grade distribution
 */
export function getGradeDistribution(state: State): Record<string, number> {
  const grades = calculateCountryGrades(state)
  const distribution: Record<string, number> = {}
  
  grades.forEach(g => {
    const gradeLetter = g.grade[0] // A, B, C, D, or F
    distribution[gradeLetter] = (distribution[gradeLetter] || 0) + 1
  })
  
  return distribution
}
