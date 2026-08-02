import {
  DEFAULT_LIMITATIONS,
  type Confidence,
  type DependencyEdge,
  type DependencyNode,
  type Dossier,
  type FairScenario,
  type GazetteerEntry,
  type IncidentKbEntry,
  type IncidentLink,
  type InterdependencyTier,
  type Source,
} from "@interdependency/shared";

type TickerRow = { cik_str: number; ticker: string; title: string };

interface ExtractedHit {
  entry: GazetteerEntry;
  confidence: Confidence;
  evidenceQuote: string;
}

async function loadJson<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json() as Promise<T>;
}

function rank(c: Confidence): number {
  return { high: 4, medium: 3, low: 2, inferred: 1 }[c];
}

function extractDeterministic(
  corpus: string,
  gazetteer: GazetteerEntry[]
): ExtractedHit[] {
  const hits: ExtractedHit[] = [];
  const lower = corpus.toLowerCase();
  for (const entry of gazetteer) {
    const terms = [entry.name, ...entry.aliases];
    for (const term of terms) {
      const t = term.toLowerCase();
      if (t.length < 3) continue;
      const idx = lower.indexOf(t);
      if (idx >= 0) {
        const start = Math.max(0, idx - 80);
        const end = Math.min(corpus.length, idx + term.length + 120);
        const quote = corpus.slice(start, end).trim();
        const confidence: Confidence =
          /\b(uses|using|utiliz|powered by|migrated to|hosted on|provider|vendor|platform|implement)\b/i.test(
            quote
          )
            ? "medium"
            : "low";
        hits.push({
          entry,
          confidence,
          evidenceQuote: quote.slice(0, 280),
        });
        break;
      }
    }
  }
  const map = new Map<string, ExtractedHit>();
  for (const h of hits) {
    const prev = map.get(h.entry.id);
    if (!prev || rank(h.confidence) > rank(prev.confidence)) map.set(h.entry.id, h);
  }
  return [...map.values()];
}

function linkIncidents(
  hits: ExtractedHit[],
  kb: IncidentKbEntry[]
): { incidents: IncidentLink[]; sources: Source[] } {
  const incidents: IncidentLink[] = [];
  const sources: Source[] = [];
  for (const hit of hits) {
    const ids = hit.entry.incidentIds || [];
    const related = kb.filter(
      (inc) =>
        ids.includes(inc.id) ||
        inc.entityIds.includes(hit.entry.id) ||
        (inc.classes || []).includes(hit.entry.class)
    );
    const preferred = related.filter(
      (inc) => ids.includes(inc.id) || inc.entityIds.includes(hit.entry.id)
    );
    const chosen = (preferred.length ? preferred : related).slice(0, 2);
    for (const inc of chosen) {
      const sid = `src-inc-${inc.id}-${hit.entry.id}`;
      sources.push({
        id: sid,
        type: "incident-kb",
        title: inc.title,
        url: inc.url,
        excerpt: inc.summary,
      });
      incidents.push({
        id: `il-${inc.id}-${hit.entry.id}`,
        nodeId: hit.entry.id,
        incidentId: inc.id,
        title: inc.title,
        year: inc.year,
        summary: `${hit.entry.name} (${hit.entry.class}) — ${inc.summary}`,
        relevance: preferred.includes(inc)
          ? hit.confidence === "low"
            ? "industry-common"
            : "disclosed-use"
          : "industry-common",
        sources: [sid],
      });
    }
  }
  return { incidents, sources };
}

function buildEdges(
  companyId: string,
  nodes: DependencyNode[]
): DependencyEdge[] {
  const criticalityFor = (cls: string) => {
    if (["processor", "payment", "identity", "erp"].includes(cls)) return "critical" as const;
    if (["software", "cloud", "msp", "logistics"].includes(cls)) return "high" as const;
    return "medium" as const;
  };
  return nodes.map((n, i) => ({
    id: `e-live-${n.id}-${i}`,
    fromCompanyId: companyId,
    toNodeId: n.id,
    relationship: `${n.class} dependency (public evidence)`,
    criticalityHint: criticalityFor(n.class),
    sources: n.sources,
  }));
}

