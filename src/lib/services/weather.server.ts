/**
 * Server-only weather helpers.
 *
 * Talks to OpenWeather One Call API 3.0 using a server-side API key and
 * persists results into Supabase using a per-request authenticated client
 * (so RLS applies as the calling user).
 *
 * NEVER import this file from client code or from a route loader that
 * runs during SSR for an unauthenticated visitor. Call it only from
 * server-function handlers or `/api/weather/*` route handlers.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { fail, ok, type ServiceResult } from "./result";

type SB = SupabaseClient<Database>;

export const WEATHER_ERRORS = {
  NOT_CONFIGURED: "Weather service not configured.",
  NO_LOCATION: "Farm location is not set. Add GPS coordinates to enable weather.",
  FARM_NOT_FOUND: "Farm not found or you don't have access.",
  REQUEST_FAILED: "Weather provider request failed.",
  UNAVAILABLE: "Weather data unavailable.",
} as const;

export function isWeatherConfigured(): boolean {
  return Boolean(process.env.OPENWEATHER_API_KEY || process.env.WEATHER_API_KEY);
}

function apiKey(): string | null {
  return process.env.OPENWEATHER_API_KEY || process.env.WEATHER_API_KEY || null;
}

/** Resolve farm coords from public.farm_locations (RLS applies). */
async function getFarmCoords(
  supabase: SB,
  farmId: string,
): Promise<{ lat: number; lon: number } | null> {
  const { data, error } = await supabase
    .from("farm_locations")
    .select("latitude, longitude")
    .eq("farm_id", farmId)
    .maybeSingle();
  if (error || !data || data.latitude == null || data.longitude == null) return null;
  return { lat: Number(data.latitude), lon: Number(data.longitude) };
}

type OneCallResponse = {
  current?: {
    dt: number;
    temp: number;
    humidity: number;
    pressure: number;
    uvi: number;
    wind_speed: number;
    rain?: { "1h"?: number };
    weather?: Array<{ main: string; description: string }>;
  };
  daily?: Array<{
    dt: number;
    temp: { min: number; max: number };
    humidity: number;
    pop: number;
    rain?: number;
    wind_speed: number;
    weather?: Array<{ main: string; description: string }>;
  }>;
  alerts?: Array<{
    event: string;
    start: number;
    end: number;
    description: string;
    sender_name?: string;
  }>;
};

async function fetchOneCall(lat: number, lon: number): Promise<OneCallResponse | null> {
  const key = apiKey();
  if (!key) return null;

  // 1) Try One Call 3.0 (paid plan).
  const url = new URL("https://api.openweathermap.org/data/3.0/onecall");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("units", "metric");
  url.searchParams.set("exclude", "minutely,hourly");
  url.searchParams.set("appid", key);
  const res = await fetch(url.toString());
  if (res.ok) return (await res.json()) as OneCallResponse;

  const errText = await res.text().catch(() => "");
  console.error("[weather] OneCall 3.0 failed", res.status, errText);

  // 2) Fallback to free 2.5 endpoints (no paid subscription required).
  if (res.status === 401 || res.status === 403 || res.status === 404) {
    return await fetchLegacy(lat, lon, key);
  }
  return null;
}

/**
 * Fallback: assemble a OneCall-shaped response from free 2.5 endpoints.
 * - /data/2.5/weather  → current
 * - /data/2.5/forecast → 3-hourly forecast, condensed into daily buckets
 */
