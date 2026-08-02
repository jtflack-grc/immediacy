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

## Quick start

```bash
npm install
npm run build --workspace=@interdependency/shared

# terminal 1
npm run dev:api

# terminal 2
npm run dev:web
```

- Web: http://localhost:5275  
- API: http://localhost:8787/health  

Optional LLM extraction: copy `.env.example` → `api/.env` or export `OPENAI_API_KEY`.

Set a descriptive `SEC_USER_AGENT` (SEC policy).

## Live analyze example

```bash
curl "http://127.0.0.1:8787/api/analyze?q=HAYW"
```

## Deploy

- **Web:** GitHub Pages via `.github/workflows/deploy-pages.yml`. Set repo variable `VITE_API_BASE` to your API origin.
- **API:** `fly.toml` + `api/Dockerfile` (`fly deploy`). Set `CORS_ORIGINS` to your Pages origin.

Rails JSON is also copied to `web/public/rails/` so cases load if the API is down.

## Method honesty

- Filings under-disclose tech stacks; missing vendors ≠ low risk.
- Inferred / low-confidence hits are labeled.
- Ranges are teaching tools with explicit assumptions — not certified FAIR analyses.
- Passive OSINT only (no port scanning, credential dumps, or vendor email automation).

## License

MIT — see [LICENSE](LICENSE).
