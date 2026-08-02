import { State, Delta, RingDatum } from './scenarioTypes'

/**
 * Scale a delta value based on current metric state (context-dependent effects)
 * This creates diminishing returns and makes outcomes vary based on current state
 */
function scaleDeltaByContext(
  deltaValue: number,
  currentValue: number,
  isHigherBetter: boolean,
  maxValue: number = 1
): number {
  if (deltaValue === 0) return 0
  
  // Normalize current value to 0-1 range
  const normalizedCurrent = Math.max(0, Math.min(1, currentValue / maxValue))
  
  // For metrics where higher is better (productionEfficiency, welfareStandardAdoption)
  if (isHigherBetter) {
    if (deltaValue > 0) {
      // Positive change: diminishing returns when already high
      // Scale factor: 1.0 when current=0, 0.5 when current=1
      const scaleFactor = 1.0 - (normalizedCurrent * 0.5)
      return deltaValue * scaleFactor
    } else {
      // Negative change: larger impact when already high
      // Scale factor: 0.5 when current=0, 1.0 when current=1
      const scaleFactor = 0.5 + (normalizedCurrent * 0.5)
      return deltaValue * scaleFactor
    }
  } 
  // For metrics where lower is better (costPerUnit, welfareIncidentRate, all unmeasured)
  else {
    if (deltaValue < 0) {
      // Negative change (improvement): larger impact when current is high (bad)
      // Scale factor: 1.0 when current=1 (bad), 0.5 when current=0 (good)
      const scaleFactor = 0.5 + (normalizedCurrent * 0.5)
      return deltaValue * scaleFactor
    } else {
      // Positive change (worsening): larger impact when current is low (good)
      // Scale factor: 1.0 when current=0 (good), 0.5 when current=1 (bad)
      const scaleFactor = 1.0 - (normalizedCurrent * 0.5)
      return deltaValue * scaleFactor
    }
  }
}

/**
 * Pure function to apply a delta to state
 * This is the core mechanic for state transitions
 * Now includes context-dependent scaling for replayability
 */