async function fetchLegacy(lat: number, lon: number, key: string): Promise<OneCallResponse | null> {
  const base = "https://api.openweathermap.org/data/2.5";
  const qs = `lat=${lat}&lon=${lon}&units=metric&appid=${encodeURIComponent(key)}`;
  const [cw, fc] = await Promise.all([
    fetch(`${base}/weather?${qs}`),
    fetch(`${base}/forecast?${qs}`),
  ]);
  if (!cw.ok && !fc.ok) {
    console.error("[weather] legacy 2.5 failed", cw.status, fc.status);
    return null;
  }
  const out: OneCallResponse = {};
  if (cw.ok) {
    const j = (await cw.json()) as {
      dt: number;
      main?: { temp: number; humidity: number; pressure: number };
      wind?: { speed: number };
      rain?: { "1h"?: number };
      weather?: Array<{ main: string; description: string }>;
    };
    out.current = {
      dt: j.dt,
      temp: j.main?.temp ?? 0,
      humidity: j.main?.humidity ?? 0,
      pressure: j.main?.pressure ?? 0,
      uvi: 0,
      wind_speed: j.wind?.speed ?? 0,
      rain: j.rain ? { "1h": j.rain["1h"] } : undefined,
      weather: j.weather,
    };
  }
  if (fc.ok) {
    const j = (await fc.json()) as {
      list: Array<{
        dt: number;
        main: { temp_min: number; temp_max: number; humidity: number };
        wind: { speed: number };
        pop?: number;
        rain?: { "3h"?: number };
        weather: Array<{ main: string; description: string }>;
      }>;
    };
    const byDay = new Map<
      string,
      ReturnType<() => NonNullable<OneCallResponse["daily"]>[number]>
    >();
    for (const it of j.list) {
      const dayKey = new Date(it.dt * 1000).toISOString().slice(0, 10);
      const existing = byDay.get(dayKey);
      const rain = it.rain?.["3h"] ?? 0;
      if (!existing) {
        byDay.set(dayKey, {
          dt: it.dt,
          temp: { min: it.main.temp_min, max: it.main.temp_max },
          humidity: it.main.humidity,
          pop: it.pop ?? 0,
          rain,
          wind_speed: it.wind.speed,
          weather: it.weather,
        });
      } else {
        existing.temp.min = Math.min(existing.temp.min, it.main.temp_min);
        existing.temp.max = Math.max(existing.temp.max, it.main.temp_max);
        existing.humidity = Math.round((existing.humidity + it.main.humidity) / 2);
        existing.pop = Math.max(existing.pop, it.pop ?? 0);
        existing.rain = (existing.rain ?? 0) + rain;
        existing.wind_speed = Math.max(existing.wind_speed, it.wind.speed);
      }
    }
    out.daily = Array.from(byDay.values()).slice(0, 7);
  }
  return out;
}

export type CurrentWeather = {
  temperature: number | null;
  humidity: number | null;
  rainfall: number | null;
  wind_speed: number | null;
  pressure: number | null;
  uv_index: number | null;
  weather_condition: string | null;
  fetched_at: string;
  latitude: number;
  longitude: number;
  source: string;
};

export type ForecastDay = {
  forecast_date: string;
  min_temp: number | null;
  max_temp: number | null;
  humidity: number | null;
  rain_probability: number | null;
  rainfall: number | null;
  wind_speed: number | null;
  weather_condition: string | null;
};

