/**
 * Environment validation.
 *
 * Validates publishable client-side variables and exposes a typed view of
 * optional integrations so the UI can show truthful "configured / not configured"
 * states without ever shipping secrets to the browser.
 */

type Status = { configured: boolean; reason?: string };

function readClient(name: string): string | undefined {
  const v = (import.meta.env as Record<string, string | undefined>)[name];
  return v && v.length > 0 ? v : undefined;
}

const SUPABASE_URL = readClient("VITE_SUPABASE_URL");
const SUPABASE_PUBLISHABLE_KEY = readClient("VITE_SUPABASE_PUBLISHABLE_KEY");
const MAPBOX_TOKEN = readClient("VITE_MAPBOX_TOKEN");

const missingRequired: string[] = [];
if (!SUPABASE_URL) missingRequired.push("VITE_SUPABASE_URL");
if (!SUPABASE_PUBLISHABLE_KEY) missingRequired.push("VITE_SUPABASE_PUBLISHABLE_KEY");

if (typeof window !== "undefined" && missingRequired.length > 0) {
  // eslint-disable-next-line no-console
  console.error(
    `[AgriTwin] Missing required env vars: ${missingRequired.join(", ")}.`,
  );
}

export const clientEnv = {
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  MAPBOX_TOKEN,
};

/**
 * Public status snapshot for the Settings → Data Sources view.
 *
 * We deliberately only report on integrations whose presence we can detect
 * from the browser without leaking secrets. Server-side integrations
 * (Weather, AI model, IoT, Yield) report `not configured` until their
 * server-side feature flags are wired up in Phase 2.
 */
export function getDataSourceStatuses(): Record<string, Status> {
  return {
    supabase: SUPABASE_URL
      ? { configured: true }
      : { configured: false, reason: "Backend URL missing." },
    mapbox: MAPBOX_TOKEN
      ? { configured: true }
      : { configured: false, reason: "Mapbox token not set." },
    weather: { configured: false, reason: "Phase 2 — not yet configured." },
    ai_crop: { configured: false, reason: "Phase 2 — not yet configured." },
    irrigation_engine: { configured: false, reason: "Phase 2 — not yet configured." },
    yield_model: { configured: false, reason: "Phase 2 — not yet configured." },
    iot: { configured: false, reason: "Phase 2 — not yet configured." },
  };
}
