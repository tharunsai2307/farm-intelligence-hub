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

        const lovableKey = process.env.LOVABLE_API_KEY;
        const gmapsKey = process.env.GOOGLE_MAPS_API_KEY;
        const legacyKey = process.env.GOOGLE_EARTH_ENGINE_API_KEY;
        if (!legacyKey && !(lovableKey && gmapsKey))
          return jsonError("Satellite provider not configured", 503);

        const url = new URL(request.url);
        const farmId = url.searchParams.get("farm_id");
        if (!farmId) return jsonError("farm_id required", 400);

        const zoom = Number(url.searchParams.get("zoom") ?? "16");
        const w = Math.min(Number(url.searchParams.get("w") ?? "640"), 640);
        const h = Math.min(Number(url.searchParams.get("h") ?? "400"), 640);

        const { data: farm, error } = await auth.supabase
          .from("farm_locations")
          .select("latitude, longitude")
          .eq("farm_id", farmId)
          .maybeSingle();
        if (error) return jsonError(error.message, 400);
        if (!farm || farm.latitude == null || farm.longitude == null)
          return jsonError("Farm has no GPS coordinates", 400);

        const params = new URLSearchParams({
          center: `${farm.latitude},${farm.longitude}`,
          zoom: String(zoom),
          size: `${w}x${h}`,
          maptype: "satellite",
          scale: "2",
        });
        params.append("markers", `color:red|${farm.latitude},${farm.longitude}`);

        const useGateway = Boolean(lovableKey && gmapsKey);
        const endpoint = useGateway
          ? `https://connector-gateway.lovable.dev/google_maps/maps/api/staticmap?${params.toString()}`
          : `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}&key=${legacyKey}`;

        const upstream = await fetch(
          endpoint,
          useGateway
            ? {
                headers: {
                  Authorization: `Bearer ${lovableKey}`,
                  "X-Connection-Api-Key": gmapsKey as string,
                },
              }
            : undefined,
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
