import { describe, it, expect } from 'vitest'
import { buildMessageSequence, getBriefingMessages, personalizePrompt } from './messageBuilder'
import type { Node } from '../engine/scenarioTypes'
import type { SecurityResearchCard } from './securityResearch'

function stubNode(overrides: Partial<Node> = {}): Node {
  return {
    id: 'N01_SCOPE',
    title: 'Scope the blast radius',
    prompt: 'SOC flags impossible travel across three privileged accounts. How do you respond?',
    context: 'Customer telemetry is beginning to fail in two regions.',
    choices: [
      { label: 'Declare Sev-1 now', delta: { measured: {}, unmeasured: {} }, nextNodeId: 'N02' },
    ],
    caseStudies: [
      {
        title: 'Example breach',
        description: 'A short case study for the briefing feed.',
      },
    ],
    ...overrides,
  }
}

const researchStub: SecurityResearchCard = {
  id: 'owasp_access_control',
  framework: 'OWASP',
  title: 'Broken Access Control',
  description: 'Access control enforces policy.',
  keyQuestions: ['Who can still authenticate?'],
  researchAreas: ['AuthZ'],
  horizon: 'Immediate',
  relevance: 'Privilege paths',
  url: 'https://example.com',
}

describe('personalizePrompt', () => {
  it('lowercases ordinary sentence-case prompts', () => {
    expect(personalizePrompt('Incident Lead', 'Should we isolate the VPN?')).toBe(
      'Incident Lead, should we isolate the VPN?'
    )
  })

  it('preserves leading acronyms like SOC', () => {
    expect(personalizePrompt('Incident Lead', 'SOC flags impossible travel across three privileged accounts. How do you respond?')).toBe(
      'Incident Lead, SOC flags impossible travel across three privileged accounts. How do you respond?'
    )
  })

  it('preserves GDPR-style acronyms', () => {
    expect(personalizePrompt('Alex', 'GDPR clocks are already running — notify?')).toBe(
      'Alex, GDPR clocks are already running — notify?'
    )
  })
})

describe('buildMessageSequence', () => {
  it('keeps research cards in the same array before choices', () => {
    const messages = buildMessageSequence(stubNode(), 1, 'Incident Lead', [researchStub])
    const types = messages.map(m => m.type)

    expect(types[0]).toBe('system')
    expect(types).toContain('prompt')
    expect(types).toContain('caseStudy')
    expect(types).toContain('research')
    expect(types[types.length - 1]).toBe('choices')
    expect(types.indexOf('research')).toBeLessThan(types.lastIndexOf('choices'))
  })

  it('aligns briefing length with display indexes used for completion', () => {
    const messages = buildMessageSequence(stubNode(), 1, undefined, [researchStub, researchStub])
    const briefing = getBriefingMessages(messages)

    expect(briefing.every(m => m.type !== 'choices')).toBe(true)
    expect(briefing.length).toBe(messages.length - 1)
    expect(briefing.map(m => m.type)).toEqual(
      messages.filter(m => m.type !== 'choices').map(m => m.type)
    )
  })

  it('includes prompt, case studies, and research so Turn 1 is not title-only', () => {
    const node = stubNode()
    ;(node as Node & { moralUncertainties: string[] }).moralUncertainties = ['What is in scope?']
    const messages = buildMessageSequence(node, 1, 'Incident Lead', [researchStub])
    const briefing = getBriefingMessages(messages)
    const types = briefing.map(m => m.type)

    expect(types).toContain('system')
    expect(types).toContain('prompt')
    expect(types).toContain('caseStudy')
    expect(types).toContain('research')
    expect(briefing.some(m => m.content.includes('Key Questions'))).toBe(true)
    expect(briefing.length).toBeGreaterThan(1)
  })
})
