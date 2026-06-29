/**
 * AgriSense — TanStack server function wrappers.
 *
 * Loads server-only logic from agrisense.server.ts dynamically so the file is
 * safe to import from route components.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { fail, ok, type ServiceResult } from "./result";

const deviceTypeEnum = z.enum([
  "esp32",
  "arduino",
  "lora",
  "mqtt",
  "weather_station",
  "soil_probe",
  "camera",
  "other",
]);

const droneStatusEnum = z.enum([
  "planned",
  "in_progress",
  "completed",
  "failed",
  "cancelled",
]);

const registerDeviceInput = z.object({
  farm_id: z.string().uuid(),
  plot_id: z.string().uuid().nullable().optional(),
  device_name: z.string().trim().min(1).max(120),
  device_type: deviceTypeEnum,
  manufacturer: z.string().trim().max(120).nullable().optional(),
  serial_number: z.string().trim().max(120).nullable().optional(),
  firmware_version: z.string().trim().max(60).nullable().optional(),
});

export const registerSensorDevice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: z.infer<typeof registerDeviceInput>) => registerDeviceInput.parse(input))
  .handler(async ({ data, context }) => {
    const { registerDevice } = await import("./agrisense.server");
    return registerDevice(context.supabase, context.userId, data);
  });

export const renameSensorDevice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; device_name: string }) =>
    z.object({ id: z.string().uuid(), device_name: z.string().trim().min(1).max(120) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { renameDevice } = await import("./agrisense.server");
    return renameDevice(context.supabase, data.id, data.device_name);
  });

export const removeSensorDevice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { removeDevice } = await import("./agrisense.server");
    return removeDevice(context.supabase, data.id);
  });

export const listSensorDevices = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { farm_id?: string }) =>
    z.object({ farm_id: z.string().uuid().optional() }).parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { listDevices } = await import("./agrisense.server");
    return listDevices(context.supabase, data.farm_id);
  });

export const listSensorReadings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { farm_id?: string; device_id?: string; limit?: number }) =>
    z
      .object({
        farm_id: z.string().uuid().optional(),
        device_id: z.string().uuid().optional(),
        limit: z.number().int().positive().max(500).optional(),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { listReadings } = await import("./agrisense.server");
    return listReadings(context.supabase, {
      farmId: data.farm_id,
      deviceId: data.device_id,
      limit: data.limit,
    });
  });

export const getLatestSensorReadings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { farm_id: string }) =>
    z.object({ farm_id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { getLatestReadings } = await import("./agrisense.server");
    return getLatestReadings(context.supabase, data.farm_id);
  });

export const ingestSensorReading = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    device_id: string;
    sensor_type: string;
    value: number;
    unit?: string | null;
    recorded_at?: string;
  }) =>
    z
      .object({
        device_id: z.string().uuid(),
        sensor_type: z.string().trim().min(1).max(60),
        value: z.number().finite(),
        unit: z.string().trim().max(20).nullable().optional(),
        recorded_at: z.string().datetime().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { ingestReading } = await import("./agrisense.server");
    return ingestReading(context.supabase, context.userId, data);
  });

export const listSatelliteRecordsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { farm_id: string }) =>
    z.object({ farm_id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { listSatelliteRecords } = await import("./agrisense.server");
    return listSatelliteRecords(context.supabase, data.farm_id);
  });

export const getSatelliteStatus = createServerFn({ method: "GET" }).handler(async () => {
  const hasGmaps = Boolean(process.env.LOVABLE_API_KEY && process.env.GOOGLE_MAPS_API_KEY);
  const configured = Boolean(
    process.env.SENTINEL_HUB_API_KEY ||
      process.env.GOOGLE_EARTH_ENGINE_API_KEY ||
      process.env.PLANET_LABS_API_KEY ||
      hasGmaps,
  );
  const result: ServiceResult<{ configured: boolean; provider: string | null }> = configured
    ? ok({
        configured: true,
        provider: process.env.SENTINEL_HUB_API_KEY
          ? "Sentinel Hub"
          : process.env.GOOGLE_EARTH_ENGINE_API_KEY
            ? "Google Earth Engine"
            : process.env.PLANET_LABS_API_KEY
              ? "Planet Labs"
              : "Google Maps Platform",
      })
    : fail("Satellite service unavailable.");
  return result;
});

const createDroneInput = z.object({
  farm_id: z.string().uuid(),
  survey_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  pilot: z.string().trim().max(120).nullable().optional(),
  coverage_area: z.number().positive().nullable().optional(),
  image_count: z.number().int().nonnegative().optional(),
  status: droneStatusEnum.optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
  report_url: z.string().url().nullable().optional(),
  geojson_url: z.string().url().nullable().optional(),
  orthomosaic_url: z.string().url().nullable().optional(),
});

export const createDroneSurveyFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: z.infer<typeof createDroneInput>) => createDroneInput.parse(input))
  .handler(async ({ data, context }) => {
    const { createDroneSurvey } = await import("./agrisense.server");
    return createDroneSurvey(context.supabase, context.userId, data);
  });

export const listDroneSurveysFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { farm_id: string }) =>
    z.object({ farm_id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { listDroneSurveys } = await import("./agrisense.server");
    return listDroneSurveys(context.supabase, data.farm_id);
  });

export const deleteDroneSurveyFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { deleteDroneSurvey } = await import("./agrisense.server");
    return deleteDroneSurvey(context.supabase, data.id);
  });