export function applyDelta(state: State, delta: Delta): State {
  const newState = { ...state }

  // Apply metrics changes with context-dependent scaling
  if (delta.metrics) {
    if (delta.metrics.measured) {
      const scaledMeasured: Partial<typeof state.metrics.measured> = {}
      
      // Production Efficiency: higher is better
      if (delta.metrics.measured.productionEfficiency !== undefined) {
        scaledMeasured.productionEfficiency = state.metrics.measured.productionEfficiency + 
          scaleDeltaByContext(
            delta.metrics.measured.productionEfficiency,
            state.metrics.measured.productionEfficiency,
            true
          )
      }
      
      // Cost Per Unit: lower is better
      if (delta.metrics.measured.costPerUnit !== undefined) {
        scaledMeasured.costPerUnit = state.metrics.measured.costPerUnit + 
          scaleDeltaByContext(
            delta.metrics.measured.costPerUnit,
            state.metrics.measured.costPerUnit,
            false
          )
      }
      
      // Welfare Incident Rate: lower is better
      if (delta.metrics.measured.welfareIncidentRate !== undefined) {
        scaledMeasured.welfareIncidentRate = state.metrics.measured.welfareIncidentRate + 
          scaleDeltaByContext(
            delta.metrics.measured.welfareIncidentRate,
            state.metrics.measured.welfareIncidentRate,
            false
          )
      }
      
      // Welfare Standard Adoption: higher is better (can exceed 1)
      if (delta.metrics.measured.welfareStandardAdoption !== undefined) {
        scaledMeasured.welfareStandardAdoption = state.metrics.measured.welfareStandardAdoption + 
          scaleDeltaByContext(
            delta.metrics.measured.welfareStandardAdoption,
            Math.min(1, state.metrics.measured.welfareStandardAdoption / 3), // Normalize to 0-1 for scaling
            true,
            3 // Max value is 3
          )
      }
      
      newState.metrics.measured = {
        ...newState.metrics.measured,
        ...scaledMeasured,
      }
      
      // Clamp values to valid ranges
      newState.metrics.measured.productionEfficiency = Math.max(0, Math.min(1, newState.metrics.measured.productionEfficiency))
      newState.metrics.measured.costPerUnit = Math.max(0, Math.min(1, newState.metrics.measured.costPerUnit))
      newState.metrics.measured.welfareIncidentRate = Math.max(0, Math.min(1, newState.metrics.measured.welfareIncidentRate))
      newState.metrics.measured.welfareStandardAdoption = Math.max(0, newState.metrics.measured.welfareStandardAdoption) // Can exceed 1
    }

    if (delta.metrics.unmeasured) {
      const scaledUnmeasured: Partial<typeof state.metrics.unmeasured> = {}
      
      // All unmeasured metrics: lower is better
      Object.entries(delta.metrics.unmeasured).forEach(([key, deltaValue]) => {
        const currentValue = state.metrics.unmeasured[key as keyof typeof state.metrics.unmeasured]
        scaledUnmeasured[key as keyof typeof scaledUnmeasured] = currentValue + 
          scaleDeltaByContext(deltaValue, currentValue, false)
      })
      
      newState.metrics.unmeasured = {
        ...newState.metrics.unmeasured,
        ...scaledUnmeasured,
      }
      
      // Clamp values to valid ranges
      Object.keys(newState.metrics.unmeasured).forEach(key => {
        const value = newState.metrics.unmeasured[key as keyof typeof newState.metrics.unmeasured]
        newState.metrics.unmeasured[key as keyof typeof newState.metrics.unmeasured] = Math.max(0, Math.min(1, value))
      })
    }
  }

  // Apply map changes
  if (delta.map) {
    // Update region values (additive adjustments)
    if (delta.map.regionValues) {
      newState.map.regionValues = { ...newState.map.regionValues }
      
      // Define regional propagation: when a country improves, nearby/trading partners improve slightly
      const regionalPropagation: Record<string, string[]> = {
        // North America
        'USA': ['CAN', 'MEX'], // US improvements affect Canada and Mexico
        'CAN': ['USA', 'MEX'], // Canada improvements affect US and Mexico
        'MEX': ['USA', 'CAN'], // Mexico improvements affect US and Canada
        // Europe - major economies affect neighbors
        'GBR': ['IRL', 'FRA', 'DEU', 'NLD', 'BEL'],
        'FRA': ['GBR', 'DEU', 'ESP', 'ITA', 'BEL', 'CHE'],
        'DEU': ['FRA', 'AUT', 'POL', 'CZE', 'NLD', 'BEL', 'CHE'],
        'ITA': ['FRA', 'ESP', 'AUT', 'CHE'],
        'ESP': ['FRA', 'ITA', 'PRT'],
        'NLD': ['BEL', 'DEU', 'GBR'],
        'BEL': ['FRA', 'DEU', 'NLD'],
        'POL': ['DEU', 'CZE', 'SVK'],
        'SWE': ['DNK', 'NOR', 'FIN'],
        'DNK': ['SWE', 'NOR', 'DEU'],
        // Asia - major economies affect regional partners
        'CHN': ['JPN', 'KOR', 'THA', 'IDN', 'MYS', 'PHL', 'VNM'],
        'JPN': ['CHN', 'KOR', 'THA'],
        'KOR': ['CHN', 'JPN'],
        'IND': ['PAK', 'BGD', 'LKA', 'NPL'],
        'THA': ['VNM', 'MYS', 'IDN', 'PHL'],
        'IDN': ['MYS', 'THA', 'PHL', 'SGP'],
        'MYS': ['SGP', 'IDN', 'THA'],
        'PHL': ['IDN', 'THA', 'VNM'],
        // South America
        'BRA': ['ARG', 'CHL', 'URY', 'PRY'],
        'ARG': ['BRA', 'CHL', 'URY'],
        'CHL': ['ARG', 'PER', 'BOL'],
        // Oceania
        'AUS': ['NZL'],
        'NZL': ['AUS'],
        // Africa & Middle East
        'ZAF': ['BWA', 'ZWE', 'MOZ', 'NAM'],
        'EGY': ['LBY', 'SDN', 'JOR', 'ISR'],
        'SAU': ['ARE', 'KWT', 'BHR', 'OMN', 'QAT'],
        'TUR': ['GRC', 'BGR', 'GEO', 'ARM'],
        'ISR': ['JOR', 'LBN', 'EGY'],
      }
      
      // First, apply direct updates
      Object.entries(delta.map.regionValues).forEach(([iso3, adjustment]) => {
        newState.map.regionValues[iso3] = Math.max(0, Math.min(1, 
          (newState.map.regionValues[iso3] || 0) + adjustment
        ))
        
        // Propagate to related countries (smaller effect, only if positive)
        if (adjustment > 0 && regionalPropagation[iso3]) {
          const propagationAmount = adjustment * 0.3 // 30% of the original improvement
          regionalPropagation[iso3].forEach(relatedIso3 => {
            // Only propagate if the related country exists in regionValues
            if (newState.map.regionValues[relatedIso3] !== undefined) {
              newState.map.regionValues[relatedIso3] = Math.max(0, Math.min(1,
                newState.map.regionValues[relatedIso3] + propagationAmount
              ))
            }
          })
        }
      })
    }

    // Activate arcs (by ID, will be matched with loaded flows.json)
    if (delta.map.activateArcs) {
      const currentNodeId = newState.currentNodeId  // Track which node triggered this
      const newArcs = delta.map.activateArcs.map(arcId => {
        // Find arc in existing activeArcs or create placeholder
        const existing = newState.map.activeArcs.find(a => a.id === arcId)
        if (existing) {
          // Update triggeredBy if not already set
          return { ...existing, triggeredByNodeId: existing.triggeredByNodeId || currentNodeId }
        }
        // Return placeholder - will be replaced when flows.json loads
        return {
          id: arcId,
          startLat: 0,
          startLng: 0,
          endLat: 0,
          endLng: 0,
          type: 'supply_chain' as const,
          baseWeight: 0.5,
          label: arcId,
          triggeredByNodeId: currentNodeId,
        }
      })
      // Merge with existing, avoiding duplicates
      const existingIds = new Set(newState.map.activeArcs.map(a => a.id))
      newArcs.forEach(arc => {
        if (!existingIds.has(arc.id)) {
          newState.map.activeArcs.push(arc)
        } else {
          // Update existing arc with triggeredBy if not set
          const existingIndex = newState.map.activeArcs.findIndex(a => a.id === arc.id)
          if (existingIndex >= 0 && !newState.map.activeArcs[existingIndex].triggeredByNodeId) {
            newState.map.activeArcs[existingIndex] = { ...newState.map.activeArcs[existingIndex], triggeredByNodeId: currentNodeId }
          }
        }
      })
    }

    // Activate hubs (by ID, will be matched with loaded hubs.json)
    if (delta.map.activateHubs) {
      const newHubs = delta.map.activateHubs.map(hubId => {
        // Find hub in existing activeHubs or create placeholder
        const existing = newState.map.activeHubs.find(h => h.id === hubId)
        if (existing) return existing
        // Return placeholder - will be replaced when hubs.json loads
        return {
          id: hubId,
          name: hubId,
          lat: 0,
          lng: 0,
          iso3: '',
          type: 'unknown',
        }
      })
      // Merge with existing, avoiding duplicates
      const existingIds = new Set(newState.map.activeHubs.map(h => h.id))
      newHubs.forEach(hub => {
        if (!existingIds.has(hub.id)) {
          newState.map.activeHubs.push(hub)
        }
      })
    }

    // Spawn rings
    if (delta.map.spawnRings) {
      const currentNodeId = newState.currentNodeId  // Track which node triggered this
      const newRings: RingDatum[] = delta.map.spawnRings.map((ring, idx) => ({
        id: `ring_${state.turn}_${idx}_${Date.now()}`,
        lat: ring.lat,
        lng: ring.lng,
        eventType: ring.eventType,
        ttl: ring.ttl,
        createdTurn: state.turn,
        triggeredByNodeId: currentNodeId,
      }))
      newState.map.activeRings = [...newState.map.activeRings, ...newRings]
    }
  }

  // Update system irreversibility based on welfare debt and enforcement gap.
  // Instead of a one-way ratchet, we move gradually toward a target value so that
  // irreversibility can also recover (slowly) when debt/enforcement gap are reduced.
  const currentIrreversibility = newState.metrics.unmeasured.systemIrreversibility
  const targetIrreversibility = Math.min(
    1,
    newState.metrics.unmeasured.welfareDebt * 0.7 +
      newState.metrics.unmeasured.enforcementGap * 0.5
  )
  // Move a fraction of the way toward the target each turn
  const adjustment = (targetIrreversibility - currentIrreversibility) * 0.25
  newState.metrics.unmeasured.systemIrreversibility = Math.max(
    0,
    Math.min(1, currentIrreversibility + adjustment)
  )

  return newState
}
