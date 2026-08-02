import fs from "node:fs/promises";
import path from "node:path";
import {
  DEFAULT_LIMITATIONS,
  type Dossier,
  type Source,
} from "@interdependency/shared";
import { RAILS_DIR } from "../paths.js";
import { ingestFilings, resolveCompany } from "./edgar.js";
import { extractDependencies } from "./extract.js";
import { buildEdges, buildScenarios, computeTier } from "./fair.js";
import { linkIncidents } from "./link.js";
import { passiveOsint } from "./osint.js";

const RAILS_FILES: Record<string, string> = {
  crowdstrike: "crowdstrike.json",
  "change-healthcare": "change-healthcare.json",
  change: "change-healthcare.json",
  clorox: "clorox.json",
  clx: "clorox.json",
};

export async function listRailsCases(): Promise<
  Array<{ id: string; title: string; tagline?: string }>
> {
  return [
    {
      id: "crowdstrike",
      title: "CrowdStrike (2024)",
      tagline: "Critical software / update-channel dependency",
    },
    {
      id: "change-healthcare",
      title: "Change Healthcare (2024)",
      tagline: "Intermediary concentration / healthcare payments",
    },
    {
      id: "clorox",
      title: "Clorox (2023)",
      tagline: "Service-provider foothold → operational cascade",
    },
  ];
}

export async function loadRailsDossier(caseId: string): Promise<Dossier | null> {
  const file = RAILS_FILES[caseId.toLowerCase()];
  if (!file) return null;
  const raw = await fs.readFile(path.join(RAILS_DIR, file), "utf8");
  return JSON.parse(raw) as Dossier;
}

export async function analyzeCompany(query: string): Promise<Dossier> {
  const resolved = await resolveCompany(query);
  if (!resolved) {
    throw Object.assign(new Error(`Could not resolve company: ${query}`), {
      statusCode: 404,
    });
  }

  const { filings, corpus, meta, usedSample } = await ingestFilings(
    resolved.cik,
    resolved.ticker
  );
  const websiteGuess =
    meta.website ||
    (resolved.ticker === "HAYW" ? "https://www.hayward.com" : undefined);
  const osintHosts = await passiveOsint({
    website: websiteGuess,
    name: meta.name || resolved.name,
  });

  const extracted = await extractDependencies(corpus);
  const linked = await linkIncidents(extracted.hits);

  const companyId = `co-${resolved.ticker.toLowerCase()}`;
  const sources: Source[] = [
    ...filings.map((f, i) => ({
      id: `src-filing-${i}`,
      type: f.form,
      title: `${f.form} ${f.accessionNumber}`,
      url: f.url,
      retrievedAt: new Date().toISOString(),
      excerpt: f.excerpt.slice(0, 400),
    })),
    ...extracted.sources,
    ...linked.sources,
  ];

  if (osintHosts.length) {
    sources.push({
      id: "src-osint-ct",
      type: "osint",
      title: "Passive OSINT (domain + Certificate Transparency)",
      excerpt: osintHosts
        .slice(0, 8)
        .map((h) => h.hostname)
        .join(", "),
      retrievedAt: new Date().toISOString(),
    });
  }

  const nodes = extracted.nodes;
  const edges = buildEdges(
    companyId,
    nodes,
    sources.map((s) => s.id)
  );
  const scenarios = buildScenarios(resolved.name, nodes, linked.incidents);
  const { tier, rationale } = computeTier(nodes, edges, linked.incidents);

  const domain =
    osintHosts[0]?.hostname ||
    (meta.website
      ? meta.website.replace(/^https?:\/\//, "").replace(/\/$/, "")
      : undefined);

  const dossier: Dossier = {
    id: `live-${resolved.ticker.toLowerCase()}-${Date.now()}`,
    mode: "live",
    generatedAt: new Date().toISOString(),
    tagline: "Live public-company interdependency dossier",
    company: {
      id: companyId,
      name: meta.name || resolved.name,
      ticker: resolved.ticker,
      cik: resolved.cik,
    industry: meta.industry || "Specialty water management / manufacturing",
    domains: domain ? [domain] : [],
      lat: resolved.ticker === "HAYW" ? 35.2271 : 39.8283,
      lng: resolved.ticker === "HAYW" ? -80.8431 : -98.5795,
      summary: `Public-data TPRM dossier for ${meta.name || resolved.name} (${resolved.ticker}). Dependencies extracted from EDGAR text + passive OSINT; never treat silence as safety.`,
    },
    sources,
    nodes,
    edges,
    incidents: linked.incidents,
    scenarios,
    tier,
    tierRationale: rationale,
    filings,
    osintHosts,
    limitations: [
      ...DEFAULT_LIMITATIONS,
      ...(usedSample
        ? [
            "Live SEC fetch was unavailable in this environment; analysis used a cached public 10-K excerpt bundle. Re-run where EDGAR is reachable for full accession coverage.",
          ]
        : []),
      nodes.length === 0
        ? "No gazetteer/LLM dependency hits in the extracted filing windows — disclosure gap is itself a finding."
        : "Dependency list is incomplete by design; filings omit most of the real vendor inventory.",
      "Named ERP vendor is often undisclosed; ERP-class hits may link industry-common ERP incident patterns (labeled accordingly).",
    ],
  };

  return dossier;
}
