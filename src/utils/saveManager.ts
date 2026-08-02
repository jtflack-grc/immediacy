import { State } from '../engine/scenarioTypes'

export interface SavedScenario {
  id: string
  name: string
  timestamp: number
  state: State
  version: string
}

const STORAGE_KEY = 'savedScenarios'
const MAX_SAVES = 10

/**
 * Get all saved scenarios
 */
export function getSavedScenarios(): SavedScenario[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return []
    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Failed to load saved scenarios:', error)
    return []
  }
}

/**
 * Save a scenario
 */
export function saveScenario(state: State, name: string, version: string): string {
  const saved = getSavedScenarios()
  
  // Remove oldest if at max capacity
  if (saved.length >= MAX_SAVES) {
    saved.sort((a, b) => a.timestamp - b.timestamp)
    saved.shift()
  }
  
  const newSave: SavedScenario = {
    id: `save_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    timestamp: Date.now(),
    state: JSON.parse(JSON.stringify(state)), // Deep copy
    version
  }
  
  saved.push(newSave)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
  
  return newSave.id
}

/**
 * Load a scenario by ID
 */
export function loadScenario(id: string): State | null {
  const saved = getSavedScenarios()
  const scenario = saved.find(s => s.id === id)
  return scenario ? scenario.state : null
}

/**
 * Delete a saved scenario
 */
export function deleteScenario(id: string): boolean {
  const saved = getSavedScenarios()
  const filtered = saved.filter(s => s.id !== id)
  if (filtered.length === saved.length) return false
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  return true
}

/**
 * Rename a saved scenario
 */
export function renameScenario(id: string, newName: string): boolean {
  const saved = getSavedScenarios()
  const scenario = saved.find(s => s.id === id)
  if (!scenario) return false
  
  scenario.name = newName
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
  return true
}
