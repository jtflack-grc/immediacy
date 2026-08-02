/** Shared dossier schema for Interdependency rails + live pipeline. */

export type SourceType =
  | "10-K"
  | "8-K"
  | "osint"
  | "news"
  | "incident-kb"
  | "rails"
  | "assumption";

export type DependencyClass =
  | "erp"
  | "cloud"
  | "msp"
  | "processor"
  | "software"
  | "logistics"
  | "payment"
  | "identity"
  | "telecom"
  | "other";

export type CriticalityHint = "critical" | "high" | "medium" | "low" | "unknown";

export type Confidence = "high" | "medium" | "low" | "inferred";

export type InterdependencyTier = "T1" | "T2" | "T3" | "T4";

export interface Source {
  id: string;
  type: SourceType;
  title: string;
  url?: string;
  retrievedAt?: string;
  excerpt?: string;
}

export interface Company {
  id: string;
  name: string;
  ticker?: string;
  cik?: string;
  industry?: string;
  domains: string[];
  lat?: number;
  lng?: number;
  summary?: string;
}

export interface DependencyNode {
  id: string;
  name: string;
  class: DependencyClass;
  confidence: Confidence;
  sources: string[];
  lat?: number;
  lng?: number;
  notes?: string;
}

export interface DependencyEdge {
  id: string;
  fromCompanyId: string;
  toNodeId: string;
  relationship: string;
  criticalityHint: CriticalityHint;
  sources: string[];
}

export interface IncidentLink {
  id: string;
  nodeId: string;
  incidentId: string;
  title: string;
  year: number;
  summary: string;
  relevance: "disclosed-use" | "inferred-use" | "industry-common" | "case-study";
  sources: string[];
}

export interface FairBand {
  low: number;
  mode: number;
  high: number;
  unit: "events/year" | "USD" | "days";
}

export interface FairAssumption {
  id: string;
  label: string;
  value: number;
  unit: string;
  editable: boolean;
  note?: string;
}

export interface FairScenario {
  id: string;
  name: string;
  threat: string;
  asset: string;
  lef: FairBand;
  lossMag: FairBand;
  assumptions: FairAssumption[];
  drivers: string[];
  residualNotes?: string;
}

export interface OsintHost {
  hostname: string;
  source: string;
}

export interface FilingExcerpt {
  form: "10-K" | "8-K";
  accessionNumber: string;
  filedAt?: string;
  section: string;
  excerpt: string;
  url?: string;
}

export interface Dossier {
  id: string;
  mode: "rails" | "live";
  generatedAt: string;
  company: Company;
  sources: Source[];
  nodes: DependencyNode[];
  edges: DependencyEdge[];
  incidents: IncidentLink[];
  scenarios: FairScenario[];
  tier: InterdependencyTier;
  tierRationale: string;
  filings: FilingExcerpt[];
  osintHosts: OsintHost[];
  limitations: string[];
  tagline?: string;
}

export interface GazetteerEntry {
  id: string;
  name: string;
  aliases: string[];
  class: DependencyClass;
  lat?: number;
  lng?: number;
  incidentIds?: string[];
}

export interface IncidentKbEntry {
  id: string;
  title: string;
  year: number;
  entityIds: string[];
  summary: string;
  url?: string;
  classes?: DependencyClass[];
}

export interface ResolveResult {
  ticker: string;
  name: string;
  cik: string;
}

export const DEFAULT_LIMITATIONS: string[] = [
  "Educational freeware — not a substitute for due diligence, questionnaires, or contractual assurance.",
  "Public filings under-disclose technology stacks; absence of evidence is not evidence of absence.",
  "Inferred dependencies are labeled; do not treat inferred claims as facts.",
  "FAIR-shaped ranges use transparent assumptions and are not FAIR Institute–certified analyses.",
  "Outside-in coverage is passive only (no port scanning, darknet, or inside-out telemetry).",
  "Not affiliated with Safe Security or any commercial TPRM platform.",
];
