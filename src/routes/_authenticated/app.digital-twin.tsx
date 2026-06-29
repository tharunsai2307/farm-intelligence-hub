import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Boxes,
  Check,
  CircleDashed,
  MapPin,
  Plus,
  Leaf,
  Droplets,
  Eye,
  FlaskConical,
} from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { CardSkeleton } from "@/components/common/loading-skeleton";
import { DataCompletenessBadge } from "@/components/common/data-completeness-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { getFarmLocation, getPrimaryFarm } from "@/lib/services/farms.functions";
import { listFarmPlots, type FarmPlotRow } from "@/lib/services/farm-plots.functions";
import {
  listCropObservations,
  listIrrigationRecords,
  listSoilRecords,
} from "@/lib/services/records.functions";

export const Route = createFileRoute("/_authenticated/app/digital-twin")({
  head: () => ({ meta: [{ title: "Digital Farm Twin — AgriTwin OS" }] }),
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
  const farmQ = useQuery({ queryKey: ["primary-farm"], queryFn: () => getPrimaryFarm() });
  const farm = farmQ.data?.farm;

  const locQ = useQuery({
    queryKey: ["farm-location", farm?.id],
    queryFn: () => getFarmLocation({ data: { farm_id: farm!.id } }),
    enabled: !!farm?.id,
  });
  const plotsQ = useQuery({
    queryKey: ["farm-plots", farm?.id],
    queryFn: () => listFarmPlots({ data: { farm_id: farm!.id } }),
    enabled: !!farm?.id,
  });
  const soilQ = useQuery({
    queryKey: ["soil-records", farm?.id],
    queryFn: () => listSoilRecords({ data: { farm_id: farm!.id } }),
    enabled: !!farm?.id,
  });
  const irrQ = useQuery({
    queryKey: ["irrigation-records", farm?.id],
    queryFn: () => listIrrigationRecords({ data: { farm_id: farm!.id } }),
    enabled: !!farm?.id,
  });
  const obsQ = useQuery({
    queryKey: ["crop-observations", farm?.id],
    queryFn: () => listCropObservations({ data: { farm_id: farm!.id } }),
    enabled: !!farm?.id,
  });

  const checklist = [
    { label: "Farm profile created", done: !!farm },
    { label: "Farm location added", done: !!locQ.data?.location },
    { label: "Farm plots created", done: (plotsQ.data?.items?.length ?? 0) > 0 },
    { label: "Crop records added", done: (obsQ.data?.items?.length ?? 0) > 0 },
    { label: "Soil records added", done: (soilQ.data?.items?.length ?? 0) > 0 },
    { label: "Irrigation records added", done: (irrQ.data?.items?.length ?? 0) > 0 },
    { label: "Weather API connected", done: false },
    { label: "Sensor data connected", done: false },
  ];

  const plots = plotsQ.data?.items ?? [];

  const events: Array<{ id: string; icon: React.ElementType; label: string; ts: string }> = [];
  for (const p of plots) {
    events.push({ id: `p-${p.id}`, icon: Boxes, label: `Plot created — ${p.name}`, ts: p.created_at });
  }
  for (const r of soilQ.data?.items ?? []) {
    events.push({ id: `s-${r.id}`, icon: FlaskConical, label: "Soil record added", ts: r.recorded_at });
  }
  for (const r of irrQ.data?.items ?? []) {
    events.push({ id: `i-${r.id}`, icon: Droplets, label: `Irrigation logged — ${r.method ?? "—"}`, ts: r.started_at });
  }
  for (const r of obsQ.data?.items ?? []) {
    events.push({ id: `o-${r.id}`, icon: Eye, label: `Observation — ${r.crop_stage ?? "—"}`, ts: r.recorded_at });
  }
  events.sort((a, b) => (a.ts < b.ts ? 1 : -1));

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Digital Farm Twin"
        description="A real-time-ready visual model of your farm built from your farm location, plots, crop records, and sensor data."
        actions={
          <Button asChild>
            <Link to="/app/farm/plots">
              <Plus className="mr-2 h-4 w-4" /> Create plot
            </Link>
          </Button>
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
          {/* Left: layout + timeline */}
          <div className="space-y-8">
            <section>
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground">2D Farm Layout</h2>
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
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {plots.map((p) => (
                    <article
                      key={p.id}
                      className="surface-card group relative overflow-hidden p-4 transition hover:shadow-md"
                    >
                      <div
                        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500"
                        aria-hidden
                      />
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold">{p.name}</h3>
                          <p className="truncate text-xs text-muted-foreground">
                            <Leaf className="mr-1 inline h-3 w-3" />
                            {p.crop ?? "No crop"}
                            {p.area ? ` · ${p.area} ${p.area_unit ?? "ha"}` : ""}
                          </p>
                        </div>
                        <DataCompletenessBadge percent={completeness(p)} />
                      </div>
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
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Digital Twin Timeline</h2>
              {events.length === 0 ? (
                <EmptyState icon={Eye} title="No twin events yet" description="Activity will appear as you add plots and records." />
              ) : (
                <ol className="surface-card divide-y">
                  {events.slice(0, 12).map((e) => (
                    <li key={e.id} className="flex items-center gap-3 p-3">
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-accent text-accent-foreground">
                        <e.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm">{e.label}</p>
                        <p className="text-xs text-muted-foreground">{new Date(e.ts).toLocaleString()}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>

          {/* Right: readiness */}
          <aside className="space-y-4 lg:sticky lg:top-20">
            <div className="surface-card p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Twin Readiness</h3>
                <Badge variant="outline" className="text-[10px]">
                  {checklist.filter((c) => c.done).length}/{checklist.length}
                </Badge>
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                {checklist.map((c) => (
                  <li key={c.label} className="flex items-center gap-2">
                    <span
                      className={cn(
                        "grid h-5 w-5 place-items-center rounded-full border",
                        c.done
                          ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-600"
                          : "border-border text-muted-foreground",
                      )}
                    >
                      {c.done ? <Check className="h-3 w-3" /> : <CircleDashed className="h-3 w-3" />}
                    </span>
                    <span className={cn(c.done ? "" : "text-muted-foreground")}>{c.label}</span>
                  </li>
                ))}
              </ul>
            </div>

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
