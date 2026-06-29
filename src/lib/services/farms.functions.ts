import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type FarmRow = {
  id: string;
  name: string;
  area_hectares: number | null;
  soil_type: string | null;
  irrigation_type: string | null;
  water_source: string | null;
  planting_date: string | null;
  expected_harvest: string | null;
  created_at: string;
};

export const listFarms = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("farms")
      .select("id, name, area_hectares, soil_type, irrigation_type, water_source, planting_date, expected_harvest, created_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { items: (data ?? []) as FarmRow[] };
  });

const createFarmSchema = z.object({
  name: z.string().min(1).max(120),
  area_hectares: z.number().nonnegative().nullable().optional(),
  soil_type: z.string().max(60).nullable().optional(),
  irrigation_type: z.string().max(60).nullable().optional(),
  water_source: z.string().max(60).nullable().optional(),
  planting_date: z.string().nullable().optional(),
  expected_harvest: z.string().nullable().optional(),
});

export const createFarm = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: z.infer<typeof createFarmSchema>) => createFarmSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("farms")
      .insert({ ...data, owner_id: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id as string };
  });
