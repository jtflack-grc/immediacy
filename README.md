# INTERDEPENDENCY

**Map who you depend on. Price what breaks.**

Open-source, FAIR-informed third-party risk (TPRM) mapper in the same product family as [INQUISITION](https://github.com/jtflack-grc/inquisition) and [IMPACT!](https://github.com/jtflack-grc/impact).

Educational freeware. Not affiliated with Safe Security or any commercial TPRM platform. Not advice.

## What it does

1. **Rails cases** — CrowdStrike (2024), Change Healthcare (2024), Clorox (2023) teach the three-panel grammar offline.
2. **Open search** — resolve any US public company via SEC EDGAR, pull 10-K / 8-K windows, extract dependencies (gazetteer + optional LLM), link a curated incident KB, build FAIR-shaped scenarios, and render an interdependency globe/graph.

### Cribbed from Safe TPRM (public loop only)

| Capability | Interdependency |
|---|---|
| Enter company → auto profile | Live `/api/analyze` |
| SEC / public records | EDGAR 10-K & 8-K |
| Outside-in | Passive OSINT (domain + crt.sh) |
| Smart tiering | Interdependency Tier T1–T4 |
| FAIR financial framing | Transparent LEF / loss-mag bands + editable assumptions |
| Questionnaires, vendor chase, contracts, darknet | Out of scope |

## Monorepo

```
packages/shared   Dossier TypeScript schema
data/rails        Locked case studies
data/kb           Gazetteer + incident knowledge base
api               Fastify analysis service
web               Vite + React three-panel UI
```

## Live site

**https://jtflack-grc.github.io/interdependency/**

- **Rails cases** load as static JSON (like the family apps).
- **Live search** calls the analysis API (`https://interdependency-api.fly.dev`) for EDGAR 10-K/8-K + OSINT + FAIR scenarios. SEC cannot be queried safely from the browser, so the API is required for full-universe search.

## Quick start

```bash
npm install
npm run build --workspace=@interdependency/shared
npm run dev:api   # :8787  — required for live search locally
npm run dev:web   # :5275
```

Set `VITE_API_BASE=http://127.0.0.1:8787` when building/running the web app against a local API.

Optional LLM extraction on the API: export `OPENAI_API_KEY`.
Set a descriptive `SEC_USER_AGENT` (SEC policy).

## Deploy

1. **Web:** GitHub Pages (`.github/workflows/deploy-pages.yml`).
2. **Live API (Fly.io):**
   ```powershell
   .\.tools\flyctl\flyctl.exe auth login
   .\scripts\deploy-api.ps1
   ```
   Or add repo secret `FLY_API_TOKEN` and run the **Deploy analysis API** workflow.

Default web build expects `https://interdependency-api.fly.dev`. Override with `VITE_API_BASE`.

## Method honesty

- Filings under-disclose tech stacks; missing vendors ≠ low risk.
- Inferred / low-confidence hits are labeled.
- Ranges are teaching tools with explicit assumptions — not certified FAIR analyses.
- Passive OSINT only (no port scanning, credential dumps, or vendor email automation).

## License

MIT — see [LICENSE](LICENSE).
