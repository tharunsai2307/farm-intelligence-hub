import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type DataAvailabilityStatus = {
  weather_api: "not_configured";
  soil_sensors: "not_configured" | "no_records" | "has_records";
  crop_images: "no_records" | "has_records";
  irrigation_records: "no_records" | "has_records";
  yield_records: "not_available";
  farm_plots: "none" | "has_records";
  reports: "not_available";
  farm_location: "missing" | "set";
};

export type ActivityItem = {
  id: string;
  kind: "plot" | "soil" | "irrigation" | "observation";
  title: string;
  timestamp: string;
};

export type DashboardSummary = {
  counts: {
    farms: number;
    plots: number;
    soil_records: number;
    irrigation_records: number;
    crop_observations: number;
  };
  availability: DataAvailabilityStatus;
  recent: ActivityItem[];
  last_updated: string;
};

export const getDashboardSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<DashboardSummary> => {
    const sb = context.supabase;

    const [
      farms,
      plots,
      soil,
      irrigation,
      observations,
      farmLocations,
    ] = await Promise.all([
      sb.from("farms").select("id", { count: "exact", head: true }).is("deleted_at", null),
      sb.from("farm_plots").select("id", { count: "exact", head: true }).is("deleted_at", null),
      sb.from("soil_records").select("id", { count: "exact", head: true }).is("deleted_at", null),
      sb.from("irrigation_records").select("id", { count: "exact", head: true }).is("deleted_at", null),
      sb.from("crop_observations").select("id", { count: "exact", head: true }).is("deleted_at", null),
      sb.from("farm_locations").select("id", { count: "exact", head: true }),
    ]);

    const [recentPlots, recentSoil, recentIrr, recentObs] = await Promise.all([
      sb
        .from("farm_plots")
        .select("id, name, created_at")
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(5),
      sb
        .from("soil_records")
        .select("id, recorded_at")
        .is("deleted_at", null)
        .order("recorded_at", { ascending: false })
        .limit(5),
      sb
        .from("irrigation_records")
        .select("id, started_at, method")
        .is("deleted_at", null)
        .order("started_at", { ascending: false })
        .limit(5),
      sb
        .from("crop_observations")
        .select("id, recorded_at, crop_stage")
        .is("deleted_at", null)
        .order("recorded_at", { ascending: false })
        .limit(5),
    ]);

    const recent: ActivityItem[] = [];
    for (const r of recentPlots.data ?? []) {
      recent.push({
        id: `plot-${r.id}`,
        kind: "plot",
        title: `Plot created — ${r.name}`,
        timestamp: r.created_at as string,
      });
    }
    for (const r of recentSoil.data ?? []) {
      recent.push({
        id: `soil-${r.id}`,
        kind: "soil",
        title: "Soil record added",
        timestamp: r.recorded_at as string,
      });
    }
    for (const r of recentIrr.data ?? []) {
      recent.push({
        id: `irr-${r.id}`,
        kind: "irrigation",
        title: `Irrigation logged${r.method ? ` — ${r.method}` : ""}`,
        timestamp: r.started_at as string,
      });
    }
    for (const r of recentObs.data ?? []) {
      recent.push({
        id: `obs-${r.id}`,
        kind: "observation",
        title: `Crop observation${r.crop_stage ? ` — ${r.crop_stage}` : ""}`,
        timestamp: r.recorded_at as string,
      });
    }
    recent.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));

    const availability: DataAvailabilityStatus = {
      weather_api: "not_configured",
      soil_sensors: (soil.count ?? 0) > 0 ? "has_records" : "no_records",
      crop_images: (observations.count ?? 0) > 0 ? "has_records" : "no_records",
      irrigation_records: (irrigation.count ?? 0) > 0 ? "has_records" : "no_records",
      yield_records: "not_available",
      farm_plots: (plots.count ?? 0) > 0 ? "has_records" : "none",
      reports: "not_available",
      farm_location: (farmLocations.count ?? 0) > 0 ? "set" : "missing",
    };

    return {
      counts: {
        farms: farms.count ?? 0,
        plots: plots.count ?? 0,
        soil_records: soil.count ?? 0,
        irrigation_records: irrigation.count ?? 0,
        crop_observations: observations.count ?? 0,
      },
      availability,
      recent: recent.slice(0, 10),
      last_updated: new Date().toISOString(),
    };
  });
