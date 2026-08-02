import type { Dossier } from "@interdependency/shared";
import { analyzeClientSide } from "./clientAnalyze";

const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) || "";

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
  const res = await fetch(`${API_BASE}${path}`);
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

/** Pages-first: static client analyze, optional remote API if VITE_API_BASE is set. */
export async function analyzeQuery(query: string): Promise<Dossier> {
  if (API_BASE) {
    try {
      const q = encodeURIComponent(query.trim());
      return await getJson<Dossier>(`/api/analyze?q=${q}`);
    } catch {
      // fall through to static pack
    }
  }
  return analyzeClientSide(query);
}
