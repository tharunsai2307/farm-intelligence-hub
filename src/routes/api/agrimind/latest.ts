/**
 * GET /api/agrimind/latest?farm_id=uuid
 */
import { createFileRoute } from "@tanstack/react-router";
import { getRequestSupabase, jsonError } from "@/lib/server/request-auth.server";

export const Route = createFileRoute("/api/agrimind/latest")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = await getRequestSupabase(request);
        if (!auth) return jsonError("Unauthorized", 401);
        const url = new URL(request.url);
        const farmId = url.searchParams.get("farm_id") ?? undefined;
        const { getLatestRecommendation } = await import("@/lib/services/agrimind.server");
        const result = await getLatestRecommendation(auth.supabase, farmId);
        return new Response(JSON.stringify(result), {
          status: result.success ? 200 : 500,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
