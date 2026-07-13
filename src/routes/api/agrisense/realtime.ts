/**
 * GET /api/agrisense/realtime?farm_id=uuid
 *
 * Returns the latest reading per (device, sensor_type) for a farm, plus the
 * current state of every device. Suitable for short-poll fallback when WS is
 * unavailable. Realtime push is handled directly by Supabase channels on the
 * client; this endpoint is the on-demand snapshot.
 */
import { createFileRoute } from "@tanstack/react-router";
import { getRequestSupabase, jsonError, jsonOk } from "@/lib/server/request-auth.server";

export const Route = createFileRoute("/api/agrisense/realtime")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = await getRequestSupabase(request);
        if (!auth) return jsonError("Unauthorized", 401);
        const url = new URL(request.url);
        const farmId = url.searchParams.get("farm_id");
        if (!farmId) return jsonError("farm_id required", 400);
        const { getLatestReadings, listDevices } = await import("@/lib/services/agrisense.server");
        const [readings, devices] = await Promise.all([
          getLatestReadings(auth.supabase, farmId),
          listDevices(auth.supabase, farmId),
        ]);
        return jsonOk({
          latest_readings: readings.success ? readings.data : [],
          devices: devices.success ? devices.data : [],
          server_time: new Date().toISOString(),
        });
      },
    },
  },
});