function buildScenarios(
  companyName: string,
  nodes: DependencyNode[],
  incidents: IncidentLink[]
): FairScenario[] {
  const scenarios: FairScenario[] = [];
  const soft = nodes.find((n) => n.class === "software");
  const proc = nodes.find((n) => n.class === "processor" || n.class === "payment");
  const msp = nodes.find((n) => n.class === "msp");
  const cloud = nodes.find((n) => n.class === "cloud");
  const erp = nodes.find((n) => n.class === "erp");

  if (soft) {
    scenarios.push({
      id: "sc-software-update",
      name: "Critical software vendor failure / bad update",
      threat: `Faulty or disrupted update from ${soft.name}`,
      asset: `${companyName} endpoint / control-plane operations`,
      lef: { low: 0.02, mode: 0.08, high: 0.2, unit: "events/year" },
      lossMag: { low: 2_000_000, mode: 20_000_000, high: 150_000_000, unit: "USD" },
      assumptions: [
        { id: "a-soft-1", label: "Estate coverage by vendor", value: 70, unit: "%", editable: true },
        { id: "a-soft-2", label: "Hours of material disruption", value: 18, unit: "hours", editable: true },
      ],
      drivers: ["Update-channel trust", "Privileged agent/software footprint", "Vendor concentration"],
    });
  }
  if (proc) {
    scenarios.push({
      id: "sc-processor",
      name: "Concentrated processor / clearinghouse outage",
      threat: `Prolonged outage at ${proc.name}`,
      asset: "Revenue cycle / transaction clearing",
      lef: { low: 0.03, mode: 0.1, high: 0.25, unit: "events/year" },
      lossMag: { low: 5_000_000, mode: 40_000_000, high: 250_000_000, unit: "USD" },
      assumptions: [
        { id: "a-proc-1", label: "Share of volume via intermediary", value: 50, unit: "%", editable: true },
      ],
      drivers: ["Intermediary concentration", "Limited alternate rails"],
    });
  }
  if (msp) {
    scenarios.push({
      id: "sc-msp",
      name: "Service-provider foothold → operational cascade",
      threat: "Social engineering or compromise of IT support / identity pathway",
      asset: "Manufacturing, logistics, or core ops systems",
      lef: { low: 0.05, mode: 0.12, high: 0.3, unit: "events/year" },
      lossMag: { low: 8_000_000, mode: 60_000_000, high: 300_000_000, unit: "USD" },
      assumptions: [
        { id: "a-msp-1", label: "Weeks of constrained operations", value: 4, unit: "weeks", editable: true },
      ],
      drivers: ["Support-channel trust", "Identity reset privileges"],
    });
  }
  if (cloud || erp) {
    const name = cloud?.name || erp?.name || "SaaS/ERP platform";
    scenarios.push({
      id: "sc-cloud-saas",
      name: "Cloud/SaaS or ERP data exposure via named dependency",
      threat: `Compromise or prolonged outage of ${name}`,
      asset: "Customer data / financial system of record",
      lef: { low: 0.04, mode: 0.11, high: 0.28, unit: "events/year" },
      lossMag: { low: 3_000_000, mode: 25_000_000, high: 180_000_000, unit: "USD" },
      assumptions: [
        { id: "a-cloud-1", label: "Sensitive records in platform", value: 250000, unit: "records", editable: true },
      ],
      drivers: ["Shared responsibility gaps", "Identity federation", "ERP cutover risk"],
    });
  }
  if (nodes.length) {
    scenarios.push({
      id: "sc-concentration",
      name: "Single-supplier / platform concentration",
      threat: "Simultaneous failure of a high-criticality dependency class",
      asset: "Business continuity for core processes",
      lef: { low: 0.04, mode: 0.1, high: 0.22, unit: "events/year" },
      lossMag: { low: 2_000_000, mode: 18_000_000, high: 120_000_000, unit: "USD" },
      assumptions: [
        {
          id: "a-conc-1",
          label: "Critical dependencies without alternate",
          value: Math.min(nodes.length, 5),
          unit: "vendors",
          editable: true,
        },
      ],
      drivers: ["Disclosure-limited visibility", "Switching costs"],
    });
  }
  if (!scenarios.length) {
    scenarios.push({
      id: "sc-unknown",
      name: "Undisclosed third-party surface",
      threat: "Material third-party failure not visible in public filings",
      asset: "Unknown critical dependency",
      lef: { low: 0.05, mode: 0.15, high: 0.35, unit: "events/year" },
      lossMag: { low: 1_000_000, mode: 10_000_000, high: 80_000_000, unit: "USD" },
      assumptions: [
        {
          id: "a-unk-1",
          label: "Unknown critical vendors (estimate)",
          value: 5,
          unit: "vendors",
          editable: true,
        },
      ],
      drivers: ["Disclosure gap"],
      residualNotes: incidents.length
        ? "Incident KB has related patterns, but no filing dependency hit."
        : "Add filing excerpts or run with the optional analysis API for broader EDGAR coverage.",
    });
  }
  return scenarios.slice(0, 5);
}

