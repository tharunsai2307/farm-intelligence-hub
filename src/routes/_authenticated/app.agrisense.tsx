/**
 * AgriSense Dashboard — /app/agrisense
 *
 * The single pane of glass for every real data source feeding the Digital Twin:
 *   • Connected devices + health
 *   • API status (Supabase / Mapbox / Weather / AI / Satellite)
 *   • Recent sensor readings (with Supabase Realtime push)
 *   • Weather sync status (from /api/weather/current)
 *   • Satellite imagery (configured providers only)
 *   • Drone surveys (upload + listing)
 *   • Health monitor (per-device summary)
 *
 * AgriSense never decides or simulates. Empty states are honest: when a
 * source is offline or unconfigured we say so.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Activity,
  Cpu,
  CloudSun,
  Database as DatabaseIcon,
  MapPin as MapPinIcon,
  Pencil,
  RefreshCw,
  Satellite as SatelliteIcon,
  Trash2,
} from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { CardSkeleton } from "@/components/common/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { SensorCard } from "@/components/agrisense/sensor-card";
import { SensorTable } from "@/components/agrisense/sensor-table";
import { DeviceRegistration } from "@/components/agrisense/device-registration";
import { SatelliteCard } from "@/components/agrisense/satellite-card";
import {
  DroneSurveyCard,
  DroneSurveyUploader,
} from "@/components/agrisense/drone-survey-card";
import { RealtimeIndicator } from "@/components/agrisense/realtime-indicator";

import { listFarms } from "@/lib/services/farms.functions";
import {
  getLatestSensorReadings,
  getSatelliteStatus,
  listDroneSurveysFn,
  listSatelliteRecordsFn,
  listSensorDevices,
  listSensorReadings,
  removeSensorDevice,
  renameSensorDevice,
} from "@/lib/services/agrisense.service";
import { getCurrentWeatherByFarm } from "@/lib/services/weather.service";
import { getAiCropStatus } from "@/lib/services/ai-crop.service";
import { getAgriMindStatus } from "@/lib/services/agrimind.service";
import { supabase } from "@/integrations/supabase/client";
import { getDataSourceStatuses } from "@/lib/env";
import type {
  SensorDeviceRow,
  SensorReadingRow,
} from "@/lib/services/agrisense.server";
import { deriveDeviceHealth } from "@/lib/services/agrisense.server";

export const Route = createFileRoute("/_authenticated/app/agrisense")({
  head: () => ({
    meta: [
      { title: "AgriSense — AgriTwin OS" },
      { name: "description", content: "Real-time telemetry from IoT sensors, satellite, and drone sources normalized into your farm's Digital Twin." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "AgriSense — AgriTwin OS" },
      { property: "og:description", content: "Live sensor, satellite, and drone telemetry unified for your Digital Twin." },
      { property: "og:url", content: "https://agri-twin-os.lovable.app/app/agrisense" },
    ],
  }),
  component: AgriSensePage,
});

function AgriSensePage() {
  const qc = useQueryClient();
  const farmsQ = useQuery({ queryKey: ["farms"], queryFn: () => listFarms() });
  const farms = farmsQ.data?.items ?? [];
  const [farmId, setFarmId] = useState<string | undefined>();
  useEffect(() => {
    if (!farmId && farms[0]) setFarmId(farms[0].id);
  }, [farms, farmId]);

  // -------- queries --------
  const devicesQ = useQuery({
    queryKey: ["agrisense", "devices", farmId],
    queryFn: () => listSensorDevices({ data: { farm_id: farmId! } }),
    enabled: !!farmId,
  });
  const readingsQ = useQuery({
    queryKey: ["agrisense", "readings", farmId],
    queryFn: () => listSensorReadings({ data: { farm_id: farmId!, limit: 50 } }),
    enabled: !!farmId,
  });
  const latestQ = useQuery({
    queryKey: ["agrisense", "latest", farmId],
    queryFn: () => getLatestSensorReadings({ data: { farm_id: farmId! } }),
    enabled: !!farmId,
  });
  const satelliteRecordsQ = useQuery({
    queryKey: ["agrisense", "satellite", farmId],
    queryFn: () => listSatelliteRecordsFn({ data: { farm_id: farmId! } }),
    enabled: !!farmId,
  });
  const satelliteStatusQ = useQuery({
    queryKey: ["agrisense", "satellite-status"],
    queryFn: () => getSatelliteStatus(),
  });
  const dronesQ = useQuery({
    queryKey: ["agrisense", "drone", farmId],
    queryFn: () => listDroneSurveysFn({ data: { farm_id: farmId! } }),
    enabled: !!farmId,
  });
  const weatherQ = useQuery({
    queryKey: ["agrisense", "weather", farmId],
    queryFn: () => getCurrentWeatherByFarm({ data: { farmId: farmId! } }),
    enabled: !!farmId,
  });

  const devices = devicesQ.data?.success ? devicesQ.data.data : [];
  const readings = readingsQ.data?.success ? readingsQ.data.data : [];
  const latest = latestQ.data?.success ? latestQ.data.data : [];
  const satRecords = satelliteRecordsQ.data?.success ? satelliteRecordsQ.data.data : [];
  const droneSurveys = dronesQ.data?.success ? dronesQ.data.data : [];

  // -------- realtime --------
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [lastRealtimeAt, setLastRealtimeAt] = useState<string | null>(null);
  const farmRef = useRef(farmId);
  farmRef.current = farmId;

  useEffect(() => {
    if (!farmId) return;
    setRealtimeConnected(false);
    const channel = supabase
      .channel(`agrisense-${farmId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "sensor_readings", filter: `farm_id=eq.${farmId}` },
        () => {
          if (farmRef.current !== farmId) return;
          setLastRealtimeAt(new Date().toISOString());
          qc.invalidateQueries({ queryKey: ["agrisense", "readings", farmId] });
          qc.invalidateQueries({ queryKey: ["agrisense", "latest", farmId] });
          qc.invalidateQueries({ queryKey: ["agrisense", "devices", farmId] });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sensor_devices", filter: `farm_id=eq.${farmId}` },
        () => qc.invalidateQueries({ queryKey: ["agrisense", "devices", farmId] }),
      )
      .subscribe((status) => setRealtimeConnected(status === "SUBSCRIBED"));
    return () => {
      supabase.removeChannel(channel);
    };
  }, [farmId, qc]);

  // -------- API status --------
  const apiStatuses = useMemo(() => {
    const base = getDataSourceStatuses();
    const weatherOk = weatherQ.data?.success === true;
    const weatherError = weatherQ.data && !weatherQ.data.success ? weatherQ.data.error : undefined;
    return [
      { key: "supabase", label: "Supabase", configured: base.supabase.configured, detail: base.supabase.reason },
      { key: "mapbox", label: "Mapbox", configured: base.mapbox.configured, detail: base.mapbox.reason },
      {
        key: "weather",
        label: "Weather (OpenWeather)",
        configured: weatherOk,
        detail: weatherOk
          ? "Live data flowing"
          : weatherError ?? "Sync to verify",
      },
      {
        key: "satellite",
        label: "Satellite imagery",
        configured: satelliteStatusQ.data?.success === true,
        detail:
          satelliteStatusQ.data?.success
            ? `Provider: ${satelliteStatusQ.data.data.provider}`
            : "Satellite service unavailable.",
      },
      { key: "ai_crop", label: "Crop AI (Roboflow)", configured: false, detail: "Per-scan via Crop Health" },
      { key: "agrimind", label: "AgriMind AI (Lovable AI)", configured: false, detail: "Generated on demand" },
    ];
  }, [weatherQ.data, satelliteStatusQ.data]);

  // -------- device actions --------
  const [renameTarget, setRenameTarget] = useState<SensorDeviceRow | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [removeTarget, setRemoveTarget] = useState<SensorDeviceRow | null>(null);

  const renameMutation = useMutation({
    mutationFn: async () =>
      renameSensorDevice({
        data: { id: renameTarget!.id, device_name: renameValue.trim() },
      }),
    onSuccess: (res) => {
      if (!res.success) return toast.error(res.error);
      toast.success("Device renamed");
      qc.invalidateQueries({ queryKey: ["agrisense", "devices", farmId] });
      setRenameTarget(null);
    },
  });
  const removeMutation = useMutation({
    mutationFn: async () => removeSensorDevice({ data: { id: removeTarget!.id } }),
    onSuccess: (res) => {
      if (!res.success) return toast.error(res.error);
      toast.success("Device removed");
      qc.invalidateQueries({ queryKey: ["agrisense", "devices", farmId] });
      setRemoveTarget(null);
    },
  });

  // -------- per-device latest readings map --------
  const latestByDevice = useMemo(() => {
    const m = new Map<string, SensorReadingRow[]>();
    for (const r of latest) {
      const arr = m.get(r.device_id) ?? [];
      arr.push(r);
      m.set(r.device_id, arr);
    }
    return m;
  }, [latest]);

  // -------- health monitor summary --------
  const healthSummary = useMemo(() => {
    const s = { online: 0, offline: 0, low_battery: 0, maintenance: 0, unknown: 0 };
    for (const d of devices) {
      s[deriveDeviceHealth(d).status]++;
    }
    return s;
  }, [devices]);

  if (farmsQ.isLoading) return <CardSkeleton />;
  if (!farms.length) {
    return (
      <div className="mx-auto max-w-7xl">
        <PageHeader title="AgriSense" description="Real data plane for your farm." />
        <EmptyState
          icon={Activity}
          title="Create a farm first"
          description="AgriSense connects devices and APIs to a specific farm."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="AgriSense"
        description="Collects, validates, and distributes every real-world signal — never simulated."
        actions={
          <div className="flex items-center gap-2">
            <RealtimeIndicator
              connected={realtimeConnected}
              lastEventAt={lastRealtimeAt}
              label={realtimeConnected ? "Realtime live" : "Realtime offline"}
            />
            {farms.length > 1 && (
              <Select value={farmId} onValueChange={setFarmId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {farms.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {farmId && <DeviceRegistration farmId={farmId} />}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-8">
          {/* API status */}
          <Section title="API Status" icon={DatabaseIcon}>
            <div className="grid gap-3 sm:grid-cols-2">
              {apiStatuses.map((s) => (
                <div key={s.key} className="surface-card p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{s.label}</p>
                    <Badge
                      variant="outline"
                      className={
                        s.configured
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                          : "text-muted-foreground"
                      }
                    >
                      {s.configured ? "Connected" : "Not configured"}
                    </Badge>
                  </div>
                  {s.detail && <p className="mt-1 text-xs text-muted-foreground">{s.detail}</p>}
                </div>
              ))}
            </div>
          </Section>

          {/* Devices */}
          <Section
            title="Connected Devices"
            icon={Cpu}
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => qc.invalidateQueries({ queryKey: ["agrisense"] })}
              >
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh
              </Button>
            }
          >
            {devicesQ.isLoading ? (
              <CardSkeleton />
            ) : devices.length === 0 ? (
              <EmptyState
                icon={Cpu}
                title="No devices registered"
                description="Register a sensor device to start receiving real readings. AgriSense never creates fake values."
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {devices.map((d) => (
                  <SensorCard
                    key={d.id}
                    device={d}
                    latestReadings={latestByDevice.get(d.id) ?? []}
                    onRename={(dev) => {
                      setRenameTarget(dev);
                      setRenameValue(dev.device_name);
                    }}
                    onRemove={(dev) => setRemoveTarget(dev)}
                  />
                ))}
              </div>
            )}
          </Section>

          {/* Recent readings */}
          <Section title="Recent Sensor Readings" icon={Activity}>
            {readings.length === 0 ? (
              <EmptyState
                icon={Activity}
                title="No readings yet"
                description="Once your devices POST to /api/agrisense/sensors, readings appear here in real time."
              />
            ) : (
              <SensorTable readings={readings} devices={devices} />
            )}
          </Section>

          {/* Weather + Satellite + Drone */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Section title="Weather Sync" icon={CloudSun}>
              <div className="surface-card p-4">
                {weatherQ.isLoading ? (
                  <p className="text-sm text-muted-foreground">Checking…</p>
                ) : weatherQ.data?.success && weatherQ.data.data ? (
                  <div>
                    <p className="text-sm font-medium">Live weather available</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Latest record at {new Date(weatherQ.data.data.recorded_at).toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      No live weather available
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {weatherQ.data && !weatherQ.data.success
                        ? weatherQ.data.error
                        : "Visit the Weather module to sync."}
                    </p>
                  </div>
                )}
              </div>
            </Section>

            <Section title="Satellite Status" icon={SatelliteIcon}>
              <SatelliteCard
                records={satRecords}
                configured={satelliteStatusQ.data?.success === true}
                provider={
                  satelliteStatusQ.data?.success
                    ? satelliteStatusQ.data.data.provider
                    : null
                }
              />
            </Section>
          </div>

          <Section
            title="Drone Survey Status"
            icon={MapPinIcon}
            action={farmId ? <DroneSurveyUploaderWrapper farmId={farmId} /> : null}
          >
            {droneSurveys.length === 0 ? (
              <EmptyState
                icon={MapPinIcon}
                title="No drone surveys yet"
                description="Upload survey reports, GeoJSON boundaries, or orthomosaics from your drone flights."
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {droneSurveys.map((s) => (
                  <DroneSurveyCard key={s.id} survey={s} />
                ))}
              </div>
            )}
          </Section>
        </div>

        {/* Right rail: Health monitor */}
        <aside className="space-y-4 lg:sticky lg:top-20">
          <div className="surface-card p-4">
            <h3 className="text-sm font-semibold">Device Health Monitor</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Derived from each device's last sync. Never guessed.
            </p>
            <ul className="mt-3 space-y-1.5 text-sm">
              <HealthRow label="Online" value={healthSummary.online} tone="emerald" />
              <HealthRow label="Offline" value={healthSummary.offline} tone="rose" />
              <HealthRow label="Low battery" value={healthSummary.low_battery} tone="amber" />
              <HealthRow label="Maintenance" value={healthSummary.maintenance} tone="blue" />
              <HealthRow label="Unknown" value={healthSummary.unknown} tone="muted" />
            </ul>
            <div className="mt-3 border-t pt-3 text-xs text-muted-foreground">
              {devices.length} device{devices.length === 1 ? "" : "s"} registered
            </div>
          </div>
        </aside>
      </div>

      {/* Rename dialog */}
      <Dialog open={!!renameTarget} onOpenChange={(o) => !o && setRenameTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename device</DialogTitle>
          </DialogHeader>
          <div className="grid gap-1.5">
            <Label htmlFor="rename">New name</Label>
            <Input
              id="rename"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRenameTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => renameMutation.mutate()}
              disabled={!renameValue.trim() || renameMutation.isPending}
            >
              <Pencil className="mr-1.5 h-3.5 w-3.5" /> Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove confirm */}
      <AlertDialog open={!!removeTarget} onOpenChange={(o) => !o && setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this device?</AlertDialogTitle>
            <AlertDialogDescription>
              {removeTarget?.device_name} and all its historical readings will be deleted. This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removeMutation.mutate()}
              className="bg-rose-600 hover:bg-rose-700"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ---------- helpers ----------

function Section({
  title,
  icon: Icon,
  action,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <header className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Icon className="h-4 w-4 text-primary" /> {title}
        </h2>
        {action}
      </header>
      {children}
    </section>
  );
}

function HealthRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "emerald" | "rose" | "amber" | "blue" | "muted";
}) {
  const toneCls =
    tone === "emerald"
      ? "bg-emerald-500"
      : tone === "rose"
        ? "bg-rose-500"
        : tone === "amber"
          ? "bg-amber-500"
          : tone === "blue"
            ? "bg-blue-500"
            : "bg-muted-foreground/40";
  return (
    <li className="flex items-center justify-between">
      <span className="flex items-center gap-2">
        <span className={`inline-block h-2 w-2 rounded-full ${toneCls}`} />
        {label}
      </span>
      <span className="font-mono text-xs">{value}</span>
    </li>
  );
}

function DroneSurveyUploaderWrapper({ farmId }: { farmId: string }) {
  // We need the auth user id to scope storage paths.
  const userQ = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user?.id ?? null;
    },
  });
  if (!userQ.data) return null;
  return <DroneSurveyUploader farmId={farmId} userId={userQ.data} />;
}
