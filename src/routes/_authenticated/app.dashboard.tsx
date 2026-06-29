import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Tractor,
  Plus,
  Leaf,
  Droplets,
  Boxes,
  MapPin,
  Sprout,
  CalendarDays,
  FlaskConical,
  Eye,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import {
  LineChart as RLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { CardSkeleton } from "@/components/common/loading-skeleton";
import { ErrorState } from "@/components/common/error-state";
import { DataSourceStatusBadge } from "@/components/common/data-source-status-badge";
import { AgriMindInsightsWidget } from "@/components/dashboard/agrimind-insights-widget";
import { FarmOSDashboardWidget } from "@/components/dashboard/farmos-widget";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { listFarms, type FarmRow } from "@/lib/services/farms.functions";
import { getDashboardSummary } from "@/lib/services/dashboard.functions";
import {
  listCropObservations,
  listIrrigationRecords,
  listSoilRecords,
} from "@/lib/services/records.functions";

export const Route = createFileRoute("/_authenticated/app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — AgriTwin OS" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const farmsQ = useQuery({ queryKey: ["farms"], queryFn: () => listFarms() });
  const farms: FarmRow[] = farmsQ.data?.items ?? [];
  const primary = farms[0];

  const summaryQ = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => getDashboardSummary(),
    enabled: !!primary,
  });

  const soilQ = useQuery({
    queryKey: ["soil-records", primary?.id],
    queryFn: () => listSoilRecords({ data: { farm_id: primary!.id } }),
    enabled: !!primary,
  });
  const irrQ = useQuery({
    queryKey: ["irrigation-records", primary?.id],
    queryFn: () => listIrrigationRecords({ data: { farm_id: primary!.id } }),
    enabled: !!primary,
  });
  const obsQ = useQuery({
    queryKey: ["crop-observations", primary?.id],
    queryFn: () => listCropObservations({ data: { farm_id: primary!.id } }),
    enabled: !!primary,
  });

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title={primary ? primary.name : "Dashboard"}
        description={
          primary
            ? `Real farm data only. Last refreshed ${summaryQ.data ? new Date(summaryQ.data.last_updated).toLocaleTimeString() : "now"}.`
            : "Your farms at a glance. Add a farm to start tracking crops, weather, soil, and irrigation."
        }
        actions={
          <Button asChild>
            <Link to={primary ? "/app/farm/plots" : "/onboarding/farm"}>
              <Plus className="mr-2 h-4 w-4" /> {primary ? "Add plot" : "Add farm"}
            </Link>
          </Button>
        }
      />

      {farmsQ.isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      )}

      {farmsQ.isError && <ErrorState onRetry={() => farmsQ.refetch()} />}

      {!farmsQ.isLoading && !farmsQ.isError && !primary && (
        <EmptyState
          icon={Tractor}
          title="Add Your First Farm"
          description="Add your first farm to unlock plots, soil records, irrigation tracking, and the Digital Twin."
          action={
            <Button asChild>
              <Link to="/onboarding/farm">
                <Plus className="mr-2 h-4 w-4" /> Add Your First Farm
              </Link>
            </Button>
          }
        />
      )}

      {primary && (
        <div className="space-y-10">
          <FarmSummary farm={primary} />

          <Alerts
            farm={primary}
            availability={summaryQ.data?.availability}
          />

          <AgriMindInsightsWidget farmId={primary.id} />

          <FarmOSDashboardWidget farmId={primary.id} />



          <QuickActions />

          <DataAvailability availability={summaryQ.data?.availability} />

          <Charts
            soil={soilQ.data?.items ?? []}
            irrigation={irrQ.data?.items ?? []}
            observations={obsQ.data?.items ?? []}
            loading={soilQ.isLoading || irrQ.isLoading || obsQ.isLoading}
          />

          <RecentActivity summary={summaryQ.data?.recent ?? []} loading={summaryQ.isLoading} />
        </div>
      )}
    </div>
  );
}

// ---------------- Sections ----------------

