/**
 * AgriSense — server-side data plane for sensor devices, sensor readings,
 * satellite imagery, and drone surveys.
 *
 * Strict rule: every read/write is scoped to the authenticated user via RLS.
 * No values are ever fabricated — if a device hasn't reported, callers see
 * `status = 'offline'/'unknown'` and an empty reading list.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { fail, ok, type ServiceResult } from "./result";

type SB = SupabaseClient<Database>;

export type SensorDeviceRow = Database["public"]["Tables"]["sensor_devices"]["Row"];
export type SensorReadingRow = Database["public"]["Tables"]["sensor_readings"]["Row"];
export type SatelliteRecordRow = Database["public"]["Tables"]["satellite_records"]["Row"];
export type DroneSurveyRow = Database["public"]["Tables"]["drone_surveys"]["Row"];

export type DeviceType = Database["public"]["Enums"]["sensor_device_type"];
export type DeviceStatus = Database["public"]["Enums"]["sensor_device_status"];

const STALE_AFTER_MINUTES = 60; // anything older = offline

/** Compute device health from `last_seen` and stored status. Never guesses. */
export function deriveDeviceHealth(d: SensorDeviceRow): {
  status: DeviceStatus;
  isStale: boolean;
  minutesSinceLastSeen: number | null;
} {
  if (!d.last_seen) {
    return { status: "unknown", isStale: true, minutesSinceLastSeen: null };
  }
  const minutes = Math.floor((Date.now() - new Date(d.last_seen).getTime()) / 60000);
  const isStale = minutes > STALE_AFTER_MINUTES;
  // If the user/device set an explicit status (low_battery / maintenance) keep it.
  if (d.status === "low_battery" || d.status === "maintenance") {
    return { status: d.status, isStale, minutesSinceLastSeen: minutes };
  }
  return {
    status: isStale ? "offline" : "online",
    isStale,
    minutesSinceLastSeen: minutes,
  };
}

// -------------------- Device CRUD --------------------

export type RegisterDeviceInput = {
  farm_id: string;
  plot_id?: string | null;
  device_name: string;
  device_type: DeviceType;
  manufacturer?: string | null;
  serial_number?: string | null;
  firmware_version?: string | null;
};

export async function registerDevice(
  supabase: SB,
  userId: string,
  input: RegisterDeviceInput,
): Promise<ServiceResult<SensorDeviceRow>> {
  const { data, error } = await supabase
    .from("sensor_devices")
    .insert({
      user_id: userId,
      farm_id: input.farm_id,
      plot_id: input.plot_id ?? null,
      device_name: input.device_name.trim(),
      device_type: input.device_type,
      manufacturer: input.manufacturer ?? null,
      serial_number: input.serial_number ?? null,
      firmware_version: input.firmware_version ?? null,
      status: "unknown",
    })
    .select("*")
    .single();
  if (error || !data) return fail(error?.message ?? "Failed to register device");
  return ok(data);
}

export async function renameDevice(
  supabase: SB,
  id: string,
  device_name: string,
): Promise<ServiceResult<SensorDeviceRow>> {
  const { data, error } = await supabase
    .from("sensor_devices")
    .update({ device_name: device_name.trim() })
    .eq("id", id)
    .select("*")
    .single();
  if (error || !data) return fail(error?.message ?? "Failed to rename device");
  return ok(data);
}

export async function removeDevice(supabase: SB, id: string): Promise<ServiceResult<true>> {
  const { error } = await supabase.from("sensor_devices").delete().eq("id", id);
  if (error) return fail(error.message);
  return ok(true as const);
}

export async function listDevices(
  supabase: SB,
  farmId?: string,
): Promise<ServiceResult<SensorDeviceRow[]>> {
  let q = supabase.from("sensor_devices").select("*").order("created_at", { ascending: false });
  if (farmId) q = q.eq("farm_id", farmId);
  const { data, error } = await q;
  if (error) return fail(error.message);
  return ok(data ?? []);
}

// -------------------- Readings --------------------

export async function listReadings(
  supabase: SB,
  opts: { farmId?: string; deviceId?: string; limit?: number } = {},
): Promise<ServiceResult<SensorReadingRow[]>> {
  let q = supabase
    .from("sensor_readings")
    .select("*")
    .order("recorded_at", { ascending: false })
    .limit(opts.limit ?? 100);
  if (opts.farmId) q = q.eq("farm_id", opts.farmId);
  if (opts.deviceId) q = q.eq("device_id", opts.deviceId);
  const { data, error } = await q;
  if (error) return fail(error.message);
  return ok(data ?? []);
}

/**
 * Get the latest reading per (device, sensor_type) pair for a farm.
 * Returns a map keyed by `${device_id}:${sensor_type}`.
 */
