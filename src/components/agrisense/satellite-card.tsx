import { Satellite } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/empty-state";
import type { SatelliteRecordRow } from "@/lib/services/agrisense.server";

/**
 * SatelliteCard
 *
 * Renders the last imported satellite scene's headline metrics or, when no
 * provider is configured and no records exist, the canonical
 * "Satellite service unavailable." message. NDVI/moisture are never
 * synthesized.
 */
export function SatelliteCard({
  records,
  configured,
  provider,
}: {
  records: SatelliteRecordRow[];
  configured: boolean;
  provider?: string | null;
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
              {provider ?? "Sentinel Hub / GEE / Planet"}
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={
            configured
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "text-muted-foreground"
          }
        >
          {configured ? "Configured" : "Not configured"}
        </Badge>
      </header>

      <div className="mt-4">
        {!latest ? (
          <EmptyState
            icon={Satellite}
            title={configured ? "No satellite imagery yet" : "Satellite service unavailable."}
            description={
              configured
                ? "Imported scenes will appear here once available."
                : "Connect a Sentinel Hub, Google Earth Engine, or Planet Labs key to begin imports."
            }
          />
        ) : (
          <dl className="grid grid-cols-3 gap-2 text-xs">
            <Metric label="NDVI" value={fmt(latest.ndvi)} />
            <Metric label="Moisture" value={fmt(latest.moisture_index)} />
            <Metric label="Vegetation" value={fmt(latest.vegetation_index)} />
            <Metric label="Resolution" value={latest.resolution ?? "—"} />
            <Metric label="Provider" value={latest.provider} />
            <Metric label="Captured" value={new Date(latest.image_date).toLocaleDateString()} />
          </dl>
        )}
      </div>
    </div>
  );
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
