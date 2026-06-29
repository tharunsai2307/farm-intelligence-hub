# AgriTwin OS — Phase 1 Part 1 Foundation

Build only the production foundation. No AI, no fake dashboards, no placeholder analytics. Every value rendered comes from the DB, the authenticated user, or an explicit empty state.

## Stack alignment
- Framework: TanStack Start + React 19 + Vite (Cloudflare Workers runtime) — replaces "Next.js App Router" from the brief, same architecture outcomes.
- Backend: Lovable Cloud (Supabase) — Auth, Postgres, Storage, RLS.
- UI: Tailwind v4 + shadcn/ui + Framer Motion + lucide-react.
- Forms: react-hook-form + zod.
- Charts/Maps deps: deferred to phases that actually render them (no dead deps now).

## 1. Design system (`src/styles.css`)
- Forest/emerald/leaf-green palette in oklch, light + dark.
- Semantic tokens only (`--primary`, `--accent`, `--surface`, `--success`, `--warning`, `--danger`, plus `--gradient-primary`, `--shadow-elevated`).
- Typography scale, 8px spacing, rounded-2xl cards, soft shadows.
- Dark mode via `.dark` class; theme toggle persists to localStorage and respects system.

## 2. Database (single migration)
Tables (all UUID PK, `created_at`, `updated_at`, `deleted_at` for soft delete, FKs, indexes, RLS on, GRANTs):
- `profiles` (1:1 auth.users) — name, phone, avatar_url, language, location, onboarded
- `app_role` enum + `user_roles` + `has_role()` SECURITY DEFINER
- `farms` — owner_id, name, area_hectares, soil_type, irrigation_type, water_source, planting_date, expected_harvest
- `farm_locations` — farm_id, label, lat, lng, geojson
- `crops` — farm_id, name, variety, planted_on, expected_harvest, status
- `crop_images` — crop_id, storage_path, captured_at
- `weather_records` — farm_id, recorded_at, temp_c, humidity, rainfall_mm, wind_kph, source
- `soil_records` — farm_id, recorded_at, ph, moisture, n, p, k, organic_matter
- `irrigation_records` — farm_id, started_at, ended_at, volume_liters, method
- `notifications` — user_id, title, body, severity, read_at
- `user_settings` — user_id, theme, language, notif_email, notif_push, privacy_share_analytics
- Auto-create profile + default settings via `handle_new_user()` trigger on `auth.users`.
- RLS: every table scoped to `auth.uid()` ownership (via farm.owner_id for farm-scoped tables).

## 3. Auth (Lovable Cloud)
Public routes:
- `/auth` — Login + Register tabs (email/password), zod-validated, `emailRedirectTo: window.location.origin`.
- `/auth/forgot` — password reset request.
- `/auth/reset-password` — set new password (handles `type=recovery`).
- `/auth/verify` — email-verification landing.

Protected subtree under `src/routes/_authenticated/` (integration-managed gate already wired):
- `/onboarding` — profile completion (forces redirect until `profiles.onboarded = true`).

Sign-out hygiene: cancel queries → clear cache → signOut → replace-navigate to `/auth`.

## 4. Global layout (under `_authenticated`)
- `AppShell` with collapsible `Sidebar` (shadcn sidebar, icon-collapsible) + top `Topbar`.
- Sidebar nav (routes registered, leaf pages render proper Empty States — no fake data):
  Dashboard · Digital Twin · Crop Health · Weather · Irrigation · Yield Prediction · FarmOS · Marketplace · Reports · AI Assistant · Settings.
- Topbar: breadcrumbs, global search (UI only, wired to empty results), notification bell (reads `notifications`), profile dropdown, theme toggle.
- Mobile: sidebar collapses to bottom nav.
- Settings page is real: profile form (writes `profiles`), theme, language, notification prefs (writes `user_settings`).

## 5. Architecture & code quality
- `src/lib/services/` — `auth.ts`, `farms.functions.ts`, `notifications.functions.ts`, `settings.functions.ts` (server fns with `requireSupabaseAuth`).
- `src/hooks/` — `use-auth.ts`, `use-theme.ts`, `use-profile.ts` (TanStack Query).
- `src/components/` — `ui/` (shadcn), `layout/` (AppShell, Sidebar, Topbar), `common/` (EmptyState, PageHeader, LoadingSkeleton, ErrorState), `forms/` (FormField wrappers).
- Strongly typed throughout; no `any`. Error + NotFound boundaries on every route with a loader.
- SEO: per-route `head()` metadata; sitemap.xml + robots.txt.

## 6. What is explicitly NOT built (Phase 1 Part 2+)
- Mapbox, Recharts, AI assistant, weather ingestion, IoT, marketplace, yield models. Routes exist with empty states; deps not installed until needed.

## Deliverable summary printed at end
Files/folders, tables, routes, components, env vars (auto-provisioned by Cloud: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, server `SUPABASE_*`), and extension points reserved for Phase 1 Part 2.
