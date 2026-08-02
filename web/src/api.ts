import type { Dossier } from "@interdependency/shared";
import { analyzeClientSide } from "./clientAnalyze";

/**
 * Optional local analysis API only.
 * - Dev: Vite proxies /api → localhost:8787 (npm run dev:api)
 * - Pages: no cloud API, no personal keys — search uses Action-built static dossiers
 */
const API_BASE = ((import.meta.env.VITE_API_BASE as string | undefined) || "").replace(
  /\/$/,
  ""
);

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

async function tryLocalApiAnalyze(query: string): Promise<Dossier | null> {
  const url = `${API_BASE}/api/analyze?q=${encodeURIComponent(query.trim())}`;
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(API_BASE ? 120000 : 2000),
    });
    if (!res.ok) return null;
    return (await res.json()) as Dossier;
  } catch {
    return null;
  }
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

/** True when local analysis API /health responds (dev only). */
export async function pingLiveApi(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, {
      signal: AbortSignal.timeout(1500),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * 1) Local API if running (true on-demand EDGAR)
 * 2) Static dossiers/corpora on Pages (built by GitHub Actions)
 */
export async function analyzeQuery(query: string): Promise<Dossier> {
  const live = await tryLocalApiAnalyze(query);
  if (live) return live;
  return analyzeClientSide(query);
}

export function getApiBase(): string {
  return API_BASE || "local /api (npm run dev:api)";
}

export function getBuildDossierActionUrl(): string {
  return "https://github.com/jtflack-grc/interdependency/actions/workflows/build-dossiers.yml";
}
