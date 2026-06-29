/**
 * GET /api/agrisense/satellite-image?farm_id=uuid&zoom=16&w=640&h=400
 *
 * Proxies Google Maps Static API ("satellite" map type) using the server-side
 * GOOGLE_EARTH_ENGINE_API_KEY so the key is never exposed to the browser.
 * Returns the raw image bytes for the farm's GPS location.
 */
import { createFileRoute } from "@tanstack/react-router";
import { getRequestSupabase, jsonError } from "@/lib/server/request-auth.server";

export const Route = createFileRoute("/api/agrisense/satellite-image")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = await getRequestSupabase(request);
        if (!auth) return jsonError("Unauthorized", 401);

        const apiKey = process.env.GOOGLE_EARTH_ENGINE_API_KEY;
        if (!apiKey) return jsonError("Satellite provider not configured", 503);

        const url = new URL(request.url);
        const farmId = url.searchParams.get("farm_id");
        if (!farmId) return jsonError("farm_id required", 400);

        const zoom = Number(url.searchParams.get("zoom") ?? "16");
        const w = Math.min(Number(url.searchParams.get("w") ?? "640"), 640);
        const h = Math.min(Number(url.searchParams.get("h") ?? "400"), 640);

        const { data: farm, error } = await auth.supabase
          .from("farms")
          .select("latitude, longitude, name")
          .eq("id", farmId)
          .single();
        if (error || !farm) return jsonError("Farm not found", 404);
        if (farm.latitude == null || farm.longitude == null)
          return jsonError("Farm has no GPS coordinates", 400);

        const params = new URLSearchParams({
          center: `${farm.latitude},${farm.longitude}`,
          zoom: String(zoom),
          size: `${w}x${h}`,
          maptype: "satellite",
          scale: "2",
          key: apiKey,
        });
        params.append("markers", `color:red|${farm.latitude},${farm.longitude}`);

        const upstream = await fetch(
          `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`,
        );
        if (!upstream.ok) {
          const text = await upstream.text().catch(() => "");
          return jsonError(`Upstream error: ${upstream.status} ${text}`.trim(), 502);
        }

        return new Response(upstream.body, {
          status: 200,
          headers: {
            "content-type": upstream.headers.get("content-type") ?? "image/png",
            "cache-control": "private, max-age=600",
          },
        });
      },
    },
  },
});