export async function getLatestReadings(
  supabase: SB,
  farmId: string,
): Promise<ServiceResult<SensorReadingRow[]>> {
  // Pull recent slice; clients can rely on it being small thanks to the index.
  const { data, error } = await supabase
    .from("sensor_readings")
    .select("*")
    .eq("farm_id", farmId)
    .order("recorded_at", { ascending: false })
    .limit(500);
  if (error) return fail(error.message);
  const seen = new Set<string>();
  const latest: SensorReadingRow[] = [];
  for (const r of data ?? []) {
    const key = `${r.device_id}:${r.sensor_type}`;
    if (seen.has(key)) continue;
    seen.add(key);
    latest.push(r);
  }
  return ok(latest);
}

export type IngestReadingInput = {
  device_id: string;
  sensor_type: string;
  value: number;
  unit?: string | null;
  recorded_at?: string;
  metadata?: Record<string, unknown>;
};

/**
 * Ingest a sensor reading. Validates device ownership (RLS already enforces
 * this) and updates the device's `last_seen` / status atomically.
 */
export async function ingestReading(
  supabase: SB,
  userId: string,
  input: IngestReadingInput,
): Promise<ServiceResult<SensorReadingRow>> {
  const { data: device, error: devErr } = await supabase
    .from("sensor_devices")
    .select("id, farm_id, plot_id, user_id")
    .eq("id", input.device_id)
    .single();
  if (devErr || !device) return fail("Device not found");
  if (device.user_id !== userId) return fail("Forbidden");

  const recordedAt = input.recorded_at ?? new Date().toISOString();
  const { data, error } = await supabase
    .from("sensor_readings")
    .insert({
      user_id: userId,
      device_id: device.id,
      farm_id: device.farm_id,
      plot_id: device.plot_id,
      sensor_type: input.sensor_type,
      value: input.value,
      unit: input.unit ?? null,
      recorded_at: recordedAt,
      metadata: (input.metadata ?? {}) as never,
    })
    .select("*")
    .single();
  if (error || !data) return fail(error?.message ?? "Failed to ingest reading");

  // Refresh last_seen + flip to online.
  await supabase
    .from("sensor_devices")
    .update({ last_seen: recordedAt, status: "online" })
    .eq("id", device.id);

  return ok(data);
}

// -------------------- Satellite --------------------

export function isSatelliteConfigured(): boolean {
  return Boolean(
    process.env.SENTINEL_HUB_API_KEY ||
      process.env.GOOGLE_EARTH_ENGINE_API_KEY ||
      process.env.PLANET_LABS_API_KEY,
  );
}

export async function listSatelliteRecords(
  supabase: SB,
  farmId: string,
): Promise<ServiceResult<SatelliteRecordRow[]>> {
  const { data, error } = await supabase
    .from("satellite_records")
    .select("*")
    .eq("farm_id", farmId)
    .order("image_date", { ascending: false })
    .limit(50);
  if (error) return fail(error.message);
  return ok(data ?? []);
}

// -------------------- Drone --------------------

export type CreateDroneSurveyInput = {
  farm_id: string;
  survey_date: string;
  pilot?: string | null;
  coverage_area?: number | null;
  image_count?: number;
  status?: Database["public"]["Enums"]["drone_survey_status"];
  notes?: string | null;
  report_url?: string | null;
  geojson_url?: string | null;
  orthomosaic_url?: string | null;
};

export async function createDroneSurvey(
  supabase: SB,
  userId: string,
  input: CreateDroneSurveyInput,
): Promise<ServiceResult<DroneSurveyRow>> {
  const { data, error } = await supabase
    .from("drone_surveys")
    .insert({
      user_id: userId,
      farm_id: input.farm_id,
      survey_date: input.survey_date,
      pilot: input.pilot ?? null,
      coverage_area: input.coverage_area ?? null,
      image_count: input.image_count ?? 0,
      status: input.status ?? "completed",
      notes: input.notes ?? null,
      report_url: input.report_url ?? null,
      geojson_url: input.geojson_url ?? null,
      orthomosaic_url: input.orthomosaic_url ?? null,
    })
    .select("*")
    .single();
  if (error || !data) return fail(error?.message ?? "Failed to create survey");
  return ok(data);
}

export async function listDroneSurveys(
  supabase: SB,
  farmId: string,
): Promise<ServiceResult<DroneSurveyRow[]>> {
  const { data, error } = await supabase
    .from("drone_surveys")
    .select("*")
    .eq("farm_id", farmId)
    .order("survey_date", { ascending: false });
  if (error) return fail(error.message);
  return ok(data ?? []);
}

export async function deleteDroneSurvey(
  supabase: SB,
  id: string,
): Promise<ServiceResult<true>> {
  const { error } = await supabase.from("drone_surveys").delete().eq("id", id);
  if (error) return fail(error.message);
  return ok(true as const);
}
