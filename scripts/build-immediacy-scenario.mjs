/**
 * Generate IMMEDIACY disclosure war-game scenario + advisor pack.
 * Metric keys stay Inheritance-compatible; labels are remapped in the UI.
 *
 * measured:
 *   productionEfficiency     -> Operational Control
 *   costPerUnit              -> Response Burn (higher = worse)
 *   welfareIncidentRate      -> Exposure Severity (higher = worse)
 *   welfareStandardAdoption  -> Disclosure Posture (0-3)
 * unmeasured:
 *   welfareDebt              -> Disclosure Debt
 *   enforcementGap           -> Regulatory Clock Lag
 *   regulatoryCapture        -> Narrative Capture
 *   sentienceKnowledgeGap    -> Facts Gap
 *   systemIrreversibility    -> Commitment Lock
 */
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const regions = {
  usaHeavy: { USA: 0.12, CAN: 0.08, GBR: 0.06 },
  euHeavy: { DEU: 0.1, FRA: 0.1, IRL: 0.12, NLD: 0.08, GBR: 0.08 },
  global: { USA: 0.08, GBR: 0.06, DEU: 0.06, SGP: 0.05, JPN: 0.05, AUS: 0.05 },
  asia: { SGP: 0.1, JPN: 0.08, AUS: 0.06, IND: 0.05 },
}

function ring(lat, lng, eventType = 'public_pressure', ttl = 3) {
  return { lat, lng, eventType, ttl }
}

function choice(label, quality, next, metrics, map = {}) {
  return {
    label,
    quality,
    nextNodeId: next,
    delta: {
      metrics,
      map: {
        ...(map.regionValues ? { regionValues: map.regionValues } : {}),
        ...(map.spawnRings ? { spawnRings: map.spawnRings } : {}),
      },
    },
  }
}

function node(id, title, prompt, context, vignette, moralUncertainties, caseStudies, choices) {
  return { id, title, prompt, context, vignette, moralUncertainties, caseStudies, choices }
}

const caseBank = {
  uber2016: {
    title: 'Uber 2016 breach concealment',
    year: '2016–2017',
    source: 'DOJ / FTC',
    sourceType: 'government',
    url: 'https://www.justice.gov/opa/pr/former-chief-security-officer-uber-convicted-federal-charges-covering-2016-data-breach',
    description: 'Uber paid attackers and concealed a 2016 breach affecting ~57M users; CSO later convicted.',
    analysis: 'Paying + NDA + delayed notice is a classic disclosure-debt spiral. Silence became a crime scene.',
    outcomes: 'Criminal exposure for executives; FTC consent order; lasting trust damage.',
  },
  equifax: {
    title: 'Equifax 2017 disclosure lag',
    year: '2017',
    source: 'US House Oversight',
    sourceType: 'government',
    url: 'https://oversight.house.gov/report/the-equifax-data-breach/',
    description: 'Critical patch delayed; breach discovered then disclosed weeks later amid executive stock sales controversy.',
    analysis: 'Facts gap + regulatory clock lag compound. The public story became about the delay as much as the theft.',
    outcomes: 'Settlement >$700M; congressional hearings; brand damage lasting years.',
  },
  capitalOne: {
    title: 'Capital One / Paige Thompson',
    year: '2019',
    source: 'DOJ',
    sourceType: 'government',
    url: 'https://www.justice.gov/usao-wdwa/pr/former-seattle-tech-worker-sentenced-prison-stealing-data-capital-one',
    description: 'Misconfigured WAF/S3 access led to ~100M records exposed; relatively fast public disclosure.',
    analysis: 'Fast facts + clear customer notice reduced narrative capture — still costly, but controllable.',
    outcomes: 'Criminal conviction of attacker; Capital One paid large fine but avoided Uber-style cover-up narrative.',
  },
  colonial: {
    title: 'Colonial Pipeline ransomware',
    year: '2021',
    source: 'CISA / DOJ',
    sourceType: 'government',
    url: 'https://www.cisa.gov/news-events/news/attack-colonial-pipeline-what-weve-learned-what-weve-done-over-past-two-years',
    description: 'Ransomware halted fuel distribution; company paid ransom; public operational impact forced disclosure.',
    analysis: 'Operational control vs payment is a commitment lock. Paying can buy hours — and fund next week\'s crew.',
    outcomes: 'National emergency optics; ransom partially recovered; lasting OT/IT segmentation lessons.',
  },
  moveit: {
    title: 'MOVEit / Cl0p mass extortion',
    year: '2023',
    source: 'CISA',
    sourceType: 'government',
    url: 'https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-158a',
    description: 'Supply-chain zero-day in managed file transfer; Cl0p extorted hundreds of orgs and published victim lists.',
    analysis: 'Third-party exposure collapses your disclosure timeline. Waiting for perfect facts loses the race to the leak site.',
    outcomes: 'Mass notifications; class actions; board questions about vendor diligence.',
  },
  changehc: {
    title: 'Change Healthcare ransomware',
    year: '2024',
    source: 'HHS / UnitedHealth',
    sourceType: 'news',
    url: 'https://www.hhs.gov/hipaa/for-professionals/breach-notification/index.html',
    description: 'ALPHV/BlackCat hit a claims clearinghouse; care payments disrupted nationwide; disclosure rolled out over weeks.',
    analysis: 'When you are critical infrastructure for others, disclosure debt becomes systemic risk.',
    outcomes: 'Congressional scrutiny; prolonged remediation; FAIR-scale loss estimates in the billions.',
  },
  lastpass: {
    title: 'LastPass multi-stage disclosure',
    year: '2022–2023',
    source: 'LastPass disclosures',
    sourceType: 'industry',
    url: 'https://blog.lastpass.com/2023/03/security-incident-update-recommended-actions/',
    description: 'Initial limited breach disclosure expanded as later stages (vault backups) became clear.',
    analysis: 'Partial truth early can be honest — or look like drip narrative capture if facts gap was avoidable.',
    outcomes: 'Customer migration; trust hit; example of staged disclosure under incomplete forensics.',
  },
  solarwinds: {
    title: 'SolarWinds supply-chain disclosure',
    year: '2020',
    source: 'CISA',
    sourceType: 'government',
    url: 'https://www.cisa.gov/news-events/news/joint-statement-federal-bureau-investigation-fbi-cybersecurity-and-infrastructure',
    description: 'Nation-state implant via software update; coordinated public attribution and customer guidance.',
    analysis: 'Attribution timing is a board/comms weapon. Too early misleads; too late looks like cover.',
    outcomes: 'Sector-wide incident response; new supply-chain assurance expectations.',
  },
  owasp: {
    title: 'OWASP Top 10 as war-room curriculum',
    year: '2021+',
    source: 'OWASP',
    sourceType: 'academic',
    url: 'https://owasp.org/www-project-top-ten/',
    description: 'Broken Access Control, Cryptographic Failures, Injection, and Security Misconfiguration dominate real breach root causes.',
    analysis: 'Teaching beat: disclosure choices should name the failure class without inventing root cause before forensics finish.',
    outcomes: 'Teams that map incidents to OWASP classes brief boards faster and with less spin.',
  },
}