function computeTier(
  nodes: DependencyNode[],
  edges: DependencyEdge[],
  incidents: IncidentLink[]
): { tier: InterdependencyTier; rationale: string } {
  const criticalEdges = edges.filter(
    (e) => e.criticalityHint === "critical" || e.criticalityHint === "high"
  ).length;
  let score = criticalEdges * 2;
  score += nodes.some((n) => n.class === "processor" || n.class === "payment") ? 3 : 0;
  score += nodes.some((n) => ["software", "identity", "erp"].includes(n.class)) ? 2 : 0;
  score += Math.min(incidents.length, 3);
  score += nodes.filter((n) => n.confidence === "high" || n.confidence === "medium").length;
  if (score >= 8) {
    return {
      tier: "T1",
      rationale:
        "High materiality proxies: critical dependency classes and/or linked historical third-party failure patterns.",
    };
  }
  if (score >= 5) {
    return {
      tier: "T2",
      rationale:
        "Elevated coupling via cloud/ERP/software dependencies with partial evidence strength.",
    };
  }
  if (score >= 2) {
    return {
      tier: "T3",
      rationale: "Some public dependency signals; limited criticality confirmation.",
    };
  }
  return {
    tier: "T4",
    rationale:
      "Sparse public disclosure — tier reflects visibility gap more than proven low risk.",
  };
}

