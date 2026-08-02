import { describe, it, expect } from 'vitest'
import { advanceIncidentTime, formatIncidentClock, getTimeCost } from './incidentClock'
import { createMockState } from './testFixtures'
import { Choice } from './scenarioTypes'

describe('advanceIncidentTime', () => {
  it('increases incidentTime in simulated mode by the requested minutes', () => {
    const state = createMockState({ incidentTime: 0, timeMode: 'simulated' })
    const next = advanceIncidentTime(state, 30)
    expect(next.incidentTime).toBeGreaterThan(state.incidentTime)
    expect(next.incidentTime).toBe(30)
  })

  it('increases incidentTime in learning mode, but by a reduced amount', () => {
    const state = createMockState({ incidentTime: 0, timeMode: 'learning' })
    const next = advanceIncidentTime(state, 30)
    expect(next.incidentTime).toBeGreaterThan(state.incidentTime)
    expect(next.incidentTime).toBeLessThan(30)
  })

  it('marks deadlines missed once incidentTime passes dueAt', () => {
    const state = createMockState({
      incidentTime: 0,
      timeMode: 'simulated',
      deadlines: [{ id: 'd1', label: 'Test deadline', kind: 'regulatory', dueAt: 10 }],
    })
    const next = advanceIncidentTime(state, 30)
    expect(next.deadlines[0].missed).toBe(true)
  })

  it('accumulates time across multiple calls', () => {
    let state = createMockState({ incidentTime: 0, timeMode: 'simulated' })
    state = advanceIncidentTime(state, 20)
    state = advanceIncidentTime(state, 15)
    expect(state.incidentTime).toBe(35)
  })
})

describe('getTimeCost', () => {
  it('defaults to 30 minutes when no cost is specified', () => {
    const choice: Choice = { label: 'x', delta: {}, nextNodeId: 'N' }
    expect(getTimeCost(choice)).toBe(30)
  })

  it('prefers an explicit choice.timeCost', () => {
    const choice: Choice = { label: 'x', delta: {}, nextNodeId: 'N', timeCost: 15 }
    expect(getTimeCost(choice)).toBe(15)
  })
})

describe('formatIncidentClock', () => {
  it('formats minutes into T+Hh MMm', () => {
    expect(formatIncidentClock(90)).toBe('T+1h 30m')
    expect(formatIncidentClock(0)).toBe('T+0h 00m')
  })
})