function FarmSummary({ farm }: { farm: FarmRow }) {
  const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString(undefined, { dateStyle: "medium" }) : "Not set";

  const facts = [
    { icon: MapPin, label: "Location", value: [farm.village, farm.district, farm.state].filter(Boolean).join(", ") || "Not set" },
    {
      icon: Sprout,
      label: "Primary crop",
      value: farm.primary_crop ? `${farm.primary_crop}${farm.crop_variety ? ` · ${farm.crop_variety}` : ""}` : "Not set",
    },
    {
      icon: Boxes,
      label: "Farm size",
      value: farm.area_hectares ? `${farm.area_hectares.toFixed(2)} ha` : "Not set",
    },
    { icon: Leaf, label: "Soil type", value: farm.soil_type ?? "Not set" },
    { icon: Droplets, label: "Irrigation", value: [farm.irrigation_type, farm.water_source].filter(Boolean).join(" · ") || "Not set" },
    {
      icon: CalendarDays,
      label: "Sowing → harvest",
      value: `${fmtDate(farm.sowing_date ?? farm.planting_date)} → ${fmtDate(farm.expected_harvest)}`,
    },
  ];
  return (
    <section aria-labelledby="farm-summary-heading" className="space-y-3">
      <h2 id="farm-summary-heading" className="sr-only">Farm summary</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {facts.map((f) => (
          <div key={f.label} className="surface-card flex items-start gap-3 p-4">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
              <f.icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{f.label}</p>
              <p className="mt-0.5 truncate text-sm font-medium">{f.value}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


function Alerts({
  farm,
  availability,
}: {
  farm: FarmRow;
  availability?: ReturnType<typeof useDummy>;
}) {
  // build alerts from real state
  const alerts: { msg: string; href?: string }[] = [];
  if (availability) {
    if (availability.farm_location === "missing")
      alerts.push({ msg: "Farm location is missing. Add coordinates to enable map view.", href: "/app/farm/location" });
    if (availability.farm_plots === "none")
      alerts.push({ msg: "No farm plots created yet.", href: "/app/farm/plots" });
    if (availability.soil_sensors === "no_records")
      alerts.push({ msg: "No soil records yet.", href: "/app/farm/records" });
    if (availability.irrigation_records === "no_records")
      alerts.push({ msg: "No irrigation records yet.", href: "/app/farm/records" });
    if (availability.crop_images === "no_records")
      alerts.push({ msg: "No crop observations yet.", href: "/app/farm/records" });
    if (availability.weather_api === "not_configured")
      alerts.push({ msg: "Weather API not configured (Phase 2)." });
  }
  if (!farm.primary_crop) alerts.push({ msg: "Primary crop not set on farm." });

  if (alerts.length === 0) return null;
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Setup alerts</h2>
      <ul className="surface-card divide-y">
        {alerts.map((a, i) => (
          <li key={i} className="flex items-center gap-3 p-3">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="flex-1 text-sm">{a.msg}</span>
            {a.href && (
              <Button asChild size="sm" variant="ghost">
                <Link to={a.href}>
                  Fix <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

// helper type extraction
function useDummy() {
  return undefined as unknown as {
    weather_api: "not_configured";
    soil_sensors: "not_configured" | "no_records" | "has_records";
    crop_images: "no_records" | "has_records";
    irrigation_records: "no_records" | "has_records";
    yield_records: "not_available";
    farm_plots: "none" | "has_records";
    reports: "not_available";
    farm_location: "missing" | "set";
  };
}

function QuickActions() {
  const items = [
    { label: "Add Farm Plot", icon: Boxes, href: "/app/farm/plots" },
    { label: "Add Soil Record", icon: FlaskConical, href: "/app/farm/records" },
    { label: "Add Irrigation Record", icon: Droplets, href: "/app/farm/records" },
    { label: "Add Crop Observation", icon: Eye, href: "/app/farm/records" },
    { label: "Open Digital Twin", icon: Sprout, href: "/app/digital-twin" },
    { label: "View Farm Map", icon: MapPin, href: "/app/farm/location" },
  ] as const;
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Quick actions</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <Button asChild key={it.label} variant="outline" className="h-auto justify-start gap-3 p-4">
            <Link to={it.href}>
              <it.icon className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{it.label}</span>
            </Link>
          </Button>
        ))}
      </div>
    </section>
  );
}

function DataAvailability({ availability }: { availability?: ReturnType<typeof useDummy> }) {
  if (!availability) return null;
  const rows: Array<{ label: string; status: Parameters<typeof DataSourceStatusBadge>[0]["status"] }> = [
    { label: "Weather API", status: availability.weather_api },
    { label: "Soil Sensors", status: availability.soil_sensors === "has_records" ? "has_records" : availability.soil_sensors === "no_records" ? "no_records" : "not_configured" },
    { label: "Crop Images / Observations", status: availability.crop_images },
    { label: "Irrigation Records", status: availability.irrigation_records },
    { label: "Yield Records", status: availability.yield_records },
    { label: "Farm Plots", status: availability.farm_plots },
    { label: "Reports", status: availability.reports },
    { label: "Farm Location", status: availability.farm_location },
  ];
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Data availability</h2>
      <div className="surface-card divide-y">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-3 p-3">
            <span className="text-sm">{r.label}</span>
            <DataSourceStatusBadge status={r.status} />
          </div>
        ))}
      </div>
    </section>
  );
}

function Charts({
  soil,
  irrigation,
  observations,
  loading,
}: {
  soil: Array<{ recorded_at: string; moisture: number | null }>;
  irrigation: Array<{ started_at: string; volume_liters: number | null }>;
  observations: Array<{ recorded_at: string }>;
  loading: boolean;
}) {
  const soilSeries = useMemo(
    () =>
      [...soil]
        .filter((s) => s.moisture != null)
        .sort((a, b) => (a.recorded_at < b.recorded_at ? -1 : 1))
        .map((s) => ({
          t: new Date(s.recorded_at).toLocaleDateString(),
          moisture: s.moisture,
        })),
    [soil],
  );
  const irrSeries = useMemo(
    () =>
      [...irrigation]
        .filter((s) => s.volume_liters != null)
        .sort((a, b) => (a.started_at < b.started_at ? -1 : 1))
        .map((s) => ({
          t: new Date(s.started_at).toLocaleDateString(),
          volume: s.volume_liters,
        })),
    [irrigation],
  );
  const obsSeries = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of observations) {
      const d = new Date(o.recorded_at).toLocaleDateString();
      map.set(d, (map.get(d) ?? 0) + 1);
    }
    return [...map.entries()]
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([t, count]) => ({ t, count }));
  }, [observations]);

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Real-data trends</h2>
      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Soil moisture (%)">
          {loading ? (
            <CardSkeleton />
          ) : soilSeries.length === 0 ? (
            <EmptyChart label="Add soil records to see this trend." />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <RLineChart data={soilSeries} margin={{ top: 10, right: 12, bottom: 0, left: -12 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <XAxis dataKey="t" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="moisture" stroke="#10b981" strokeWidth={2} dot={false} />
              </RLineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
        <ChartCard title="Irrigation volume (L)">
          {loading ? (
            <CardSkeleton />
          ) : irrSeries.length === 0 ? (
            <EmptyChart label="Add irrigation records to see this trend." />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={irrSeries} margin={{ top: 10, right: 12, bottom: 0, left: -12 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <XAxis dataKey="t" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="volume" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
        <ChartCard title="Crop observations">
          {loading ? (
            <CardSkeleton />
          ) : obsSeries.length === 0 ? (
            <EmptyChart label="Add crop observations to see this trend." />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={obsSeries} margin={{ top: 10, right: 12, bottom: 0, left: -12 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <XAxis dataKey="t" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </section>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="surface-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <Badge variant="outline" className="text-[10px]">Real records</Badge>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="grid h-[200px] place-items-center rounded-lg border border-dashed text-center text-xs text-muted-foreground">
      {label}
    </div>
  );
}

function RecentActivity({
  summary,
  loading,
}: {
  summary: Array<{ id: string; kind: string; title: string; timestamp: string }>;
  loading: boolean;
}) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Recent activity</h2>
      {loading ? (
        <CardSkeleton />
      ) : summary.length === 0 ? (
        <EmptyState icon={Eye} title="No farm activity has been recorded yet." />
      ) : (
        <ul className="surface-card divide-y">
          {summary.map((s) => (
            <li key={s.id} className="flex items-center gap-3 p-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-accent text-accent-foreground text-xs">
                {s.kind[0].toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{s.title}</p>
                <p className="text-xs text-muted-foreground">{new Date(s.timestamp).toLocaleString()}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
