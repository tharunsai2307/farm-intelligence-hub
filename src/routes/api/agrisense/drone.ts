/**
 * GET  /api/agrisense/drone?farm_id=uuid   — list surveys
 * POST /api/agrisense/drone                 — create survey
 */
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getRequestSupabase, jsonError } from "@/lib/server/request-auth.server";

const Body = z.object({
  farm_id: z.string().uuid(),
  survey_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  pilot: z.string().max(120).nullable().optional(),
  coverage_area: z.number().positive().nullable().optional(),
  image_count: z.number().int().nonnegative().optional(),
  status: z.enum(["planned", "in_progress", "completed", "failed", "cancelled"]).optional(),
  notes: z.string().max(2000).nullable().optional(),
  report_url: z.string().url().nullable().optional(),
  geojson_url: z.string().url().nullable().optional(),
  orthomosaic_url: z.string().url().nullable().optional(),
});

export const Route = createFileRoute("/api/agrisense/drone")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = await getRequestSupabase(request);
        if (!auth) return jsonError("Unauthorized", 401);
        const url = new URL(request.url);
        const farmId = url.searchParams.get("farm_id");
        if (!farmId) return jsonError("farm_id required", 400);
        const { listDroneSurveys } = await import("@/lib/services/agrisense.server");
        const result = await listDroneSurveys(auth.supabase, farmId);
        return new Response(JSON.stringify(result), {
          status: result.success ? 200 : 500,
          headers: { "Content-Type": "application/json" },
        });
      },
      POST: async ({ request }) => {
        const auth = await getRequestSupabase(request);
        if (!auth) return jsonError("Unauthorized", 401);
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return jsonError("Invalid JSON", 400);
        }
        const parsed = Body.safeParse(body);
        if (!parsed.success) return jsonError("Invalid input", 400);
        const { createDroneSurvey } = await import("@/lib/services/agrisense.server");
        const result = await createDroneSurvey(auth.supabase, auth.userId, parsed.data);
        return new Response(JSON.stringify(result), {
          status: result.success ? 200 : 400,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
