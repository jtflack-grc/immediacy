import fs from "node:fs/promises";
import path from "node:path";
import type {
  Confidence,
  DependencyClass,
  DependencyNode,
  GazetteerEntry,
  Source,
} from "@interdependency/shared";
import { KB_DIR } from "../paths.js";

export interface ExtractedHit {
  entry: GazetteerEntry;
  confidence: Confidence;
  evidenceQuote: string;
  via: "gazetteer" | "llm";
}

let gazetteerCache: GazetteerEntry[] | null = null;

export async function loadGazetteer(): Promise<GazetteerEntry[]> {
  if (gazetteerCache) return gazetteerCache;
  const raw = await fs.readFile(path.join(KB_DIR, "gazetteer.json"), "utf8");
  gazetteerCache = JSON.parse(raw) as GazetteerEntry[];
  return gazetteerCache;
}

export async function extractDeterministic(corpus: string): Promise<ExtractedHit[]> {
  const gazetteer = await loadGazetteer();
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
          /\b(uses|using|utiliz|powered by|migrated to|hosted on|provider|vendor|platform)\b/i.test(
            quote
          )
            ? "medium"
            : "low";
        hits.push({
          entry,
          confidence,
          evidenceQuote: quote.slice(0, 280),
          via: "gazetteer",
        });
        break;
      }
    }
  }

  // de-dupe by entry id
  const map = new Map<string, ExtractedHit>();
  for (const h of hits) {
    const prev = map.get(h.entry.id);
    if (!prev || rank(h.confidence) > rank(prev.confidence)) map.set(h.entry.id, h);
  }
  return [...map.values()];
}

function rank(c: Confidence): number {
  return { high: 4, medium: 3, low: 2, inferred: 1 }[c];
}

interface LlmExtraction {
  entity: string;
  dependencyClass: DependencyClass;
  evidenceQuote: string;
  confidence: Confidence;
}

export async function extractWithLlm(corpus: string): Promise<ExtractedHit[]> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.LLM_API_KEY;
  if (!apiKey || !corpus.trim()) return [];

  const base = process.env.LLM_BASE_URL || "https://api.openai.com/v1";
  const model = process.env.LLM_MODEL || "gpt-4o-mini";
  const chunk = corpus.slice(0, 12000);

  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Extract third-party technology and service dependencies explicitly evidenced in the filing text. Never invent. Return JSON {\"items\":[{\"entity\",\"dependencyClass\",\"evidenceQuote\",\"confidence\"}]} where dependencyClass is one of erp,cloud,msp,processor,software,logistics,payment,identity,telecom,other and confidence is high|medium|low.",
          },
          { role: "user", content: chunk },
        ],
      }),
    });
    if (!res.ok) return [];
    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content;
    if (!content) return [];
    const parsed = JSON.parse(content) as { items?: LlmExtraction[] };
    const gazetteer = await loadGazetteer();
    const out: ExtractedHit[] = [];

    for (const item of parsed.items || []) {
      if (!item.entity || !item.evidenceQuote) continue;
      const match =
        gazetteer.find(
          (g) =>
            g.name.toLowerCase() === item.entity.toLowerCase() ||
            g.aliases.some((a) => a.toLowerCase() === item.entity.toLowerCase())
        ) ||
        ({
          id: slug(item.entity),
          name: item.entity,
          aliases: [],
          class: item.dependencyClass || "other",
        } satisfies GazetteerEntry);

      out.push({
        entry: match,
        confidence: item.confidence || "low",
        evidenceQuote: item.evidenceQuote.slice(0, 280),
        via: "llm",
      });
    }
    return out;
  } catch {
    return [];
  }
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);
}

export async function extractDependencies(corpus: string): Promise<{
  hits: ExtractedHit[];
  nodes: DependencyNode[];
  sources: Source[];
}> {
  const det = await extractDeterministic(corpus);
  const llm = await extractWithLlm(corpus);
  const merged = new Map<string, ExtractedHit>();
  for (const h of [...det, ...llm]) {
    const prev = merged.get(h.entry.id);
    if (!prev || rank(h.confidence) > rank(prev.confidence)) merged.set(h.entry.id, h);
  }
  const hits = [...merged.values()];
  const sources: Source[] = [];
  const nodes: DependencyNode[] = hits.map((h, i) => {
    const sid = `src-dep-${h.entry.id}-${i}`;
    sources.push({
      id: sid,
      type: "10-K",
      title: `${h.via} evidence for ${h.entry.name}`,
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
      notes: h.via === "llm" ? "LLM-extracted; verify quote." : "Gazetteer match in filing text.",
    };
  });
  return { hits, nodes, sources };
}
