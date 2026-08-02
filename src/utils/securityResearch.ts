/**
 * Security research lab cards for IMMEDIACY war-room teaching.
 * Frameworks: OWASP, MITRE ATT&CK, NIST, CISA, FAIR.
 */

export interface SecurityResearchCard {
  id: string
  title: string
  framework: 'OWASP' | 'MITRE' | 'NIST' | 'CISA' | 'FAIR' | 'Regulatory'
  description: string
  keyQuestions: string[]
  researchAreas: string[]
  horizon: string
  relevance: string
  url?: string
}

export const securityResearchCards: SecurityResearchCard[] = [
  {
    id: 'owasp_access_control',
    title: 'OWASP A01 — Broken Access Control',
    framework: 'OWASP',
    description:
      'Most serious web risk class: users or attackers act outside intended permissions. In a SaaS breach, weak authz often explains how a CRM export or admin path was reachable.',
    keyQuestions: [
      'Was the foothold identity abuse, missing object-level checks, or over-privileged service accounts?',
      'Can you name the control failure without inventing root cause before forensics finish?',
      'Which customer tenants shared the same privilege model?',
    ],
    researchAreas: [
      'Object-level authorization',
      'Privilege escalation paths',
      'Tenant isolation failures',
    ],
    horizon: 'Incident hours → posture years',
    relevance:
      'Maps cleanly to early Detection/Containment choices: scope triage without OWASP language becomes narrative capture.',
    url: 'https://owasp.org/Top10/A01_2021-Broken_Access_Control/',
  },
  {
    id: 'owasp_misconfig',
    title: 'OWASP A05 — Security Misconfiguration',
    framework: 'OWASP',
    description:
      'Default creds, open shares, flat networks, and “temporary” cloud permissions that never expired. Observe-vs-isolate decisions often fail here.',
    keyQuestions: [
      'Is dwell time research worth exposing more misconfigured surface?',
      'Which restore shortcuts destroy evidence of the misconfiguration?',
      'What configuration debt will still exist after the war room closes?',
    ],
    researchAreas: [
      'Cloud IAM drift',
      'Hardening baselines',
      'Segmented containment',
    ],
    horizon: 'Containment window',
    relevance:
      'Colonial-style ops pressure meets flat networks: aggressive segmentation is often the only honest control.',
    url: 'https://owasp.org/Top10/A05_2021-Security_Misconfiguration/',
  },
  {
    id: 'owasp_crypto_failures',
    title: 'OWASP A02 — Cryptographic Failures',
    framework: 'OWASP',
    description:
      'Data at rest/in transit protections that looked fine on a questionnaire — until the export was plaintext or keys rode along with the loot.',
    keyQuestions: [
      'Was the CRM export encrypted in a way that still matters after theft?',
      'Are you over-claiming “secured” after a ransom payment?',
      'Does customer notice need to distinguish encrypted vs usable data?',
    ],
    researchAreas: [
      'Key management',
      'Backup encryption integrity',
      'Notice content accuracy',
    ],
    horizon: 'Notice drafting',
    relevance:
      'False precision about encryption is classic narrative capture in customer notices.',
    url: 'https://owasp.org/Top10/A02_2021-Cryptographic_Failures/',
  },
  {
    id: 'mitre_initial_access',
    title: 'MITRE ATT&CK — Initial Access & Execution',
    framework: 'MITRE',
    description:
      'How they got in: phishing, valid accounts, exposed services, supply-chain footholds. Attribution cosplay starts when boards demand a named “nation-state” before TTPs are solid.',
    keyQuestions: [
      'What is observed vs inferred about initial access?',
      'Does public attribution help customers change risk decisions?',
      'Are you confusing ransomware affiliate branding with confidence?',
    ],
    researchAreas: [
      'ATT&CK Initial Access (TA0001)',
      'Valid Accounts',
      'Supply-chain entry',
    ],
    horizon: 'Forensics confidence ladder',
    relevance:
      'Use TTPs and confidence levels; hard brand claims are commitment lock.',
    url: 'https://attack.mitre.org/tactics/TA0001/',
  },
  {
    id: 'mitre_exfil_impact',
    title: 'MITRE ATT&CK — Exfiltration & Impact',
    framework: 'MITRE',
    description:
      'Staging, compression, C2, leak-site pressure, encryption for ransom. Sample files on a note often force awareness for disclosure clocks.',
    keyQuestions: [
      'Do sample files constitute awareness of personal-data breach?',
      'Is negotiation buying time, silence, or a decryptor?',
      'How do Impact tactics change customer harm narrative?',
    ],
    researchAreas: [
      'Exfiltration over C2',
      'Data encrypted for impact',
      'Extortion / leak-site ops',
    ],
    horizon: 'Adversary disclosure clock',
    relevance:
      'Adversary-driven disclosure races your Art. 33 / state notice program.',
    url: 'https://attack.mitre.org/tactics/TA0010/',
  },
  {
    id: 'nist_800_61',
    title: 'NIST SP 800-61 — Incident Handling',
    framework: 'NIST',
    description:
      'Classic IR lifecycle: preparation, detection & analysis, containment/eradication/recovery, post-incident activity. Privilege protocols and insurer panels sit inside this loop.',
    keyQuestions: [
      'Where are you in the lifecycle — analysis or recovery theater?',
      'Who owns evidence integrity vs uptime?',
      'What post-incident controls become permanent posture?',
    ],
    researchAreas: [
      'IR playbooks',
      'Coordination & information sharing',
      'Lessons learned cadence',
    ],
    horizon: 'Full incident arc',
    relevance:
      'Holding statements must stay true across lifecycle stages.',
    url: 'https://csrc.nist.gov/pubs/sp/800/61/r2/final',
  },
  {
    id: 'cisa_stopransomware',
    title: 'CISA — StopRansomware Guidance',
    framework: 'CISA',
    description:
      'Operational guidance on ransomware response, payment risks, and sector coordination. Boards often hear “pay to restore” without the secondary-loss story.',
    keyQuestions: [
      'What are you buying with payment — time, silence, or decryptor?',
      'How do you explain payment after customers were already notified?',
      'Which OFAC / sanctions checks are on the critical path?',
    ],
    researchAreas: [
      'Ransomware response',
      'Payment decision framing',
      'Sector notifications',
    ],
    horizon: 'Ransom deadline',
    relevance:
      'Payment is the sharpest commitment lock in the game.',
    url: 'https://www.cisa.gov/stopransomware',
  },
  {
    id: 'fair_secondary_loss',
    title: 'FAIR — Secondary Loss from Disclosure Failure',
    framework: 'FAIR',
    description:
      'Quantitative risk framing: primary loss (response, downtime) vs secondary loss (fines, lawsuits, churn, reputation). Delayed or deceptive disclosure often dominates the loss table.',
    keyQuestions: [
      'Are board slides using ranges or false precision?',
      'Which choice reduces secondary loss even if burn rises?',
      'How do you price narrative capture as a loss driver?',
    ],
    researchAreas: [
      'Loss magnitude & frequency',
      'Secondary loss drivers',
      'Control ROI under time pressure',
    ],
    horizon: 'Board decision window',
    relevance:
      'FAIR ranges beat optimism-as-fiduciary-duty.',
    url: 'https://www.fairinstitute.org/',
  },
  {
    id: 'regulatory_clocks',
    title: 'Disclosure Clocks — GDPR / State / SEC',
    framework: 'Regulatory',
    description:
      'Awareness starts clocks: GDPR Art. 33 (72h to DPA), US state AG notices, sector rules, and securities materiality. Document the awareness rationale either way.',
    keyQuestions: [
      'Have we hit awareness for personal data — and who decides?',
      'Is “awaiting forensics” a control or a stall?',
      'Would a reasonable investor want this now?',
    ],
    researchAreas: [
      'GDPR Art. 33/34',
      'State breach statutes',
      'SEC cybersecurity disclosure',
    ],
    horizon: '72 hours → filing windows',
    relevance:
      'Regulatory clock lag is measurable disclosure debt.',
    url: 'https://gdpr-info.eu/art-33-gdpr/',
  },
]

/** Alias so older call sites can swap with minimal churn */
export type LongtermismAngle = SecurityResearchCard
export const longtermismAngles = securityResearchCards
