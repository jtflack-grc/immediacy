import fs from "node:fs/promises";
import path from "node:path";
import type {
  ExtractedHit,
} from "./extract.js";
import type { IncidentKbEntry, IncidentLink, Source } from "@interdependency/shared";
import { KB_DIR } from "../paths.js";

let incidentCache: IncidentKbEntry[] | null = null;

export async function loadIncidents(): Promise<IncidentKbEntry[]> {
  if (incidentCache) return incidentCache;
  const raw = await fs.readFile(path.join(KB_DIR, "incidents.json"), "utf8");
  incidentCache = JSON.parse(raw) as IncidentKbEntry[];
  return incidentCache;
}

export async function linkIncidents(hits: ExtractedHit[]): Promise<{
  incidents: IncidentLink[];
  sources: Source[];
}> {
  const kb = await loadIncidents();
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

    // Prefer entity-specific incidents over class-wide
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
      const relevance =
        hit.confidence === "high" || hit.confidence === "medium"
          ? "disclosed-use"
          : hit.confidence === "inferred"
            ? "inferred-use"
            : "industry-common";
      incidents.push({
        id: `il-${inc.id}-${hit.entry.id}`,
        nodeId: hit.entry.id,
        incidentId: inc.id,
        title: inc.title,
        year: inc.year,
        summary: `${hit.entry.name} (${hit.entry.class}) — ${inc.summary}`,
        relevance:
          preferred.includes(inc) && hit.via === "gazetteer"
            ? relevance
            : preferred.includes(inc)
              ? relevance
              : "industry-common",
        sources: [sid],
      });
    }
  }

  return { incidents, sources };
}
