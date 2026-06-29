/** GET (farm_id, from, to) / POST / DELETE /api/farmos/calendar */
import { createFileRoute } from "@tanstack/react-router";
import { getRequestSupabase, jsonError } from "@/lib/server/request-auth.server";

export const Route = createFileRoute("/api/farmos/calendar")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = await getRequestSupabase(request);
        if (!auth) return jsonError("Unauthorized", 401);
        const u = new URL(request.url);
        const from = u.searchParams.get("from");
        const to = u.searchParams.get("to");
        if (!from || !to) return jsonError("Missing from/to", 400);
        const { listCalendar } = await import("@/lib/services/farmos.server");
        const result = await listCalendar(auth.supabase, {
          farmId: u.searchParams.get("farm_id") ?? undefined,
          from,
          to,
        });
        return new Response(JSON.stringify(result), { status: result.success ? 200 : 500, headers: { "Content-Type": "application/json" } });
      },
      POST: async ({ request }) => {
        const auth = await getRequestSupabase(request);
        if (!auth) return jsonError("Unauthorized", 401);
        let body: any;
        try { body = await request.json(); } catch { return jsonError("Invalid JSON", 400); }
        const { upsertCalendarEvent } = await import("@/lib/services/farmos.server");
        const result = await upsertCalendarEvent(auth.supabase, auth.userId, body);
        return new Response(JSON.stringify(result), { status: result.success ? 200 : 400, headers: { "Content-Type": "application/json" } });
      },
      DELETE: async ({ request }) => {
        const auth = await getRequestSupabase(request);
        if (!auth) return jsonError("Unauthorized", 401);
        const id = new URL(request.url).searchParams.get("id");
        if (!id) return jsonError("Missing id", 400);
        const { softDeleteCalendarEvent } = await import("@/lib/services/farmos.server");
        const result = await softDeleteCalendarEvent(auth.supabase, id);
        return new Response(JSON.stringify(result), { status: result.success ? 200 : 400, headers: { "Content-Type": "application/json" } });
      },
    },
  },
});
