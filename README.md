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

Same model as INQUISITION / IMPACT!: a static GitHub Pages web app. Rails cases and bundled company packs (e.g. HAYW) analyze entirely in the browser.

## Quick start

```bash
npm install
npm run build --workspace=@interdependency/shared
npm run dev:web
```

- Web: http://localhost:5275  

Optional analysis API (full live EDGAR beyond the static pack):

```bash
npm run dev:api   # :8787
# then build web with VITE_API_BASE=http://127.0.0.1:8787
```

Optional LLM extraction on the API: copy `.env.example` → export `OPENAI_API_KEY`.
Set a descriptive `SEC_USER_AGENT` (SEC policy).

## Deploy

- **Web (primary):** GitHub Pages via `.github/workflows/deploy-pages.yml` — no backend required.
- **API (optional):** `fly.toml` + `api/Dockerfile`. Set Pages repo variable `VITE_API_BASE` only if you want live EDGAR for the full ticker universe.

Static assets live under `web/public/rails/`, `web/public/kb/`, and `web/public/dossiers/`.

## Method honesty

- Filings under-disclose tech stacks; missing vendors ≠ low risk.
- Inferred / low-confidence hits are labeled.
- Ranges are teaching tools with explicit assumptions — not certified FAIR analyses.
- Passive OSINT only (no port scanning, credential dumps, or vendor email automation).

## License

MIT — see [LICENSE](LICENSE).
