/**
 * POST /api/agrimind/recommend
 * Body: { farm_id: uuid, language?: "en" | "ta" | "te" }
 * Generates new recommendations from real data. Auth via Bearer token.
 */
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getRequestSupabase, jsonError } from "@/lib/server/request-auth.server";

const Body = z.object({
  farm_id: z.string().uuid(),
  language: z.enum(["en", "ta", "te"]).optional(),
});

export const Route = createFileRoute("/api/agrimind/recommend")({
  server: {
    handlers: {
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
        const { generateRecommendations } = await import("@/lib/services/agrimind.server");
        const result = await generateRecommendations(auth.supabase, auth.userId, parsed.data);
        return new Response(JSON.stringify(result), {
          status: result.success ? 200 : 502,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
