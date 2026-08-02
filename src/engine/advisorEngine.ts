import { Advisor, AdvisorRecommendation } from './scenarioTypes'

let cachedAdvisors: Advisor[] | null = null
let cachedRecommendations: Record<string, AdvisorRecommendation[]> | null = null

/**
 * Load advisors from JSON file
 */
export async function loadAdvisors(): Promise<Advisor[]> {
  if (cachedAdvisors) {
    return cachedAdvisors
  }

  try {
    // Relative path so this works on GitHub Pages project pages
    const response = await fetch('advisors.json')
    if (!response.ok) {
      throw new Error(`Failed to load advisors: ${response.status}`)
    }
    const data = await response.json()
    cachedAdvisors = data as Advisor[]
    return cachedAdvisors
  } catch (error) {
    console.error('Error loading advisors:', error)
    return []
  }
}

/**
 * Load advisor recommendations from JSON file
 */
export async function loadRecommendations(): Promise<Record<string, AdvisorRecommendation[]>> {
  if (cachedRecommendations) {
    return cachedRecommendations
  }

  try {
    // Relative path so this works on GitHub Pages project pages
    const response = await fetch('advisorRecommendations.json')
    if (!response.ok) {
      throw new Error(`Failed to load recommendations: ${response.status}`)
    }
    const data = await response.json()
    cachedRecommendations = data as Record<string, AdvisorRecommendation[]>
    return cachedRecommendations
  } catch (error) {
    console.error('Error loading recommendations:', error)
    return {}
  }
}

/**
 * Get advisor recommendations for a specific node
 */
export async function getAdvisorRecommendations(nodeId: string): Promise<{
  advisors: Advisor[]
  recommendations: (AdvisorRecommendation & { advisor: Advisor })[]
}> {
  const [advisors, allRecommendations] = await Promise.all([
    loadAdvisors(),
    loadRecommendations()
  ])

  const recommendations = allRecommendations[nodeId] || []
  
  // Map recommendations to full advisor objects
  const advisorMap = new Map(advisors.map(a => [a.id, a]))
  const recommendationsWithAdvisors = recommendations
    .map(rec => {
      const advisor = advisorMap.get(rec.advisorId)
      return advisor ? { ...rec, advisor } : null
    })
    .filter((rec): rec is AdvisorRecommendation & { advisor: Advisor } => rec !== null)

  return {
    advisors,
    recommendations: recommendationsWithAdvisors
  }
}

/**
 * Get advisors that recommend a specific choice
 */
export function getAdvisorsForChoice(
  recommendations: (AdvisorRecommendation & { advisor?: Advisor })[],
  choiceIndex: number
): (Advisor & { recommendation: AdvisorRecommendation })[] {
  return recommendations
    .filter(rec => rec.choiceIndex === choiceIndex && rec.advisor)
    .map(rec => ({
      ...rec.advisor!,
      recommendation: rec
    }))
}
