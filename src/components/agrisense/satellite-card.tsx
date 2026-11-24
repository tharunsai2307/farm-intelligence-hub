import { Satellite, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getSatelliteCoordinates } from "@/lib/services/agrisense.service";
import { staticSatelliteUrl, isSafeMapOrigin } from "@/lib/satellite-image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/empty-state";
import type { SatelliteRecordRow } from "@/lib/services/agrisense.server";

/**
 * SatelliteCard
 *
 * Renders the last imported satellite scene's headline metrics. When the
 * provider is configured but no scene has been imported yet, shows a
 * Google Maps Static satellite basemap centred on the farm's GPS coordinates.
 * Prefer the referrer-restricted browser key; otherwise fetch the image proxy
 * with the user's bearer token and render a temporary local blob URL.
 */
export function SatelliteCard({
  records,
  configured,
  provider,
  farmId,
}: {
  records: SatelliteRecordRow[];
  configured: boolean;
  provider?: string | null;
  farmId?: string | null;
}) {
  const latest = records[0];

  return (
    <div className="surface-card p-4">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent text-accent-foreground">
            <Satellite className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Satellite</h3>
            <p className="text-xs text-muted-foreground">
              {latest?.provider ?? provider ?? "Google satellite basemap"}
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={
            configured
              ? "border-success/30 bg-success/10 text-success"
              : "text-muted-foreground"
          }
        >
          {latest ? "Imported scene" : configured ? "Configured" : "Not configured"}
        </Badge>
      </header>

      <div className="mt-4">
        {!latest ? (
          configured && farmId ? (
            <SatelliteImage key={farmId} farmId={farmId} />
          ) : (
            <EmptyState
              icon={Satellite}
              title={configured ? "No satellite imagery yet" : "Satellite service unavailable."}
              description={
                configured
                  ? "Select a farm with GPS coordinates to see satellite imagery."
                  : "Connect Google Maps Platform for a satellite basemap. Imported scenes are shown separately."
              }
            />
          )
        ) : (
          <div className="space-y-3">
            {latest.image_url ? <ImportedScene key={latest.id} source={latest.image_url} date={latest.image_date} />
              : configured && farmId ? <SatelliteImage key={farmId} farmId={farmId} />
              : <p className="text-xs text-muted-foreground">This imported scene contains measurements but no image.</p>}
            <dl className="grid grid-cols-3 gap-2 text-xs">
            <Metric label="NDVI" value={fmt(latest.ndvi)} />
            <Metric label="Moisture" value={fmt(latest.moisture_index)} />
            <Metric label="Vegetation" value={fmt(latest.vegetation_index)} />
            <Metric label="Resolution" value={latest.resolution ?? "—"} />
            <Metric label="Provider" value={latest.provider} />
            <Metric label="Captured" value={new Date(latest.image_date).toLocaleDateString()} />
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}

function ImportedScene({ source, date }: { source: string; date: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <p role="alert" className="text-sm">The imported scene image is unavailable. Its measurements are preserved below.</p>;
  return <figure className="overflow-hidden rounded-lg border">
    <img src={source} alt={`Imported satellite scene captured ${date}`} referrerPolicy="no-referrer"
      className="aspect-[8/5] w-full object-contain" onError={() => setFailed(true)} />
    <figcaption className="px-3 py-2 text-xs text-muted-foreground">Imported scene · {date}</figcaption>
  </figure>;
}

function SatelliteImage({ farmId }: { farmId: string }) {
  const getCoordinates = useServerFn(getSatelliteCoordinates);
  const [source, setSource] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let objectUrl: string | null = null;
    setSource(null);
    setError(null);
    async function load() {
      try {
        const browserKey = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"];
        if (browserKey) {
          if (!isSafeMapOrigin(window.location.origin)) throw new Error("Satellite imagery is available on your published, authorized HTTPS site.");
          const location = await getCoordinates({ data: { farm_id: farmId } });
          const url = staticSatelliteUrl(window.location.origin, browserKey, location.latitude, location.longitude,
            import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID"] ?? "");
          if (!url) throw new Error("Your farm GPS coordinates are invalid.");
          if (!controller.signal.aborted) setSource(url);
          return;
        }
        const { data } = await supabase.auth.getSession();
        if (!data.session) throw new Error("Please sign in again to view satellite imagery.");
        const response = await fetch(`/api/agrisense/satellite-image?farm_id=${encodeURIComponent(farmId)}&zoom=16`, {
          headers: { Authorization: `Bearer ${data.session.access_token}` }, signal: controller.signal,
        });
        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.error ?? `Satellite imagery could not load (${response.status}).`);
        }
        if (!response.headers.get("content-type")?.startsWith("image/")) throw new Error("The satellite service did not return an image.");
        const blob = await response.blob();
        if (controller.signal.aborted) return;
        objectUrl = URL.createObjectURL(blob);
        setSource(objectUrl);
      } catch (cause) {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Satellite imagery could not load.");
      }
    }
    void load();
    return () => { controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [farmId, attempt, getCoordinates]);
  return <figure className="overflow-hidden rounded-lg border">
    {error ? <div className="flex min-h-48 flex-col items-center justify-center gap-3 p-4 text-center" role="alert">
      <Satellite className="h-6 w-6 text-muted-foreground" />
      <p className="text-sm">{error}</p>
      <Button variant="outline" size="sm" onClick={() => setAttempt(value => value + 1)}><RefreshCw className="mr-2 h-4 w-4" />Retry</Button>
    </div> : source ? <img crossOrigin="anonymous" referrerPolicy="strict-origin-when-cross-origin" src={source}
      alt="Satellite imagery centered on your farm" className="aspect-[8/5] w-full object-contain"
      onError={() => setError("Google could not display this image. Check Maps Static API access and that this website is authorized.")} />
      : <div className="grid min-h-48 place-items-center bg-muted text-sm text-muted-foreground" role="status">Loading satellite imagery…</div>}
    <figcaption className="px-3 py-2 text-xs text-muted-foreground">Google satellite basemap · farm GPS location · capture date unavailable</figcaption>
  </figure>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border bg-muted/30 px-2 py-1.5">
      <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
function fmt(n: number | null) {
  return n == null ? "—" : n.toFixed(2);
}
