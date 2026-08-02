import fs from "node:fs/promises";
import path from "node:path";
import type { FilingExcerpt, ResolveResult } from "@interdependency/shared";
import { KB_DIR } from "../paths.js";
import { readCache, writeCache } from "./cache.js";

const SEC_UA =
  process.env.SEC_USER_AGENT ||
  "Interdependency Educational TPRM jtflack-grc@users.noreply.github.com";

const TICKERS_URL = "https://www.sec.gov/files/company_tickers.json";
const DAY = 24 * 60 * 60 * 1000;

type TickerRow = { cik_str: number; ticker: string; title: string };

async function loadSeedTickers(): Promise<TickerRow[]> {
  const raw = await fs.readFile(path.join(KB_DIR, "tickers-seed.json"), "utf8");
  return JSON.parse(raw) as TickerRow[];
}

async function secFetch(url: string): Promise<Response> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": SEC_UA,
      "Accept-Encoding": "gzip, deflate",
      Accept: "application/json,text/html,text/plain,*/*",
      Host: new URL(url).host,
    },
  });
  if (!res.ok) {
    throw new Error(`SEC fetch failed ${res.status} for ${url}`);
  }
  return res;
}

export async function loadTickers(): Promise<TickerRow[]> {
  const cached = await readCache<TickerRow[]>("sec-company-tickers");
  if (cached) return cached;
  try {
    const res = await secFetch(TICKERS_URL);
    const json = (await res.json()) as Record<string, TickerRow>;
    const rows = Object.values(json);
    await writeCache("sec-company-tickers", rows, DAY);
    return rows;
  } catch {
    const seed = await loadSeedTickers();
    await writeCache("sec-company-tickers-seed", seed, DAY);
    return seed;
  }
}

export async function resolveCompany(query: string): Promise<ResolveResult | null> {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  const rows = await loadTickers();
  const byTicker = rows.find((r) => r.ticker.toLowerCase() === q);
  if (byTicker) {
    return {
      ticker: byTicker.ticker,
      name: byTicker.title,
      cik: String(byTicker.cik_str).padStart(10, "0"),
    };
  }
  const byName = rows.find((r) => r.title.toLowerCase().includes(q));
  if (!byName) return null;
  return {
    ticker: byName.ticker,
    name: byName.title,
    cik: String(byName.cik_str).padStart(10, "0"),
  };
}

interface Submissions {
  name?: string;
  tickers?: string[];
  exchanges?: string[];
  sicDescription?: string;
  website?: string;
  filings?: {
    recent?: {
      accessionNumber?: string[];
      filingDate?: string[];
      form?: string[];
      primaryDocument?: string[];
    };
  };
}

export async function fetchSubmissions(cik: string): Promise<Submissions> {
  const key = `submissions-${cik}`;
  const cached = await readCache<Submissions>(key);
  if (cached) return cached;
  const url = `https://data.sec.gov/submissions/CIK${cik}.json`;
  const res = await secFetch(url);
  const json = (await res.json()) as Submissions;
  await writeCache(key, json, DAY);
  return json;
}

function accessionPath(accessionNumber: string): string {
  return accessionNumber.replace(/-/g, "");
}

