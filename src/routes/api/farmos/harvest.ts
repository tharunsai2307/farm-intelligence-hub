/** GET/POST/DELETE /api/farmos/harvest */
import { createFileRoute } from "@tanstack/react-router";
import { getRequestSupabase, jsonError } from "@/lib/server/request-auth.server";

export const Route = createFileRoute("/api/farmos/harvest")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = await getRequestSupabase(request);
        if (!auth) return jsonError("Unauthorized", 401);
        const farmId = new URL(request.url).searchParams.get("farm_id") ?? undefined;
        const { listHarvests } = await import("@/lib/services/farmos.server");
        const result = await listHarvests(auth.supabase, farmId);
        return new Response(JSON.stringify(result), {
          status: result.success ? 200 : 500,
          headers: { "Content-Type": "application/json" },
        });
      },
      POST: async ({ request }) => {
        const auth = await getRequestSupabase(request);
        if (!auth) return jsonError("Unauthorized", 401);
        let body: any;
        try {
          body = await request.json();
        } catch {
          return jsonError("Invalid JSON", 400);
        }
        const { upsertHarvest } = await import("@/lib/services/farmos.server");
        const result = await upsertHarvest(auth.supabase, auth.userId, body);
        return new Response(JSON.stringify(result), {
          status: result.success ? 200 : 400,
          headers: { "Content-Type": "application/json" },
        });
      },
      DELETE: async ({ request }) => {
        const auth = await getRequestSupabase(request);
        if (!auth) return jsonError("Unauthorized", 401);
        const id = new URL(request.url).searchParams.get("id");
        if (!id) return jsonError("Missing id", 400);
        const { softDeleteHarvest } = await import("@/lib/services/farmos.server");
        const result = await softDeleteHarvest(auth.supabase, id);
        return new Response(JSON.stringify(result), {
          status: result.success ? 200 : 400,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
