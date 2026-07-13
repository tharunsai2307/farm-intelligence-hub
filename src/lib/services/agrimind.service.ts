/**
 * AgriMind AI — TanStack server functions.
 *
 * Heavy logic lives in agrimind.server.ts and is loaded dynamically inside
 * each handler so client bundles never include it.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { fail, ok, type ServiceResult } from "./result";

const langSchema = z.enum(["en", "ta", "te"]);

const generateInput = z.object({
  farm_id: z.string().uuid(),
  language: langSchema.optional(),
});

export const generateAgriMindRecommendation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: z.infer<typeof generateInput>) => generateInput.parse(input))
  .handler(async ({ data, context }) => {
    const { generateRecommendations } = await import("./agrimind.server");
    return generateRecommendations(context.supabase, context.userId, data);
  });

export const listAgriMindRecommendations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { farm_id?: string; include_dismissed?: boolean }) =>
    z
      .object({
        farm_id: z.string().uuid().optional(),
        include_dismissed: z.boolean().optional(),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { listRecommendations } = await import("./agrimind.server");
    return listRecommendations(context.supabase, {
      farmId: data.farm_id,
      includeDismissed: data.include_dismissed,
    });
  });

export const getLatestAgriMindRecommendation = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { farm_id?: string }) =>
    z.object({ farm_id: z.string().uuid().optional() }).parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { getLatestRecommendation } = await import("./agrimind.server");
    return getLatestRecommendation(context.supabase, data.farm_id);
  });

export const updateAgriMindRecommendationStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; accepted?: boolean; dismissed?: boolean }) =>
    z
      .object({
        id: z.string().uuid(),
        accepted: z.boolean().optional(),
        dismissed: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { setRecommendationStatus } = await import("./agrimind.server");
    return setRecommendationStatus(context.supabase, data.id, {
      accepted: data.accepted,
      dismissed: data.dismissed,
    });
  });

export const translateAgriText = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { text: string; target: "en" | "ta" | "te" }) =>
    z.object({ text: z.string().max(4000), target: langSchema }).parse(input),
  )
  .handler(async ({ data }) => {
    const { translateText } = await import("./agrimind.server");
    return translateText(data.text, data.target);
  });

export const speakAgriText = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { text: string; language: "en" | "ta" | "te" }) =>
    z.object({ text: z.string().max(2000), language: langSchema }).parse(input),
  )
  .handler(async ({ data }) => {
    const { speakText } = await import("./agrimind.server");
    return speakText(data.text, data.language);
  });

export const getAgriMindStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const configured = Boolean(process.env.LOVABLE_API_KEY);
    const result: ServiceResult<{ configured: boolean; provider: string }> = configured
      ? ok({ configured: true, provider: "lovable-ai" })
      : fail("AgriMind AI is currently unavailable.");
    return result;
  });