function deriveAlerts(
  userId: string,
  farmId: string,
  current: CurrentWeather | null,
  forecast: ForecastDay[],
  providerAlerts: OneCallResponse["alerts"],
): Array<{
  user_id: string;
  farm_id: string;
  alert_type: string;
  severity: "low" | "medium" | "high";
  title: string;
  description: string | null;
  source: string;
  starts_at: string | null;
  ends_at: string | null;
}> {
  const out: ReturnType<typeof deriveAlerts> = [];
  const base = { user_id: userId, farm_id: farmId, source: "openweather" };

  if (current) {
    if (current.temperature != null && current.temperature >= 40) {
      out.push({
        ...base,
        alert_type: "high_temperature",
        severity: current.temperature >= 45 ? "high" : "medium",
        title: `High temperature: ${current.temperature.toFixed(1)}°C`,
        description: "Heat stress risk for crops. Consider irrigation and shading.",
        starts_at: current.fetched_at,
        ends_at: null,
      });
    }
    if (current.temperature != null && current.temperature <= 4) {
      out.push({
        ...base,
        alert_type: "low_temperature",
        severity: current.temperature <= 0 ? "high" : "medium",
        title: `Low temperature: ${current.temperature.toFixed(1)}°C`,
        description: "Frost risk for sensitive crops.",
        starts_at: current.fetched_at,
        ends_at: null,
      });
    }
    if (current.wind_speed != null && current.wind_speed >= 14) {
      out.push({
        ...base,
        alert_type: "strong_wind",
        severity: current.wind_speed >= 20 ? "high" : "medium",
        title: `Strong wind: ${current.wind_speed.toFixed(1)} m/s`,
        description: "Risk of lodging and spray drift.",
        starts_at: current.fetched_at,
        ends_at: null,
      });
    }
    if (current.humidity != null && current.humidity >= 90) {
      out.push({
        ...base,
        alert_type: "high_humidity",
        severity: "low",
        title: `High humidity: ${current.humidity.toFixed(0)}%`,
        description: "Elevated disease pressure possible.",
        starts_at: current.fetched_at,
        ends_at: null,
      });
    }
  }

  // Heavy rain on any forecast day
  for (const d of forecast) {
    if ((d.rainfall ?? 0) >= 25) {
      out.push({
        ...base,
        alert_type: "heavy_rain",
        severity: (d.rainfall ?? 0) >= 50 ? "high" : "medium",
        title: `Heavy rain expected ${d.forecast_date}`,
        description: `${d.rainfall?.toFixed(1)} mm forecast. Delay spraying and check drainage.`,
        starts_at: `${d.forecast_date}T00:00:00Z`,
        ends_at: `${d.forecast_date}T23:59:59Z`,
      });
    }
  }

  // Drought risk: 5+ consecutive forecast days with <1mm
  const dryStreak = forecast.slice(0, 7).every((d) => (d.rainfall ?? 0) < 1);
  if (forecast.length >= 5 && dryStreak) {
    out.push({
      ...base,
      alert_type: "drought_risk",
      severity: "medium",
      title: "No rainfall forecast for the next 7 days",
      description: "Plan irrigation; consider mulching to retain soil moisture.",
      starts_at: null,
      ends_at: null,
    });
  }

  // Pass through provider alerts as 'high'
  for (const a of providerAlerts ?? []) {
    out.push({
      ...base,
      alert_type: "provider",
      severity: "high",
      title: a.event,
      description: a.description?.slice(0, 800) ?? null,
      starts_at: new Date(a.start * 1000).toISOString(),
      ends_at: new Date(a.end * 1000).toISOString(),
    });
  }

  return out;
}

export async function syncWeatherForFarm(
  supabase: SB,
  userId: string,
  farmId: string,
): Promise<
  ServiceResult<{ current: CurrentWeather; forecast: ForecastDay[]; alerts_created: number }>