const scenario = {
  version: '1.0.0',
  title: 'IMMEDIACY',
  tagline: 'Every Second Counts',
  setting:
    'You are Incident Commander for Northline Systems, a mid-cap SaaS company with US + EU customers. A Friday evening alert just lit up. Extortion crews, counsel, reporters, regulators, and your board will all move faster than your facts.',
  phases: [
    {
      id: 'P1_DETECTION',
      title: 'Detection',
      description: 'Hour 0–4 — first signal to scope. Facts are thin; the clock already started.',
      nodes: [
        node(
          'N01_FIRST_SIGNAL',
          'Friday 18:12 — The Ticket Spike',
          'SOC flags a burst of failed admin logins and encrypted file extensions on a finance file share. On-call asks: declare an incident now, or watch another hour?',
          'Northline sells workflow SaaS to mid-market customers. You have cyber insurance, an IR retainer, and a draft incident playbook last updated 14 months ago. Legal is at a wedding. Comms is offline. The CFO texts: "Is this real?"',
          'Teaching beat (OWASP A07/A01): Identity failures and broken access control often look like "weird tickets" before they look like ransomware.',
          [
            'Do you optimize for operational control or for not crying wolf?',
            'What unmeasured disclosure debt starts the moment you delay the war room?',
          ],
          [caseBank.owasp, caseBank.capitalOne, caseBank.equifax],
          [
            choice(
              'Declare Sev-1 now; stand up war room; freeze high-risk changes',
              'best',
              'N02_SCOPE_TRIAGE',
              {
                measured: { productionEfficiency: 0.12, costPerUnit: 0.06, welfareStandardAdoption: 0.2 },
                unmeasured: { sentienceKnowledgeGap: -0.08, welfareDebt: -0.04, enforcementGap: -0.03 },
              },
              { regionValues: regions.usaHeavy, spawnRings: [ring(37.77, -122.42, 'regulatory_response', 2)] }
            ),
            choice(
              'Quiet watch for 90 minutes; page only IR lead and CISO',
              'good',
              'N02_SCOPE_TRIAGE',
              {
                measured: { productionEfficiency: 0.04, costPerUnit: 0.02 },
                unmeasured: { sentienceKnowledgeGap: 0.05, welfareDebt: 0.04 },
              },
              { regionValues: { USA: 0.04 } }
            ),
            choice(
              'Treat as noisy false positive; ask SOC to "keep an eye on it"',
              'poor',
              'N02_SCOPE_TRIAGE',
              {
                measured: { productionEfficiency: -0.08, welfareIncidentRate: 0.1 },
                unmeasured: { welfareDebt: 0.1, sentienceKnowledgeGap: 0.12, enforcementGap: 0.06 },
              }
            ),
            choice(
              'Reboot the file server and tell Finance downtime is maintenance',
              'terrible',
              'N02_SCOPE_TRIAGE',
              {
                measured: { productionEfficiency: -0.15, welfareIncidentRate: 0.15, costPerUnit: 0.05 },
                unmeasured: { welfareDebt: 0.15, regulatoryCapture: 0.1, systemIrreversibility: 0.08 },
              },
              { spawnRings: [ring(37.77, -122.42, 'breach_notice', 4)] }
            ),
            choice(
              'Escalate to board chat immediately with incomplete facts',
              'neutral',
              'N02_SCOPE_TRIAGE',
              {
                measured: { costPerUnit: 0.04, welfareStandardAdoption: 0.05 },
                unmeasured: { regulatoryCapture: 0.06, sentienceKnowledgeGap: -0.02, systemIrreversibility: 0.05 },
              }
            ),
          ]
        ),
        node(
          'N02_SCOPE_TRIAGE',
          'Scope Triage — Ransomware, Insider, or Noise?',
          'Forensics finds Cobalt Strike-ish beacons and a staging share. Customer PII may sit adjacent. How hard do you declare the blast radius?',
          'You do not yet have proof of exfiltration. Backup integrity is unverified. GDPR/CCPA clocks may start on "awareness," not certainty.',
          'Teaching beat: FAIR-style analysis needs frequency × magnitude — but disclosure law often triggers on reasonable belief, not courtroom proof.',
          [
            'Is under-scoping a facts gap or narrative capture?',
            'Who owns the word "aware" for regulatory purposes?',
          ],
          [caseBank.moveit, caseBank.lastpass, caseBank.changehc],
          [
            choice(
              'Assume worst credible case: possible exfil of customer PII; start parallel forensics + counsel',
              'best',
              'N03_ISOLATE_OR_OBSERVE',
              {
                measured: { welfareStandardAdoption: 0.25, costPerUnit: 0.08, productionEfficiency: 0.05 },
                unmeasured: { sentienceKnowledgeGap: -0.12, enforcementGap: -0.06, welfareDebt: -0.05 },
              },
              { regionValues: { ...regions.usaHeavy, ...regions.euHeavy } }
            ),
            choice(
              'Limit scope to the finance share until exfil is proven',
              'neutral',
              'N03_ISOLATE_OR_OBSERVE',
              {
                measured: { costPerUnit: 0.03, productionEfficiency: 0.06 },
                unmeasured: { sentienceKnowledgeGap: 0.08, welfareDebt: 0.06, enforcementGap: 0.05 },
              }
            ),
            choice(
              'Publicly call it a "systems issue" while scoping privately',
              'poor',
              'N03_ISOLATE_OR_OBSERVE',
              {
                measured: { productionEfficiency: 0.02 },
                unmeasured: { regulatoryCapture: 0.12, welfareDebt: 0.1, systemIrreversibility: 0.08 },
              },
              { spawnRings: [ring(40.71, -74.0, 'public_pressure', 3)] }
            ),
            choice(
              'Wait for insurer-approved IR firm before any internal scope call',
              'good',
              'N03_ISOLATE_OR_OBSERVE',
              {
                measured: { costPerUnit: 0.05, welfareStandardAdoption: 0.1 },
                unmeasured: { enforcementGap: 0.04, sentienceKnowledgeGap: 0.03, welfareDebt: 0.02 },
              }
            ),
            choice(
              'Declare customer impact in Slack to "be transparent" with incomplete evidence',
              'terrible',
              'N03_ISOLATE_OR_OBSERVE',
              {
                measured: { welfareIncidentRate: 0.08, costPerUnit: 0.1 },
                unmeasured: { systemIrreversibility: 0.15, regulatoryCapture: 0.08, welfareDebt: 0.12 },
              }
            ),
          ]
        ),
      ],
    },
    {
      id: 'P2_CONTAINMENT',
      title: 'Containment',
      description: 'Hour 4–24 — isolate, confront the note, and meet counsel under fire.',
      nodes: [
        node(
          'N03_ISOLATE_OR_OBSERVE',
          'Isolate or Observe?',
          'Attacker still has a foothold. Pull the plug on segments and risk downtime — or watch to learn TTPs and risk wider encryption?',
          'Operations wants uptime. Security wants kill-chain intel. Customers in EU are approaching Monday morning login.',
          'Teaching beat (OWASP A05): Misconfiguration and flat networks turn "observe" into "gift the adversary dwell time."',
          [
            'Is dwell-time research worth commitment lock on customer harm?',
            'Who decides acceptable downtime — CISO, CEO, or customers by accident?',
          ],
          [caseBank.colonial, caseBank.changehc, caseBank.owasp],
          [
            choice(
              'Aggressive segmentation: isolate finance + identity; accept customer login degradation',
              'best',
              'N04_RANSOM_NOTE',
              {
                measured: { productionEfficiency: 0.15, welfareIncidentRate: -0.08, costPerUnit: 0.1 },
                unmeasured: { welfareDebt: -0.06, systemIrreversibility: 0.04 },
              },
              { regionValues: regions.global, spawnRings: [ring(51.5, -0.12, 'policy_shift', 2)] }
            ),
            choice(
              'Partial isolate of known-bad hosts; keep core SaaS up',
              'good',
              'N04_RANSOM_NOTE',
              {
                measured: { productionEfficiency: 0.08, welfareIncidentRate: -0.03, costPerUnit: 0.05 },
                unmeasured: { sentienceKnowledgeGap: 0.04, welfareDebt: 0.03 },
              }
            ),
            choice(
              'Observe overnight to map lateral movement before acting',
              'poor',
              'N04_RANSOM_NOTE',
              {
                measured: { productionEfficiency: -0.05, welfareIncidentRate: 0.12 },
                unmeasured: { welfareDebt: 0.1, sentienceKnowledgeGap: -0.05, enforcementGap: 0.06 },
              }
            ),
            choice(
              'Full enterprise lockdown — every product offline until clean',
              'neutral',
              'N04_RANSOM_NOTE',
              {
                measured: { productionEfficiency: 0.2, costPerUnit: 0.18, welfareIncidentRate: -0.1 },
                unmeasured: { systemIrreversibility: 0.1, regulatoryCapture: -0.04, welfareDebt: -0.02 },
              }
            ),
            choice(
              'Pay the MSP to "restore from backup" without forensic imaging',
              'terrible',
              'N04_RANSOM_NOTE',
              {
                measured: { productionEfficiency: -0.1, welfareIncidentRate: 0.1 },
                unmeasured: { sentienceKnowledgeGap: 0.15, welfareDebt: 0.14, systemIrreversibility: 0.12 },
              }
            ),
          ]
        ),
        node(
          'N04_RANSOM_NOTE',
          'The Note — "ShinyFox" Claims Your Data',
          'A leak-site style note appears: 48 hours to contact them or customer samples go public. They attach three real filenames from your CRM export.',
          'Extortion archetypes thrive on your disclosure debt. Paying may violate sanctions policy. Not paying may force customer notification on their timeline.',
          'Teaching beat: Adversary-driven disclosure is still disclosure. Your choice is whether you narrate it or they do.',
          [
            'Is negotiation a containment tool or a commitment lock?',
            'Do sample files constitute "awareness" of personal data breach?',
          ],
          [caseBank.moveit, caseBank.colonial, caseBank.uber2016],
          [
            choice(
              'Acknowledge via counsel/IR channel; demand proof pack; no payment talk yet',
              'best',
              'N05_COUNSEL_ARRIVES',
              {
                measured: { welfareStandardAdoption: 0.2, productionEfficiency: 0.05, costPerUnit: 0.07 },
                unmeasured: { sentienceKnowledgeGap: -0.1, welfareDebt: -0.05, regulatoryCapture: -0.04 },
              },
              { spawnRings: [ring(52.37, 4.9, 'public_pressure', 3)] }
            ),
            choice(
              'Ignore the note; focus only on technical recovery',
              'poor',
              'N05_COUNSEL_ARRIVES',
              {
                measured: { productionEfficiency: 0.06 },
                unmeasured: { welfareDebt: 0.12, enforcementGap: 0.08, sentienceKnowledgeGap: 0.05 },
              }
            ),
            choice(
              'Open payment negotiation immediately to buy time',
              'neutral',
              'N05_COUNSEL_ARRIVES',
              {
                measured: { costPerUnit: 0.12, welfareIncidentRate: -0.04 },
                unmeasured: { systemIrreversibility: 0.12, welfareDebt: 0.06, regulatoryCapture: 0.05 },
              }
            ),
            choice(
              'Publicly name the crew and dare them on social media',
              'terrible',
              'N05_COUNSEL_ARRIVES',
              {
                measured: { welfareIncidentRate: 0.1, costPerUnit: 0.08 },
                unmeasured: { regulatoryCapture: 0.1, systemIrreversibility: 0.14, welfareDebt: 0.1 },
              },
              { spawnRings: [ring(40.71, -74.0, 'public_pressure', 5)] }
            ),
            choice(
              'Quietly ask a trusted peer CISO how they handled Cl0p-style notes',
              'good',
              'N05_COUNSEL_ARRIVES',
              {
                measured: { welfareStandardAdoption: 0.1, costPerUnit: 0.02 },
                unmeasured: { sentienceKnowledgeGap: -0.06, welfareDebt: -0.02 },
              }
            ),
          ]
        ),
        node(
          'N05_COUNSEL_ARRIVES',
          'Counsel on the Line',
          'Outside counsel wants privilege protocols, a narrow briefing tree, and no customer emails without their sign-off. IR wants speed. Comms wants a holding line.',
          'Privilege is real — and can become narrative capture if it blocks necessary operational truth inside the company.',
          'Teaching beat: Legal delay is a FAIR control and a disclosure debt generator at the same time.',
          [
            'When does privilege protect the company vs protect individuals from accountability?',
            'Who is the client — the board, the CEO, or "the company"?',
          ],
          [caseBank.uber2016, caseBank.equifax, caseBank.lastpass],
          [
            choice(
              'Adopt privilege protocol AND a timed disclosure decision checkpoint (T+24h)',
              'best',
              'N05B_CUSTOMER_HINT',
              {
                measured: { welfareStandardAdoption: 0.25, costPerUnit: 0.06 },
                unmeasured: { enforcementGap: -0.08, welfareDebt: -0.06, regulatoryCapture: -0.05 },
              }
            ),
            choice(
              'Full stop: nothing leaves Legal without review, even internal status',
              'neutral',
              'N05B_CUSTOMER_HINT',
              {
                measured: { costPerUnit: 0.04, productionEfficiency: -0.04 },
                unmeasured: { enforcementGap: 0.1, welfareDebt: 0.08, regulatoryCapture: 0.06 },
              }
            ),
            choice(
              'Bypass counsel for now; "we need to move"',
              'poor',
              'N05B_CUSTOMER_HINT',
              {
                measured: { productionEfficiency: 0.08, costPerUnit: 0.03 },
                unmeasured: { systemIrreversibility: 0.1, welfareDebt: 0.07, regulatoryCapture: -0.02 },
              }
            ),
            choice(
              'Ask counsel to draft a denial that "no customer data is affected" before forensics finish',
              'terrible',
              'N05B_CUSTOMER_HINT',
              {
                measured: { welfareStandardAdoption: -0.1 },
                unmeasured: { regulatoryCapture: 0.18, welfareDebt: 0.16, systemIrreversibility: 0.15 },
              }
            ),
            choice(
              'Bring insurance coverage counsel into the privilege circle tonight',
              'good',
              'N05B_CUSTOMER_HINT',
              {
                measured: { costPerUnit: 0.05, welfareStandardAdoption: 0.12 },
                unmeasured: { sentienceKnowledgeGap: -0.04, enforcementGap: -0.03 },
              }
            ),
          ]
        ),
        node(
          'N05B_CUSTOMER_HINT',
          'A Customer Smells Smoke',
          'Your largest EU customer\'s CISO DMs: "Our CASB saw odd API pulls from your tenant overnight. Should we be worried?"',
          'They are not a regulator — yet. How you answer becomes evidence of awareness and fairness.',
          'Teaching beat: Selective disclosure to one customer can create Reg FD / fairness debt and accelerate regulatory clocks.',
          [
            'Do you owe the same sentence to every similarly situated customer?',
            'Is a DM a notification?',
          ],
          [caseBank.moveit, caseBank.solarwinds, caseBank.capitalOne],
          [
            choice(
              'Honest holding reply: investigating, will provide formal notice if personal data implicated; offer private bridge',
              'best',
              'N06_REGULATOR_CLOCK',
              {
                measured: { welfareStandardAdoption: 0.2, productionEfficiency: 0.04 },
                unmeasured: { welfareDebt: -0.05, regulatoryCapture: -0.06, enforcementGap: -0.04 },
              },
              { regionValues: regions.euHeavy }
            ),
            choice(
              'Ask them to keep it confidential and "stand by for a briefing tomorrow"',
              'neutral',
              'N06_REGULATOR_CLOCK',
              {
                measured: { costPerUnit: 0.02 },
                unmeasured: { welfareDebt: 0.06, enforcementGap: 0.05, regulatoryCapture: 0.04 },
              }
            ),
            choice(
              'Deny any issue to keep the renewal conversation calm',
              'terrible',
              'N06_REGULATOR_CLOCK',
              {
                measured: { productionEfficiency: 0.03 },
                unmeasured: { regulatoryCapture: 0.16, welfareDebt: 0.14, systemIrreversibility: 0.12 },
              }
            ),
            choice(
              'Loop them into the war room as a design partner',
              'poor',
              'N06_REGULATOR_CLOCK',
              {
                measured: { welfareStandardAdoption: 0.05, costPerUnit: 0.06 },
                unmeasured: { systemIrreversibility: 0.08, regulatoryCapture: 0.05, welfareDebt: 0.04 },
              }
            ),
            choice(
              'Route to counsel to reply under privilege with a factual, non-assuring update',
              'good',
              'N06_REGULATOR_CLOCK',
              {
                measured: { welfareStandardAdoption: 0.15, costPerUnit: 0.04 },
                unmeasured: { welfareDebt: -0.03, enforcementGap: -0.02 },
              }
            ),
          ]
        ),
      ],
    },
    {
      id: 'P3_DISCLOSURE',
      title: 'Disclosure Pressure',
      description: 'Day 1–3 — regulators, board, and the first public sentence.',
      nodes: [
        node(
          'N06_REGULATOR_CLOCK',
          'Start the Clock?',
          'Counsel asks the hard question: have we hit "awareness" for GDPR 72-hour notice? CCPA? State AG thresholds? HIPAA if any health data rode along?',
          'Starting the clock is irreversible optics. Not starting it when you should is worse.',
          'Teaching beat: Regulatory clock lag is measurable disclosure debt. Document the awareness rationale either way.',
          [
            'What evidence would convince a regulator you were not yet aware?',
            'Is "awaiting forensics" a control or a stall?',
          ],
          [caseBank.equifax, caseBank.changehc, caseBank.capitalOne],
          [
            choice(
              'Document awareness rationale; prepare GDPR Art. 33 draft; notify DPA if personal data likely',
              'best',
              'N07_BOARD_BRIEF',
              {
                measured: { welfareStandardAdoption: 0.3, costPerUnit: 0.08 },
                unmeasured: { enforcementGap: -0.15, welfareDebt: -0.08, regulatoryCapture: -0.05 },
              },
              { regionValues: regions.euHeavy, spawnRings: [ring(53.35, -6.26, 'regulatory_response', 4)] }
            ),
            choice(
              'Hold 24 hours for stronger forensics before any regulator contact',
              'neutral',
              'N07_BOARD_BRIEF',
              {
                measured: { productionEfficiency: 0.04, costPerUnit: 0.03 },
                unmeasured: { enforcementGap: 0.1, welfareDebt: 0.08 },
              }
            ),
            choice(
              'Notify only the friendliest regulator first as a "courtesy"',
              'poor',
              'N07_BOARD_BRIEF',
              {
                measured: { welfareStandardAdoption: 0.1 },
                unmeasured: { regulatoryCapture: 0.1, enforcementGap: 0.06, welfareDebt: 0.07 },
              }
            ),
            choice(
              'Argue no personal data involved until proven otherwise — no clock',
              'terrible',
              'N07_BOARD_BRIEF',
              {
                measured: { costPerUnit: -0.02 },
                unmeasured: { enforcementGap: 0.18, welfareDebt: 0.16, systemIrreversibility: 0.1 },
              }
            ),
            choice(
              'Start internal notification clock + insurer notice even if DPA wait continues',
              'good',
              'N07_BOARD_BRIEF',
              {
                measured: { welfareStandardAdoption: 0.18, costPerUnit: 0.05 },
                unmeasured: { enforcementGap: -0.06, welfareDebt: -0.04 },
              }
            ),
          ]
        ),
        node(
          'N07_BOARD_BRIEF',
          'Board Bridge — What Do They Hear?',
          'Emergency board call in 40 minutes. Chair wants "the truth in one slide." CEO wants confidence. Audit chair wants FAIR ranges.',
          'Boards punish surprises more than bad news. Under-briefing creates commitment lock when headlines hit.',
          'Teaching beat: FAIR ranges (min/mode/max) beat false precision. Say what you know, what you don\'t, and the decision deadline.',
          [
            'Is optimism a fiduciary duty or a disclosure debt?',
            'Which metric belongs on the slide: control, burn, exposure, or debt?',
          ],
          [caseBank.solarwinds, caseBank.equifax, caseBank.colonial],
          [
            choice(
              'One slide: facts / unknowns / clocks / choices / FAIR loss range; no spin',
              'best',
              'N08_COMMS_DRAFT',
              {
                measured: { welfareStandardAdoption: 0.22, productionEfficiency: 0.05 },
                unmeasured: { regulatoryCapture: -0.08, sentienceKnowledgeGap: -0.06, welfareDebt: -0.05 },
              }
            ),
            choice(
              'Emphasize containment success; bury possible exfil as a footnote',
              'poor',
              'N08_COMMS_DRAFT',
              {
                measured: { productionEfficiency: 0.08 },
                unmeasured: { regulatoryCapture: 0.12, welfareDebt: 0.1, sentienceKnowledgeGap: 0.04 },
              }
            ),
            choice(
              'Ask board to approve customer silence until ransom deadline passes',
              'terrible',
              'N08_COMMS_DRAFT',
              {
                measured: { costPerUnit: 0.04 },
                unmeasured: { welfareDebt: 0.15, enforcementGap: 0.1, systemIrreversibility: 0.12 },
              }
            ),
            choice(
              'Present options only; refuse to recommend — "you decide"',
              'neutral',
              'N08_COMMS_DRAFT',
              {
                measured: { welfareStandardAdoption: 0.05 },
                unmeasured: { welfareDebt: 0.04, regulatoryCapture: 0.03 },
              }
            ),
            choice(
              'Bring IR firm lead on the call to challenge management narrative live',
              'good',
              'N08_COMMS_DRAFT',
              {
                measured: { welfareStandardAdoption: 0.15, costPerUnit: 0.06 },
                unmeasured: { sentienceKnowledgeGap: -0.08, regulatoryCapture: -0.05 },
              }
            ),
          ]
        ),
        node(
          'N08_COMMS_DRAFT',
          'The First Public Sentence',
          'Comms offers three drafts: vague downtime, "cybersecurity incident," or full customer-risk narrative. Website status page is already getting questions.',
          'Your first sentence becomes a commitment lock. Everything after is reconciliation.',
          'Teaching beat: Holding statements should be true, narrow, and updateable — not clever.',
          [
            'What will this sentence look like next to the leak-site screenshot?',
            'Who is the audience — customers, markets, employees, or attackers?',
          ],
          [caseBank.lastpass, caseBank.capitalOne, caseBank.uber2016],
          [
            choice(
              'Publish narrow true statement + update cadence; open customer trust center',
              'best',
              'N09_EMPLOYEES',
              {
                measured: { welfareStandardAdoption: 0.28, costPerUnit: 0.07 },
                unmeasured: { regulatoryCapture: -0.1, welfareDebt: -0.08, enforcementGap: -0.04 },
              },
              { regionValues: regions.global, spawnRings: [ring(37.77, -122.42, 'public_pressure', 3)] }
            ),
            choice(
              'Status page: "intermittent degradation" with no cyber mention',
              'terrible',
              'N09_EMPLOYEES',
              {
                measured: { productionEfficiency: 0.02 },
                unmeasured: { regulatoryCapture: 0.18, welfareDebt: 0.14, systemIrreversibility: 0.1 },
              }
            ),
            choice(
              'Full narrative dump including unverified root cause and named adversary',
              'poor',
              'N09_EMPLOYEES',
              {
                measured: { welfareStandardAdoption: 0.1, costPerUnit: 0.05 },
                unmeasured: { systemIrreversibility: 0.12, sentienceKnowledgeGap: -0.04, regulatoryCapture: 0.06 },
              }
            ),
            choice(
              'No public statement; reply only to inbound press with "no comment"',
              'neutral',
              'N09_EMPLOYEES',
              {
                measured: { costPerUnit: 0.02 },
                unmeasured: { welfareDebt: 0.08, enforcementGap: 0.05, regulatoryCapture: 0.04 },
              }
            ),
            choice(
              'Coordinate statement with major customers before public post',
              'good',
              'N09_EMPLOYEES',
              {
                measured: { welfareStandardAdoption: 0.18, costPerUnit: 0.06 },
                unmeasured: { welfareDebt: -0.04, regulatoryCapture: -0.04 },
              }
            ),
          ]
        ),
      ],
    },
    {
      id: 'P4_STAKEHOLDERS',
      title: 'Stakeholders',
      description: 'Day 3–7 — employees, insurer, press, customers.',
      nodes: [
        node(
          'N09_EMPLOYEES',
          'The Rumor Mill',
          'Employees see the status page. Eng Twitter is restless. Someone posts a meme about "ShinyFox." Do you brief all-hands now?',
          'Insiders leak. Treated-as-outsiders leak faster. HR wants calm; Security wants operational security.',
          'Teaching beat: Employees are a control surface. Opacity trades short-term OPSEC for long-term narrative capture.',
          [
            'What must staff know to avoid becoming accidental amplifiers?',
            'Are contractors in the briefing circle?',
          ],
          [caseBank.solarwinds, caseBank.lastpass],
          [
            choice(
              'All-hands with clear do/don\'t: no speculation, how to route press, wellness support',
              'best',
              'N10_INSURER_FORENSICS',
              {
                measured: { welfareStandardAdoption: 0.15, productionEfficiency: 0.05 },
                unmeasured: { regulatoryCapture: -0.06, welfareDebt: -0.04 },
              }
            ),
            choice(
              'Managers-only brief; ask them to "keep teams focused"',
              'neutral',
              'N10_INSURER_FORENSICS',
              {
                measured: { productionEfficiency: 0.03 },
                unmeasured: { welfareDebt: 0.05, regulatoryCapture: 0.04 },
              }
            ),
            choice(
              'Threaten discipline for any external mention',
              'poor',
              'N10_INSURER_FORENSICS',
              {
                measured: { productionEfficiency: -0.02 },
                unmeasured: { regulatoryCapture: 0.1, welfareDebt: 0.08, systemIrreversibility: 0.06 },
              }
            ),
            choice(
              'Say nothing internally beyond the public statement',
              'terrible',
              'N10_INSURER_FORENSICS',
              {
                measured: {},
                unmeasured: { welfareDebt: 0.1, regulatoryCapture: 0.08, sentienceKnowledgeGap: 0.05 },
              }
            ),
            choice(
              'Publish an internal FAQ updated twice daily',
              'good',
              'N10_INSURER_FORENSICS',
              {
                measured: { welfareStandardAdoption: 0.12, costPerUnit: 0.03 },
                unmeasured: { welfareDebt: -0.03, sentienceKnowledgeGap: -0.03 },
              }
            ),
          ]
        ),
        node(
          'N10_INSURER_FORENSICS',
          'Carrier Conditions',
          'Cyber insurer reminds you: unapproved counsel, ransom payment, or public admissions may jeopardize coverage. They push their panel IR firm.',
          'Coverage is a control. Panel politics can slow truth. Document disagreements.',
          'Teaching beat: Insurance is part of the FAIR transfer strategy — and a stakeholder with its own disclosure incentives.',
          [
            'Whose facts win if panel IR and your IR disagree?',
            'Is coverage preservation worth regulatory clock lag?',
          ],
          [caseBank.colonial, caseBank.changehc],
          [
            choice(
              'Accept panel IR as lead; keep internal IR as challenge function; document coverage positions',
              'best',
              'N10B_REPORTER_CALL',
              {
                measured: { costPerUnit: 0.06, welfareStandardAdoption: 0.15, productionEfficiency: 0.04 },
                unmeasured: { sentienceKnowledgeGap: -0.07, welfareDebt: -0.03 },
              }
            ),
            choice(
              'Refuse panel; keep preferred firm despite reservation of rights letter',
              'neutral',
              'N10B_REPORTER_CALL',
              {
                measured: { costPerUnit: 0.12, productionEfficiency: 0.05 },
                unmeasured: { systemIrreversibility: 0.08, welfareDebt: 0.05 },
              }
            ),
            choice(
              'Minimize written record to "protect coverage"',
              'terrible',
              'N10B_REPORTER_CALL',
              {
                measured: {},
                unmeasured: { welfareDebt: 0.14, regulatoryCapture: 0.1, enforcementGap: 0.08 },
              }
            ),
            choice(
              'Ask carrier to pre-approve customer notification language',
              'good',
              'N10B_REPORTER_CALL',
              {
                measured: { welfareStandardAdoption: 0.12, costPerUnit: 0.04 },
                unmeasured: { enforcementGap: -0.05, welfareDebt: -0.03 },
              }
            ),
            choice(
              'Hide ransom negotiations from the carrier for now',
              'poor',
              'N10B_REPORTER_CALL',
              {
                measured: { costPerUnit: 0.05 },
                unmeasured: { systemIrreversibility: 0.12, welfareDebt: 0.1, regulatoryCapture: 0.08 },
              }
            ),
          ]
        ),
        node(
          'N10B_REPORTER_CALL',
          'Reporter on Deadline',
          'A reputable reporter emails: they have a leak-site screenshot and a source saying customer exports were taken. Deadline in three hours.',
          'You cannot kill the story. You can choose to be a primary source or a reacting quote.',
          'Teaching beat: Press is a disclosure channel with asymmetric clocks. "No comment" often reads as confirmation.',
          [
            'What can you confirm without creating a false denial?',
            'Do you offer embargoed briefing for accuracy?',
          ],
          [caseBank.equifax, caseBank.moveit, caseBank.uber2016],
          [
            choice(
              'On-record narrow confirms + background briefing; correct factual errors; no speculation',
              'best',
              'N11_CUSTOMER_NOTIFY',
              {
                measured: { welfareStandardAdoption: 0.2, costPerUnit: 0.05 },
                unmeasured: { regulatoryCapture: -0.08, welfareDebt: -0.06 },
              },
              { spawnRings: [ring(40.71, -74.0, 'public_pressure', 4)] }
            ),
            choice(
              'No comment; refer to prior status page',
              'neutral',
              'N11_CUSTOMER_NOTIFY',
              {
                measured: {},
                unmeasured: { welfareDebt: 0.07, regulatoryCapture: 0.05 },
              }
            ),
            choice(
              'Off-record spin: blame a vendor and "nation-state" without evidence',
              'terrible',
              'N11_CUSTOMER_NOTIFY',
              {
                measured: { welfareIncidentRate: 0.05 },
                unmeasured: { regulatoryCapture: 0.16, systemIrreversibility: 0.14, welfareDebt: 0.12 },
              }
            ),
            choice(
              'Ask for more time; promise exclusive if they wait 24h',
              'poor',
              'N11_CUSTOMER_NOTIFY',
              {
                measured: { costPerUnit: 0.03 },
                unmeasured: { welfareDebt: 0.06, enforcementGap: 0.04, systemIrreversibility: 0.05 },
              }
            ),
            choice(
              'Issue your own post 30 minutes before their story',
              'good',
              'N11_CUSTOMER_NOTIFY',
              {
                measured: { welfareStandardAdoption: 0.16, costPerUnit: 0.04 },
                unmeasured: { regulatoryCapture: -0.05, welfareDebt: -0.04 },
              }
            ),
          ]
        ),
        node(
          'N11_CUSTOMER_NOTIFY',
          'Who Gets Notified — And How Fast?',
          'Forensics now shows a CRM export likely left the environment. Legal drafts notice tiers: confirmed affected, possibly affected, and "vigilant."',
          'Fairness, speed, and specificity trade off. Regulators watch your process as much as your content.',
          'Teaching beat: Notification quality is a disclosure posture metric. Vague panic and false precision both destroy trust.',
          [
            'Do possibly-affected customers deserve the same speed as confirmed?',
            'Call centers and credit monitoring — control or theater?',
          ],
          [caseBank.capitalOne, caseBank.moveit, caseBank.changehc],
          [
            choice(
              'Tiered notice now: confirmed + possibly affected; clear what we know/don\'t; offer monitoring where warranted',
              'best',
              'N12_SEC_8K',
              {
                measured: { welfareStandardAdoption: 0.35, costPerUnit: 0.12, welfareIncidentRate: -0.05 },
                unmeasured: { enforcementGap: -0.12, welfareDebt: -0.1, regulatoryCapture: -0.06 },
              },
              { regionValues: { ...regions.usaHeavy, ...regions.euHeavy } }
            ),
            choice(
              'Notify only confirmed affected; silence for possibles until more proof',
              'neutral',
              'N12_SEC_8K',
              {
                measured: { costPerUnit: 0.06, welfareStandardAdoption: 0.1 },
                unmeasured: { welfareDebt: 0.08, enforcementGap: 0.06 },
              }
            ),
            choice(
              'Wait for ransom deadline — maybe the files are deleted',
              'terrible',
              'N12_SEC_8K',
              {
                measured: { costPerUnit: 0.04 },
                unmeasured: { welfareDebt: 0.18, enforcementGap: 0.15, systemIrreversibility: 0.1 },
              }
            ),
            choice(
              'Push ISP-style "you may be affected" to entire customer base',
              'poor',
              'N12_SEC_8K',
              {
                measured: { costPerUnit: 0.15, welfareStandardAdoption: 0.05 },
                unmeasured: { regulatoryCapture: 0.06, welfareDebt: 0.05, systemIrreversibility: 0.04 },
              }
            ),
            choice(
              'Notify regulators and customers same day with consistent facts package',
              'good',
              'N12_SEC_8K',
              {
                measured: { welfareStandardAdoption: 0.25, costPerUnit: 0.1 },
                unmeasured: { enforcementGap: -0.1, welfareDebt: -0.07 },
              }
            ),
          ]
        ),
      ],
    },
    {
      id: 'P5_AFTERMATH',
      title: 'Aftermath',
      description: 'Week 2+ — markets, money, blame, and what locks in.',
      nodes: [
        node(
          'N12_SEC_8K',
          'Materiality — File the 8-K?',
          'CFO and disclosure counsel debate whether the incident is material for securities disclosure. Stock is already soft on rumor.',
          'Securities disclosure is its own clock. Waiting for perfect forensics has burned others.',
          'Teaching beat: Materiality is judgment under uncertainty — document the process.',
          [
            'Would a reasonable investor want this now?',
            'Does customer notification itself make it material?',
          ],
          [caseBank.solarwinds, caseBank.equifax],
          [
            choice(
              'File 8-K with careful, non-hyped description aligned to customer notice',
              'best',
              'N12B_RANSOM_PAY',
              {
                measured: { welfareStandardAdoption: 0.25, costPerUnit: 0.05 },
                unmeasured: { enforcementGap: -0.08, regulatoryCapture: -0.06, welfareDebt: -0.05 },
              },
              { regionValues: { USA: 0.15 }, spawnRings: [ring(38.9, -77.0, 'regulatory_response', 3)] }
            ),
            choice(
              'Delay filing; argue quantitative impact still unknown',
              'neutral',
              'N12B_RANSOM_PAY',
              {
                measured: { costPerUnit: 0.02 },
                unmeasured: { enforcementGap: 0.1, welfareDebt: 0.08 },
              }
            ),
            choice(
              'Quiet Reg FD calls to top holders only',
              'terrible',
              'N12B_RANSOM_PAY',
              {
                measured: {},
                unmeasured: { regulatoryCapture: 0.15, systemIrreversibility: 0.12, welfareDebt: 0.12 },
              }
            ),
            choice(
              'File minimal 8-K, over-index on "no material impact expected"',
              'poor',
              'N12B_RANSOM_PAY',
              {
                measured: { welfareStandardAdoption: 0.08 },
                unmeasured: { regulatoryCapture: 0.1, welfareDebt: 0.09, systemIrreversibility: 0.08 },
              }
            ),
            choice(
              'Board minutes the materiality analysis even if filing waits 24h',
              'good',
              'N12B_RANSOM_PAY',
              {
                measured: { welfareStandardAdoption: 0.15, costPerUnit: 0.03 },
                unmeasured: { welfareDebt: -0.03, enforcementGap: -0.04 },
              }
            ),
          ]
        ),
        node(
          'N12B_RANSOM_PAY',
          'Pay, Negotiate, or Refuse?',
          'Decryptor claims are shaky. Leak site countdown hits 6 hours. OFAC screening is clean so far. Board asks for a recommendation.',
          'Payment is the sharpest commitment lock in the game. Refusal may be right — and still costly.',
          'Teaching beat: Colonial Pipeline showed payment can restore ops and still become a national story.',
          [
            'What are you buying — time, silence, or a decryptor?',
            'How do you explain payment to customers you already notified?',
          ],
          [caseBank.colonial, caseBank.uber2016, caseBank.moveit],
          [
            choice(
              'Refuse payment; accelerate rebuild + customer support; publish decision rationale internally',
              'best',
              'N13_ATTRIBUTION',
              {
                measured: { productionEfficiency: 0.08, costPerUnit: 0.1, welfareStandardAdoption: 0.15 },
                unmeasured: { systemIrreversibility: -0.05, welfareDebt: -0.04, regulatoryCapture: -0.04 },
              }
            ),
            choice(
              'Negotiate for proof deletion only; still refuse decryptor purchase',
              'good',
              'N13_ATTRIBUTION',
              {
                measured: { costPerUnit: 0.14, welfareIncidentRate: -0.03 },
                unmeasured: { systemIrreversibility: 0.08, welfareDebt: 0.04 },
              }
            ),
            choice(
              'Pay for decryptor + deletion promise under NDA',
              'poor',
              'N13_ATTRIBUTION',
              {
                measured: { productionEfficiency: 0.12, costPerUnit: 0.2, welfareIncidentRate: -0.05 },
                unmeasured: { systemIrreversibility: 0.18, welfareDebt: 0.1, regulatoryCapture: 0.08 },
              }
            ),
            choice(
              'Pay quietly and tell customers the files were "secured"',
              'terrible',
              'N13_ATTRIBUTION',
              {
                measured: { productionEfficiency: 0.1, costPerUnit: 0.22 },
                unmeasured: { regulatoryCapture: 0.2, welfareDebt: 0.2, systemIrreversibility: 0.22 },
              }
            ),
            choice(
              'Defer to insurer + counsel recommendation with board vote on record',
              'neutral',
              'N13_ATTRIBUTION',
              {
                measured: { costPerUnit: 0.08, welfareStandardAdoption: 0.1 },
                unmeasured: { welfareDebt: 0.02, systemIrreversibility: 0.05 },
              }
            ),
          ]
        ),
        node(
          'N13_ATTRIBUTION',
          'Name the Adversary?',
          'Intelligence partners suggest a known extortion brand. Marketing wants a nation-state story. Reality looks like criminal ransomware-as-a-service.',
          'Wrong attribution is narrative capture. Right attribution can help peers — and paint a target.',
          'Teaching beat: SolarWinds-style coordinated attribution is rare; most firms should stick to observed TTPs.',
          [
            'What public good does naming serve?',
            'Will naming change customer risk decisions?',
          ],
          [caseBank.solarwinds, caseBank.moveit],
          [
            choice(
              'Describe TTPs and confidence level; avoid hard brand claims without high confidence',
              'best',
              'N14_THIRD_PARTY',
              {
                measured: { welfareStandardAdoption: 0.15 },
                unmeasured: { regulatoryCapture: -0.07, sentienceKnowledgeGap: -0.05, welfareDebt: -0.03 },
              }
            ),
            choice(
              'Publicly name the crew to "warn the industry"',
              'neutral',
              'N14_THIRD_PARTY',
              {
                measured: { welfareStandardAdoption: 0.08, costPerUnit: 0.03 },
                unmeasured: { systemIrreversibility: 0.08, regulatoryCapture: 0.04 },
              }
            ),
            choice(
              'Frame as likely nation-state to reduce negligence narrative',
              'terrible',
              'N14_THIRD_PARTY',
              {
                measured: {},
                unmeasured: { regulatoryCapture: 0.18, welfareDebt: 0.12, systemIrreversibility: 0.1 },
              }
            ),
            choice(
              'Stay silent on attribution entirely',
              'good',
              'N14_THIRD_PARTY',
              {
                measured: { costPerUnit: 0.01 },
                unmeasured: { welfareDebt: -0.02, regulatoryCapture: -0.03 },
              }
            ),
            choice(
              'Leak a dramatic attribution to a friendly podcast',
              'poor',
              'N14_THIRD_PARTY',
              {
                measured: { costPerUnit: 0.04 },
                unmeasured: { regulatoryCapture: 0.12, welfareDebt: 0.08, systemIrreversibility: 0.08 },
              }
            ),
          ]
        ),
        node(
          'N14_THIRD_PARTY',
          'Blame the Vendor?',
          'A mismanaged SaaS connector likely aided access. Procurement wants to sue. Vendor wants a joint statement that "shared responsibility" applies.',
          'Third-party failure does not erase your disclosure duties. Customers bought your brand.',
          'Teaching beat (OWASP + MOVEit): supply-chain incidents still require first-party disclosure maturity.',
          [
            'Does suing the vendor help customers this week?',
            'What does your own SSAE/SOC report claim you controlled?',
          ],
          [caseBank.moveit, caseBank.solarwinds, caseBank.owasp],
          [
            choice(
              'Own customer narrative; pursue vendor separately; share IOCs with peers',
              'best',
              'N15_LESSONS_LOCK',
              {
                measured: { welfareStandardAdoption: 0.2, productionEfficiency: 0.05 },
                unmeasured: { regulatoryCapture: -0.08, welfareDebt: -0.06 },
              },
              { regionValues: regions.asia }
            ),
            choice(
              'Joint bland statement spreading responsibility',
              'neutral',
              'N15_LESSONS_LOCK',
              {
                measured: { costPerUnit: 0.03 },
                unmeasured: { regulatoryCapture: 0.06, welfareDebt: 0.05 },
              }
            ),
            choice(
              'Publicly torch the vendor to deflect',
              'poor',
              'N15_LESSONS_LOCK',
              {
                measured: { productionEfficiency: 0.02 },
                unmeasured: { regulatoryCapture: 0.12, systemIrreversibility: 0.08, welfareDebt: 0.07 },
              }
            ),
            choice(
              'Quiet settlement with gag on root cause',
              'terrible',
              'N15_LESSONS_LOCK',
              {
                measured: { costPerUnit: 0.1 },
                unmeasured: { welfareDebt: 0.14, regulatoryCapture: 0.1, sentienceKnowledgeGap: 0.08 },
              }
            ),
            choice(
              'Publish a postmortem section on vendor control gaps without legal conclusions',
              'good',
              'N15_LESSONS_LOCK',
              {
                measured: { welfareStandardAdoption: 0.15, costPerUnit: 0.04 },
                unmeasured: { sentienceKnowledgeGap: -0.06, welfareDebt: -0.04 },
              }
            ),
          ]
        ),
        node(
          'N15_LESSONS_LOCK',
          'What Locks In?',
          'The acute incident is cooling. Board asks which changes become permanent policy — and which were theater.',
          'Irreversibility can be good (stronger controls) or bad (rituals that hide debt). Choose deliberately.',
          'Teaching beat: Convert disclosure debt paydown into lasting posture: tabletop cadence, evidence retention, customer trust center, OWASP-linked backlog.',
          [
            'Which metric must move permanently: control, posture, or debt?',
            'What will you refuse to re-normalize?',
          ],
          [caseBank.owasp, caseBank.capitalOne, caseBank.lastpass],
          [
            choice(
              'Lock in: 72h decision checklist, quarterly tabletop, customer trust center, OWASP-mapped backlog funded',
              'best',
              'N16_COMPLETE',
              {
                measured: { welfareStandardAdoption: 0.4, productionEfficiency: 0.1, welfareIncidentRate: -0.08 },
                unmeasured: { welfareDebt: -0.12, systemIrreversibility: 0.05, enforcementGap: -0.08, sentienceKnowledgeGap: -0.08 },
              },
              { regionValues: regions.global }
            ),
            choice(
              'Fund detection tools; skip process/disclosure reforms',
              'neutral',
              'N16_COMPLETE',
              {
                measured: { productionEfficiency: 0.12, costPerUnit: 0.1 },
                unmeasured: { welfareDebt: 0.04, regulatoryCapture: 0.03 },
              }
            ),
            choice(
              'Declare all-clear; return to pre-incident change freeze habits',
              'terrible',
              'N16_COMPLETE',
              {
                measured: { productionEfficiency: 0.05 },
                unmeasured: { welfareDebt: 0.15, systemIrreversibility: 0.12, enforcementGap: 0.08 },
              }
            ),
            choice(
              'Overcorrect: every change requires board cyber committee — freeze innovation',
              'poor',
              'N16_COMPLETE',
              {
                measured: { productionEfficiency: -0.08, welfareStandardAdoption: 0.1, costPerUnit: 0.08 },
                unmeasured: { systemIrreversibility: 0.15, welfareDebt: 0.05 },
              }
            ),
            choice(
              'Publish a public postmortem and invite customer challenge',
              'good',
              'N16_COMPLETE',
              {
                measured: { welfareStandardAdoption: 0.3, costPerUnit: 0.06 },
                unmeasured: { regulatoryCapture: -0.08, welfareDebt: -0.08, sentienceKnowledgeGap: -0.05 },
              }
            ),
          ]
        ),
        node(
          'N16_COMPLETE',
          'After-Action',
          'The war room lights dim. Your audit trail is the curriculum.',
          'IMMEDIACY grades the path you took: operational control, disclosure posture, and the debt you still carry.',
          'Every second counted. The next incident will start mid-sentence.',
          ['What would you decide faster next time?', 'What would you refuse to rush?'],
          [caseBank.owasp],
          [
            choice(
              'End simulation — review post-mortem',
              'best',
              'N16_COMPLETE',
              {
                measured: { welfareStandardAdoption: 0.05 },
                unmeasured: { welfareDebt: -0.02 },
              }
            ),
          ]
        ),
      ],
    },
  ],
}

