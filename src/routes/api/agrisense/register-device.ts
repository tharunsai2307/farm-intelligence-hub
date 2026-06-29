/**
 * POST /api/agrisense/register-device
 * Body: { farm_id, device_name, device_type, ... }
 */
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getRequestSupabase, jsonError } from "@/lib/server/request-auth.server";

const Body = z.object({
  farm_id: z.string().uuid(),
  plot_id: z.string().uuid().nullable().optional(),
  device_name: z.string().trim().min(1).max(120),
  device_type: z.enum([
    "esp32",
    "arduino",
    "lora",
    "mqtt",
    "weather_station",
    "soil_probe",
    "camera",
    "other",
  ]),
  manufacturer: z.string().max(120).nullable().optional(),
  serial_number: z.string().max(120).nullable().optional(),
  firmware_version: z.string().max(60).nullable().optional(),
});

export const Route = createFileRoute("/api/agrisense/register-device")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = await getRequestSupabase(request);
        if (!auth) return jsonError("Unauthorized", 401);
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return jsonError("Invalid JSON", 400);
        }
        const parsed = Body.safeParse(body);
        if (!parsed.success) return jsonError("Invalid input", 400);
        const { registerDevice } = await import("@/lib/services/agrisense.server");
        const result = await registerDevice(auth.supabase, auth.userId, parsed.data);
        return new Response(JSON.stringify(result), {
          status: result.success ? 200 : 400,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
