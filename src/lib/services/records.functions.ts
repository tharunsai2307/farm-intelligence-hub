import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ---------------------------------------------------------------------------
// Shared shapes
// ---------------------------------------------------------------------------

export type SoilRecordRow = {
  id: string;
  farm_id: string;
  plot_id: string | null;
  user_id: string | null;
  recorded_at: string;
  moisture: number | null;
  ph: number | null;
  nitrogen: number | null;
  phosphorus: number | null;
  potassium: number | null;
  temperature: number | null;
  notes: string | null;
  created_at: string;
};

export type IrrigationRecordRow = {
  id: string;
  farm_id: string;
  plot_id: string | null;
  user_id: string | null;
  started_at: string;
  ended_at: string | null;
  method: string | null;
  volume_liters: number | null;
  duration_minutes: number | null;
  energy_used: number | null;
  notes: string | null;
  created_at: string;
};

export type CropObservationRow = {
  id: string;
  farm_id: string;
  plot_id: string | null;
  user_id: string;
  recorded_at: string;
  crop_stage: string | null;
  visual_condition: string | null;
  notes: string | null;
  image_url: string | null;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Soil records
// ---------------------------------------------------------------------------

const SOIL_COLS =
  "id, farm_id, plot_id, user_id, recorded_at, moisture, ph, nitrogen, phosphorus, potassium, temperature, notes, created_at";

const soilSchema = z.object({
  farm_id: z.string().uuid(),
  plot_id: z.string().uuid().optional().nullable(),
  recorded_at: z.string().min(1),
  moisture: z.number().min(0).max(100).optional().nullable(),
  ph: z.number().min(0).max(14).optional().nullable(),
  nitrogen: z.number().min(0).optional().nullable(),
  phosphorus: z.number().min(0).optional().nullable(),
  potassium: z.number().min(0).optional().nullable(),
  temperature: z.number().min(-50).max(80).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const listSoilRecords = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { farm_id?: string }) =>
    z.object({ farm_id: z.string().uuid().optional() }).parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("soil_records")
      .select(SOIL_COLS)
      .is("deleted_at", null)
      .order("recorded_at", { ascending: false });
    if (data.farm_id) q = q.eq("farm_id", data.farm_id);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { items: (rows ?? []) as SoilRecordRow[] };
  });

export const createSoilRecord = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: z.infer<typeof soilSchema>) => soilSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("soil_records")
      .insert({ ...data, user_id: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id as string };
  });

export const deleteSoilRecord = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("soil_records")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------------------------------------------------------------------------
// Irrigation records
// ---------------------------------------------------------------------------

const IRR_COLS =
  "id, farm_id, plot_id, user_id, started_at, ended_at, method, volume_liters, duration_minutes, energy_used, notes, created_at";

const irrSchema = z.object({
  farm_id: z.string().uuid(),
  plot_id: z.string().uuid().optional().nullable(),
  started_at: z.string().min(1),
  method: z.string().trim().min(1).max(60),
  volume_liters: z.number().nonnegative().optional().nullable(),
  duration_minutes: z.number().nonnegative().optional().nullable(),
  energy_used: z.number().nonnegative().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const listIrrigationRecords = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { farm_id?: string }) =>
    z.object({ farm_id: z.string().uuid().optional() }).parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("irrigation_records")
      .select(IRR_COLS)
      .is("deleted_at", null)
      .order("started_at", { ascending: false });
    if (data.farm_id) q = q.eq("farm_id", data.farm_id);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { items: (rows ?? []) as IrrigationRecordRow[] };
  });

export const createIrrigationRecord = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: z.infer<typeof irrSchema>) => irrSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("irrigation_records")
      .insert({ ...data, user_id: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id as string };
  });

export const deleteIrrigationRecord = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("irrigation_records")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------------------------------------------------------------------------
// Crop observations
// ---------------------------------------------------------------------------

const OBS_COLS =
  "id, farm_id, plot_id, user_id, recorded_at, crop_stage, visual_condition, notes, image_url, created_at";

const obsSchema = z.object({
  farm_id: z.string().uuid(),
  plot_id: z.string().uuid().optional().nullable(),
  recorded_at: z.string().min(1),
  crop_stage: z.string().trim().max(60).optional().nullable(),
  visual_condition: z.string().trim().max(60).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  image_url: z.string().url().optional().nullable(),
});

export const listCropObservations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { farm_id?: string }) =>
    z.object({ farm_id: z.string().uuid().optional() }).parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("crop_observations")
      .select(OBS_COLS)
      .is("deleted_at", null)
      .order("recorded_at", { ascending: false });
    if (data.farm_id) q = q.eq("farm_id", data.farm_id);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { items: (rows ?? []) as CropObservationRow[] };
  });

export const createCropObservation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: z.infer<typeof obsSchema>) => obsSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("crop_observations")
      .insert({ ...data, user_id: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id as string };
  });

export const deleteCropObservation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("crop_observations")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Sign a path inside the crop-observations storage bucket for upload (URL pre-signed by client).
// We just return a short-lived signed URL the browser can fetch the file from after upload.
export const signCropObservationView = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { path: string }) =>
    z.object({ path: z.string().min(1).max(400) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    if (!data.path.startsWith(`${context.userId}/`)) {
      throw new Error("Forbidden");
    }
    const { data: signed, error } = await context.supabase.storage
      .from("crop-observations")
      .createSignedUrl(data.path, 60 * 60 * 24 * 7);
    if (error) throw new Error(error.message);
    return { url: signed.signedUrl };
  });
