import type { Dossier } from "@interdependency/shared";
import { analyzeClientSide } from "./clientAnalyze";

/**
 * Live analysis API origin.
 * Override at build time with VITE_API_BASE.
 * Default points at the Fly app once deployed.
 */
const API_BASE = (
  (import.meta.env.VITE_API_BASE as string | undefined) ||
  "https://interdependency-api.fly.dev"
).replace(/\/$/, "");

const RAILS_CASES = [
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

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || res.statusText);
  }
  return res.json() as Promise<T>;
}

export async function fetchRailsList(): Promise<
  Array<{ id: string; title: string; tagline?: string }>
> {
  return RAILS_CASES;
}

export async function fetchRailsDossier(id: string): Promise<Dossier> {
  const res = await fetch(`./rails/${id}.json`);
  if (!res.ok) throw new Error(`Rails case not found: ${id}`);
  return res.json() as Promise<Dossier>;
}

export async function pingLiveApi(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, {
      signal: AbortSignal.timeout(4000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Live-first: hit the analysis API; fall back to static packs only if API is down. */
export async function analyzeQuery(query: string): Promise<Dossier> {
  const q = encodeURIComponent(query.trim());
  try {
    return await getJson<Dossier>(`/api/analyze?q=${q}`);
  } catch (err) {
    // If the ticker is in the static pack, still return a dossier so the page is usable.
    try {
      return await analyzeClientSide(query);
    } catch {
      const msg = err instanceof Error ? err.message : "Live analyze failed";
      throw new Error(
        `${msg}. Live search needs the analysis API at ${API_BASE}.`
      );
    }
  }
}

export function getApiBase(): string {
  return API_BASE;
}