> {
  if (!isWeatherConfigured()) return fail(WEATHER_ERRORS.NOT_CONFIGURED);
  const coords = await getFarmCoords(supabase, farmId);
  if (!coords) return fail(WEATHER_ERRORS.NO_LOCATION);

  const data = await fetchOneCall(coords.lat, coords.lon);
  if (!data) return fail(WEATHER_ERRORS.REQUEST_FAILED);

  const nowIso = new Date().toISOString();
  const current: CurrentWeather | null = data.current
    ? {
        temperature: data.current.temp ?? null,
        humidity: data.current.humidity ?? null,
        rainfall: data.current.rain?.["1h"] ?? 0,
        wind_speed: data.current.wind_speed ?? null,
        pressure: data.current.pressure ?? null,
        uv_index: data.current.uvi ?? null,
        weather_condition: data.current.weather?.[0]?.description ?? null,
        fetched_at: nowIso,
        latitude: coords.lat,
        longitude: coords.lon,
        source: "openweather",
      }
    : null;

  const forecast: ForecastDay[] = (data.daily ?? []).slice(0, 7).map((d) => ({
    forecast_date: new Date(d.dt * 1000).toISOString().slice(0, 10),
    min_temp: d.temp?.min ?? null,
    max_temp: d.temp?.max ?? null,
    humidity: d.humidity ?? null,
    rain_probability: d.pop != null ? Math.round(d.pop * 100) : null,
    rainfall: d.rain ?? 0,
    wind_speed: d.wind_speed ?? null,
    weather_condition: d.weather?.[0]?.description ?? null,
  }));

  if (!current && forecast.length === 0) return fail(WEATHER_ERRORS.UNAVAILABLE);

  // Persist current
  if (current) {
    const { error } = await supabase.from("weather_records").insert({
      farm_id: farmId,
      user_id: userId,
      recorded_at: nowIso,
      fetched_at: nowIso,
      latitude: coords.lat,
      longitude: coords.lon,
      temp_c: current.temperature,
      humidity: current.humidity,
      rainfall_mm: current.rainfall,
      wind_kph: current.wind_speed,
      pressure: current.pressure,
      uv_index: current.uv_index,
      weather_condition: current.weather_condition,
      source: "openweather",
    });
    if (error) console.error("[weather] insert current failed", error);
  }

  // Persist forecasts (upsert by farm_id + forecast_date)
  if (forecast.length > 0) {
    const rows = forecast.map((f) => ({
      user_id: userId,
      farm_id: farmId,
      forecast_date: f.forecast_date,
      min_temp: f.min_temp,
      max_temp: f.max_temp,
      humidity: f.humidity,
      rain_probability: f.rain_probability,
      rainfall: f.rainfall,
      wind_speed: f.wind_speed,
      weather_condition: f.weather_condition,
      source: "openweather",
      fetched_at: nowIso,
    }));
    const { error } = await supabase
      .from("weather_forecasts")
      .upsert(rows, { onConflict: "farm_id,forecast_date" });
    if (error) console.error("[weather] upsert forecasts failed", error);
  }

  // Derive + persist alerts (replace recent ones for the farm to avoid pileup)
  const alerts = deriveAlerts(userId, farmId, current, forecast, data.alerts);
  let alertsCreated = 0;
  if (alerts.length > 0) {
    const { error } = await supabase.from("weather_alerts").insert(alerts);
    if (error) console.error("[weather] insert alerts failed", error);
    else alertsCreated = alerts.length;
  }

  return ok({
    current: current ?? {
      temperature: null,
      humidity: null,
      rainfall: null,
      wind_speed: null,
      pressure: null,
      uv_index: null,
      weather_condition: null,
      fetched_at: nowIso,
      latitude: coords.lat,
      longitude: coords.lon,
      source: "openweather",
    },
    forecast,
    alerts_created: alertsCreated,
  });
}

export async function getStoredWeatherRecords(supabase: SB, farmId: string) {
  const { data, error } = await supabase
    .from("weather_records")
    .select("*")
    .eq("farm_id", farmId)
    .order("fetched_at", { ascending: false })
    .limit(50);
  if (error) return fail<typeof data>(error.message);
  return ok(data ?? []);
}

export async function getStoredForecasts(supabase: SB, farmId: string) {
  const { data, error } = await supabase
    .from("weather_forecasts")
    .select("*")
    .eq("farm_id", farmId)
    .order("forecast_date", { ascending: true });
  if (error) return fail<typeof data>(error.message);
  return ok(data ?? []);
}

export async function getWeatherAlertsForFarm(supabase: SB, farmId: string) {
  const { data, error } = await supabase
    .from("weather_alerts")
    .select("*")
    .eq("farm_id", farmId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return fail<typeof data>(error.message);
  return ok(data ?? []);
}

export async function getCurrentWeatherByFarm(supabase: SB, farmId: string) {
  const { data, error } = await supabase
    .from("weather_records")
    .select("*")
    .eq("farm_id", farmId)
    .order("fetched_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return fail<typeof data>(error.message);
  if (!data) return fail<typeof data>(WEATHER_ERRORS.UNAVAILABLE);
  return ok(data);
}

export async function getForecastByFarm(supabase: SB, farmId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("weather_forecasts")
    .select("*")
    .eq("farm_id", farmId)
    .gte("forecast_date", today)
    .order("forecast_date", { ascending: true })
    .limit(7);
  if (error) return fail<typeof data>(error.message);
  return ok(data ?? []);
}