const advisors = [
  {
    id: 'ADV_COUNSEL',
    name: 'Maya Okonkwo',
    title: 'Outside Counsel',
    specialization: ['Disclosure law', 'Privilege', 'Regulatory notice', 'Board governance'],
    color: '#3b82f6',
    bio: 'Crisis counsel focused on timed disclosure checkpoints without false denials.',
    researchDomains: ['GDPR Art. 33', 'State breach statutes', 'Securities disclosure', 'Privilege protocols'],
    imageUrl: 'https://randomuser.me/api/portraits/women/47.jpg',
  },
  {
    id: 'ADV_IR',
    name: 'Chris Delgado',
    title: 'Incident Response Lead',
    specialization: ['Containment', 'Forensics', 'Ransomware', 'Evidence integrity'],
    color: '#10b981',
    bio: 'IR lead who treats dwell time and evidence preservation as first-class controls.',
    researchDomains: ['Ransomware playbooks', 'Memory forensics', 'Segmented containment', 'OFAC screening'],
    imageUrl: 'https://randomuser.me/api/portraits/men/33.jpg',
  },
  {
    id: 'ADV_COMMS',
    name: 'Priya Natarajan',
    title: 'Crisis Communications',
    specialization: ['Holding statements', 'Press', 'Employee comms', 'Trust centers'],
    color: '#f59e0b',
    bio: 'Comms lead who writes updateable truth, not clever spin.',
    researchDomains: ['Crisis narratives', 'Journalist embargos', 'Customer trust centers'],
    imageUrl: 'https://randomuser.me/api/portraits/women/25.jpg',
  },
  {
    id: 'ADV_FAIR',
    name: 'Jonah Berg',
    title: 'Quantitative Risk Advisor',
    specialization: ['FAIR', 'Loss magnitude', 'Control ROI', 'Board metrics'],
    color: '#8b5cf6',
    bio: 'Translates war-room choices into ranges the board can govern.',
    researchDomains: ['FAIR', 'Cyber loss data', 'Secondary loss from disclosure failure'],
    imageUrl: 'https://randomuser.me/api/portraits/men/52.jpg',
  },
  {
    id: 'ADV_CISO_PEER',
    name: 'Alex Romero',
    title: 'Peer CISO',
    specialization: ['Operator judgment', 'Vendor risk', 'Tabletops', 'OWASP mapping'],
    color: '#ef4444',
    bio: 'Been through MOVEit-week. Allergic to nation-state cosplay and false precision.',
    researchDomains: ['OWASP Top 10', 'Vendor incidents', 'Tabletop design'],
    imageUrl: 'https://randomuser.me/api/portraits/men/75.jpg',
  },
  {
    id: 'ADV_PRIVACY',
    name: 'Elena Voss',
    title: 'Privacy Officer',
    specialization: ['Individual notice', 'DPIA', 'Cross-border transfer', 'Data minimization'],
    color: '#ec4899',
    bio: 'Keeps the human beings behind the records in the room.',
    researchDomains: ['GDPR', 'CCPA/CPRA', 'Notification content standards'],
    imageUrl: 'https://randomuser.me/api/portraits/women/28.jpg',
  },
]

