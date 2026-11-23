/**
 * GET /api/agrisense/satellite-image?farm_id=uuid&zoom=16&w=640&h=400
 *
 * Proxies Google Maps Static API ("satellite" map type) using the server-side
 * GOOGLE_EARTH_ENGINE_API_KEY so the key is never exposed to the browser.
 * Returns the raw image bytes for the farm's GPS location.
 */
import { createFileRoute } from "@tanstack/react-router";
import { getRequestSupabase, jsonError } from "@/lib/server/request-auth.server";
import { z } from "zod";

const imageQuery = z.object({
  farm_id: z.string().uuid(),
  zoom: z.coerce.number().int().min(0).max(21).default(16),
  w: z.coerce.number().int().min(1).max(640).default(640),
  h: z.coerce.number().int().min(1).max(640).default(400),
});

export const Route = createFileRoute("/api/agrisense/satellite-image")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = await getRequestSupabase(request);
        if (!auth) return jsonError("Unauthorized", 401);

        const lovableKey = process.env["LOVABLE_API_KEY"];
        const gmapsKey = process.env["GOOGLE_MAPS_API_KEY"];
        const legacyKey = process.env["GOOGLE_EARTH_ENGINE_API_KEY"];
        if (!legacyKey && !(lovableKey && gmapsKey))
          return jsonError("Satellite provider not configured", 503);

        const url = new URL(request.url);
        const parsed = imageQuery.safeParse(Object.fromEntries(url.searchParams));
        if (!parsed.success) return jsonError("Invalid farm ID or image dimensions", 400);
        const { farm_id: farmId, zoom, w, h } = parsed.data;

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

        let upstream: Response;
        try { upstream = await fetch(
          endpoint,
          useGateway
            ? {
                headers: {
                  Authorization: `Bearer ${lovableKey}`,
                  "X-Connection-Api-Key": gmapsKey as string,
                },
              }
            : undefined,
        ); } catch { return jsonError("Satellite service could not be reached. Please try again.", 502); }
        if (!upstream.ok) {
          const text = await upstream.text().catch(() => "");
          if (upstream.status === 403) {
            if (text.includes("API_KEY_HTTP_REFERRER_BLOCKED")) return jsonError("The satellite server key is website-restricted. Set only the server key's restrictions to None or IP addresses in Google Cloud Console.", 403);
            if (text.includes("API_KEY_SERVICE_BLOCKED")) return jsonError("The satellite server key does not allow Maps Static API. Enable that API and add it to the server key's allowed APIs, or use the managed browser key on your published site.", 403);
            return jsonError("Google denied satellite imagery (403). Check billing and Maps Static API permissions on the server key, or use the managed browser key on your published site.", 403);
          }
          return jsonError(`Upstream error: ${upstream.status} ${text}`.trim(), 502);
        }

        if (!upstream.headers.get("content-type")?.startsWith("image/"))
          return jsonError("The satellite provider did not return an image", 502);

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
