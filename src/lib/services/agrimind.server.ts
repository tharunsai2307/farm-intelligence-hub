/**
 * AgriMind AI Decision Engine — server-only.
 *
 * Pipeline:
 *  1) Gather real data: farm, weather (current + forecast + alerts),
 *     recent crop AI analyses, soil records, irrigation records, crop observations.
 *  2) Ask Lovable AI (Gemini) to produce 1..N grounded recommendations using
 *     ONLY the gathered data. Model is instructed to abstain when data is
 *     insufficient. Returns translations for en/ta/te in the same call.
 *  3) Persist recommendations into public.farm_recommendations (RLS scoped).
 *
 * Never fabricates data. If LOVABLE_API_KEY is missing or the LLM cannot
 * be reached, returns a typed ServiceResult error and persists nothing.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { fail, ok, type ServiceResult } from "./result";

type SB = SupabaseClient<Database>;

export const AGRIMIND_ERRORS = {
  NOT_CONFIGURED: "AgriMind AI is currently unavailable.",
  FARM_NOT_FOUND: "Farm not found or you don't have access.",
  NO_DATA: "Insufficient data to generate recommendation.",
  LLM_FAILED: "AgriMind AI is currently unavailable.",
  PERSIST_FAILED: "Could not save recommendation.",
} as const;

const ALLOWED_TYPES = [
  "Irrigation",
  "Weather",
  "Crop Health",
  "Soil",
  "Harvest Planning",
  "General Advisory",
  "Monitoring Reminder",
  "Resource Optimization",
  "Sustainability",
] as const;
type RecType = (typeof ALLOWED_TYPES)[number];

const ALLOWED_MODULES = [
  "Weather API",
  "Crop Disease AI",
  "Soil Records",
  "Irrigation Records",
  "Crop Observations",
  "Farm Information",
  "User Preferences",
] as const;

export type LangCode = "en" | "ta" | "te";

export type AgriMindRecommendation = {
  id: string;
  recommendation_type: RecType;
  title: string;
  recommendation: string;
  reason: string;
  confidence: "low" | "medium" | "high" | "rule-based";
  source_modules: string[];
  language: LangCode;
  translations: Record<LangCode, { title: string; recommendation: string; reason: string }>;
  created_at: string;
  status: string;
  accepted: boolean;
  dismissed: boolean;
  plot_id: string | null;
};

function isLlmConfigured(): boolean {
  return Boolean(process.env.LOVABLE_API_KEY);
}

export function isAgriMindConfigured(): boolean {
  return isLlmConfigured();
}

/** Gather every real data source the engine is allowed to reason over. */
async function gatherContext(supabase: SB, farmId: string) {
  const { data: farm } = await supabase
    .from("farms")
    .select(
      "id, name, primary_crop, crop_variety, season, sowing_date, area_value, area_unit, farm_type, state, district",
    )
    .eq("id", farmId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!farm) return { farm: null } as const;

  const [
    { data: location },
    { data: weatherCurrent },
    { data: forecasts },
    { data: alerts },
    { data: cropAi },
    { data: soil },
    { data: irrigation },
    { data: observations },
    { data: plots },
  ] = await Promise.all([
    supabase
      .from("farm_locations")
      .select("latitude, longitude, address")
      .eq("farm_id", farmId)
      .maybeSingle(),
    supabase
      .from("weather_records")
      .select("temperature, humidity, rainfall, wind_speed, pressure, uv_index, condition, recorded_at")
      .eq("farm_id", farmId)
      .order("recorded_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("weather_forecasts")
      .select(
        "forecast_date, temp_min, temp_max, humidity, rain_mm, pop, wind_speed, condition",
      )
      .eq("farm_id", farmId)
      .order("forecast_date", { ascending: true })
      .limit(5),
    supabase
      .from("weather_alerts")
      .select("event, severity, description, starts_at, ends_at")
      .eq("farm_id", farmId)
      .order("starts_at", { ascending: false })
      .limit(5),
    supabase
      .from("crop_analysis")
      .select("prediction, scientific_name, confidence, severity, recommendation, created_at")
      .eq("farm_id", farmId)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("soil_records")
      .select("ph, moisture_percent, nitrogen_ppm, phosphorus_ppm, potassium_ppm, recorded_at")
      .eq("farm_id", farmId)
      .is("deleted_at", null)
      .order("recorded_at", { ascending: false })
      .limit(3),
    supabase
      .from("irrigation_records")
      .select("method, water_volume_liters, duration_minutes, started_at")
      .eq("farm_id", farmId)
      .is("deleted_at", null)
      .order("started_at", { ascending: false })
      .limit(5),
    supabase
      .from("crop_observations")
      .select("growth_stage, health_status, notes, observed_at")
      .eq("farm_id", farmId)
      .is("deleted_at", null)
      .order("observed_at", { ascending: false })
      .limit(3),
    supabase
      .from("farm_plots")
      .select("id, name, crop, area, area_unit")
      .eq("farm_id", farmId)
      .is("deleted_at", null),
  ]);

  return {
    farm,
    location: location ?? null,
    weatherCurrent: weatherCurrent ?? null,
    forecasts: forecasts ?? [],
    alerts: alerts ?? [],
    cropAi: cropAi ?? [],
    soil: soil ?? [],
    irrigation: irrigation ?? [],
    observations: observations ?? [],
    plots: plots ?? [],
  } as const;
}

function summarizeSources(ctx: Awaited<ReturnType<typeof gatherContext>>): string[] {
  const sources: string[] = [];
  if (ctx.farm) sources.push("Farm Information");
  if (ctx.weatherCurrent || (ctx.forecasts && ctx.forecasts.length > 0) || (ctx.alerts && ctx.alerts.length > 0))
    sources.push("Weather API");
  if (ctx.cropAi && ctx.cropAi.length > 0) sources.push("Crop Disease AI");
  if (ctx.soil && ctx.soil.length > 0) sources.push("Soil Records");
  if (ctx.irrigation && ctx.irrigation.length > 0) sources.push("Irrigation Records");
  if (ctx.observations && ctx.observations.length > 0) sources.push("Crop Observations");
  return sources;
}

type LlmRec = {
  recommendation_type: RecType;
  confidence: "low" | "medium" | "high";
  source_modules: string[];
  plot_hint?: string | null;
  translations: Record<LangCode, { title: string; recommendation: string; reason: string }>;
};

type LlmEnvelope = {
  has_data: boolean;
  reason_if_no_data?: string;
  recommendations: LlmRec[];
};

async function callLlm(
  ctx: Awaited<ReturnType<typeof gatherContext>>,
  preferredLanguage: LangCode,
): Promise<LlmEnvelope | null> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) return null;

  const sys = `You are AgriMind, the decision engine of an agricultural Digital Twin.
You generate explainable, grounded farm recommendations ONLY from the data provided.
Strict rules:
- NEVER invent weather, sensor values, disease names, or numbers not present in the input.
- If the provided data is empty or clearly insufficient to support a useful recommendation, return {"has_data": false, "reason_if_no_data": "...", "recommendations": []}.
- Only use recommendation_type from this exact list: ${ALLOWED_TYPES.join(", ")}.
- Only list data sources you actually used, from: ${ALLOWED_MODULES.join(", ")}.
- Keep each recommendation actionable and concise. Reason must explicitly cite the data observations that justify it.
- Always return translations for English (en), Tamil (ta), and Telugu (te). Translate ONLY the text; never change the underlying recommendation between languages.
- Respond as strict JSON matching the schema. No prose outside JSON.`;

  const user = JSON.stringify({
    preferred_language: preferredLanguage,
    farm: ctx.farm,
    location: ctx.location,
    weather_current: ctx.weatherCurrent,
    weather_forecasts: ctx.forecasts,
    weather_alerts: ctx.alerts,
    crop_ai_recent: ctx.cropAi,
    soil_recent: ctx.soil,
    irrigation_recent: ctx.irrigation,
    crop_observations_recent: ctx.observations,
    plots: ctx.plots,
    schema: {
      has_data: "boolean",
      reason_if_no_data: "string (only when has_data is false)",
      recommendations: [
        {
          recommendation_type: `one of: ${ALLOWED_TYPES.join("|")}`,
          confidence: "low|medium|high",
          source_modules: "array of strings, subset of allowed modules",
          plot_hint: "optional plot name from input or null",
          translations: {
            en: { title: "string", recommendation: "string", reason: "string" },
            ta: { title: "string", recommendation: "string", reason: "string" },
            te: { title: "string", recommendation: "string", reason: "string" },
          },
        },
      ],
    },
    instruction:
      "Produce 1 to 4 recommendations grounded in the data. If insufficient data, set has_data=false and return an empty recommendations array.",
  });

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!res.ok) {
      console.error("[agrimind] llm failed", res.status, await res.text().catch(() => ""));
      return null;
    }
    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const raw = json.choices?.[0]?.message?.content;
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LlmEnvelope;
    return parsed;
  } catch (e) {
    console.error("[agrimind] llm error", e);
    return null;
  }
}

