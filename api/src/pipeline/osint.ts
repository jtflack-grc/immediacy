import type { OsintHost } from "@interdependency/shared";
import { readCache, writeCache } from "./cache.js";

const DAY = 24 * 60 * 60 * 1000;

function guessDomain(website?: string, name?: string): string | null {
  if (website) {
    try {
      const u = website.startsWith("http") ? website : `https://${website}`;
      return new URL(u).hostname.replace(/^www\./, "");
    } catch {
      /* fall through */
    }
  }
  if (!name) return null;
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 24);
  return slug ? `${slug}.com` : null;
}

export async function passiveOsint(opts: {
  website?: string;
  name?: string;
}): Promise<OsintHost[]> {
  const domain = guessDomain(opts.website, opts.name);
  if (!domain) return [];

  const hosts: OsintHost[] = [
    { hostname: domain, source: "domain-guess" },
    { hostname: `www.${domain}`, source: "domain-guess" },
  ];

  const cacheKey = `crtsh-${domain}`;
  const cached = await readCache<string[]>(cacheKey);
  let names: string[] | null = cached;

  if (!names) {
    try {
      const url = `https://crt.sh/?q=%25.${encodeURIComponent(domain)}&output=json`;
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        const json = (await res.json()) as Array<{ name_value?: string }>;
        const set = new Set<string>();
        for (const row of json.slice(0, 200)) {
          for (const part of (row.name_value || "").split("\n")) {
            const h = part.trim().toLowerCase().replace(/^\*\./, "");
            if (h.endsWith(domain) && !h.includes(" ")) set.add(h);
          }
        }
        names = [...set].slice(0, 25);
        await writeCache(cacheKey, names, DAY);
      }
    } catch {
      names = [];
    }
  }

  for (const h of names || []) {
    if (!hosts.some((x) => x.hostname === h)) {
      hosts.push({ hostname: h, source: "crt.sh" });
    }
  }

  return hosts.slice(0, 30);
}
