/** GET/POST/DELETE /api/farmos/tasks */
import { createFileRoute } from "@tanstack/react-router";
import { getRequestSupabase, jsonError } from "@/lib/server/request-auth.server";

export const Route = createFileRoute("/api/farmos/tasks")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = await getRequestSupabase(request);
        if (!auth) return jsonError("Unauthorized", 401);
        const url = new URL(request.url);
        const farmId = url.searchParams.get("farm_id") ?? undefined;
        const status = (url.searchParams.get("status") ?? undefined) as any;
        const workerId = url.searchParams.get("worker_id") ?? undefined;
        const { listTasks } = await import("@/lib/services/farmos.server");
        const result = await listTasks(auth.supabase, { farmId, status, workerId });
        return new Response(JSON.stringify(result), { status: result.success ? 200 : 500, headers: { "Content-Type": "application/json" } });
      },
      POST: async ({ request }) => {
        const auth = await getRequestSupabase(request);
        if (!auth) return jsonError("Unauthorized", 401);
        let body: any;
        try { body = await request.json(); } catch { return jsonError("Invalid JSON", 400); }
        if (body?.from_recommendation_id) {
          const { createTaskFromRecommendation } = await import("@/lib/services/farmos.server");
          const result = await createTaskFromRecommendation(auth.supabase, auth.userId, {
            recommendation_id: body.from_recommendation_id,
            due_date: body.due_date ?? null,
            worker_id: body.worker_id ?? null,
          });
          return new Response(JSON.stringify(result), { status: result.success ? 200 : 400, headers: { "Content-Type": "application/json" } });
        }
        const { upsertTask } = await import("@/lib/services/farmos.server");
        const result = await upsertTask(auth.supabase, auth.userId, body);
        return new Response(JSON.stringify(result), { status: result.success ? 200 : 400, headers: { "Content-Type": "application/json" } });
      },
      DELETE: async ({ request }) => {
        const auth = await getRequestSupabase(request);
        if (!auth) return jsonError("Unauthorized", 401);
        const id = new URL(request.url).searchParams.get("id");
        if (!id) return jsonError("Missing id", 400);
        const { softDeleteTask } = await import("@/lib/services/farmos.server");
        const result = await softDeleteTask(auth.supabase, id);
        return new Response(JSON.stringify(result), { status: result.success ? 200 : 400, headers: { "Content-Type": "application/json" } });
      },
    },
  },
});