function sanitizeRec(rec: LlmRec): LlmRec | null {
  if (!ALLOWED_TYPES.includes(rec.recommendation_type)) return null;
  const modules = (rec.source_modules ?? []).filter((m) =>
    (ALLOWED_MODULES as readonly string[]).includes(m),
  );
  if (modules.length === 0) return null;
  const t = rec.translations;
  if (!t?.en?.title || !t?.en?.recommendation || !t?.en?.reason) return null;
  // backfill missing language with English so UI never breaks
  const en = t.en;
  const ta = t.ta?.title ? t.ta : en;
  const te = t.te?.title ? t.te : en;
  return {
    recommendation_type: rec.recommendation_type,
    confidence: rec.confidence === "high" || rec.confidence === "low" ? rec.confidence : "medium",
    source_modules: modules,
    plot_hint: rec.plot_hint ?? null,
    translations: { en, ta, te },
  };
}

export type GenerateInput = {
  farm_id: string;
  language?: LangCode;
};

export type GenerateResult = {
  generated: number;
  recommendations: AgriMindRecommendation[];
};

export async function generateRecommendations(
  supabase: SB,
  userId: string,
  input: GenerateInput,
): Promise<ServiceResult<GenerateResult>> {
  if (!isLlmConfigured()) return fail(AGRIMIND_ERRORS.NOT_CONFIGURED);

  const ctx = await gatherContext(supabase, input.farm_id);
  if (!ctx.farm) return fail(AGRIMIND_ERRORS.FARM_NOT_FOUND);

  const sources = summarizeSources(ctx);
  // Bare minimum: we need at least one non-trivial signal beyond farm metadata.
  const hasSignal =
    sources.includes("Weather API") ||
    sources.includes("Crop Disease AI") ||
    sources.includes("Soil Records") ||
    sources.includes("Irrigation Records") ||
    sources.includes("Crop Observations");
  if (!hasSignal) return fail(AGRIMIND_ERRORS.NO_DATA);

  const lang: LangCode = input.language ?? "en";
  const llm = await callLlm(ctx, lang);
  if (!llm) return fail(AGRIMIND_ERRORS.LLM_FAILED);
  if (!llm.has_data || !Array.isArray(llm.recommendations) || llm.recommendations.length === 0) {
    return fail(AGRIMIND_ERRORS.NO_DATA);
  }

  const plotByName = new Map<string, string>();
  for (const p of ctx.plots) {
    if (p?.name) plotByName.set(String(p.name).toLowerCase(), p.id);
  }

  const rows = [];
  const cleanRecs: LlmRec[] = [];
  for (const r of llm.recommendations) {
    const clean = sanitizeRec(r);
    if (!clean) continue;
    cleanRecs.push(clean);
    const chosen = clean.translations[lang];
    const plotId = clean.plot_hint
      ? plotByName.get(String(clean.plot_hint).toLowerCase()) ?? null
      : null;
    rows.push({
      user_id: userId,
      farm_id: input.farm_id,
      plot_id: plotId,
      recommendation_type: clean.recommendation_type,
      title: chosen.title,
      recommendation: chosen.recommendation,
      reason: chosen.reason,
      confidence: clean.confidence,
      source_modules: clean.source_modules,
      language: lang,
      translations: clean.translations as unknown as Database["public"]["Tables"]["farm_recommendations"]["Insert"]["translations"],
      status: "active",
      accepted: false,
      dismissed: false,
    });
  }

  if (rows.length === 0) return fail(AGRIMIND_ERRORS.NO_DATA);

  const { data: inserted, error } = await supabase
    .from("farm_recommendations")
    .insert(rows)
    .select("*");
  if (error || !inserted) {
    console.error("[agrimind] persist failed", error);
    return fail(AGRIMIND_ERRORS.PERSIST_FAILED);
  }

  return ok({
    generated: inserted.length,
    recommendations: inserted.map(rowToRec),
  });
}