async function fetchFilingText(
  cik: string,
  accessionNumber: string,
  primaryDocument: string
): Promise<string> {
  const key = `filing-${accessionNumber}-${primaryDocument}`;
  const cached = await readCache<string>(key);
  if (cached) return cached;
  const cikNum = String(Number(cik));
  const url = `https://www.sec.gov/Archives/edgar/data/${cikNum}/${accessionPath(accessionNumber)}/${primaryDocument}`;
  const res = await secFetch(url);
  const text = await res.text();
  // Cap cache size
  const clipped = text.slice(0, 2_000_000);
  await writeCache(key, clipped, 7 * DAY);
  return clipped;
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function extractSection(plain: string, labels: string[], maxLen = 6000): string {
  const lower = plain.toLowerCase();
  for (const label of labels) {
    const idx = lower.indexOf(label.toLowerCase());
    if (idx >= 0) {
      return plain.slice(idx, idx + maxLen);
    }
  }
  return plain.slice(0, Math.min(maxLen, plain.length));
}

async function loadSampleCorpus(cik: string, ticker?: string): Promise<{
  filings: FilingExcerpt[];
  corpus: string;
} | null> {
  const keys = [ticker?.toUpperCase(), cik, cik.replace(/^0+/, "")].filter(
    Boolean
  ) as string[];
  for (const key of keys) {
    const file = path.join(KB_DIR, "sample-corpora", `${key}.txt`);
    try {
      const corpus = await fs.readFile(file, "utf8");
      return {
        corpus,
        filings: [
          {
            form: "10-K",
            accessionNumber: `sample-${key}`,
            section: "Sample corpus (SEC live fetch unavailable)",
            excerpt: corpus.slice(0, 2500),
            url: "https://www.sec.gov/edgar/searchedgar/companysearch",
          },
        ],
      };
    } catch {
      /* try next key */
    }
  }
  return null;
}

export async function ingestFilings(
  cik: string,
  ticker?: string
): Promise<{
  filings: FilingExcerpt[];
  corpus: string;
  meta: { name?: string; industry?: string; website?: string; tickers?: string[] };
  usedSample?: boolean;
}> {
  let subs: Submissions = {};
  try {
    subs = await fetchSubmissions(cik);
  } catch {
    const sample = await loadSampleCorpus(cik, ticker);
    if (sample) {
      return {
        ...sample,
        meta: { tickers: ticker ? [ticker] : [] },
        usedSample: true,
      };
    }
    return {
      filings: [],
      corpus: "",
      meta: { tickers: ticker ? [ticker] : [] },
      usedSample: true,
    };
  }

  const recent = subs.filings?.recent;
  const filings: FilingExcerpt[] = [];
  const corpora: string[] = [];

  if (!recent?.form || !recent.accessionNumber || !recent.primaryDocument) {
    const sample = await loadSampleCorpus(cik, ticker);
    if (sample) {
      return {
        ...sample,
        meta: {
          name: subs.name,
          industry: subs.sicDescription,
          website: subs.website,
          tickers: subs.tickers,
        },
        usedSample: true,
      };
    }
    return {
      filings,
      corpus: "",
      meta: {
        name: subs.name,
        industry: subs.sicDescription,
        website: subs.website,
        tickers: subs.tickers,
      },
    };
  }

  const wanted = new Set(["10-K", "10-K/A", "8-K", "8-K/A"]);
  let got10k = 0;
  let got8k = 0;

  for (let i = 0; i < recent.form.length; i++) {
    const form = recent.form[i] || "";
    if (!wanted.has(form)) continue;
    const is10k = form.startsWith("10-K");
    const is8k = form.startsWith("8-K");
    if (is10k && got10k >= 1) continue;
    if (is8k && got8k >= 3) continue;

    const accessionNumber = recent.accessionNumber[i]!;
    const primaryDocument = recent.primaryDocument[i]!;
    const filedAt = recent.filingDate?.[i];

    try {
      const raw = await fetchFilingText(cik, accessionNumber, primaryDocument);
      const plain = stripHtml(raw);
      const sectionLabels = is10k
        ? [
            "Item 1A",
            "ITEM 1A",
            "Risk Factors",
            "cybersecurity",
            "Information Security",
            "suppliers",
          ]
        : ["Item 1.01", "Item 8.01", "cybersecurity", "material cybersecurity"];
      const excerpt = extractSection(plain, sectionLabels, is10k ? 8000 : 4000);
      const formType = (is10k ? "10-K" : "8-K") as "10-K" | "8-K";
      const cikNum = String(Number(cik));
      const url = `https://www.sec.gov/Archives/edgar/data/${cikNum}/${accessionPath(accessionNumber)}/${primaryDocument}`;

      filings.push({
        form: formType,
        accessionNumber,
        filedAt,
        section: is10k ? "Risk factors / cyber / suppliers (extracted window)" : "8-K material window",
        excerpt: excerpt.slice(0, 2500),
        url,
      });
      corpora.push(excerpt);
      if (is10k) got10k++;
      if (is8k) got8k++;
    } catch {
      // skip individual filing failures
    }

    if (got10k >= 1 && got8k >= 3) break;
  }

  return {
    filings,
    corpus: corpora.join("\n\n"),
    meta: {
      name: subs.name,
      industry: subs.sicDescription,
      website: subs.website,
      tickers: subs.tickers,
    },
  };
}
