/** GET/POST/DELETE /api/farmos/workers */
import { createFileRoute } from "@tanstack/react-router";
import { getRequestSupabase, jsonError } from "@/lib/server/request-auth.server";

export const Route = createFileRoute("/api/farmos/workers")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = await getRequestSupabase(request);
        if (!auth) return jsonError("Unauthorized", 401);
        const url = new URL(request.url);
        const farmId = url.searchParams.get("farm_id") ?? undefined;
        const { listWorkers } = await import("@/lib/services/farmos.server");
        const result = await listWorkers(auth.supabase, farmId);
        return new Response(JSON.stringify(result), { status: result.success ? 200 : 500, headers: { "Content-Type": "application/json" } });
      },
      POST: async ({ request }) => {
        const auth = await getRequestSupabase(request);
        if (!auth) return jsonError("Unauthorized", 401);
        let body: any;
        try { body = await request.json(); } catch { return jsonError("Invalid JSON", 400); }
        const { upsertWorker } = await import("@/lib/services/farmos.server");
        const result = await upsertWorker(auth.supabase, auth.userId, body);
        return new Response(JSON.stringify(result), { status: result.success ? 200 : 400, headers: { "Content-Type": "application/json" } });
      },
      DELETE: async ({ request }) => {
        const auth = await getRequestSupabase(request);
        if (!auth) return jsonError("Unauthorized", 401);
        const id = new URL(request.url).searchParams.get("id");
        if (!id) return jsonError("Missing id", 400);
        const { softDeleteWorker } = await import("@/lib/services/farmos.server");
        const result = await softDeleteWorker(auth.supabase, id);
        return new Response(JSON.stringify(result), { status: result.success ? 200 : 400, headers: { "Content-Type": "application/json" } });
      },
    },
  },
});
