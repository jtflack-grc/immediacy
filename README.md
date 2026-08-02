# INTERDEPENDENCY

**Map who you depend on. Price what breaks.**

Open-source, FAIR-informed third-party risk (TPRM) mapper in the same product family as [INQUISITION](https://github.com/jtflack-grc/inquisition) and [IMPACT!](https://github.com/jtflack-grc/impact).

Educational freeware. Not affiliated with Safe Security. Not advice.

**Live site:** https://jtflack-grc.github.io/interdependency/

## How search works (no cloud keys in the app)

SEC EDGAR cannot be queried safely from a browser (CORS + User-Agent policy). This project **does not** require Fly or a personal API key embedded in the public page.

| Mode | How |
|---|---|
| **GitHub Pages** | Search Action-built static dossiers under `web/public/dossiers/` (+ ticker index). Refresh via workflow **Build EDGAR dossiers**. |
| **Local live** | `npm run dev:api` + `npm run dev:web` — on-demand EDGAR for any US public company on your machine. |

## Quick start (local live search)

```bash
npm install
npm run build --workspace=@interdependency/shared
npm run build --workspace=@interdependency/api
npm run dev:api   # :8787
npm run dev:web   # :5275  (proxies /api → API)
```

Open http://localhost:5275 and Analyze any ticker (e.g. `HAYW`, `AAPL`).

Optional LLM extraction (API only, never baked into Pages): export `OPENAI_API_KEY`.

## Refresh the public search pack

GitHub → Actions → **Build EDGAR dossiers** → Run workflow with tickers  
or locally:

```bash
node scripts/build-dossier.mjs HAYW,AAPL,MSFT,CLX
```

That writes `web/public/dossiers/*.json` and syncs `web/public/kb/company_tickers.json` for Pages. Commit/push (or let the Action do it).

## Rails cases

CrowdStrike, Change Healthcare, Clorox ship as static JSON and work offline on Pages.

## Monorepo

```
packages/shared   Dossier schema
data/             Source rails + KB
api/              Local EDGAR analysis service
web/              GitHub Pages UI
scripts/          build-dossier.mjs
```

## Deploy

- **Web:** GitHub Pages (`.github/workflows/deploy-pages.yml`)
- **Dossier pack:** `.github/workflows/build-dossiers.yml` (uses `GITHUB_TOKEN` only)

`fly.toml` / API Dockerfile remain in-repo only if you later choose a host yourself — they are **not** required.

## License

MIT — see [LICENSE](LICENSE).
