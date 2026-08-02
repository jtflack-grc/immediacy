import { describe, it, expect } from 'vitest'
import { resolveNextNodeId, isChoiceLocked } from './resolveNext'
import { Choice, Node } from './scenarioTypes'
import { createMockState } from './testFixtures'

const dummyNode: Node = {
  id: 'N06_REGULATOR_CLOCK',
  title: 'Regulator clock',
  prompt: '',
  context: '',
  choices: [],
}

function makeChoice(nextNodeId: string): Choice {
  return {
    label: 'Continue',
    delta: {},
    nextNodeId,
  }
}

describe('resolveNextNodeId', () => {
  it('routes to N06B_ADVERSARY_FIRST when adversaryDisclosedFirst flag is set', () => {
    const state = createMockState({ flags: { isComplete: false, showCredits: false, adversaryDisclosedFirst: true } })
    const choice = makeChoice('N06_REGULATOR_CLOCK')
    expect(resolveNextNodeId(state, choice, dummyNode)).toBe('N06B_ADVERSARY_FIRST')
  })

  it('does not branch when adversaryDisclosedFirst flag is unset', () => {
    const state = createMockState()
    const choice = makeChoice('N06_REGULATOR_CLOCK')
    expect(resolveNextNodeId(state, choice, dummyNode)).toBe('N06_REGULATOR_CLOCK')
  })

  it('routes to N12C_PAYMENT_AFTERMATH when paidRansom flag is set', () => {
    const state = createMockState({ flags: { isComplete: false, showCredits: false, paidRansom: true } })
    const choice = makeChoice('N12B_RANSOM_PAY')
    expect(resolveNextNodeId(state, choice, dummyNode)).toBe('N12C_PAYMENT_AFTERMATH')
  })

  it('does not branch to payment aftermath when paidRansom flag is unset', () => {
    const state = createMockState()
    const choice = makeChoice('N12B_RANSOM_PAY')
    expect(resolveNextNodeId(state, choice, dummyNode)).toBe('N12B_RANSOM_PAY')
  })

  it('honors nextWhen rules before global overrides', () => {
    const state = createMockState({ flags: { isComplete: false, showCredits: false, customFlag: true } })
    const choice: Choice = {
      label: 'Custom',
      delta: { nextWhen: [{ when: 'customFlag', nextNodeId: 'N_CUSTOM' }] },
      nextNodeId: 'N_DEFAULT',
    }
    expect(resolveNextNodeId(state, choice, dummyNode)).toBe('N_CUSTOM')
  })
})

describe('isChoiceLocked', () => {
  it('locks walk-back choices when commitmentLock exceeds 0.8', () => {
    const state = createMockState({
      metrics: {
        measured: createMockState().metrics.measured,
        unmeasured: { ...createMockState().metrics.unmeasured, commitmentLock: 0.9 },
      },
    })
    const choice = makeChoice('N_ANY')
    choice.label = 'Walk back the earlier statement'
    expect(isChoiceLocked(state, choice)).toBe(true)
  })

  it('does not lock unrelated choices even with high commitmentLock', () => {
    const state = createMockState({
      metrics: {
        measured: createMockState().metrics.measured,
        unmeasured: { ...createMockState().metrics.unmeasured, commitmentLock: 0.9 },
      },
    })
    const choice = makeChoice('N_ANY')
    choice.label = 'Escalate to the board'
    expect(isChoiceLocked(state, choice)).toBe(false)
  })
})
