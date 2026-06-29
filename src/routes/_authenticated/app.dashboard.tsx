import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Tractor,
  Plus,
  Leaf,
  Droplets,
  CloudSun,
  Boxes,
  LineChart,
  MapPin,
  Sprout,
  CalendarDays,
} from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { CardSkeleton } from "@/components/common/loading-skeleton";
import { ErrorState } from "@/components/common/error-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listFarms, type FarmRow } from "@/lib/services/farms.functions";

export const Route = createFileRoute("/_authenticated/app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — AgriTwin OS" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["farms"],
    queryFn: () => listFarms(),
  });

  const farms: FarmRow[] = data?.items ?? [];
  const primary = farms[0];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title={primary ? primary.name : "Dashboard"}
        description={
          primary
            ? "Real farm data only. Connect sources to unlock more modules."
            : "Your farms at a glance. Add a farm to start tracking crops, weather, soil, and irrigation."
        }
        actions={
          <Button asChild>
            <Link to="/onboarding/farm">
              <Plus className="mr-2 h-4 w-4" /> Add farm
            </Link>
          </Button>
        }
      />

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      )}

      {isError && <ErrorState message="We couldn't load your farms." onRetry={() => refetch()} />}

      {!isLoading && !isError && !primary && (
        <EmptyState
          icon={Tractor}
          title="No farm connected yet"
          description="Add your first farm to unlock crop health, weather, irrigation, and yield modules."
          action={
            <Button asChild>
              <Link to="/onboarding/farm"><Plus className="mr-2 h-4 w-4" /> Add Farm</Link>
            </Button>
          }
        />
      )}

      {!isLoading && !isError && primary && (
        <>
          <FarmSummary farm={primary} />

          <h2 className="mt-10 text-sm font-semibold text-muted-foreground">Modules</h2>
          <section className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ModuleCard
              icon={CloudSun}
              title="Weather"
              state="Connect a weather API in the next phase."
            />
            <ModuleCard
              icon={Droplets}
              title="Soil Moisture"
              state="Connect an IoT sensor or upload a soil record."
            />
            <ModuleCard
              icon={Leaf}
              title="Crop Health"
              state="Upload crop images in the next phase."
            />
            <ModuleCard
              icon={Boxes}
              title="Digital Twin"
              state="Farm map will be generated in the next phase."
            />
            <ModuleCard
              icon={LineChart}
              title="Yield Prediction"
              state="Requires crop and historical records."
            />
            <ModuleCard
              icon={Tractor}
              title="FarmOS"
              state="Tasks and inputs management — coming soon."
            />
          </section>

          {farms.length > 1 && (
            <section className="mt-10 surface-card divide-y">
              <header className="flex items-center justify-between p-4">
                <h2 className="text-sm font-semibold">All farms ({farms.length})</h2>
              </header>
              {farms.map((f) => (
                <article key={f.id} className="flex items-center justify-between p-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{f.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {[f.village, f.district, f.state].filter(Boolean).join(", ") || "Location not set"}
                    </p>
                  </div>
                  <Badge variant="outline">{f.primary_crop ?? "No crop set"}</Badge>
                </article>
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}

function FarmSummary({ farm }: { farm: FarmRow }) {
  const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString(undefined, { dateStyle: "medium" }) : "—";

  const facts: Array<{ icon: typeof MapPin; label: string; value: string }> = [
    {
      icon: MapPin,
      label: "Location",
      value: [farm.village, farm.district, farm.state].filter(Boolean).join(", ") || "Not set",
    },
    {
      icon: Sprout,
      label: "Crop",
      value: farm.primary_crop
        ? `${farm.primary_crop}${farm.crop_variety ? ` · ${farm.crop_variety}` : ""}`
        : "Not set",
    },
    {
      icon: Boxes,
      label: "Farm size",
      value: farm.area_hectares
        ? `${farm.area_hectares.toFixed(2)} ha${farm.area_unit && farm.area_unit !== "hectares" ? ` (entered in ${farm.area_unit})` : ""}`
        : "Not set",
    },
    {
      icon: Leaf,
      label: "Soil type",
      value: farm.soil_type ?? "Not set",
    },
    {
      icon: Droplets,
      label: "Irrigation",
      value: [farm.irrigation_type, farm.water_source].filter(Boolean).join(" · ") || "Not set",
    },
    {
      icon: CalendarDays,
      label: "Sowing → harvest",
      value: `${fmtDate(farm.sowing_date ?? farm.planting_date)} → ${fmtDate(farm.expected_harvest)}`,
    },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
    </section>
  );
}

function ModuleCard({
  icon: Icon,
  title,
  state,
}: {
  icon: typeof Tractor;
  title: string;
  state: string;
}) {
  return (
    <div className="surface-card p-5">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">{title}</h3>
        <Badge variant="outline" className="ml-auto text-[10px]">Awaiting input</Badge>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{state}</p>
    </div>
  );
}
