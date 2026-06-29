import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type FarmPlotRow = {
  id: string;
  farm_id: string;
  user_id: string;
  name: string;
  crop: string | null;
  crop_variety: string | null;
  area: number | null;
  area_unit: string | null;
  soil_type: string | null;
  irrigation_type: string | null;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

const COLS =
  "id, farm_id, user_id, name, crop, crop_variety, area, area_unit, soil_type, irrigation_type, latitude, longitude, notes, created_at, updated_at";

const plotInputSchema = z.object({
  farm_id: z.string().uuid(),
  name: z.string().trim().min(1, "Plot name is required").max(120),
  crop: z.string().trim().max(80).optional().nullable(),
  crop_variety: z.string().trim().max(80).optional().nullable(),
  area: z.number().positive("Area must be positive").optional().nullable(),
  area_unit: z.enum(["hectares", "acres"]).optional().nullable(),
  soil_type: z.string().trim().max(60).optional().nullable(),
  irrigation_type: z.string().trim().max(60).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
});

export const listFarmPlots = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { farm_id?: string }) =>
    z.object({ farm_id: z.string().uuid().optional() }).parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("farm_plots")
      .select(COLS)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    if (data.farm_id) q = q.eq("farm_id", data.farm_id);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { items: (rows ?? []) as FarmPlotRow[] };
  });

export const getFarmPlotById = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("farm_plots")
      .select(COLS)
      .eq("id", data.id)
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { plot: (row as FarmPlotRow | null) ?? null };
  });

export const createFarmPlot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: z.infer<typeof plotInputSchema>) => plotInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("farm_plots")
      .insert({ ...data, user_id: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id as string };
  });

const updateSchema = plotInputSchema.partial().extend({ id: z.string().uuid() });

export const updateFarmPlot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: z.infer<typeof updateSchema>) => updateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data;
    const { error } = await context.supabase.from("farm_plots").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteFarmPlot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("farm_plots")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
