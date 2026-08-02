/**
 * Inject genuine branch-point nodes into scenario.v1.json and wire diverging nextNodeIds
 * on a few spine choices.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const path = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'scenario.v1.json')
const scenario = JSON.parse(readFileSync(path, 'utf8'))

function findPhase(id) {
  return scenario.phases.find(p => p.id === id)
}

function choice(label, next, metrics = {}, timeCost = 30) {
  return {
    label,
    nextNodeId: next,
    timeCost,
    delta: { metrics, timeCost },
  }
}

const branchNodes = [
  {
    phaseId: 'P3_DISCLOSURE',
    after: 'N05B_CUSTOMER_HINT',
    node: {
      id: 'N06B_ADVERSARY_FIRST',
      title: 'Adversary-driven disclosure',
      prompt: 'The leak site posted first. Your customers and a reporter already have the adversary’s narrative. What do you do now?',
      context: 'Delayed escalation let the threat actor set the disclosure clock. Teaching note: this is a simulation of adversary-driven disclosure — not a claim that every delay causes a leak.',
      choices: [
        choice('Publish a bounded factual notice correcting the leak-site claims', 'N07_BOARD_BRIEF', {
          measured: { disclosurePosture: 0.3, stakeholderTrust: 0.05 },
          unmeasured: { disclosureDebt: -0.08, narrativeIntegrity: 0.06 },
        }, 40),
        choice('Hold for counsel while monitoring the leak site', 'N07_BOARD_BRIEF', {
          unmeasured: { disclosureDebt: 0.1, regulatoryExposure: 0.08, narrativeIntegrity: -0.05 },
        }, 50),
        choice('Full transparent dump of everything you know — including unverified items', 'N07_BOARD_BRIEF', {
          measured: { disclosurePosture: 0.4 },
          unmeasured: { factsConfidence: -0.08, commitmentLock: 0.1, disclosureDebt: -0.05 },
        }, 35),
      ],
      caseStudies: [{
        title: 'Teaching note — adversary leak sites',
        description: 'Extortion crews often force disclosure timing. Legal notice clocks still run from awareness; leak-site posts do not replace regulator notice.',
        teachingNote: 'Teaching simplification: leak-site timing is dramatized for the war game.',
        sourceType: 'industry',
      }],
    },
  },
  {
    phaseId: 'P4_STAKEHOLDERS',
    after: 'N08_COMMS_DRAFT',
    node: {
      id: 'N09B_STAFF_FROM_PRESS',
      title: 'Staff learned from the press',
      prompt: 'Employees are learning about the incident from outside sources. Trust and rumor control are collapsing.',
      context: 'Employee silence earlier meant staff were not briefed. Teaching note: internal communications timing is a judgment call; this fork dramatizes the cost of silence.',
      choices: [
        choice('All-hands with facts-first briefing and Q&A', 'N10_INSURER_FORENSICS', {
          measured: { stakeholderTrust: 0.1 },
          unmeasured: { disclosureDebt: -0.04, narrativeIntegrity: 0.05 },
        }, 40),
        choice('Written memo only — no live forum', 'N10_INSURER_FORENSICS', {
          measured: { stakeholderTrust: -0.04 },
          unmeasured: { disclosureDebt: 0.03 },
        }, 25),
        choice('Ask managers to handle quietly team-by-team', 'N10_INSURER_FORENSICS', {
          measured: { stakeholderTrust: -0.08 },
          unmeasured: { disclosureDebt: 0.06, narrativeIntegrity: -0.04 },
        }, 35),
      ],
    },
  },
  {
    phaseId: 'P4_STAKEHOLDERS',
    after: 'N09_EMPLOYEES',
    node: {
      id: 'N10C_COVERAGE_RISK',
      title: 'Insurer coverage at risk',
      prompt: 'Late notice and weak preservation notes have the insurer questioning coverage. How do you respond?',
      context: 'Late insurer notification threatens cooperation and coverage. Teaching note: policy language varies — treat this as a teaching scenario, not legal advice.',
      choices: [
        choice('Full cooperation package: timeline, preservation log, counsel present', 'N10B_REPORTER_CALL', {
          measured: { evidenceIntegrity: 0.08, financialBurn: 0.05 },
          unmeasured: { regulatoryExposure: -0.04 },
        }, 45),
        choice('Minimal update — dispute late-notice characterization', 'N10B_REPORTER_CALL', {
          measured: { evidenceIntegrity: -0.05 },
          unmeasured: { commitmentLock: 0.08, regulatoryExposure: 0.06 },
        }, 30),
        choice('Escalate to coverage counsel and pause forensics vendor spend', 'N10B_REPORTER_CALL', {
          measured: { financialBurn: -0.04, evidenceIntegrity: -0.03 },
          unmeasured: { commitmentLock: 0.05 },
        }, 40),
      ],
    },
  },
  {
    phaseId: 'P5_AFTERMATH',
    after: 'N12_SEC_8K',
    node: {
      id: 'N12C_PAYMENT_AFTERMATH',
      title: 'Payment aftermath',
      prompt: 'You paid. Restoration may improve — but sanctions review, repeat extortion, and commitment lock now dominate.',
      context: 'OFAC and sanctions screening matter for ransom payments. Teaching note: this is not legal advice; payment is rarely “the answer.”',
      choices: [
        choice('Document OFAC screening and refuse further payments', 'N13_ATTRIBUTION', {
          measured: { operationalControl: 0.05 },
          unmeasured: { commitmentLock: 0.12, regulatoryExposure: 0.05 },
        }, 40),
        choice('Negotiate for decryptor only — no silence clause', 'N13_ATTRIBUTION', {
          measured: { operationalControl: 0.08, financialBurn: 0.06 },
          unmeasured: { commitmentLock: 0.08, disclosureDebt: -0.03 },
        }, 50),
        choice('Publicly acknowledge payment under board direction', 'N13_ATTRIBUTION', {
          measured: { disclosurePosture: 0.2, stakeholderTrust: -0.06 },
          unmeasured: { disclosureDebt: -0.05, commitmentLock: 0.15 },
        }, 35),
      ],
      caseStudies: [{
        title: 'Teaching note — OFAC / ransom',
        description: 'US persons must consider OFAC sanctions risk before ransom payment. Simulate the deliberation; obtain real counsel in real incidents.',
        teachingNote: 'Legal requirement vs teaching simplification: OFAC screening is required in real US matters; in-game options compress that process.',
        sourceType: 'government',
        url: 'https://ofac.treasury.gov/',
      }],
    },
  },
]

// Wire a few choices on N03 to set divergent paths via nextWhen flags (engine also uses flags)
for (const phase of scenario.phases) {
  for (const node of phase.nodes) {
    if (node.id === 'N03_ISOLATE_OR_OBSERVE') {
      for (const c of node.choices) {
        const l = c.label.toLowerCase()
        if (l.includes('isolat') || l.includes('segment')) {
          c.delta = c.delta || {}
          c.delta.setFlags = { ...(c.delta.setFlags || {}), aggressiveIsolation: true }
        }
        if (l.includes('observe') || l.includes('monitor') || l.includes('wait')) {
          c.delta = c.delta || {}
          c.delta.setFlags = { ...(c.delta.setFlags || {}), delayedEscalation: true }
        }
      }
    }
    if (node.id === 'N02_SCOPE_TRIAGE') {
      for (const c of node.choices) {
        const l = c.label.toLowerCase()
        if (l.includes('narrow') || l.includes('minimal') || l.includes('one tenant')) {
          c.delta = c.delta || {}
          c.delta.setFlags = { ...(c.delta.setFlags || {}), underScoped: true, prematureCertainty: true }
        }
      }
    }
    if (node.id === 'N09_EMPLOYEES') {
      for (const c of node.choices) {
        const l = c.label.toLowerCase()
        if (l.includes('silence') || l.includes('hold') || l.includes('not yet') || l.includes('later')) {
          c.delta = c.delta || {}
          c.delta.setFlags = { ...(c.delta.setFlags || {}), employeeSilence: true }
        }
      }
    }
    if (node.id === 'N10_INSURER_FORENSICS') {
      for (const c of node.choices) {
        const l = c.label.toLowerCase()
        if (l.includes('later') || l.includes('after') || l.includes('delay')) {
          c.delta = c.delta || {}
          c.delta.setFlags = { ...(c.delta.setFlags || {}), lateInsurerNotice: true }
        }
      }
    }
    if (node.id === 'N12B_RANSOM_PAY') {
      for (const c of node.choices) {
        const l = c.label.toLowerCase()
        if (l.includes('pay') || l.includes('transfer') || l.includes('bitcoin')) {
          c.delta = c.delta || {}
          c.delta.setFlags = { ...(c.delta.setFlags || {}), paidRansom: true }
          // Prefer payment aftermath branch when paying
          c.delta.nextWhen = [{ when: 'paidRansom', nextNodeId: 'N12C_PAYMENT_AFTERMATH' }]
        }
      }
    }
  }
}

for (const b of branchNodes) {
  const phase = findPhase(b.phaseId) || scenario.phases.find(p => p.nodes.some(n => n.id === b.after))
  if (!phase) {
    // find any phase and append
    const host = scenario.phases.find(p => p.nodes.some(n => n.id.startsWith(b.after.slice(0, 3)))) || scenario.phases[2]
    host.nodes.push(b.node)
    continue
  }
  const idx = phase.nodes.findIndex(n => n.id === b.after)
  if (idx >= 0) phase.nodes.splice(idx + 1, 0, b.node)
  else phase.nodes.push(b.node)
}

// Apply setFlags from delta into state via applyDelta — ensure applyDelta copies setFlags
writeFileSync(path, JSON.stringify(scenario, null, 2) + '\n')
console.log('Branch nodes injected. Node count:', scenario.phases.reduce((n, p) => n + p.nodes.length, 0))
