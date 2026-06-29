/**
 * GET  /api/agrisense/sensors?farm_id=uuid[&device_id=uuid][&limit=N]
 *      List readings for a farm (optionally a single device).
 * POST /api/agrisense/sensors
 *      Ingest a single reading. Body: { device_id, sensor_type, value, unit?, recorded_at? }
 */
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getRequestSupabase, jsonError } from "@/lib/server/request-auth.server";

const IngestBody = z.object({
  device_id: z.string().uuid(),
  sensor_type: z.string().trim().min(1).max(60),
  value: z.number().finite(),
  unit: z.string().trim().max(20).nullable().optional(),
  recorded_at: z.string().datetime().optional(),
});

export const Route = createFileRoute("/api/agrisense/sensors")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = await getRequestSupabase(request);
        if (!auth) return jsonError("Unauthorized", 401);
        const url = new URL(request.url);
        const farmId = url.searchParams.get("farm_id") ?? undefined;
        const deviceId = url.searchParams.get("device_id") ?? undefined;
        const limit = Number(url.searchParams.get("limit") ?? "100");
        const { listReadings } = await import("@/lib/services/agrisense.server");
        const result = await listReadings(auth.supabase, {
          farmId,
          deviceId,
          limit: Number.isFinite(limit) ? Math.min(500, Math.max(1, limit)) : 100,
        });
        return new Response(JSON.stringify(result), {
          status: result.success ? 200 : 500,
          headers: { "Content-Type": "application/json" },
        });
      },
      POST: async ({ request }) => {
        const auth = await getRequestSupabase(request);
        if (!auth) return jsonError("Unauthorized", 401);
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return jsonError("Invalid JSON", 400);
        }
        const parsed = IngestBody.safeParse(body);
        if (!parsed.success) return jsonError("Invalid input", 400);
        const { ingestReading } = await import("@/lib/services/agrisense.server");
        const result = await ingestReading(auth.supabase, auth.userId, parsed.data);
        return new Response(JSON.stringify(result), {
          status: result.success ? 200 : 400,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
