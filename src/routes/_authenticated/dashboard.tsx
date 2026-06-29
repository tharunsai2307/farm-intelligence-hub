import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useServerFn } from "@tanstack/react-query";
import { useMemo } from "react";
import { useQuery as useTQQuery } from "@tanstack/react-query";
import { Tractor, Plus, Boxes, Leaf, CloudSun, Droplets } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { CardSkeleton } from "@/components/common/loading-skeleton";
import { ErrorState } from "@/components/common/error-state";
import { Button } from "@/components/ui/button";
import { listFarms } from "@/lib/services/farms.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — AgriTwin OS" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { data, isLoading, isError, refetch } = useTQQuery({
    queryKey: ["farms"],
    queryFn: () => listFarms(),
  });

  const farms = data?.items ?? [];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Dashboard"
        description="Your farms at a glance. Add a farm to start tracking crops, weather, soil, and irrigation."
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add farm
          </Button>
        }
      />

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      )}

      {isError && <ErrorState message="We couldn't load your farms." onRetry={() => refetch()} />}

      {!isLoading && !isError && farms.length === 0 && (
        <EmptyState
          icon={Tractor}
          title="No farms yet"
          description="Add your first farm to unlock crop health, weather, irrigation, and yield modules."
          action={<Button><Plus className="mr-2 h-4 w-4" /> Add your first farm</Button>}
        />
      )}

      {!isLoading && !isError && farms.length > 0 && (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Tractor} label="Farms" value={farms.length.toString()} />
            <StatCard icon={Boxes} label="Active modules" value="0" hint="Phase 1 · foundation" />
            <StatCard icon={Leaf} label="Crops tracked" value="0" />
            <StatCard icon={Droplets} label="Irrigation logs" value="0" />
          </section>

          <section className="mt-8 surface-card divide-y">
            <header className="flex items-center justify-between p-4">
              <h2 className="text-sm font-semibold">Your farms</h2>
            </header>
            {farms.map((f) => (
              <article key={f.id} className="flex items-center justify-between p-4">
                <div className="min-w-0">
                  <p className="truncate font-medium">{f.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {f.area_hectares ? `${f.area_hectares} ha` : "Area not set"}
                    {f.soil_type ? ` · ${f.soil_type}` : ""}
                  </p>
                </div>
              </article>
            ))}
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Tractor;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="surface-card p-5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="mt-3 text-2xl font-semibold">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