/** Lightweight per-node recommendations: best choice championed by 2 advisors */
const nodeAdvisorMap = {
  N01_FIRST_SIGNAL: [['ADV_IR', 0], ['ADV_FAIR', 0]],
  N02_SCOPE_TRIAGE: [['ADV_PRIVACY', 0], ['ADV_COUNSEL', 0]],
  N03_ISOLATE_OR_OBSERVE: [['ADV_IR', 0], ['ADV_CISO_PEER', 0]],
  N04_RANSOM_NOTE: [['ADV_COUNSEL', 0], ['ADV_IR', 0]],
  N05_COUNSEL_ARRIVES: [['ADV_COUNSEL', 0], ['ADV_FAIR', 0]],
  N05B_CUSTOMER_HINT: [['ADV_PRIVACY', 0], ['ADV_COMMS', 0]],
  N06_REGULATOR_CLOCK: [['ADV_COUNSEL', 0], ['ADV_PRIVACY', 0]],
  N07_BOARD_BRIEF: [['ADV_FAIR', 0], ['ADV_COUNSEL', 0]],
  N08_COMMS_DRAFT: [['ADV_COMMS', 0], ['ADV_CISO_PEER', 0]],
  N09_EMPLOYEES: [['ADV_COMMS', 0], ['ADV_IR', 0]],
  N10_INSURER_FORENSICS: [['ADV_COUNSEL', 0], ['ADV_FAIR', 0]],
  N10B_REPORTER_CALL: [['ADV_COMMS', 0], ['ADV_COUNSEL', 0]],
  N11_CUSTOMER_NOTIFY: [['ADV_PRIVACY', 0], ['ADV_COMMS', 0]],
  N12_SEC_8K: [['ADV_COUNSEL', 0], ['ADV_FAIR', 0]],
  N12B_RANSOM_PAY: [['ADV_CISO_PEER', 0], ['ADV_COUNSEL', 0]],
  N13_ATTRIBUTION: [['ADV_CISO_PEER', 0], ['ADV_COMMS', 0]],
  N14_THIRD_PARTY: [['ADV_CISO_PEER', 0], ['ADV_PRIVACY', 0]],
  N15_LESSONS_LOCK: [['ADV_FAIR', 0], ['ADV_CISO_PEER', 0]],
}

