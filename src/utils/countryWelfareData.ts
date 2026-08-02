/**
 * Jurisdiction disclosure / cyber-pressure data for globe hovers.
 * Scores reflect baseline disclosure & breach-notice posture (not animal welfare).
 */

export interface CountryJurisdictionData {
  name: string
  iso3: string
  fastFacts: string[]
  baselineScore: number
  /** Optional baseline regulatory-pressure estimate (0-1, higher = more pressure). */
  baselinePressure?: number
  sources?: string[]
  detailedContext?: string
}

/** @deprecated use CountryJurisdictionData */
export type CountryWelfareData = CountryJurisdictionData

/**
 * The jurisdictions actually "in play" for the default Northline incident scenario.
 * The globe / fallback map / post-mortem should only surface hover detail, status,
 * and pressure for these — everything else in `countryWelfareData` is background
 * reference data for jurisdictions that could matter in other scenarios.
 */
export const IN_PLAY_ISO3: ReadonlySet<string> = new Set([
  'USA', 'CAN', 'GBR', 'IRL', 'DEU', 'FRA', 'NLD', 'SGP', 'AUS', 'BRA', 'IND',
])

export function isInPlayJurisdiction(iso3: string): boolean {
  return IN_PLAY_ISO3.has(iso3)
}

function entry(
  name: string,
  iso3: string,
  fastFacts: string[],
  baselineScore: number,
  detailedContext: string,
  sources: string[] = []
): CountryJurisdictionData {
  return {
    name,
    iso3,
    fastFacts,
    baselineScore,
    baselinePressure: Math.max(0, Math.min(1, 1 - baselineScore)),
    detailedContext,
    sources,
  }
}