/** Fully static browser analyze (GitHub Pages) using bundled KB + sample corpora. */
export async function analyzeClientSide(query: string): Promise<Dossier> {
  const q = query.trim();
  if (!q) throw new Error("Enter a ticker or company name");

  // Prefer a prebuilt dossier pack when the query looks like a ticker
  const packRes = await fetch(`./dossiers/${q.toUpperCase()}.json`);
  if (packRes.ok) {
    return packRes.json() as Promise<Dossier>;
  }

  const [seedTickers, gazetteer, incidentsKb] = await Promise.all([
    loadJson<TickerRow[]>("./kb/tickers-seed.json"),
    loadJson<GazetteerEntry[]>("./kb/gazetteer.json"),
    loadJson<IncidentKbEntry[]>("./kb/incidents.json"),
  ]);

  let tickers = seedTickers;
  try {
    tickers = await loadJson<TickerRow[]>("./kb/company_tickers.json");
  } catch {
    /* seed only until Actions syncs the full SEC ticker file */
  }

  const lower = q.toLowerCase();
  const resolved =
    tickers.find((t) => t.ticker.toLowerCase() === lower) ||
    tickers.find((t) => t.title.toLowerCase().includes(lower));
  if (!resolved) {
    throw new Error(
      `“${q}” was not found in the ticker index. Try a US listed ticker (e.g. HAYW) or a rails case.`
    );
  }

  // Prefer a prebuilt dossier from the Actions search pack
  const built = await fetch(`./dossiers/${resolved.ticker.toUpperCase()}.json`);
  if (built.ok) {
    return built.json() as Promise<Dossier>;
  }

  const cik = String(resolved.cik_str).padStart(10, "0");
  let corpus = "";
  let filingExcerpt = "";
  const corpusRes = await fetch(`./kb/sample-corpora/${resolved.ticker.toUpperCase()}.txt`);
  if (corpusRes.ok) {
    corpus = await corpusRes.text();
    filingExcerpt = corpus.slice(0, 2500);
  }

  if (!corpus) {
    throw new Error(
      `${resolved.ticker} is in the ticker index, but no EDGAR dossier is published yet. Run GitHub Action “Build EDGAR dossiers” with ticker ${resolved.ticker}, or use local live search (npm run dev:api).`
    );
  }

  const hits = extractDeterministic(corpus, gazetteer);
  const linked = linkIncidents(hits, incidentsKb);
  const sources: Source[] = [];
  if (filingExcerpt) {
    sources.push({
      id: "src-filing-0",
      type: "10-K",
      title: `${resolved.ticker} public 10-K excerpt (static pack)`,
      url: "https://www.sec.gov/edgar/searchedgar/companysearch",
      excerpt: filingExcerpt.slice(0, 400),
      retrievedAt: new Date().toISOString(),
    });
  }
  const nodes: DependencyNode[] = hits.map((h, i) => {
    const sid = `src-dep-${h.entry.id}-${i}`;
    sources.push({
      id: sid,
      type: "10-K",
      title: `Gazetteer evidence for ${h.entry.name}`,
      excerpt: h.evidenceQuote,
    });
    return {
      id: h.entry.id,
      name: h.entry.name,
      class: h.entry.class,
      confidence: h.confidence,
      sources: [sid],
      lat: h.entry.lat,
      lng: h.entry.lng,
      notes: "Extracted in-browser from bundled public filing excerpt.",
    };
  });
  sources.push(...linked.sources);

  const companyId = `co-${resolved.ticker.toLowerCase()}`;
  const edges = buildEdges(companyId, nodes);
  const scenarios = buildScenarios(resolved.title, nodes, linked.incidents);
  const { tier, rationale } = computeTier(nodes, edges, linked.incidents);

  return {
    id: `static-${resolved.ticker.toLowerCase()}-${Date.now()}`,
    mode: "live",
    generatedAt: new Date().toISOString(),
    tagline: "Static web pack (GitHub Pages) — same dossier schema as the API",
    company: {
      id: companyId,
      name: resolved.title,
      ticker: resolved.ticker,
      cik,
      industry: undefined,
      domains: [],
      lat: resolved.ticker === "HAYW" ? 35.2271 : 39.8283,
      lng: resolved.ticker === "HAYW" ? -80.8431 : -98.5795,
      summary: `Browser-side TPRM dossier for ${resolved.title} (${resolved.ticker}) built from bundled public excerpts and the Interdependency knowledge base.`,
    },
    sources,
    nodes,
    edges,
    incidents: linked.incidents,
    scenarios,
    tier,
    tierRationale: rationale,
    filings: filingExcerpt
      ? [
          {
            form: "10-K",
            accessionNumber: `static-${resolved.ticker}`,
            section: "Bundled public excerpt",
            excerpt: filingExcerpt,
            url: "https://www.sec.gov/edgar/searchedgar/companysearch",
          },
        ]
      : [],
    osintHosts: [],
    limitations: [
      ...DEFAULT_LIMITATIONS,
      "Browser search uses Action-built dossiers / excerpts (no cloud API keys in the app).",
      "For on-demand EDGAR of any ticker on your machine: npm run dev:api && npm run dev:web.",
      "To add a company to the public Pages pack: run workflow Build EDGAR dossiers.",
      nodes.length === 0
        ? "No gazetteer hits in the bundled excerpt — disclosure gap is itself a finding. Queue a dossier build for fuller EDGAR text."
        : "Dependency list is incomplete by design; filings omit most of the real vendor inventory.",
    ],
  };
}