function rowToRec(row: Database["public"]["Tables"]["farm_recommendations"]["Row"]): AgriMindRecommendation {
  return {
    id: row.id,
    recommendation_type: row.recommendation_type as RecType,
    title: row.title,
    recommendation: row.recommendation,
    reason: row.reason,
    confidence: (row.confidence ?? "medium") as AgriMindRecommendation["confidence"],
    source_modules: (row.source_modules ?? []) as string[],
    language: (row.language ?? "en") as LangCode,
    translations: (row.translations ?? {}) as AgriMindRecommendation["translations"],
    created_at: row.created_at,
    status: row.status,
    accepted: row.accepted,
    dismissed: row.dismissed,
    plot_id: row.plot_id,
  };
}

export async function listRecommendations(
  supabase: SB,
  opts: { farmId?: string; limit?: number; includeDismissed?: boolean } = {},
): Promise<ServiceResult<AgriMindRecommendation[]>> {
  let q = supabase
    .from("farm_recommendations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(opts.limit ?? 50);
  if (opts.farmId) q = q.eq("farm_id", opts.farmId);
  if (!opts.includeDismissed) q = q.eq("dismissed", false);
  const { data, error } = await q;
  if (error) return fail(error.message);
  return ok((data ?? []).map(rowToRec));
}

export async function getLatestRecommendation(
  supabase: SB,
  farmId?: string,
): Promise<ServiceResult<AgriMindRecommendation | null>> {
  let q = supabase
    .from("farm_recommendations")
    .select("*")
    .eq("dismissed", false)
    .order("created_at", { ascending: false })
    .limit(1);
  if (farmId) q = q.eq("farm_id", farmId);
  const { data, error } = await q.maybeSingle();
  if (error) return fail(error.message);
  return ok(data ? rowToRec(data) : null);
}

export async function setRecommendationStatus(
  supabase: SB,
  id: string,
  patch: { accepted?: boolean; dismissed?: boolean },
): Promise<ServiceResult<AgriMindRecommendation>> {
  const update: Database["public"]["Tables"]["farm_recommendations"]["Update"] = {};
  if (typeof patch.accepted === "boolean") {
    update.accepted = patch.accepted;
    update.status = patch.accepted ? "accepted" : "active";
  }
  if (typeof patch.dismissed === "boolean") {
    update.dismissed = patch.dismissed;
    if (patch.dismissed) update.status = "dismissed";
  }
  const { data, error } = await supabase
    .from("farm_recommendations")
    .update(update)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error || !data) return fail(error?.message ?? "Recommendation not found.");
  return ok(rowToRec(data));
}

