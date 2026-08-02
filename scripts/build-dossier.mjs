/**
 * Build static dossiers from EDGAR into web/public/dossiers/
 * and refresh company tickers for Pages search.
 *
 * Usage:
 *   node scripts/build-dossier.mjs HAYW,AAPL,MSFT
 *   TICKERS=HAYW,CLX node scripts/build-dossier.mjs
 *
 * No cloud keys. Uses SEC User-Agent from SEC_USER_AGENT or a public project identity.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dossiersDir = path.join(root, "web", "public", "dossiers");
const kbDir = path.join(root, "web", "public", "kb");

process.env.SEC_USER_AGENT =
  process.env.SEC_USER_AGENT ||
  "InterdependencyCI/0.1 (https://github.com/jtflack-grc/interdependency; jtflack-grc@users.noreply.github.com)";

async function ensureBuilt() {
  const dist = path.join(root, "api", "dist", "pipeline", "analyze.js");
  try {
    await fs.access(dist);
  } catch {
    console.log("Building shared + api…");
    const { execSync } = await import("node:child_process");
    execSync("npm run build --workspace=@interdependency/shared", {
      cwd: root,
      stdio: "inherit",
    });
    execSync("npm run build --workspace=@interdependency/api", {
      cwd: root,
      stdio: "inherit",
    });
  }
  return dist;
}

async function syncTickers() {
  await fs.mkdir(kbDir, { recursive: true });
  const out = path.join(kbDir, "company_tickers.json");
  const url = "https://www.sec.gov/files/company_tickers.json";
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": process.env.SEC_USER_AGENT,
        Accept: "application/json",
      },
    });
    if (res.ok) {
      const json = await res.json();
      const rows = Object.values(json);
      await fs.writeFile(out, JSON.stringify(rows), "utf8");
      console.log(`Wrote company_tickers.json (${rows.length} issuers)`);
      return;
    }
    console.warn(`Ticker sync SEC ${res.status}; falling back to seed.`);
  } catch (err) {
    console.warn(`Ticker sync failed; falling back to seed: ${err}`);
  }
  // Always publish an index for Pages search
  const seed = await fs.readFile(
    path.join(root, "data", "kb", "tickers-seed.json"),
    "utf8"
  );
  await fs.writeFile(out, seed, "utf8");
  console.log("Wrote company_tickers.json from seed pack");
}

async function main() {
  const arg =
    process.argv[2] ||
    process.env.TICKERS ||
    "HAYW,AAPL,MSFT,AMZN,GOOGL,META,NVDA,JPM,XOM,UNH,CLX,CRWD";
  const tickers = arg
    .split(",")
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean);

  await ensureBuilt();
  await syncTickers();

  const analyzeUrl = pathToFileURL(
    path.join(root, "api", "dist", "pipeline", "analyze.js")
  ).href;
  const { analyzeCompany } = await import(analyzeUrl);

  await fs.mkdir(dossiersDir, { recursive: true });
  const index = [];

  for (const ticker of tickers) {
    process.stdout.write(`Analyzing ${ticker}… `);
    try {
      const dossier = await analyzeCompany(ticker);
      const out = path.join(dossiersDir, `${ticker}.json`);
      await fs.writeFile(out, JSON.stringify(dossier, null, 2), "utf8");
      // also keep a corpus snippet for client fallback
      if (dossier.filings?.[0]?.excerpt) {
        const corporaDir = path.join(kbDir, "sample-corpora");
        await fs.mkdir(corporaDir, { recursive: true });
        await fs.writeFile(
          path.join(corporaDir, `${ticker}.txt`),
          dossier.filings.map((f) => f.excerpt).join("\n\n"),
          "utf8"
        );
      }
      index.push({
        ticker,
        name: dossier.company.name,
        tier: dossier.tier,
        nodes: dossier.nodes.length,
        generatedAt: dossier.generatedAt,
      });
      console.log(`ok (tier ${dossier.tier}, ${dossier.nodes.length} deps)`);
    } catch (err) {
      console.log(`FAIL: ${err instanceof Error ? err.message : err}`);
    }
    // be polite to SEC
    await new Promise((r) => setTimeout(r, 800));
  }

  await fs.writeFile(
    path.join(dossiersDir, "index.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), dossiers: index }, null, 2),
    "utf8"
  );
  console.log(`Done. ${index.length}/${tickers.length} dossiers in web/public/dossiers/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
