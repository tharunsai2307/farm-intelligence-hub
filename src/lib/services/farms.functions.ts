import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type FarmRow = {
  id: string;
  name: string;
  owner_name: string | null;
  area_hectares: number | null;
  area_unit: string | null;
  farm_type: string | null;
  country: string | null;
  state: string | null;
  district: string | null;
  village: string | null;
  pincode: string | null;
  primary_crop: string | null;
  crop_variety: string | null;
  sowing_date: string | null;
  farming_season: string | null;
  soil_type: string | null;
  irrigation_type: string | null;
  water_source: string | null;
  planting_date: string | null;
  expected_harvest: string | null;
  has_soil_sensors: boolean | null;
  has_weather_station: boolean | null;
  wants_api_connection: boolean | null;
  created_at: string;
};

export type FarmLocationRow = {
  id: string;
  farm_id: string;
  label: string | null;
  latitude: number;
  longitude: number;
};

const FARM_COLS =
  "id, name, owner_name, area_hectares, area_unit, farm_type, country, state, district, village, pincode, primary_crop, crop_variety, sowing_date, farming_season, soil_type, irrigation_type, water_source, planting_date, expected_harvest, has_soil_sensors, has_weather_station, wants_api_connection, created_at";

export const listFarms = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("farms")
      .select(FARM_COLS)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { items: (data ?? []) as FarmRow[] };
  });

export const getPrimaryFarm = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("farms")
      .select(FARM_COLS)
      .is("deleted_at", null)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { farm: (data as FarmRow | null) ?? null };
  });

export const getFarmById = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: farm, error } = await context.supabase
      .from("farms")
      .select(FARM_COLS)
      .eq("id", data.id)
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { farm: (farm as FarmRow | null) ?? null };
  });

export const getFarmLocation = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { farm_id: string }) =>
    z.object({ farm_id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: loc, error } = await context.supabase
      .from("farm_locations")
      .select("id, farm_id, label, latitude, longitude")
      .eq("farm_id", data.farm_id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { location: (loc as FarmLocationRow | null) ?? null };
  });

const updateLocationSchema = z.object({
  farm_id: z.string().uuid(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  label: z.string().max(80).optional().nullable(),
});

export const updateFarmLocation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: z.infer<typeof updateLocationSchema>) =>
    updateLocationSchema.parse(input),
  )
  .handler(async ({ data, context }) => {
    // Ensure the farm belongs to the caller (RLS will also block)
    const { data: existing } = await context.supabase
      .from("farm_locations")
      .select("id")
      .eq("farm_id", data.farm_id)
      .limit(1)
      .maybeSingle();

    if (existing) {
      const { error } = await context.supabase
        .from("farm_locations")
        .update({
          latitude: data.latitude,
          longitude: data.longitude,
          label: data.label ?? "Primary",
        })
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await context.supabase.from("farm_locations").insert({
        farm_id: data.farm_id,
        latitude: data.latitude,
        longitude: data.longitude,
        label: data.label ?? "Primary",
      });
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

const createFarmSchema = z.object({
  name: z.string().min(1).max(120),
  owner_name: z.string().max(120).optional().nullable(),
  area_hectares: z.number().nonnegative().optional().nullable(),
  area_unit: z.enum(["hectares", "acres"]).optional(),
  farm_type: z.enum(["open_field", "greenhouse", "hydroponic", "mixed"]).optional().nullable(),
  country: z.string().max(80).optional().nullable(),
  state: z.string().max(80).optional().nullable(),
  district: z.string().max(80).optional().nullable(),
  village: z.string().max(120).optional().nullable(),
  pincode: z.string().max(20).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  primary_crop: z.string().max(80).optional().nullable(),
  crop_variety: z.string().max(80).optional().nullable(),
  sowing_date: z.string().optional().nullable(),
  planting_date: z.string().optional().nullable(),
  expected_harvest: z.string().optional().nullable(),
  farming_season: z.string().max(40).optional().nullable(),
  soil_type: z.string().max(60).optional().nullable(),
  irrigation_type: z.string().max(60).optional().nullable(),
  water_source: z.string().max(60).optional().nullable(),
  has_soil_sensors: z.boolean().optional(),
  has_weather_station: z.boolean().optional(),
  wants_api_connection: z.boolean().optional(),
});

export const createFarm = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: z.infer<typeof createFarmSchema>) => createFarmSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { latitude, longitude, ...farm } = data;
    const { data: row, error } = await context.supabase
      .from("farms")
      .insert({ ...farm, owner_id: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    if (latitude != null && longitude != null) {
      const { error: locErr } = await context.supabase.from("farm_locations").insert({
        farm_id: row.id as string,
        latitude,
        longitude,
        label: "Primary",
      });
      if (locErr) throw new Error(locErr.message);
    }

    return { id: row.id as string };
  });
