# AgriTwin OS

> **The Intelligent Operating System for Every Farm.**
> AI-powered Digital Twin platform that helps farmers monitor, predict, manage, and optimize their farms with real data — never guesses.

AgriTwin OS unifies a farm's environmental, operational, and commercial data into one digital twin. It combines real weather APIs, IoT sensors, crop imagery, AI-driven recommendations, operations tooling, and commerce surfaces so farmers can move from scattered tools to a single operating system.

---

## Modules

### Core Platform

- **Auth & Onboarding** — Email + Google OAuth, profile and farm onboarding gate, multi-tenant RLS.
- **Farm Management** — Farms, plots, GPS boundaries on Mapbox, crop metadata, soil/irrigation/observation records with image uploads.
- **Digital Twin** — Living 2D representation of plots with real per-plot signals (sensors, observations, irrigation, AgriMind insights) and a unified farm timeline.

### Intelligence (Phase 2)

- **Weather Intelligence** — OpenWeather One Call 3.0 with current, forecast, and derived alerts.
- **Crop AI** — Roboflow CV disease detection + Gemini-generated multilingual treatment plans.
- **AgriMind AI** — Central decision engine that fuses weather, soil, irrigation, observations, and crop AI into explainable recommendations with English / Tamil / Telugu translation and voice playback.
- **AgriSense** — IoT, satellite, and drone ingestion with realtime device health.

### Operations — FarmOS (Phase 3)

- Inventory, Equipment, Workers & Attendance, Tasks, Expenses (with receipts), Harvest Planning, Calendar, Notifications.
- AgriMind → Task converter so AI recommendations become real operations.

### Commerce & Compliance (Phase 3)

- **Live Market Prices** via data.gov.in Agmarknet API.
- **Marketplace + Buyer Matching** — listings and inquiries (no payments).
- **Logistics & Warehouse** planning.
- **Government Schemes, Loans, Insurance** eligibility.
- **Sustainability & ESG** carbon scoring.

### Platform (Phase 4 in progress)

- Multi-user farm collaboration, push subscriptions, admin audit log.
- PWA, offline-first, monitoring, demo mode (planned).

---

## Tech Stack

- **Framework**: TanStack Start v1 (React 19, Vite 7, SSR, file-based routing)
- **Styling**: Tailwind CSS v4 with OKLCH design tokens
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Server Logic**: TanStack `createServerFn` + `/api/*` server routes
- **AI**: Gemini AI (Gemini 1.5 Flash, GPT-4o-mini-tts), Roboflow CV
- **Maps**: Mapbox GL JS
- **Charts**: Recharts
- **Deployment**: Cloudflare Workers (edge)

---

## Getting Started

```bash
# Install dependencies
bun install

# Run the dev server
bun run dev
```

The app will be available at `http://localhost:8080`.

### Environment Variables

Auto-managed by Supabase:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

User-supplied secrets:

- `OPENWEATHER_API_KEY` — One Call 3.0
- `ROBOFLOW_API_KEY` — Crop disease CV
- `LOVABLE_API_KEY` — Gemini API Key (Gemini + TTS)
- `MAPBOX_ACCESS_TOKEN` — Map tiles
- `DATA_GOV_IN_API_KEY` — Agmarknet market prices

---

## Project Structure

```
src/
├── routes/                  # File-based routes (TanStack)
│   ├── __root.tsx           # Root shell + global head/meta
│   ├── index.tsx            # Landing page
│   ├── _authenticated/      # Gated app subtree (/app/*)
│   └── api/                 # Server routes (webhooks, AgriSense ingest, sitemap)
├── components/              # Reusable UI (shadcn + domain)
├── lib/
│   ├── services/            # *.server.ts + *.functions.ts
│   ├── types/domain.ts      # Shared domain types
│   └── env.ts               # Validated env access
├── integrations/supabase/   # Auto-generated client + middleware (do not edit)
└── styles.css               # Tailwind v4 theme tokens
```

---

## Security

- Row-Level Security on every public table.
- `can_access_farm` / `can_manage_farm` SECURITY DEFINER helpers used in policies.
- Auth-gated server functions via `requireSupabaseAuth` middleware.
- Private storage buckets (`farm-records`, `farmos-receipts`, `drone-uploads`) with owner-scoped policies.
- Same-origin redirect validation on the login flow.
---

## Author

**Created and developed by Tharun Sai**  
[LinkedIn](https://www.linkedin.com/in/tharun-sai-gangadhar-p-a32245396/)

---

## License

Proprietary — AgriTwin OS. All rights reserved.
