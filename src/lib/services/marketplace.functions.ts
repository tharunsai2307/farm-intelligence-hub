/**
 * Marketplace server functions — listings + inquiries (no payments).
 * RLS handles per-user scoping; "browse" relies on existing public-read
 * policies on marketplace_listings for active listings.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type MarketplaceListingRow = {
  id: string;
  owner_id: string;
  farm_id: string;
  title: string;
  commodity: string;
  variety: string | null;
  grade: string | null;
  description: string | null;
  quantity: number;
  unit: string;
  price_per_unit: number;
  currency: string;
  status: "draft" | "active" | "sold" | "withdrawn" | string;
  pickup_address: string | null;
  pickup_district: string | null;
  pickup_state: string | null;
  harvest_date: string | null;
  available_from: string | null;
  available_until: string | null;
  views_count: number;
  created_at: string;
};

const LISTING_COLS =
  "id, owner_id, farm_id, title, commodity, variety, grade, description, quantity, unit, price_per_unit, currency, status, pickup_address, pickup_district, pickup_state, harvest_date, available_from, available_until, views_count, created_at";

export const listMyListings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("marketplace_listings")
      .select(LISTING_COLS)
      .eq("owner_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { items: (data ?? []) as MarketplaceListingRow[] };
  });

export const browseListings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { commodity?: string; state?: string } | undefined) =>
    z
      .object({
        commodity: z.string().trim().min(1).max(80).optional(),
        state: z.string().trim().min(1).max(80).optional(),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("marketplace_listings")
      .select(LISTING_COLS)
      .eq("status", "active")
      .neq("owner_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (data.commodity) q = q.ilike("commodity", `%${data.commodity}%`);
    if (data.state) q = q.ilike("pickup_state", `%${data.state}%`);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { items: (rows ?? []) as MarketplaceListingRow[] };
  });

const createSchema = z.object({
  farm_id: z.string().uuid(),
  title: z.string().trim().min(3).max(140),
  commodity: z.string().trim().min(2).max(80),
  variety: z.string().trim().max(80).optional().nullable(),
  grade: z.string().trim().max(40).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  quantity: z.number().positive(),
  unit: z.string().trim().min(1).max(20).default("kg"),
  price_per_unit: z.number().positive(),
  currency: z.string().trim().min(3).max(3).default("INR"),
  pickup_address: z.string().max(300).optional().nullable(),
  pickup_district: z.string().max(80).optional().nullable(),
  pickup_state: z.string().max(80).optional().nullable(),
  harvest_date: z.string().optional().nullable(),
  available_from: z.string().optional().nullable(),
  available_until: z.string().optional().nullable(),
});

export const createListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: z.infer<typeof createSchema>) => createSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("marketplace_listings")
      .insert({ ...data, owner_id: context.userId, status: "active" })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id as string };
  });

export const updateListingStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; status: "active" | "sold" | "withdrawn" }) =>
    z
      .object({ id: z.string().uuid(), status: z.enum(["active", "sold", "withdrawn"]) })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("marketplace_listings")
      .update({ status: data.status })
      .eq("id", data.id)
      .eq("owner_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
