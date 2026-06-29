/**
 * POST /api/translate { text, target: "en"|"ta"|"te" }
 */
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getRequestSupabase, jsonError } from "@/lib/server/request-auth.server";

const Body = z.object({ text: z.string().max(4000), target: z.enum(["en", "ta", "te"]) });

export const Route = createFileRoute("/api/translate")({
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
        const { translateText } = await import("@/lib/services/agrimind.server");
        const result = await translateText(parsed.data.text, parsed.data.target);
        return new Response(JSON.stringify(result), {
          status: result.success ? 200 : 502,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