/** Translate arbitrary text. Used by /api/translate. */
export async function translateText(
  text: string,
  target: LangCode,
): Promise<ServiceResult<{ text: string }>> {
  if (!text.trim()) return ok({ text });
  const key = process.env.LOVABLE_API_KEY;
  if (!key) return fail("Translation service unavailable.");
  const langName = { en: "English", ta: "Tamil", te: "Telugu" }[target];
  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `Translate the user's text into ${langName}. Preserve agricultural terminology. Return ONLY the translated text, no quotes, no commentary.`,
          },
          { role: "user", content: text },
        ],
      }),
    });
    if (!res.ok) return fail("Translation service unavailable.");
    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const out = json.choices?.[0]?.message?.content?.trim();
    if (!out) return fail("Translation service unavailable.");
    return ok({ text: out });
  } catch (e) {
    console.error("[agrimind] translate error", e);
    return fail("Translation service unavailable.");
  }
}

/** Text-to-speech via Lovable AI Gateway. Returns base64-encoded MP3. */
export async function speakText(
  text: string,
  language: LangCode,
): Promise<ServiceResult<{ audio_base64: string; mime: string }>> {
  if (!text.trim()) return fail("Nothing to speak.");
  const key = process.env.LOVABLE_API_KEY;
  if (!key) return fail("Voice service unavailable.");
  // gpt-4o-mini-tts is multilingual; voice "alloy" works across languages.
  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini-tts",
        input: text,
        voice: "alloy",
        response_format: "mp3",
        instructions: `Speak clearly in ${
          { en: "English", ta: "Tamil", te: "Telugu" }[language]
        } at a calm, conversational pace for a farmer.`,
      }),
    });
    if (!res.ok) {
      console.error("[agrimind] tts failed", res.status, await res.text().catch(() => ""));
      return fail("Voice service unavailable.");
    }
    const buf = new Uint8Array(await res.arrayBuffer());
    const base64 =
      typeof Buffer !== "undefined"
        ? Buffer.from(buf).toString("base64")
        : btoa(String.fromCharCode(...buf));
    return ok({ audio_base64: base64, mime: "audio/mpeg" });
  } catch (e) {
    console.error("[agrimind] tts error", e);
    return fail("Voice service unavailable.");
  }
}
