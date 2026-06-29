/**
 * GET /api/agrimind/history?farm_id=uuid&include_dismissed=1
 */
import { createFileRoute } from "@tanstack/react-router";
import { getRequestSupabase, jsonError } from "@/lib/server/request-auth.server";

export const Route = createFileRoute("/api/agrimind/history")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = await getRequestSupabase(request);
        if (!auth) return jsonError("Unauthorized", 401);
        const url = new URL(request.url);
        const farmId = url.searchParams.get("farm_id") ?? undefined;
        const includeDismissed = url.searchParams.get("include_dismissed") === "1";
        const { listRecommendations } = await import("@/lib/services/agrimind.server");
        const result = await listRecommendations(auth.supabase, {
          farmId,
          includeDismissed,
        });
        return new Response(JSON.stringify(result), {
          status: result.success ? 200 : 500,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
