import { SecurityResearchCard, securityResearchCards } from './securityResearch'
import { State } from '../engine/scenarioTypes'

function byId(id: string): SecurityResearchCard {
  const card = securityResearchCards.find(c => c.id === id)
  if (!card) throw new Error(`Missing security research card: ${id}`)
  return card
}

/**
 * Match OWASP / MITRE / NIST cards to IMMEDIACY decision nodes.
 */
export function getRelevantSecurityCardsForNode(nodeId: string): SecurityResearchCard[] {
  const relevant: SecurityResearchCard[] = []
  const id = nodeId.toUpperCase()

  if (id.includes('FIRST_SIGNAL') || id.includes('SCOPE')) {
    relevant.push(byId('owasp_access_control'), byId('mitre_initial_access'))
  } else if (id.includes('ISOLATE') || id.includes('CONTAIN')) {
    relevant.push(byId('owasp_misconfig'), byId('nist_800_61'))
  } else if (id.includes('RANSOM') || id.includes('PAY')) {
    relevant.push(byId('cisa_stopransomware'), byId('mitre_exfil_impact'))
  } else if (id.includes('COUNSEL') || id.includes('REGULATOR') || id.includes('SEC_8K') || id.includes('CUSTOMER_NOTIFY')) {
    relevant.push(byId('regulatory_clocks'), byId('fair_secondary_loss'))
  } else if (id.includes('COMMS') || id.includes('REPORTER') || id.includes('EMPLOYEE')) {
    relevant.push(byId('nist_800_61'), byId('fair_secondary_loss'))
  } else if (id.includes('ATTRIBUTION') || id.includes('THIRD_PARTY')) {
    relevant.push(byId('mitre_initial_access'), byId('owasp_access_control'))
  } else if (id.includes('LESSONS') || id.includes('COMPLETE')) {
    relevant.push(byId('owasp_misconfig'), byId('nist_800_61'))
  } else if (id.includes('INSURER') || id.includes('HINT')) {
    relevant.push(byId('nist_800_61'), byId('regulatory_clocks'))
  } else if (id.includes('CUSTOMER') || id.includes('CRYPTO') || id.includes('NOTIFY')) {
    relevant.push(byId('owasp_crypto_failures'), byId('regulatory_clocks'))
  } else {
    // Default teaching pair for unmatched nodes
    relevant.push(byId('owasp_access_control'), byId('fair_secondary_loss'))
  }

  // Deduplicate while preserving order
  const seen = new Set<string>()
  return relevant.filter(c => {
    if (seen.has(c.id)) return false
    seen.add(c.id)
    return true
  })
}

/** @deprecated name — use getRelevantSecurityCardsForNode */
export function getRelevantAnglesForNode(nodeId: string): SecurityResearchCard[] {
  return getRelevantSecurityCardsForNode(nodeId)
}

export function getRelevantSecurityCardsForPhase(phaseId: string, _state?: State): SecurityResearchCard[] {
  const id = phaseId.toUpperCase()
  if (id.includes('DETECTION')) {
    return [byId('owasp_access_control'), byId('mitre_initial_access')]
  }
  if (id.includes('CONTAINMENT')) {
    return [byId('owasp_misconfig'), byId('cisa_stopransomware')]
  }
  if (id.includes('DISCLOSURE')) {
    return [byId('regulatory_clocks'), byId('fair_secondary_loss')]
  }
  if (id.includes('STAKEHOLDER')) {
    return [byId('nist_800_61'), byId('owasp_crypto_failures')]
  }
  if (id.includes('AFTERMATH')) {
    return [byId('mitre_exfil_impact'), byId('nist_800_61')]
  }
  return [byId('fair_secondary_loss'), byId('owasp_access_control')]
}

/** @deprecated name */
export function getRelevantAnglesForPhase(phaseId: string, state: State): SecurityResearchCard[] {
  return getRelevantSecurityCardsForPhase(phaseId, state)
}
