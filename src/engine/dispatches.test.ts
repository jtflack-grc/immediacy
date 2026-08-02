import { describe, it, expect } from 'vitest'
import { deliverDueDispatches } from './dispatches'
import { createMockState } from './testFixtures'

describe('deliverDueDispatches', () => {
  it('delivers counsel_joins once incidentTime reaches 45 minutes', () => {
    const state = createMockState({ incidentTime: 45 })
    const next = deliverDueDispatches(state)
    const delivered = next.dispatchLog.find(d => d.id === 'counsel_joins')
    expect(delivered).toBeDefined()
    expect(next.flags.counselPresent).toBe(true)
    expect(next.deadlines.some(d => d.id === 'gdpr_72h')).toBe(true)
  })

  it('delivers counsel_joins for any incidentTime past the threshold', () => {
    const state = createMockState({ incidentTime: 200 })
    const next = deliverDueDispatches(state)
    expect(next.dispatchLog.some(d => d.id === 'counsel_joins')).toBe(true)
  })

  it('does not deliver counsel_joins before incidentTime reaches 45 minutes', () => {
    const state = createMockState({ incidentTime: 44 })
    const next = deliverDueDispatches(state)
    expect(next.dispatchLog.some(d => d.id === 'counsel_joins')).toBe(false)
  })

  it('does not re-deliver a dispatch already present in dispatchLog', () => {
    const state = createMockState({ incidentTime: 45 })
    const first = deliverDueDispatches(state)
    const second = deliverDueDispatches(first)
    const count = second.dispatchLog.filter(d => d.id === 'counsel_joins').length
    expect(count).toBe(1)
  })

  it('gates requires-flagged dispatches like threat_proof behind their flag', () => {
    const withoutFlag = createMockState({ incidentTime: 200 })
    const next = deliverDueDispatches(withoutFlag)
    expect(next.dispatchLog.some(d => d.id === 'threat_proof')).toBe(false)

    const withFlag = createMockState({
      incidentTime: 200,
      flags: { isComplete: false, showCredits: false, delayedEscalation: true },
    })
    const nextWithFlag = deliverDueDispatches(withFlag)
    expect(nextWithFlag.dispatchLog.some(d => d.id === 'threat_proof')).toBe(true)
  })
})
