/**
 * Weather service — real OpenWeather One Call integration.
 *
 * These are TanStack server functions that:
 *  - Require an authenticated user (via requireSupabaseAuth).
 *  - Resolve farm lat/lon from public.farm_locations (RLS scoped to owner).
 *  - Call OpenWeather One Call API 3.0 with a server-side API key.
 *  - Persist results into weather_records / weather_forecasts / weather_alerts.
 *
 * Returns a ServiceResult<T> — never throws raw provider errors at callers.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { fail, type ServiceResult } from "./result";

const farmInput = (data: unknown) => z.object({ farmId: z.string().uuid() }).parse(data);

export const getCurrentWeatherByFarm = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(farmInput)
  .handler(async ({ data, context }) => {
    const { getCurrentWeatherByFarm: fn } = await import("./weather.server");
    return fn(context.supabase, data.farmId);
  });

export const getForecastByFarm = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(farmInput)
  .handler(async ({ data, context }) => {
    const { getForecastByFarm: fn } = await import("./weather.server");
    return fn(context.supabase, data.farmId);
  });

export const syncWeatherForFarm = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(farmInput)
  .handler(async ({ data, context }) => {
    const { syncWeatherForFarm: fn } = await import("./weather.server");
    return fn(context.supabase, context.userId, data.farmId);
  });

export const getStoredWeatherRecords = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(farmInput)
  .handler(async ({ data, context }) => {
    const { getStoredWeatherRecords: fn } = await import("./weather.server");
    return fn(context.supabase, data.farmId);
  });

export const getStoredForecasts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(farmInput)
  .handler(async ({ data, context }) => {
    const { getStoredForecasts: fn } = await import("./weather.server");
    return fn(context.supabase, data.farmId);
  });

export const getWeatherAlerts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(farmInput)
  .handler(async ({ data, context }) => {
    const { getWeatherAlertsForFarm: fn } = await import("./weather.server");
    return fn(context.supabase, data.farmId);
  });

export const getWeatherSourceStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const configured = Boolean(process.env.OPENWEATHER_API_KEY || process.env.WEATHER_API_KEY);
    const result: ServiceResult<{ configured: boolean; provider: string }> = configured
      ? { success: true, data: { configured: true, provider: "openweather" }, error: null }
      : fail("Weather API key not configured.");
    return result;
  });
