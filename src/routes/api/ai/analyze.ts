/**
 * Public-ish API route for triggering an AI crop analysis from external
 * tooling (e.g. mobile shell, CLI). Auth-required via Supabase bearer
 * token — same security as the server function.
 *
 * Body: { farm_id, plot_id?, crop_type?, image_path, language? }
 */
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getAuthedSupabaseFromRequest } from "@/lib/server/request-auth.server";

const BodySchema = z.object({
  farm_id: z.string().uuid(),
  plot_id: z.string().uuid().nullable().optional(),
  crop_type: z.string().max(80).nullable().optional(),
  image_path: z.string().min(1),
  language: z.enum(["en", "ta", "te", "hi"]).optional(),
});

export const Route = createFileRoute("/api/ai/analyze")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = await getAuthedSupabaseFromRequest(request);
        if (!auth) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ error: "Invalid JSON" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const parsed = BodySchema.safeParse(body);
        if (!parsed.success) {
          return new Response(
            JSON.stringify({ error: "Invalid input", details: parsed.error.flatten() }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        const { analyzeCrop } = await import("@/lib/services/ai-crop.server");
        const result = await analyzeCrop(auth.supabase, auth.userId, parsed.data);
        return new Response(JSON.stringify(result), {
          status: result.success ? 200 : 502,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