const recText = {
  ADV_COUNSEL: {
    reasoning: 'Document the awareness rationale and put a timed disclosure checkpoint on the calendar. Privilege protects strategy — it should not manufacture silence.',
    benefits: ['Defensible regulatory posture', 'Clear decision record for the board'],
    concerns: ['Still need operational facts', 'Clock may already be running'],
    researchCitations: [
      {
        text: 'GDPR Article 33 — notification of a personal data breach to the supervisory authority',
        url: 'https://gdpr-info.eu/art-33-gdpr/',
        sourceType: 'government',
        year: 2018,
        lastVerified: '2026-08-01',
      },
    ],
  },
  ADV_IR: {
    reasoning: 'Preserve evidence, contain aggressively where blast radius is credible, and refuse restoration shortcuts that destroy forensics.',
    benefits: ['Higher operational control', 'Better facts for notice content'],
    concerns: ['Downtime cost', 'Business pushback'],
    researchCitations: [
      {
        text: 'CISA Stop Ransomware guidance',
        url: 'https://www.cisa.gov/stopransomware',
        sourceType: 'government',
        year: 2024,
        lastVerified: '2026-08-01',
      },
    ],
  },
  ADV_COMMS: {
    reasoning: 'Say less, say true, say when you will update. Holding lines must survive a leak-site screenshot.',
    benefits: ['Lower narrative capture', 'Updateable public record'],
    concerns: ['Press will still push', 'Internal rumor risk if employees are dark'],
    researchCitations: [
      {
        text: 'NIST SP 800-61 incident handling — coordination and information sharing themes',
        url: 'https://csrc.nist.gov/pubs/sp/800/61/r2/final',
        sourceType: 'government',
        year: 2012,
        lastVerified: '2026-08-01',
      },
    ],
  },
  ADV_FAIR: {
    reasoning: 'Give the board ranges, not theater precision. Secondary loss from delayed or deceptive disclosure often dominates primary technical loss.',
    benefits: ['Better capital decisions', 'Shared language for tradeoffs'],
    concerns: ['Data quality early in the incident', 'Anchoring bias on the mode'],
    researchCitations: [
      {
        text: 'FAIR Institute — quantitative information risk',
        url: 'https://www.fairinstitute.org/',
        sourceType: 'industry',
        year: 2024,
        lastVerified: '2026-08-01',
      },
    ],
  },
  ADV_CISO_PEER: {
    reasoning: 'Map the failure to an OWASP class when you can, refuse nation-state cosplay, and own the customer narrative even if a vendor failed.',
    benefits: ['Faster peer learning', 'Credibility with operators'],
    concerns: ['Ego and blame storms', 'Vendor legal friction'],
    researchCitations: [
      {
        text: 'OWASP Top 10',
        url: 'https://owasp.org/www-project-top-ten/',
        sourceType: 'academic',
        year: 2021,
        lastVerified: '2026-08-01',
      },
    ],
  },
  ADV_PRIVACY: {
    reasoning: 'People behind the records need timely, specific notice. Fairness across similarly situated customers is part of the control.',
    benefits: ['Lower regulatory clock lag', 'Trust salvage'],
    concerns: ['Call-center load', 'Over-notification fatigue'],
    researchCitations: [
      {
        text: 'HHS HIPAA breach notification rule overview',
        url: 'https://www.hhs.gov/hipaa/for-professionals/breach-notification/index.html',
        sourceType: 'government',
        year: 2024,
        lastVerified: '2026-08-01',
      },
    ],
  },
}

const recommendations = {}
for (const [nodeId, pairs] of Object.entries(nodeAdvisorMap)) {
  recommendations[nodeId] = pairs.map(([advisorId, choiceIndex]) => {
    const t = recText[advisorId]
    return {
      advisorId,
      choiceIndex,
      reasoning: t.reasoning,
      researchCitations: t.researchCitations,
      benefits: t.benefits,
      concerns: t.concerns,
    }
  })
}

writeFileSync(join(root, 'public', 'scenario.v1.json'), JSON.stringify(scenario, null, 2))
writeFileSync(join(root, 'public', 'advisors.json'), JSON.stringify(advisors, null, 2))
writeFileSync(join(root, 'public', 'advisorRecommendations.json'), JSON.stringify(recommendations, null, 2))

const nodeCount = scenario.phases.reduce((n, p) => n + p.nodes.length, 0)
console.log(`Wrote scenario: ${scenario.phases.length} phases, ${nodeCount} nodes`)
console.log(`Wrote ${advisors.length} advisors, ${Object.keys(recommendations).length} recommendation nodes`)
