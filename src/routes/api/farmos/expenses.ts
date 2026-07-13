/** GET/POST/DELETE /api/farmos/expenses */
import { createFileRoute } from "@tanstack/react-router";
import { getRequestSupabase, jsonError } from "@/lib/server/request-auth.server";

export const Route = createFileRoute("/api/farmos/expenses")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = await getRequestSupabase(request);
        if (!auth) return jsonError("Unauthorized", 401);
        const u = new URL(request.url);
        const { listExpenses } = await import("@/lib/services/farmos.server");
        const result = await listExpenses(auth.supabase, {
          farmId: u.searchParams.get("farm_id") ?? undefined,
          from: u.searchParams.get("from") ?? undefined,
          to: u.searchParams.get("to") ?? undefined,
          category: (u.searchParams.get("category") ?? undefined) as any,
        });
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
        const { upsertExpense } = await import("@/lib/services/farmos.server");
        const result = await upsertExpense(auth.supabase, auth.userId, body);
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
        const { softDeleteExpense } = await import("@/lib/services/farmos.server");
        const result = await softDeleteExpense(auth.supabase, id);
        return new Response(JSON.stringify(result), {
          status: result.success ? 200 : 400,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
