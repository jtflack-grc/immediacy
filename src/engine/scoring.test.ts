import { describe, it, expect } from 'vitest'
import { calculateMeasuredSuccessIndex, calculateGovernanceDebtIndex } from './scoring'
import { MeasuredMetrics, UnmeasuredMetrics } from './scenarioTypes'

const baseMeasured: MeasuredMetrics = {
  operationalControl: 0.5,
  financialBurn: 0.5,
  serviceDisruption: 0.5,
  disclosurePosture: 1.5,
  evidenceIntegrity: 0.5,
  stakeholderTrust: 0.5,
}

const baseUnmeasured: UnmeasuredMetrics = {
  disclosureDebt: 0.5,
  regulatoryExposure: 0.5,
  narrativeIntegrity: 0.5,
  factsConfidence: 0.5,
  commitmentLock: 0.5,
}

describe('calculateMeasuredSuccessIndex', () => {
  it('stays within 0-1 bounds for mid-range metrics', () => {
    const index = calculateMeasuredSuccessIndex(baseMeasured)
    expect(index).toBeGreaterThanOrEqual(0)
    expect(index).toBeLessThanOrEqual(1)
  })

  it('returns 1 when all metrics are at their best value', () => {
    const index = calculateMeasuredSuccessIndex({
      operationalControl: 1,
      financialBurn: 0,
      serviceDisruption: 0,
      disclosurePosture: 3,
      evidenceIntegrity: 1,
      stakeholderTrust: 1,
    })
    expect(index).toBeCloseTo(1, 5)
  })

  it('returns 0 when all metrics are at their worst value', () => {
    const index = calculateMeasuredSuccessIndex({
      operationalControl: 0,
      financialBurn: 1,
      serviceDisruption: 1,
      disclosurePosture: 0,
      evidenceIntegrity: 0,
      stakeholderTrust: 0,
    })
    expect(index).toBeCloseTo(0, 5)
  })

  it('increases as operationalControl improves (higher-better polarity)', () => {
    const low = calculateMeasuredSuccessIndex({ ...baseMeasured, operationalControl: 0.1 })
    const high = calculateMeasuredSuccessIndex({ ...baseMeasured, operationalControl: 0.9 })
    expect(high).toBeGreaterThan(low)
  })
})

describe('calculateGovernanceDebtIndex', () => {
  it('stays within 0-1 bounds for mid-range metrics', () => {
    const index = calculateGovernanceDebtIndex(baseUnmeasured)
    expect(index).toBeGreaterThanOrEqual(0)
    expect(index).toBeLessThanOrEqual(1)
  })

  it('returns 0 when debt-worsening metrics are at 0 and quality metrics are at 1', () => {
    const index = calculateGovernanceDebtIndex({
      disclosureDebt: 0,
      regulatoryExposure: 0,
      commitmentLock: 0,
      narrativeIntegrity: 1,
      factsConfidence: 1,
    })
    expect(index).toBeCloseTo(0, 5)
  })

  it('returns 1 when debt-worsening metrics are at 1 and quality metrics are at 0', () => {
    const index = calculateGovernanceDebtIndex({
      disclosureDebt: 1,
      regulatoryExposure: 1,
      commitmentLock: 1,
      narrativeIntegrity: 0,
      factsConfidence: 0,
    })
    expect(index).toBeCloseTo(1, 5)
  })

  it('narrativeIntegrity has inverse polarity — higher integrity lowers the debt index', () => {
    const lowIntegrity = calculateGovernanceDebtIndex({ ...baseUnmeasured, narrativeIntegrity: 0.1 })
    const highIntegrity = calculateGovernanceDebtIndex({ ...baseUnmeasured, narrativeIntegrity: 0.9 })
    expect(highIntegrity).toBeLessThan(lowIntegrity)
  })

  it('factsConfidence has inverse polarity — higher confidence lowers the debt index', () => {
    const lowConfidence = calculateGovernanceDebtIndex({ ...baseUnmeasured, factsConfidence: 0.1 })
    const highConfidence = calculateGovernanceDebtIndex({ ...baseUnmeasured, factsConfidence: 0.9 })
    expect(highConfidence).toBeLessThan(lowConfidence)
  })

  it('disclosureDebt has direct polarity — higher debt raises the debt index', () => {
    const lowDebt = calculateGovernanceDebtIndex({ ...baseUnmeasured, disclosureDebt: 0.1 })
    const highDebt = calculateGovernanceDebtIndex({ ...baseUnmeasured, disclosureDebt: 0.9 })
    expect(highDebt).toBeGreaterThan(lowDebt)
  })
})
