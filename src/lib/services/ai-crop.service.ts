/**
 * AI Crop Intelligence — TanStack server functions.
 *
 * Server-only logic lives in ai-crop.server.ts and is loaded dynamically
 * inside handlers so client bundles never include it.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { fail, ok, type ServiceResult } from "./result";

const analyzeInput = z.object({
  farm_id: z.string().uuid(),
  plot_id: z.string().uuid().nullable().optional(),
  crop_type: z.string().max(80).nullable().optional(),
  image_path: z.string().min(1),
  language: z.enum(["en", "ta", "te", "hi"]).optional(),
});

export const analyzeCropImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: z.infer<typeof analyzeInput>) => analyzeInput.parse(input))
  .handler(async ({ data, context }) => {
    const { analyzeCrop } = await import("./ai-crop.server");
    return analyzeCrop(context.supabase, context.userId, data);
  });

export const listCropAnalyses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { farm_id?: string }) =>
    z.object({ farm_id: z.string().uuid().optional() }).parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { listAnalysesForUser } = await import("./ai-crop.server");
    return listAnalysesForUser(context.supabase, data.farm_id);
  });

export const getCropAnalysis = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { getAnalysisById, createSignedImageUrl } = await import("./ai-crop.server");
    const result = await getAnalysisById(context.supabase, data.id);
    if (!result.success || !result.data) return result;
    const row = result.data;
    const signedUrl = await createSignedImageUrl(context.supabase, row.image_path);
    return ok({ ...row, signed_image_url: signedUrl });
  });

export const getSignedAnalysisImage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { path: string }) =>
    z.object({ path: z.string().min(1) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { createSignedImageUrl } = await import("./ai-crop.server");
    const url = await createSignedImageUrl(context.supabase, data.path);
    if (!url) return fail<{ url: string }>("Could not sign image URL.");
    return ok({ url });
  });

export const getAiCropStatus = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async () => {
  const hasRoboflow = Boolean(process.env.ROBOFLOW_API_KEY && process.env.ROBOFLOW_MODEL_ID);
  const hasGemini = Boolean(process.env.LOVABLE_API_KEY);
  const configured = hasRoboflow || hasGemini;
  const provider = hasRoboflow ? "roboflow" : hasGemini ? "gemini-vision" : "none";
  const result: ServiceResult<{ configured: boolean; provider: string }> = configured
    ? { success: true, data: { configured: true, provider }, error: null }
    : fail("AI Crop Analysis service is currently unavailable.");
  return result;
});
