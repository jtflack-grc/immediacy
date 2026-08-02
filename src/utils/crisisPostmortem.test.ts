import { describe, it, expect } from 'vitest'
import { generateCrisisPostmortem } from './crisisPostmortem'
import { createMockState } from '../engine/testFixtures'
import { AuditRecord } from '../engine/scenarioTypes'

describe('generateCrisisPostmortem', () => {
  it('generates a complete report object for a fresh run with no decisions', () => {
    const state = createMockState()
    const report = generateCrisisPostmortem(state)

    expect(report.timeToDeclare.found).toBe(false)
    expect(report.timeToContain.found).toBe(false)
    expect(report.evidencePreservation.value).toBe(state.metrics.measured.evidenceIntegrity)
    expect(report.factsConfidence.value).toBe(state.metrics.unmeasured.factsConfidence)
    expect(report.disclosureTimeliness).toBeDefined()
    expect(report.narrativeConsistency).toBeDefined()
    expect(report.stakeholderTrust).toBeDefined()
    expect(report.regulatoryPosture).toBeDefined()
    expect(report.insurance.coverageAtRisk).toBe(false)
    expect(report.operationalRecovery).toBeDefined()
    expect(report.decisionOwnership.totalDecisions).toBe(0)
    expect(report.assumptionQuality.totalCount).toBe(0)
    expect(typeof report.disclosureDebtAccumulated).toBe('number')
    expect(report.pivotalMoments).toEqual([])
    expect(report.counterfactuals.length).toBeGreaterThan(0)
  })

  it('detects declare and contain milestones from the audit trail', () => {
    const auditTrail: AuditRecord[] = [
      {
        turn: 1,
        phaseId: 'P1',
        nodeId: 'N01',
        nodeTitle: 'Initial Detection',
        chosenLabel: 'Isolate the affected segment immediately',
        ownerRole: 'CISO',
        rationale: 'Contain fast',
        assumptions: '',
        unmeasuredImpact: '',
        timestamp: Date.now(),
        incidentTime: 20,
      },
      {
        turn: 2,
        phaseId: 'P1',
        nodeId: 'N02',
        nodeTitle: 'Regulator Clock',
        chosenLabel: 'Notify affected customers and regulators',
        ownerRole: 'Crisis Counsel',
        rationale: 'Disclose now',
        assumptions: '',
        unmeasuredImpact: '',
        timestamp: Date.now(),
        incidentTime: 90,
      },
    ]
    const state = createMockState({ auditTrail })
    const report = generateCrisisPostmortem(state)

    expect(report.timeToContain.found).toBe(true)
    expect(report.timeToContain.incidentMinutes).toBe(20)
    expect(report.timeToDeclare.found).toBe(true)
    expect(report.timeToDeclare.incidentMinutes).toBe(90)
    expect(report.decisionOwnership.totalDecisions).toBe(2)
    expect(report.decisionOwnership.uniqueOwners).toBe(2)
  })

  it('surfaces pivotal moments ranked by disclosureDebt/commitmentLock movement', () => {
    const baseMetrics = createMockState().metrics
    const auditTrail: AuditRecord[] = [
      {
        turn: 1,
        phaseId: 'P1',
        nodeId: 'N01',
        nodeTitle: 'Small move',
        chosenLabel: 'Minor update',
        ownerRole: 'CISO',
        rationale: '',
        assumptions: '',
        unmeasuredImpact: '',
        timestamp: Date.now(),
        metricsSnapshot: {
          measured: baseMetrics.measured,
          unmeasured: { ...baseMetrics.unmeasured, disclosureDebt: baseMetrics.unmeasured.disclosureDebt + 0.02 },
        },
      },
      {
        turn: 2,
        phaseId: 'P1',
        nodeId: 'N02',
        nodeTitle: 'Big move',
        chosenLabel: 'Major escalation',
        ownerRole: 'Crisis Counsel',
        rationale: '',
        assumptions: '',
        unmeasuredImpact: '',
        timestamp: Date.now(),
        metricsSnapshot: {
          measured: baseMetrics.measured,
          unmeasured: {
            ...baseMetrics.unmeasured,
            disclosureDebt: baseMetrics.unmeasured.disclosureDebt + 0.3,
            commitmentLock: baseMetrics.unmeasured.commitmentLock + 0.2,
          },
        },
      },
    ]
    const state = createMockState({ auditTrail })
    const report = generateCrisisPostmortem(state)

    expect(report.pivotalMoments.length).toBeGreaterThan(0)
    expect(report.pivotalMoments[0].nodeTitle).toBe('Big move')
  })

  it('includes flag-based counterfactuals when adversaryDisclosedFirst is set', () => {
    const state = createMockState({
      flags: { isComplete: false, showCredits: false, adversaryDisclosedFirst: true },
    })
    const report = generateCrisisPostmortem(state)
    expect(report.counterfactuals.some(c => /adversary/i.test(c))).toBe(true)
  })
})
