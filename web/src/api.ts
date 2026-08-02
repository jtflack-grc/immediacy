import type { Dossier } from "@interdependency/shared";

const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) || "";

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
  try {
    const data = await getJson<{ cases: Array<{ id: string; title: string; tagline?: string }> }>(
      "/api/rails"
    );
    return data.cases;
  } catch {
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
}

export async function fetchRailsDossier(id: string): Promise<Dossier> {
  try {
    return await getJson<Dossier>(`/api/rails/${id}`);
  } catch {
    const res = await fetch(`./rails/${id}.json`);
    if (!res.ok) throw new Error(`Rails case not found: ${id}`);
    return res.json() as Promise<Dossier>;
  }
}

export async function analyzeQuery(query: string): Promise<Dossier> {
  const q = encodeURIComponent(query.trim());
  return getJson<Dossier>(`/api/analyze?q=${q}`);
}
