import { createFileRoute } from "@tanstack/react-router";

async function handle(request: Request) {
  const { getRequestSupabase, jsonError, jsonOk } = await import(
    "@/lib/server/request-auth.server"
  );
  const auth = await getRequestSupabase(request);
  if (!auth) return jsonError("Unauthorized", 401);

  let body: { farmId?: string } = {};
  try {
    body = (await request.json()) as { farmId?: string };
  } catch {
    return jsonError("Invalid JSON body", 400);
  }
  if (!body.farmId) return jsonError("farmId is required", 400);

  const { syncWeatherForFarm } = await import("@/lib/services/weather.server");
  const result = await syncWeatherForFarm(auth.supabase, auth.userId, body.farmId);
  return result.success ? jsonOk(result.data) : jsonError(result.error, 400);
}

export const Route = createFileRoute("/api/weather/sync")({
  server: { handlers: { POST: async ({ request }) => handle(request) } },
});
