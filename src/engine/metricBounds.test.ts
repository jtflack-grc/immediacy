import { describe, it, expect } from 'vitest'
import { applyDelta } from './applyDelta'
import { createMockState } from './testFixtures'

describe('applyDelta metric clamping', () => {
  it('clamps unmeasured metrics to a maximum of 1', () => {
    const state = createMockState({
      metrics: {
        measured: createMockState().metrics.measured,
        unmeasured: { ...createMockState().metrics.unmeasured, disclosureDebt: 0.95 },
      },
    })
    const next = applyDelta(state, { metrics: { unmeasured: { disclosureDebt: 0.5 } } })
    expect(next.metrics.unmeasured.disclosureDebt).toBeLessThanOrEqual(1)
    expect(next.metrics.unmeasured.disclosureDebt).toBeGreaterThanOrEqual(0)
  })

  it('clamps unmeasured metrics to a minimum of 0', () => {
    const state = createMockState({
      metrics: {
        measured: createMockState().metrics.measured,
        unmeasured: { ...createMockState().metrics.unmeasured, factsConfidence: 0.05 },
      },
    })
    const next = applyDelta(state, { metrics: { unmeasured: { factsConfidence: -0.5 } } })
    expect(next.metrics.unmeasured.factsConfidence).toBeGreaterThanOrEqual(0)
  })

  it('clamps measured operationalControl within 0-1', () => {
    const state = createMockState({
      metrics: {
        measured: { ...createMockState().metrics.measured, operationalControl: 0.98 },
        unmeasured: createMockState().metrics.unmeasured,
      },
    })
    const next = applyDelta(state, { metrics: { measured: { operationalControl: 0.5 } } })
    expect(next.metrics.measured.operationalControl).toBeLessThanOrEqual(1)
  })

  it('clamps measured financialBurn to a minimum of 0', () => {
    const state = createMockState({
      metrics: {
        measured: { ...createMockState().metrics.measured, financialBurn: 0.02 },
        unmeasured: createMockState().metrics.unmeasured,
      },
    })
    const next = applyDelta(state, { metrics: { measured: { financialBurn: -0.5 } } })
    expect(next.metrics.measured.financialBurn).toBeGreaterThanOrEqual(0)
  })

  it('allows disclosurePosture to exceed 1 (its scale is 0-3) but not go negative', () => {
    const state = createMockState({
      metrics: {
        measured: { ...createMockState().metrics.measured, disclosurePosture: 2.9 },
        unmeasured: createMockState().metrics.unmeasured,
      },
    })
    const next = applyDelta(state, { metrics: { measured: { disclosurePosture: 0.5 } } })
    expect(next.metrics.measured.disclosurePosture).toBeGreaterThan(1)
    expect(next.metrics.measured.disclosurePosture).toBeGreaterThanOrEqual(0)
  })

  it('never produces NaN metrics when starting from boundary values', () => {
    const state = createMockState({
      metrics: {
        measured: { ...createMockState().metrics.measured, operationalControl: 0, evidenceIntegrity: 1 },
        unmeasured: { ...createMockState().metrics.unmeasured, commitmentLock: 1 },
      },
    })
    const next = applyDelta(state, {
      metrics: {
        measured: { operationalControl: -0.9, evidenceIntegrity: 0.9 },
        unmeasured: { commitmentLock: -0.9 },
      },
    })
    expect(Number.isNaN(next.metrics.measured.operationalControl)).toBe(false)
    expect(Number.isNaN(next.metrics.measured.evidenceIntegrity)).toBe(false)
    expect(Number.isNaN(next.metrics.unmeasured.commitmentLock)).toBe(false)
  })
})