/** Detailed data for tracked jurisdictions */
export const countryWelfareData: Record<string, CountryJurisdictionData> = {
  USA: entry(
    'United States',
    'USA',
    [
      'Patchwork of state breach-notice laws + sector rules (GLBA, HIPAA, NYDFS)',
      'SEC cyber disclosure / 8-K materiality pressure for public companies',
      'No single federal consumer breach statute — clocks differ by state',
      'Active plaintiff bar and AG multi-state investigations after big incidents',
      'CISA/FBI coordination common for ransomware and critical infrastructure',
    ],
    0.55,
    'US disclosure pressure is fragmented: state AG notice, sector regulators, and securities law can all fire on different clocks. For a SaaS incident with PII, expect state notices, possible FTC interest, and board-level 8-K debates if material. Narrative capture (soft status pages) ages poorly under subpoena.',
    [
      'https://www.sec.gov/corpfin/secg-cybersecurity',
      'https://www.cisa.gov/stopransomware',
      'https://www.ftc.gov/business-guidance/privacy-security/data-breaches',
    ]
  ),
  CAN: entry(
    'Canada',
    'CAN',
    [
      'PIPEDA breach reporting to OPC when significant harm is real risk',
      'Provincial privacy statutes add notice complexity (esp. Québec Law 25)',
      'Cross-border US/CA customer bases often trigger dual notification programs',
      'OPC guidance emphasizes timely, clear individual notice',
    ],
    0.58,
    'Canada’s federal PIPEDA breach regime plus provincial overlays means “one email” rarely covers the map. Québec’s Law 25 raised expectations for privacy governance. US parent incidents routinely pull Canadian individuals into the notice set.',
    ['https://www.priv.gc.ca/en/privacy-topics/business-privacy/breaches/']
  ),
  MEX: entry(
    'Mexico',
    'MEX',
    [
      'LFPDPPP personal-data rules with INAI oversight',
      'Breach notification expectations less litigated than US/EU but rising',
      'Nearshoring SaaS footprints increase MX data in US incident scopes',
    ],
    0.42,
    'Mexico sits on many North American SaaS data paths. When CRM or HR exports include MX residents, INAI-facing notice analysis should ride alongside US state clocks.',
    []
  ),
  GBR: entry(
    'United Kingdom',
    'GBR',
    [
      'UK GDPR + Data Protection Act — ICO notification often within 72 hours',
      'Post-Brexit regime still tracks EU-style awareness clocks',
      'ICO expects documented awareness rationale and individual notice when high risk',
      'NCSC ransomware guidance discourages payment as default',
    ],
    0.72,
    'The UK remains a high-maturity disclosure jurisdiction. ICO scrutiny of delayed or drip notifications is real, and NCSC messaging shapes board debates on ransom payment. Customer trust centers that match ICO tone travel well.',
    [
      'https://ico.org.uk/for-organisations/report-a-breach/',
      'https://www.ncsc.gov.uk/guidance/mitigating-malware-and-ransomware-attacks',
    ]
  ),
  IRL: entry(
    'Ireland',
    'IRL',
    [
      'DPC is lead EU supervisory authority for many US tech/SaaS groups',
      'GDPR Art. 33 72-hour clock to the DPA once aware',
      'Cross-border one-stop-shop still concentrates EU pressure in Dublin',
    ],
    0.78,
    'If EU personal data is in scope, Ireland’s DPC is often the gravity well. Art. 33 awareness documentation matters as much as the notice text. Waiting for perfect forensics is a common — and contested — defense.',
    ['https://www.dataprotection.ie/en/organisations/know-your-obligations/breach-notification']
  ),
  FRA: entry(
    'France',
    'FRA',
    [
      'CNIL enforces GDPR breach notification with active fining history',
      'ANSSI cyber guidance influential for critical operators',
      'French customer bases expect rapid, plain-language notices',
    ],
    0.7,
    'CNIL has shown willingness to fine process failures, not just theft. French-language notice quality and speed are part of disclosure posture for EU-facing SaaS.',
    ['https://www.cnil.fr/en/personal-data-breach-notification']
  ),
  DEU: entry(
    'Germany',
    'DEU',
    [
      'BfDI / state DPAs — strict interpretation of GDPR clocks',
      'Works councils and employee-data issues complicate internal incidents',
      'BSI cyber recommendations shape enterprise customer expectations',
    ],
    0.74,
    'German DPAs are exacting on awareness and risk-to-rights analysis. Employee and customer data mixed in SaaS tenants creates dual notification tracks.',
    ['https://www.bfdi.bund.de/EN/Home/home_node.html']
  ),
  NLD: entry(
    'Netherlands',
    'NLD',
    [
      'AP (Autoriteit Persoonsgegevens) active on breach reporting',
      'Strong enterprise SaaS customer concentration in NL/EU hubs',
      'NCSC-NL ransomware advisories influence board language',
    ],
    0.72,
    'Dutch regulators and enterprise buyers both expect crisp timelines. NL often appears early on globe arcs when EU customer hints surface.',
    ['https://www.autoriteitpersoonsgegevens.nl/en']
  ),
  SWE: entry(
    'Sweden',
    'SWE',
    [
      'IMY supervises GDPR breach notices',
      'High public transparency norms raise narrative expectations',
    ],
    0.7,
    'Nordic transparency culture means soft-pedaled status pages age poorly if personal data was at risk.',
    []
  ),
  DNK: entry(
    'Denmark',
    'DNK',
    [
      'Datatilsynet GDPR enforcement',
      'Enterprise customers often demand vendor incident SLAs in contracts',
    ],
    0.7,
    'Contractual incident SLAs can be stricter than statute — disclosure debt includes broken MSA clocks.',
    []
  ),
  POL: entry(
    'Poland',
    'POL',
    [
      'UODO GDPR breach notification',
      'Growing delivery/engineering hubs put PL staff data in scopes',
    ],
    0.58,
    'Polish authority practice tracks EU norms; staff and customer data in shared tenants expand notice sets.',
    []
  ),
  ITA: entry(
    'Italy',
    'ITA',
    [
      'Garante GDPR enforcement with notable fine history',
      'Public-sector and healthcare adjacent SaaS draws extra scrutiny',
    ],
    0.65,
    'Italian Garante actions remind boards that process failures (late notice, weak security measures) drive penalties.',
    []
  ),
  ESP: entry(
    'Spain',
    'ESP',
    [
      'AEPD active on breach notification and security measures',
      'Spanish-language notice quality matters for fairness',
    ],
    0.65,
    'AEPD expects timely notice and appropriate security controls narrative — not just apology theater.',
    []
  ),
  CHN: entry(
    'China',
    'CHN',
    [
      'PIPL + CSL + DSL — incident reporting to CAC/industry regulators',
      'Cross-border transfer rules complicate global SaaS forensics narratives',
      'Public attribution and “nation-state” framing are politically sensitive',
    ],
    0.4,
    'China’s regime is sovereignty-forward. If CN personal information is involved, local reporting paths diverge from GDPR/US state clocks. Loose public attribution can create diplomatic and commercial blowback.',
    []
  ),
  IND: entry(
    'India',
    'IND',
    [
      'Digital Personal Data Protection Act regime emerging',
      'CERT-In directions historically imposed tight incident reporting windows',
      'Large IT/BPO footprints put IN employee data in many breaches',
    ],
    0.45,
    'India’s CERT-In culture trained boards to think in hours, not weeks. Employee and customer data in IN delivery centers often expands Northline-style scopes.',
    ['https://www.cert-in.org.in/']
  ),
  JPN: entry(
    'Japan',
    'JPN',
    [
      'APPI breach reporting to PPC when requirements met',
      'Enterprise customers expect sober, non-hyped incident notices',
      'Ransomware against JP manufacturers raised board awareness',
    ],
    0.62,
    'Japanese disclosure culture favors understatement without false denial. Over-claiming nation-state involvement reads as narrative capture.',
    ['https://www.ppc.go.jp/en/']
  ),
  KOR: entry(
    'South Korea',
    'KOR',
    [
      'PIPA breach notification with PIPC oversight',
      'Historically aggressive enforcement on large personal-data incidents',
    ],
    0.6,
    'Korea’s PIPA regime is a serious clock if KR residents are in the export. Under-notifying to “protect the brand” travels badly.',
    []
  ),
  SGP: entry(
    'Singapore',
    'SGP',
    [
      'PDPA breach notification to PDPC when significant harm threshold met',
      'Regional HQ hub — SG often coordinates APAC customer notices',
      'CSA ransomware guidance shapes enterprise expectations',
    ],
    0.68,
    'Singapore is a disclosure hub for APAC SaaS. PDPC guidance and CSA messaging influence how regional customers judge your posture.',
    ['https://www.pdpc.gov.sg/Overview-of-PDPA/Data-Protection/Business-Owner/Data-Breach-Notification']
  ),
  AUS: entry(
    'Australia',
    'AUS',
    [
      'Notifiable Data Breaches scheme under Privacy Act — OAIC',
      'Security of Critical Infrastructure reforms raise OT/IT bar',
      'Active class-action environment after major breaches',
    ],
    0.65,
    'Australia’s NDB scheme is a clear “eligible data breach” assessment. Boards remember Optus/Medibank-era political heat when drafting soft statements.',
    ['https://www.oaic.gov.au/privacy/notifiable-data-breaches']
  ),
  NZL: entry(
    'New Zealand',
    'NZL',
    [
      'Privacy Act 2020 notifiable privacy breach regime',
      'Close alignment with AU customer expectations',
    ],
    0.62,
    'NZ notice expectations track modern privacy-breach norms; treat similarly situated AU/NZ customers fairly.',
    []
  ),
  BRA: entry(
    'Brazil',
    'BRA',
    [
      'LGPD breach communication to ANPD and holders when risk warrants',
      'Large consumer SaaS footprints in LATAM incidents',
      'Growing ANPD enforcement posture',
    ],
    0.55,
    'LGPD brought Brazil onto the global disclosure map. Portuguese-language notice and ANPD reporting belong in the playbook when BR residents are in scope.',
    ['https://www.gov.br/anpd/pt-br']
  ),
  ARG: entry(
    'Argentina',
    'ARG',
    [
      'Personal data law with AAIP oversight; breach expectations evolving',
      'Often pulled into regional LATAM notice sets with BR/MX',
    ],
    0.45,
    'Argentina may not drive the headline clock, but fairness across LATAM customers still matters for narrative integrity.',
    []
  ),
  CHL: entry(
    'Chile',
    'CHL',
    [
      'Privacy reform trajectory raising breach expectations',
      'Enterprise mining/finance customers demand contractual notice SLAs',
    ],
    0.48,
    'Contract clocks often bind before statute. Disclosure debt includes MSA breaches as well as regulator delay.',
    []
  ),
  ZAF: entry(
    'South Africa',
    'ZAF',
    [
      'POPIA breach reporting to Information Regulator',
      'Regional hub for African customer data in SaaS tenants',
    ],
    0.5,
    'POPIA put South Africa on the breach-notice map. Ignore ZA residents in a “US-only” notice plan at your peril.',
    []
  ),
  EGY: entry(
    'Egypt',
    'EGY',
    [
      'Personal data protection law with emerging breach expectations',
      'Regional connectivity hubs appear in global SaaS routing',
    ],
    0.35,
    'Egyptian personal-data rules are maturing. If EG residents appear in exports, document the assessment even when the lead clock is GDPR/US.',
    []
  ),
  KEN: entry(
    'Kenya',
    'KEN',
    [
      'Data Protection Act with ODPC breach notification duties',
      'Growing fintech/SaaS customer base',
    ],
    0.42,
    'Kenya’s ODPC regime is part of Africa’s rising disclosure pressure. Fair notice beats selective silence.',
    []
  ),
  NGA: entry(
    'Nigeria',
    'NGA',
    [
      'NDPR / NDPC breach reporting expectations',
      'Large consumer markets increase class-style reputational risk',
    ],
    0.4,
    'Nigeria’s privacy regime belongs on the jurisdiction checklist when African customer data is in a CRM export.',
    []
  ),
  SAU: entry(
    'Saudi Arabia',
    'SAU',
    [
      'PDPL breach notification to SDAIA when required',
      'Critical-infrastructure cyber expectations rising under national programs',
    ],
    0.45,
    'Saudi PDPL and national cyber programs raise the cost of casual public narratives. Stick to verified TTPs.',
    []
  ),
  TUR: entry(
    'Turkey',
    'TUR',
    [
      'KVKK breach notification obligations',
      'Bridge jurisdiction between EU-style and regional regimes',
    ],
    0.48,
    'KVKK clocks can surprise teams that only modeled GDPR + US state law.',
    []
  ),
  ISR: entry(
    'Israel',
    'ISR',
    [
      'Privacy Protection Authority breach guidance',
      'Strong cyber industry — high customer sophistication on incident quality',
    ],
    0.6,
    'Israeli enterprise buyers judge incident communications on technical credibility. Nation-state cosplay without evidence backfires.',
    []
  ),
  THA: entry(
    'Thailand',
    'THA',
    [
      'PDPA breach notification to PDPC when thresholds met',
      'Regional manufacturing/SaaS customers increasingly in scope',
    ],
    0.45,
    'Thailand’s PDPA put breach notice on the SEA checklist alongside SG/MY.',
    []
  ),
  IDN: entry(
    'Indonesia',
    'IDN',
    [
      'Personal Data Protection Law — breach reporting trajectory',
      'Large consumer platforms raise stakes for incomplete notice',
    ],
    0.4,
    'Indonesia’s PDP law is pulling ID residents into global notice analyses that used to stop at SG.',
    []
  ),
  PHL: entry(
    'Philippines',
    'PHL',
    [
      'Data Privacy Act with NPC breach notification',
      'Major BPO employee-data presence in many SaaS incidents',
    ],
    0.48,
    'BPO and support hubs mean PH employee data appears often. NPC notice analysis should be automatic when support exports leak.',
    []
  ),
  MYS: entry(
    'Malaysia',
    'MYS',
    [
      'PDPA breach notification to Commissioner',
      'Often grouped with SG for APAC customer fairness',
    ],
    0.5,
    'Treat MY customers with the same factual package as SG peers when similarly situated — selective briefing creates disclosure debt.',
    []
  ),
}

