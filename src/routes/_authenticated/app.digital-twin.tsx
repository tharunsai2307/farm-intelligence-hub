/**
 * Digital Farm Twin — /app/digital-twin
 *
 * Phase 2 Part 4: the static dashboard becomes a living representation of the
 * farm. Each plot card overlays *real* signals (sensors, observations,
 * irrigation, crop AI, AgriMind, weather) and only when data actually exists.
 *
 * Realtime updates flow from Supabase Realtime channels for sensor readings,
 * farm recommendations, and crop analysis. There is no fake data anywhere on
 * this page.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Boxes,
  Check,
  CircleDashed,
  CloudSun,
  Plus,
  Leaf,
  Droplets,
  Eye,
  FlaskConical,
  MapPin,
  Activity,
  Bot,
} from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { CardSkeleton } from "@/components/common/loading-skeleton";
import { DataCompletenessBadge } from "@/components/common/data-completeness-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { RealtimeIndicator } from "@/components/agrisense/realtime-indicator";
import { FarmTimeline, type TimelineEvent } from "@/components/agrisense/farm-timeline";
import { TwinStatusPanel, type TwinStatusItem } from "@/components/agrisense/twin-status-panel";

import { getFarmLocation, getPrimaryFarm } from "@/lib/services/farms.functions";
import { listFarmPlots, type FarmPlotRow } from "@/lib/services/farm-plots.functions";
import {
  listCropObservations,
  listIrrigationRecords,
  listSoilRecords,
} from "@/lib/services/records.functions";
import {
  getLatestSensorReadings,
  listSensorDevices,
} from "@/lib/services/agrisense.service";
import { getCurrentWeatherByFarm } from "@/lib/services/weather.service";
import { listAgriMindRecommendations } from "@/lib/services/agrimind.service";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/app/digital-twin")({
  head: () => ({
    meta: [
      { title: "Digital Farm Twin — AgriTwin OS" },
      { name: "description", content: "Living digital replica of your farm: plots, sensors, satellite signals, and AI-driven recommendations updated in real time." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Digital Farm Twin — AgriTwin OS" },
      { property: "og:description", content: "A real-time digital twin of your farm combining IoT, satellite, and AI insight into one operational view." },
      { property: "og:url", content: "https://agri-twin-os.lovable.app/app/digital-twin" },
    ],
    links: [{ rel: "canonical", href: "https://agri-twin-os.lovable.app/app/digital-twin" }],
  }),
  component: DigitalTwinPage,
});

const REQUIRED_FIELDS: Array<keyof FarmPlotRow> = [
  "name",
  "crop",
  "area",
  "soil_type",
  "irrigation_type",
];
function completeness(p: FarmPlotRow) {
  const filled = REQUIRED_FIELDS.filter((k) => {
    const v = p[k];
    return v !== null && v !== undefined && v !== "";
  }).length;
  return (filled / REQUIRED_FIELDS.length) * 100;
}

function DigitalTwinPage() {
  const qc = useQueryClient();
  const farmQ = useQuery({ queryKey: ["primary-farm"], queryFn: () => getPrimaryFarm() });
  const farm = farmQ.data?.farm;
  const farmId = farm?.id;

  const locQ = useQuery({
    queryKey: ["farm-location", farmId],
    queryFn: () => getFarmLocation({ data: { farm_id: farmId! } }),
    enabled: !!farmId,
  });
  const plotsQ = useQuery({
    queryKey: ["farm-plots", farmId],
    queryFn: () => listFarmPlots({ data: { farm_id: farmId! } }),
    enabled: !!farmId,
  });
  const soilQ = useQuery({
    queryKey: ["soil-records", farmId],
    queryFn: () => listSoilRecords({ data: { farm_id: farmId! } }),
    enabled: !!farmId,
  });
  const irrQ = useQuery({
    queryKey: ["irrigation-records", farmId],
    queryFn: () => listIrrigationRecords({ data: { farm_id: farmId! } }),
    enabled: !!farmId,
  });
  const obsQ = useQuery({
    queryKey: ["crop-observations", farmId],
    queryFn: () => listCropObservations({ data: { farm_id: farmId! } }),
    enabled: !!farmId,
  });
  const weatherQ = useQuery({
    queryKey: ["weather-current", farmId],
    queryFn: () => getCurrentWeatherByFarm({ data: { farmId: farmId! } }),
    enabled: !!farmId,
  });
  const devicesQ = useQuery({
    queryKey: ["agrisense", "devices", farmId],
    queryFn: () => listSensorDevices({ data: { farm_id: farmId! } }),
    enabled: !!farmId,
  });
  const sensorsQ = useQuery({
    queryKey: ["agrisense", "latest", farmId],
    queryFn: () => getLatestSensorReadings({ data: { farm_id: farmId! } }),
    enabled: !!farmId,
  });
  const recsQ = useQuery({
    queryKey: ["agrimind", "list", farmId],
    queryFn: () => listAgriMindRecommendations({ data: { farm_id: farmId! } }),
    enabled: !!farmId,
  });

  // ----- realtime: invalidate on inbound events -----
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [lastEventAt, setLastEventAt] = useState<string | null>(null);
  const farmRef = useRef(farmId);
  farmRef.current = farmId;
  useEffect(() => {
    if (!farmId) return;
    setRealtimeConnected(false);
    const ch = supabase
      .channel(`twin-${farmId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sensor_readings", filter: `farm_id=eq.${farmId}` },
        () => {
          setLastEventAt(new Date().toISOString());
          qc.invalidateQueries({ queryKey: ["agrisense", "latest", farmId] });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "farm_recommendations", filter: `farm_id=eq.${farmId}` },
        () => {
          setLastEventAt(new Date().toISOString());
          qc.invalidateQueries({ queryKey: ["agrimind", "list", farmId] });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "crop_analysis", filter: `farm_id=eq.${farmId}` },
        () => {
          setLastEventAt(new Date().toISOString());
        },
      )
      .subscribe((status) => setRealtimeConnected(status === "SUBSCRIBED"));
    return () => {
      supabase.removeChannel(ch);
    };
  }, [farmId, qc]);

  const plots = plotsQ.data?.items ?? [];
  const observations = obsQ.data?.items ?? [];
  const irrigations = irrQ.data?.items ?? [];
  const soils = soilQ.data?.items ?? [];
  const devices = devicesQ.data?.success ? devicesQ.data.data : [];
  const sensorReadings = sensorsQ.data?.success ? sensorsQ.data.data : [];
  const recommendations = recsQ.data?.success ? recsQ.data.data : [];

  const weatherSnapshot =
    weatherQ.data?.success && weatherQ.data.data ? weatherQ.data.data : null;
  const latestRec = recommendations[0] ?? null;

  // Per-plot latest data — keyed by plot_id.
  const plotData = useMemo(() => {
    const data = new Map<
      string,
      {
        latestObservation: (typeof observations)[number] | null;
        latestIrrigation: (typeof irrigations)[number] | null;
        latestSoil: (typeof soils)[number] | null;
        sensors: typeof sensorReadings;
        recommendation: (typeof recommendations)[number] | null;
      }
    >();
    for (const p of plots) {
      const sensors = sensorReadings.filter(
        (r) => r.plot_id === p.id || (!r.plot_id && devices.find((d) => d.id === r.device_id)?.plot_id === p.id),
      );
      data.set(p.id, {
        latestObservation:
          observations
            .filter((o) => o.plot_id === p.id)
            .sort((a, b) => (a.recorded_at < b.recorded_at ? 1 : -1))[0] ?? null,
        latestIrrigation:
          irrigations
            .filter((i) => i.plot_id === p.id)
            .sort((a, b) => (a.started_at < b.started_at ? 1 : -1))[0] ?? null,
        latestSoil:
          soils
            .filter((s) => s.plot_id === p.id)
            .sort((a, b) => (a.recorded_at < b.recorded_at ? 1 : -1))[0] ?? null,
        sensors,
        recommendation:
          recommendations.find((r) => r.plot_id === p.id) ?? null,
      });
    }
    return data;
  }, [plots, observations, irrigations, soils, sensorReadings, devices, recommendations]);

  // Twin live sources panel
  const twinSources: TwinStatusItem[] = [
    { label: "Farm location", state: locQ.data?.location ? "connected" : "unavailable", detail: locQ.data?.location ? undefined : "Set coordinates" },
    { label: "Plots", state: plots.length > 0 ? "connected" : "unavailable", detail: `${plots.length} created` },
    { label: "Weather", state: weatherSnapshot ? "connected" : "unavailable", detail: weatherSnapshot ? "Live" : "Not synced" },
    { label: "Sensors", state: sensorReadings.length > 0 ? "connected" : devices.length > 0 ? "partial" : "unavailable", detail: `${devices.length} devices · ${sensorReadings.length} live signals` },
    { label: "Crop observations", state: observations.length > 0 ? "connected" : "unavailable", detail: `${observations.length} logged` },
    { label: "AgriMind insights", state: recommendations.length > 0 ? "connected" : "unavailable", detail: `${recommendations.length} active` },
  ];

  // Timeline events (real only)
  const events: TimelineEvent[] = [];
  if (farm) {
    events.push({
      id: `f-${farm.id}`,
      ts: farm.created_at,
      kind: "farm_created",
      title: `Farm created — ${farm.name}`,
    });
  }
  for (const p of plots) {
    events.push({ id: `plot-${p.id}`, ts: p.created_at, kind: "plot", title: `Plot created — ${p.name}` });
  }
  for (const s of soils) {
    events.push({ id: `soil-${s.id}`, ts: s.recorded_at, kind: "soil", title: "Soil record added" });
  }
  for (const i of irrigations) {
    events.push({
      id: `irr-${i.id}`,
      ts: i.started_at,
      kind: "irrigation",
      title: `Irrigation — ${i.method ?? "—"}`,
      detail: i.volume_liters ? `${i.volume_liters} L` : undefined,
    });
  }
  for (const o of observations) {
    events.push({
      id: `obs-${o.id}`,
      ts: o.recorded_at,
      kind: "observation",
      title: `Observation — ${o.crop_stage ?? "—"}`,
    });
  }
  for (const r of recommendations) {
    events.push({
      id: `rec-${r.id}`,
      ts: r.created_at,
      kind: "recommendation",
      title: r.title ?? "AgriMind recommendation",
    });
  }
  for (const r of sensorReadings) {
    events.push({
      id: `sr-${r.id}`,
      ts: r.recorded_at,
      kind: "sensor",
      title: `${r.sensor_type}: ${r.value}${r.unit ? ` ${r.unit}` : ""}`,
    });
  }
  if (weatherSnapshot) {
    events.push({
      id: `w-${weatherSnapshot.id}`,
      ts: weatherSnapshot.recorded_at,
      kind: "weather",
      title: `Weather sync — ${weatherSnapshot.temp_c ?? "?"}°C`,
    });
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Digital Farm Twin"
        description="A living model of your farm built from real plots, sensors, weather, observations, and AgriMind insights."
        actions={
          <div className="flex items-center gap-2">
            <RealtimeIndicator connected={realtimeConnected} lastEventAt={lastEventAt} />
            <Button asChild>
              <Link to="/app/farm/plots">
                <Plus className="mr-2 h-4 w-4" /> Create plot
              </Link>
            </Button>
          </div>
        }
      />

      {farmQ.isLoading && <CardSkeleton />}
      {farmQ.isError && <ErrorState onRetry={() => farmQ.refetch()} />}
      {!farmQ.isLoading && !farm && (
        <EmptyState
          icon={Boxes}
          title="No farm available"
          description="Create your farm to build the digital twin."
          action={
            <Button asChild>
              <Link to="/onboarding/farm">Add farm</Link>
            </Button>
          }
        />
      )}

      {farm && (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Left: live plots + timeline */}
          <div className="space-y-8">
            <section>
              <header className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-muted-foreground">Interactive Farm Layout</h2>
                {weatherSnapshot && (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <CloudSun className="h-3.5 w-3.5" /> {weatherSnapshot.temp_c ?? "?"}°C
                    {weatherSnapshot.humidity != null ? ` · ${weatherSnapshot.humidity}% RH` : ""}
                  </span>
                )}
              </header>
              {plotsQ.isLoading && <CardSkeleton />}
              {plotsQ.isSuccess && plots.length === 0 && (
                <EmptyState
                  icon={Boxes}
                  title="No farm plots created yet"
                  description="The twin renders from real plots. Create your first plot to begin."
                  action={
                    <Button asChild>
                      <Link to="/app/farm/plots">
                        <Plus className="mr-2 h-4 w-4" /> Create First Plot
                      </Link>
                    </Button>
                  }
                />
              )}
              {plots.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                  {plots.map((p) => {
                    const d = plotData.get(p.id);
                    return (
                      <article
                        key={p.id}
                        className="surface-card group relative overflow-hidden p-4 transition hover:shadow-md"
                      >
                        <div
                          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500"
                          aria-hidden
                        />
                        <header className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold">{p.name}</h3>
                            <p className="truncate text-xs text-muted-foreground">
                              <Leaf className="mr-1 inline h-3 w-3" />
                              {p.crop ?? "No crop"}
                              {p.area ? ` · ${p.area} ${p.area_unit ?? "ha"}` : ""}
                            </p>
                          </div>
                          <DataCompletenessBadge percent={completeness(p)} />
                        </header>

                        <dl className="mt-3 grid grid-cols-2 gap-1.5 text-[11px]">
                          <Mini label="Soil" value={p.soil_type ?? "—"} />
                          <Mini label="Irrigation" value={p.irrigation_type ?? "—"} />
                          <Mini
                            label="GPS"
                            value={
                              p.latitude != null && p.longitude != null
                                ? `${p.latitude.toFixed(3)}, ${p.longitude.toFixed(3)}`
                                : "—"
                            }
                          />
                          <Mini label="Updated" value={new Date(p.updated_at).toLocaleDateString()} />
                        </dl>

                        {/* Live overlays — render only when real data exists */}
                        {d && (
                          <div className="mt-3 space-y-1.5 border-t pt-3">
                            {d.sensors.slice(0, 2).map((s) => (
                              <Overlay
                                key={s.id}
                                Icon={Activity}
                                label={`${s.sensor_type}`}
                                value={`${s.value}${s.unit ? ` ${s.unit}` : ""}`}
                                ts={s.recorded_at}
                              />
                            ))}
                            {d.latestIrrigation && (
                              <Overlay
                                Icon={Droplets}
                                label="Irrigation"
                                value={d.latestIrrigation.volume_liters ? `${d.latestIrrigation.volume_liters} L` : "logged"}
                                ts={d.latestIrrigation.started_at}
                              />
                            )}
                            {d.latestObservation && (
                              <Overlay
                                Icon={Eye}
                                label="Observation"
                                value={d.latestObservation.crop_stage ?? "—"}
                                ts={d.latestObservation.recorded_at}
                              />
                            )}
                            {d.latestSoil && (
                              <Overlay
                                Icon={FlaskConical}
                                label="Soil"
                                value={d.latestSoil.ph != null ? `pH ${d.latestSoil.ph}` : "sampled"}
                                ts={d.latestSoil.recorded_at}
                              />
                            )}
                            {d.recommendation && (
                              <Overlay
                                Icon={Bot}
                                label="AgriMind"
                                value={d.recommendation.title ?? "Insight"}
                                ts={d.recommendation.created_at}
                              />
                            )}
                            {!d.sensors.length &&
                              !d.latestIrrigation &&
                              !d.latestObservation &&
                              !d.latestSoil &&
                              !d.recommendation && (
                                <p className="text-[11px] text-muted-foreground">
                                  No live signals for this plot yet.
                                </p>
                              )}
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <section>
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Farm Timeline</h2>
              {events.length === 0 ? (
                <EmptyState icon={Eye} title="No twin events yet" description="Activity will appear as you add plots and records." />
              ) : (
                <FarmTimeline events={events} limit={25} />
              )}
            </section>
          </div>

          {/* Right rail */}
          <aside className="space-y-4 lg:sticky lg:top-20">
            <TwinStatusPanel items={twinSources} />

            <div className="surface-card p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <MapPin className="h-4 w-4 text-primary" /> Location
              </h3>
              {locQ.data?.location ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  {locQ.data.location.latitude.toFixed(4)}, {locQ.data.location.longitude.toFixed(4)}
                </p>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">Location not set.</p>
              )}
              <Button asChild size="sm" variant="outline" className="mt-3 w-full">
                <Link to="/app/farm/location">Manage location</Link>
              </Button>
            </div>

            {latestRec && (
              <div className="surface-card p-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <Bot className="h-4 w-4 text-primary" /> Top recommendation
                </h3>
                <p className="mt-2 text-sm font-medium">{latestRec.title}</p>
                {latestRec.recommendation && (
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-3">
                    {latestRec.recommendation}
                  </p>
                )}
                <Button asChild size="sm" variant="outline" className="mt-3 w-full">
                  <Link to="/app/agrimind">Open AgriMind</Link>
                </Button>
              </div>
            )}

            <div className="surface-card p-4">
              <h3 className="text-sm font-semibold">Twin Readiness</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {twinSources.map((c) => (
                  <li key={c.label} className="flex items-center gap-2">
                    <span
                      className={cn(
                        "grid h-5 w-5 place-items-center rounded-full border",
                        c.state === "connected"
                          ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-600"
                          : "border-border text-muted-foreground",
                      )}
                    >
                      {c.state === "connected" ? <Check className="h-3 w-3" /> : <CircleDashed className="h-3 w-3" />}
                    </span>
                    <span className={cn(c.state !== "connected" && "text-muted-foreground")}>
                      {c.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border bg-muted/30 px-2 py-1">
      <dt className="text-[9px] uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="truncate font-medium">{value}</dd>
    </div>
  );
}

function Overlay({
  Icon,
  label,
  value,
  ts,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  ts: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 text-[11px]">
      <span className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3 w-3" />
        <span className="truncate">{label}</span>
      </span>
      <span className="shrink-0 font-medium">{value}</span>
      <span className="shrink-0 text-[10px] text-muted-foreground">
        {timeAgo(ts)}
      </span>
    </div>
  );
}
function timeAgo(ts: string) {
  const mins = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}
