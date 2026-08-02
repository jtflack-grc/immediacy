# IMMEDIACY — Every Second Counts

Short-horizon **disclosure war game**. Seat-of-the-pants decisions under time pressure — Legal, HR, Tech, Comms, Board — where silence is a choice.

Built on the Inheritance decision shell (3-panel UI, globe, difficulty rails, opening help, 5s title card). Product content is IMMEDIACY — incident disclosure and FAIR-flavored pressure metrics.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy

GitHub Pages via `.github/workflows/deploy-pages.yml` on push to `main`.

## What’s kept from Inheritance

- Colors, typography, dark war-room look
- Difficulty rails / scenario variations
- Opening welcome + tutorial help
- 5-second title intro (**IMMEDIACY** / *Every Second Counts*)
- Engine, globe, metrics panel, pressure-archetype scaffolding

## Scenario (v1)

Northline Systems ransomware / extortion war game — **5 phases, 19 nodes**:

1. **Detection** — first signal → scope triage  
2. **Containment** — isolate, ransom note, counsel, customer hint  
3. **Disclosure Pressure** — regulator clock, board, first public sentence  
4. **Stakeholders** — employees, insurer, reporter, customer notice  
5. **Aftermath** — 8-K, pay/refuse, attribution, vendor blame, lessons lock  

Metrics keep Inheritance keys under the hood; UI labels are disclosure-native (Operational Control, Disclosure Debt, Facts Gap, Commitment Lock, …). Case studies + OWASP teaching beats ride on each node. Regenerate with `node scripts/build-immediacy-scenario.mjs`.
