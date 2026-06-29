import { createFileRoute } from "@tanstack/react-router";

async function handle(request: Request) {
  const { getRequestSupabase, jsonError, jsonOk } = await import(
    "@/lib/server/request-auth.server"
  );
  const auth = await getRequestSupabase(request);
  if (!auth) return jsonError("Unauthorized", 401);
  const url = new URL(request.url);
  const farmId = url.searchParams.get("farmId");
  if (!farmId) return jsonError("farmId is required", 400);
  const { getCurrentWeatherByFarm } = await import("@/lib/services/weather.server");
  const result = await getCurrentWeatherByFarm(auth.supabase, farmId);
  return result.success ? jsonOk(result.data) : jsonError(result.error, 400);
}

export const Route = createFileRoute("/api/weather/current")({
  server: { handlers: { GET: async ({ request }) => handle(request) } },
});