/**
 * Regional fallback facts for jurisdictions without a detailed card
 */
export function generateBasicFastFacts(iso3: string, _countryName: string): string[] {
  const regionalPatterns: Record<string, string[]> = {
    EU: [
      'GDPR Art. 33 — notify supervisory authority within 72 hours of awareness when feasible',
      'Art. 34 individual notice when high risk to rights and freedoms',
      'Document the awareness rationale even if you wait for forensics',
      'Lead authority may be Ireland DPC for many US SaaS groups',
    ],
    UK: [
      'UK GDPR / DPA breach reporting to the ICO',
      'NCSC ransomware guidance shapes payment and disclosure debates',
    ],
    ASIA: [
      'APAC breach regimes vary — check PDPA/APPI/PIPA/local CERT rules',
      'Regional HQ hubs (often SG) coordinate multi-country customer notice',
      'Contractual MSA incident SLAs may beat statute',
    ],
    AMERICAS: [
      'US state breach statutes + sector rules; Canada PIPEDA; Brazil LGPD',
      'Securities disclosure may apply separately from consumer notice',
      'Plaintiff and AG pressure punish drip narratives',
    ],
    AFRICA: [
      'POPIA (ZA), Kenya ODPC, Nigeria NDPR — rising breach-notice expectations',
      'Fairness across similarly situated customers still matters',
    ],
    MIDDLE_EAST: [
      'PDPL-style regimes (e.g., KSA) and sector cyber rules emerging',
      'Public attribution is politically sensitive — stick to observed TTPs',
    ],
    OCEANIA: [
      'Australia NDB scheme (OAIC) and NZ Privacy Act notifiable breaches',
      'Class-action and political heat after major consumer incidents',
    ],
  }

  if (['FRA', 'DEU', 'ITA', 'ESP', 'NLD', 'BEL', 'POL', 'SWE', 'DNK', 'FIN', 'AUT', 'PRT', 'GRC', 'IRL', 'CZE', 'HUN', 'ROU', 'BGR', 'HRV', 'SVK', 'SVN', 'EST', 'LVA', 'LTU'].includes(iso3)) {
    return regionalPatterns.EU
  }
  if (iso3 === 'GBR') return regionalPatterns.UK
  if (['CHN', 'IND', 'JPN', 'KOR', 'THA', 'VNM', 'IDN', 'PHL', 'MYS', 'SGP', 'BGD', 'PAK'].includes(iso3)) {
    return regionalPatterns.ASIA
  }
  if (['USA', 'CAN', 'MEX', 'BRA', 'ARG', 'CHL', 'COL', 'PER'].includes(iso3)) {
    return regionalPatterns.AMERICAS
  }
  if (['ZAF', 'EGY', 'KEN', 'NGA', 'GHA', 'TZA', 'UGA', 'ETH', 'MAR'].includes(iso3)) {
    return regionalPatterns.AFRICA
  }
  if (['SAU', 'ARE', 'IRN', 'ISR', 'TUR'].includes(iso3)) {
    return regionalPatterns.MIDDLE_EAST
  }
  if (['AUS', 'NZL', 'PNG', 'FJI'].includes(iso3)) {
    return regionalPatterns.OCEANIA
  }

  return [
    'Breach-notice and cyber-disclosure rules vary by jurisdiction',
    'Document awareness and treat similarly situated individuals fairly',
    'Contractual incident SLAs may be stricter than local statute',
    'Adversary leak sites can force disclosure on their clock',
  ]
}

export function getCountryData(iso3: string, countryName?: string): CountryJurisdictionData | null {
  if (countryWelfareData[iso3]) {
    return countryWelfareData[iso3]
  }

  if (countryName) {
    let baselineScore = 0.4
    if (['FRA', 'DEU', 'ITA', 'ESP', 'NLD', 'BEL', 'POL', 'SWE', 'DNK', 'FIN', 'AUT', 'PRT', 'GRC', 'IRL'].includes(iso3)) {
      baselineScore = 0.68
    } else if (['JPN', 'KOR', 'SGP', 'AUS', 'NZL', 'GBR', 'CAN'].includes(iso3)) {
      baselineScore = 0.62
    } else if (['USA'].includes(iso3)) {
      baselineScore = 0.55
    }

    return {
      name: countryName,
      iso3,
      fastFacts: generateBasicFastFacts(iso3, countryName),
      baselineScore,
      baselinePressure: Math.max(0, Math.min(1, 1 - baselineScore)),
    }
  }

  return null
}
