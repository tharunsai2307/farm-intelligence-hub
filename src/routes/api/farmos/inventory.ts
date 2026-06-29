/**
 * GET  /api/farmos/inventory?farm_id=uuid
 * POST /api/farmos/inventory   { item payload }
 * DELETE /api/farmos/inventory?id=uuid   (soft-delete)
 */
import { createFileRoute } from "@tanstack/react-router";
import { getRequestSupabase, jsonError } from "@/lib/server/request-auth.server";

export const Route = createFileRoute("/api/farmos/inventory")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = await getRequestSupabase(request);
        if (!auth) return jsonError("Unauthorized", 401);
        const url = new URL(request.url);
        const farmId = url.searchParams.get("farm_id") ?? undefined;
        const { listInventory } = await import("@/lib/services/farmos.server");
        const result = await listInventory(auth.supabase, { farmId });
        return new Response(JSON.stringify(result), { status: result.success ? 200 : 500, headers: { "Content-Type": "application/json" } });
      },
      POST: async ({ request }) => {
        const auth = await getRequestSupabase(request);
        if (!auth) return jsonError("Unauthorized", 401);
        let body: any;
        try { body = await request.json(); } catch { return jsonError("Invalid JSON", 400); }
        const { upsertInventory } = await import("@/lib/services/farmos.server");
        const result = await upsertInventory(auth.supabase, auth.userId, body);
        return new Response(JSON.stringify(result), { status: result.success ? 200 : 400, headers: { "Content-Type": "application/json" } });
      },
      DELETE: async ({ request }) => {
        const auth = await getRequestSupabase(request);
        if (!auth) return jsonError("Unauthorized", 401);
        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        if (!id) return jsonError("Missing id", 400);
        const { softDeleteInventory } = await import("@/lib/services/farmos.server");
        const result = await softDeleteInventory(auth.supabase, id);
        return new Response(JSON.stringify(result), { status: result.success ? 200 : 400, headers: { "Content-Type": "application/json" } });
      },
    },
  },
});
