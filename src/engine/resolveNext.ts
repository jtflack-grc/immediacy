import { State, Choice, Node } from './scenarioTypes'

/**
 * Resolve next node from choice + state flags/metrics.
 * Supports Choice.delta.nextWhen: [{ when: 'flagName', nextNodeId }]
 * and diverging nextNodeId on choices.
 */
export function resolveNextNodeId(state: State, choice: Choice, _node: Node): string {
  const nextWhen = choice.delta?.nextWhen
  if (nextWhen?.length) {
    for (const rule of nextWhen) {
      if (state.flags[rule.when]) return rule.nextNodeId
    }
  }

  // Global branch overrides for known spine forks
  if (choice.nextNodeId === 'N06_REGULATOR_CLOCK' && state.flags.adversaryDisclosedFirst) {
    return 'N06B_ADVERSARY_FIRST'
  }
  // Fork A (N01 first signal, aggressive containment): hard containment at the very first
  // signal means the isolate-or-observe dilemma already happened implicitly — skip straight
  // to a short "already contained" beat instead of re-litigating containment.
  if (choice.nextNodeId === 'N03_ISOLATE_OR_OBSERVE' && state.flags.earlyHardContain) {
    return 'N03B_CONTAINED_THEN_RANSOM'
  }
  // Fork B (N02 scope triage): under-scoping or premature certainty forces the harder
  // insurer/coverage path instead of the standard forensics conversation, mirroring what
  // already happens on late insurer notice.
  if (
    choice.nextNodeId === 'N10_INSURER_FORENSICS' &&
    (state.flags.lateInsurerNotice || state.flags.underScoped || state.flags.prematureCertainty)
  ) {
    return 'N10C_COVERAGE_RISK'
  }
  // Fork B (N02 scope triage): a broad, transparent early scope call means the board already
  // has the facts it needs — skip the soft-status comms-drafting detour and go straight to
  // briefing employees.
  if (choice.nextNodeId === 'N08_COMMS_DRAFT' && state.flags.factsFirstComms) {
    return 'N09_EMPLOYEES'
  }
  if (choice.nextNodeId === 'N09_EMPLOYEES' && state.flags.staffLearnedFromPress) {
    return 'N09B_STAFF_FROM_PRESS'
  }
  if (choice.nextNodeId === 'N12B_RANSOM_PAY' && state.flags.paidRansom) {
    return 'N12C_PAYMENT_AFTERMATH'
  }

  return choice.nextNodeId
}

export function isChoiceLocked(state: State, choice: Choice): boolean {
  if (choice.locksWhen) {
    for (const [k, v] of Object.entries(choice.locksWhen)) {
      if (typeof v === 'boolean' && Boolean(state.flags[k]) === v) return true
      if (typeof v === 'number') {
        // metric threshold locks e.g. commitmentLock > 0.8 encoded as locksWhen in future
        const metric = (state.metrics.unmeasured as any)[k] ?? (state.metrics.measured as any)[k]
        if (typeof metric === 'number' && metric >= v) return true
      }
    }
  }
  if (choice.requires) {
    for (const [k, v] of Object.entries(choice.requires)) {
      if (typeof v === 'boolean' && v === true && !state.flags[k] && !state.scenarioConditions?.includes(k)) {
        return true // missing required flag → unavailable
      }
    }
  }
  // High commitment lock disables walk-backs
  if (state.metrics.unmeasured.commitmentLock > 0.8 && /walk back|retract|deny payment|unsay/.test(choice.label.toLowerCase())) {
    return true
  }
  return false
}
