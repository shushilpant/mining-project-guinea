# ACCI — Adaptive Continuous Compliance Intelligence

A web-based compliance and investment-intelligence platform for West African mining authorities, with a regional focus on Ghana, Guinea, and Côte d'Ivoire. ACCI gives a ministry a single hub to monitor operator performance, track compliance against mining agreements, assess risk, trace beneficial ownership, watch local-content delivery, and prepare for negotiations — with an optional, provider-agnostic AI analyst layered on top.

> **Status:** Prototype / demonstrator (internal reference PEB-0526-WA-MIN-05). All operators, agreements, financials, and risk flags are illustrative seed data, not live records.

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Demo credentials](#demo-credentials)
- [AI assistant](#ai-assistant)
- [Project structure](#project-structure)
- [Domain model](#domain-model)
- [Design system](#design-system)
- [Security & auditability](#security--auditability)
- [Deployment](#deployment)
- [Available scripts](#available-scripts)

## Features

The application is organised into modular pages (each lazily loaded). Routes are gated behind authentication and scoped by role.

| Module | Route | What it does |
| --- | --- | --- |
| Dashboard | `/` | High-level overview: operators, compliance rate, active agreements, critical risk flags, and a morning brief. |
| Agreements | `/agreements` | Repository of mining contracts — license type, commodity, royalties, concession area, term. Drill into `/agreements/:id`. |
| Performance | `/performance` | Operator scorecards tracking commitments (production, infrastructure, environmental, employment) against actuals. Drill into `/performance/:operatorId`. |
| Risk | `/risk` | Automated risk assessment flagging production shortfalls, expiring agreements, and overdue infrastructure. Drill into `/risk/:flagId`. |
| Transparency | `/transparency` | EITI-style reporting and document access logs, with a real spreadsheet export. |
| Scenarios | `/scenarios` | Financial and operational modelling. |
| Negotiation | `/negotiation` | AI-assisted briefing generation for renewals and disputes. |
| Ownership | `/ownership` | Ultimate Beneficial Owner (UBO) tracing, Politically Exposed Person (PEP) detection, and corporate-structure mapping. |
| Local Content | `/local-content` | Tracking of local employment, procurement, and community-fund commitments. |
| ESG | `/esg` | Environmental, social, and governance indicators. |
| Market Intelligence | `/market` | Commodity market context relevant to the region. |
| Documents | `/documents` | Document register with access logging. |
| Public Portal | `/public-data` | Public-facing transparency view. |
| Regulatory Tracker | `/regulatory` | Tracking of regulatory and legislative change. |
| Admin | `/admin` | System configuration, including AI provider settings. |
| Audit Monitor | `/audit` | Immutable log of system actions and document access. |

Cross-cutting capabilities include a global search palette, an alert centre in the header, a country selector (Ghana / Guinea / Côte d'Ivoire) that scopes the whole app, a GIS map of concessions and protected zones, a guided first-run tour, plain-language module intros, and inline glossary/explainer tooltips.

## Tech stack

- **Framework:** React 19 + TypeScript
- **Build tool:** Vite (with type-aware ESLint)
- **State:** Zustand — modular stores for AI settings, AI briefing, alerts, audit, auth, data, onboarding, settings, and theme
- **Routing:** React Router DOM v7 with route-level code splitting
- **Styling:** Tailwind CSS with a custom Pan-West-African theme (see `DESIGN.md`)
- **UI primitives:** Radix UI (Dialog, Progress, Select, Separator, Slot, Tabs, Tooltip) + Lucide React icons
- **Data viz:** Recharts (charts) and React Leaflet / Leaflet (mapping)
- **Utilities:** `clsx`, `tailwind-merge`, `class-variance-authority`, `xlsx` (exports)

## Getting started

### Prerequisites

- Node.js 18+ (Node 20 LTS recommended)
- npm

### Install & run

```bash
npm install
npm run dev
```

The dev server prints a local URL (default `http://localhost:5173`). Open it and sign in with the demo credentials below.

### Production build

```bash
npm run build      # type-checks (tsc -b) then builds with Vite → dist/
npm run preview    # serve the built output locally
```

## Demo credentials

The login is a front-end demo gate (no backend auth). Use:

| Role | Username | Password |
| --- | --- | --- |
| Admin | `admin` | `password` |
| Viewer | `viewer` | `viewer` |

Admins can reach configuration screens (e.g. Admin → AI Assistant); viewers get a read-scoped experience.

## AI assistant

ACCI ships a provider-agnostic AI layer (`src/services/aiService.ts`) used for briefings, risk summaries, anomaly scans, and negotiation memos. It is opt-in and configured under **Admin → AI Assistant**. Three providers are supported:

- **Local (default)** — Ollama or LM Studio, for full data sovereignty and air-gapped use. Point ACCI at your local OpenAI-compatible base URL.
- **Pollinations** — keyless, anonymous, OpenAI-compatible endpoints. Useful when no local model is available. On HTTPS deployments, requests are routed through an Edge proxy (see Deployment) because a browser on an HTTPS origin cannot reach a `http://localhost` model.
- **OpenRouter** — for hosted models when a key is supplied and authorised.

Notable behaviour:

- **Streaming responses** via an SSE parser, including extraction of `reasoning_content` from "thinking" models so progress is visible before the final answer.
- **Structured output** with a tolerant `extractJSON` fallback that survives markdown fences or surrounding prose.
- **Prompt-injection hardening** — user text is fenced/sanitised before it reaches the model.
- **Observability** — an in-memory ring buffer retains the last ~50 AI calls (latency, success rate) for the Admin view.

No AI provider is contacted unless one is explicitly configured.

## Project structure

```
.
├── api/
│   └── ai.js                 # Vercel Edge proxy for the keyless Pollinations endpoint
├── public/                   # Static assets
├── src/
│   ├── App.tsx               # Routes + lazy loading + theme wrapper
│   ├── components/
│   │   ├── shared/           # Cross-app UI (AI menu, alert centre, maps, search, tour, …)
│   │   └── ui/               # Low-level UI primitives
│   ├── content/
│   │   └── guide.ts          # First-run guidance / module intro copy
│   ├── context/
│   │   └── CountryContext.tsx
│   ├── data/
│   │   ├── seed.ts           # Illustrative seed dataset
│   │   └── types.ts          # Domain types
│   ├── hooks/                # useRole, useExplainWithAI, …
│   ├── lib/                  # AI context/prompts/cache, import/export safety, revenue model, utils
│   ├── pages/                # One module per page (see Features)
│   ├── services/             # aiService, dataService, mutationService
│   └── store/                # Zustand stores
├── DESIGN.md                 # Design-system source of truth
├── vercel.json               # Security headers (CSP, HSTS, …)
└── vite.config.ts
```

## Domain model

Core entities (see `src/data/types.ts`):

- **Country** — regulatory framework, currency, mining authority.
- **Operator** — the mining company; parent companies, UBOs, computed risk/compliance scores.
- **Agreement** — a specific contract: commodity (bauxite, gold, lithium, …), royalty rate, contract value, term.
- **Commitment** & **PerformanceRecord** — obligations (infrastructure, local employment, …) and recorded progress against targets.
- **RiskFlag** — raised when a threshold is breached (e.g. production shortfall greater than 25%, infrastructure overdue).
- **BeneficialOwnerNode** — ownership trees with jurisdiction and PEP status.
- **ProtectedZone** & **ConcessionConflict** — spatial data for overlaps between concessions and national parks or water reserves.

## Design system

All UI/UX decisions follow `DESIGN.md`: WCAG AA contrast, clarity-over-flourish (flat surfaces, 1px borders, no glassmorphism), Public Sans / IBM Plex Mono typography, and a Pan-West-African palette built from the three national flags — deep Sahel green for authority, Ghana flag green for primary actions, a premium emerald that overrides Tailwind's default blue, Saharan saffron as the warm accent, and Pan-African red reserved for danger.

## Security & auditability

- **Audit trail** — `DocumentAccessLog` records views, downloads, and edits, and hashes content to anchor an immutable trail surfaced in the Audit Monitor.
- **Role-based views** — data and features are scoped by role and jurisdiction.
- **Hardened headers** — `vercel.json` sets a strict Content-Security-Policy (locked-down `connect-src`, no inline scripts), HSTS, `X-Frame-Options: DENY`, `nosniff`, a restrictive Permissions-Policy, and more.
- **Import/export safety** — `src/lib/importSafety.ts` and `exportSafety.ts` guard data round-trips.

## Deployment

The app is a static SPA and deploys cleanly to Vercel.

- `npm run build` produces `dist/`.
- `api/ai.js` is a Vercel Edge function that proxies the keyless Pollinations text endpoint. It exists for two reasons: Pollinations' free tier allows one in-flight request per source IP (so the proxy injects a randomised `X-Forwarded-For`), and its time-to-first-token can exceed Vercel's Edge initial-response window (so the proxy streams immediately and emits SSE keep-alive comments while waiting upstream). Deployed HTTPS origins default to the hosted provider through this proxy.
- `vercel.json` applies the security headers described above to every response.

## Available scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server with HMR. |
| `npm run build` | Type-check and build for production into `dist/`. |
| `npm run preview` | Serve the production build locally. |
| `npm run lint` | Run ESLint across the project. |
