import { State, ArcDatum, HubDatum, RingDatum } from './scenarioTypes'

/**
 * Get active arcs filtered and weighted by state
 */
export function getActiveArcs(state: State, allArcs: ArcDatum[]): ArcDatum[] {
  const activeArcIds = new Set(state.map.activeArcs.map(a => a.id))
  
  // If no arcs are explicitly activated, show some based on welfare debt
  if (activeArcIds.size === 0 && state.metrics.unmeasured.welfareDebt > 0.3) {
    // Auto-activate first few arcs when welfare debt is high
    return allArcs.slice(0, Math.floor(state.metrics.unmeasured.welfareDebt * 5))
      .map(arc => {
        const weightMultiplier = 1 + (state.metrics.unmeasured.welfareDebt * 2)
        return {
          ...arc,
          baseWeight: arc.baseWeight * weightMultiplier,
        }
      })
  }
  
  return allArcs
    .filter(arc => activeArcIds.has(arc.id))
    .map(arc => {
      // Weight by welfare debt - higher debt = more visible arcs
      const weightMultiplier = 1 + (state.metrics.unmeasured.welfareDebt * 2)
      return {
        ...arc,
        baseWeight: arc.baseWeight * weightMultiplier,
      }
    })
}

/**
 * Get active hubs filtered and sized by state
 */
export function getActiveHubs(state: State, allHubs: HubDatum[]): HubDatum[] {
  const activeHubIds = new Set(state.map.activeHubs.map(h => h.id))
  
  // If no hubs are explicitly activated, show some based on welfare standard adoption
  if (activeHubIds.size === 0 && state.metrics.measured.welfareStandardAdoption > 0.5) {
    return allHubs.slice(0, Math.floor(state.metrics.measured.welfareStandardAdoption))
      .map(hub => ({
        ...hub,
        _size: 0.5 + (state.metrics.unmeasured.regulatoryCapture * 0.5),
        _brightness: 0.5 + (state.metrics.measured.welfareStandardAdoption / 3) * 0.5,
      }))
  }
  
  return allHubs
    .filter(hub => activeHubIds.has(hub.id))
    .map(hub => ({
      ...hub,
      // Size/brightness based on regulatory capture and welfare standard adoption
      // This is metadata for rendering, not part of HubDatum type
      _size: 0.5 + (state.metrics.unmeasured.regulatoryCapture * 0.5),
      _brightness: 0.5 + (state.metrics.measured.welfareStandardAdoption / 3) * 0.5,
    }))
}

/**
 * Get active rings (filter out expired ones)
 */
export function getActiveRings(state: State): RingDatum[] {
  return state.map.activeRings.filter(ring => {
    const age = state.turn - ring.createdTurn
    return age < ring.ttl
  })
}

/**
 * Get degraded assumptions (strength below threshold)
 */
export function getDegradedAssumptions(state: State) {
  const threshold = 0.3
  return state.memory.assumptionsBank.filter(a => a.strength < threshold)
}
