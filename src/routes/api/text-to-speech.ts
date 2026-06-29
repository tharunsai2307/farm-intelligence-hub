/**
 * POST /api/text-to-speech { text, language: "en"|"ta"|"te" }
 * Returns base64-encoded MP3.
 */
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getRequestSupabase, jsonError } from "@/lib/server/request-auth.server";

const Body = z.object({ text: z.string().max(2000), language: z.enum(["en", "ta", "te"]) });

export const Route = createFileRoute("/api/text-to-speech")({
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
        const { speakText } = await import("@/lib/services/agrimind.server");
        const result = await speakText(parsed.data.text, parsed.data.language);
        return new Response(JSON.stringify(result), {
          status: result.success ? 200 : 502,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
