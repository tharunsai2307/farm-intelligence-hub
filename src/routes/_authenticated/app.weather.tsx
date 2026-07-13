import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  CloudSun,
  RefreshCw,
  Droplets,
  Wind,
  ThermometerSun,
  AlertTriangle,
  Gauge,
  Sun,
} from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FarmSelector, useFarms } from "@/components/farmos/farm-selector";
import {
  getCurrentWeatherByFarm,
  getForecastByFarm,
  getWeatherAlerts,
  getWeatherSourceStatus,
  syncWeatherForFarm,
} from "@/lib/services/weather.service";

export const Route = createFileRoute("/_authenticated/app/weather")({
  head: () => ({
    meta: [
      { title: "Weather Intelligence — AgriTwin OS" },
      {
        name: "description",
        content:
          "Live hyperlocal weather, 7-day forecast, and agronomy alerts for your exact farm coordinates.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: WeatherPage,
});

function WeatherPage() {
  const farmsQ = useFarms();
  const [farmId, setFarmId] = useState<string | undefined>();
  const activeFarmId = farmId ?? farmsQ.data?.items[0]?.id;

  const statusFn = useServerFn(getWeatherSourceStatus);
  const currentFn = useServerFn(getCurrentWeatherByFarm);
  const forecastFn = useServerFn(getForecastByFarm);
  const alertsFn = useServerFn(getWeatherAlerts);
  const syncFn = useServerFn(syncWeatherForFarm);

  const statusQ = useQuery({ queryKey: ["weather", "status"], queryFn: () => statusFn() });
  const currentQ = useQuery({
    queryKey: ["weather", "current", activeFarmId],
    queryFn: () => currentFn({ data: { farmId: activeFarmId! } }),
    enabled: !!activeFarmId,
  });
  const forecastQ = useQuery({
    queryKey: ["weather", "forecast", activeFarmId],
    queryFn: () => forecastFn({ data: { farmId: activeFarmId! } }),
    enabled: !!activeFarmId,
  });
  const alertsQ = useQuery({
    queryKey: ["weather", "alerts", activeFarmId],
    queryFn: () => alertsFn({ data: { farmId: activeFarmId! } }),
    enabled: !!activeFarmId,
  });

  const qc = useQueryClient();
  const sync = useMutation({
    mutationFn: () => syncFn({ data: { farmId: activeFarmId! } }),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success(`Synced — ${res.data.alerts_created} alert(s) generated`);
      qc.invalidateQueries({ queryKey: ["weather"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Sync failed"),
  });

  const configured = statusQ.data?.success === true;
  const current = currentQ.data?.success ? currentQ.data.data : null;
  const forecast = forecastQ.data?.success ? forecastQ.data.data : [];
  const alerts = alertsQ.data?.success ? alertsQ.data.data : [];

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      <PageHeader
        title="Weather Intelligence"
        description="Live conditions, 7-day forecast, and agronomy alerts for your farm coordinates."
        actions={
          <div className="flex items-center gap-2">
            <FarmSelector value={activeFarmId} onChange={setFarmId} />
            <Button
              onClick={() => sync.mutate()}
              disabled={!activeFarmId || !configured || sync.isPending}
              size="sm"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${sync.isPending ? "animate-spin" : ""}`} />
              Sync now
            </Button>
          </div>
        }
      />

      {!configured ? (
        <EmptyState
          icon={CloudSun}
          title="Weather provider not configured"
          description={
            statusQ.data && !statusQ.data.success
              ? statusQ.data.error
              : "Set OPENWEATHER_API_KEY in your backend secrets to enable weather."
          }
        />
      ) : !activeFarmId ? (
        <EmptyState
          icon={CloudSun}
          title="Add a farm to see weather"
          description="Create a farm with GPS coordinates first."
        />
      ) : (
        <div className="grid gap-6">
          <CurrentCard data={current} loading={currentQ.isLoading} />
          <ForecastCard data={forecast ?? []} loading={forecastQ.isLoading} />
          <AlertsCard data={alerts ?? []} loading={alertsQ.isLoading} />
        </div>
      )}
    </div>
  );
}

type CurrentRow = {
  temp_c: number | null;
  humidity: number | null;
  rainfall_mm: number | null;
  wind_kph: number | null;
  pressure: number | null;
  uv_index: number | null;
  weather_condition: string | null;
  fetched_at: string;
};

function CurrentCard({ data, loading }: { data: CurrentRow | null; loading: boolean }) {
  if (loading) return <Skeleton className="h-40 w-full" />;
  if (!data) {
    return (
      <EmptyState
        icon={CloudSun}
        title="No weather synced yet"
        description='Click "Sync now" to fetch live weather for this farm. Requires GPS coordinates on the farm.'
      />
    );
  }
  const stats = [
    { icon: ThermometerSun, label: "Temperature", value: fmt(data.temp_c, "°C") },
    { icon: Droplets, label: "Humidity", value: fmt(data.humidity, "%") },
    { icon: CloudSun, label: "Rainfall (last hr)", value: fmt(data.rainfall_mm, " mm") },
    { icon: Wind, label: "Wind", value: fmt(data.wind_kph, " m/s") },
    { icon: Gauge, label: "Pressure", value: fmt(data.pressure, " hPa") },
    { icon: Sun, label: "UV index", value: fmt(data.uv_index, "") },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span>Current — {data.weather_condition ?? "—"}</span>
          <span className="text-xs font-normal text-muted-foreground">
            Updated {new Date(data.fetched_at).toLocaleString()}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {stats.map((s) => (
            <div key={s.label} className="rounded-md border bg-card/50 p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <s.icon className="h-3.5 w-3.5" /> {s.label}
              </div>
              <div className="mt-1 text-xl font-semibold tabular-nums">{s.value}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

type ForecastRow = {
  forecast_date: string;
  min_temp: number | null;
  max_temp: number | null;
  rain_probability: number | null;
  rainfall: number | null;
  weather_condition: string | null;
};

function ForecastCard({ data, loading }: { data: ForecastRow[]; loading: boolean }) {
  if (loading) return <Skeleton className="h-44 w-full" />;
  if (!data.length) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">7-day forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {data.map((d) => (
            <div key={d.forecast_date} className="rounded-md border bg-card/50 p-3">
              <div className="text-xs font-medium text-muted-foreground">
                {new Date(d.forecast_date).toLocaleDateString(undefined, {
                  weekday: "short",
                  day: "numeric",
                })}
              </div>
              <div className="mt-1 text-sm capitalize">{d.weather_condition ?? "—"}</div>
              <div className="mt-2 text-lg font-semibold tabular-nums">
                {fmt(d.max_temp, "°")}{" "}
                <span className="text-sm text-muted-foreground">/ {fmt(d.min_temp, "°")}</span>
              </div>
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Droplets className="h-3 w-3" /> {d.rain_probability ?? 0}% ·{" "}
                {fmt(d.rainfall, " mm")}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

type AlertRow = {
  id: string;
  title: string;
  description: string | null;
  severity: string;
  alert_type: string;
  created_at: string;
};

function AlertsCard({ data, loading }: { data: AlertRow[]; loading: boolean }) {
  const recent = useMemo(() => data.slice(0, 10), [data]);
  if (loading) return <Skeleton className="h-32 w-full" />;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-4 w-4" /> Recent alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No active alerts. Run a sync to generate fresh ones.
          </p>
        ) : (
          <ul className="space-y-3">
            {recent.map((a) => (
              <li key={a.id} className="flex items-start gap-3 rounded-md border bg-card/50 p-3">
                <Badge variant={a.severity === "high" ? "destructive" : "secondary"}>
                  {a.severity}
                </Badge>
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{a.title}</div>
                  {a.description && (
                    <div className="mt-0.5 text-sm text-muted-foreground">{a.description}</div>
                  )}
                  <div className="mt-1 text-xs text-muted-foreground">
                    {new Date(a.created_at).toLocaleString()}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function fmt(v: number | null | undefined, suffix: string) {
  if (v == null || Number.isNaN(v)) return "—";
  return `${Math.round(v * 10) / 10}${suffix}`;
}
