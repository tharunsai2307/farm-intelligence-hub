/**
 * GET /api/agrisense/satellite?farm_id=uuid
 * Lists stored satellite records. Live fetching from Sentinel/GEE/Planet is
 * intentionally not implemented in Phase 2 — we never fabricate NDVI. When no
 * provider key is configured, the route still returns whatever the user has
 * imported, plus the configured status.
 */
import { createFileRoute } from "@tanstack/react-router";
import { getRequestSupabase, jsonError, jsonOk } from "@/lib/server/request-auth.server";

export const Route = createFileRoute("/api/agrisense/satellite")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = await getRequestSupabase(request);
        if (!auth) return jsonError("Unauthorized", 401);
        const url = new URL(request.url);
        const farmId = url.searchParams.get("farm_id");
        if (!farmId) return jsonError("farm_id required", 400);
        const { listSatelliteRecords, isSatelliteConfigured } =
          await import("@/lib/services/agrisense.server");
        const result = await listSatelliteRecords(auth.supabase, farmId);
        return jsonOk({
          configured: isSatelliteConfigured(),
          records: result.success ? result.data : [],
          error: result.success ? null : result.error,
        });
      },
    },
  },
});
