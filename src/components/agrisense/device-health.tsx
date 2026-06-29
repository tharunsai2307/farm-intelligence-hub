import { Activity, AlertTriangle, BatteryLow, Circle, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DeviceStatus } from "@/lib/services/agrisense.server";

/**
 * DeviceHealth — pure presentation of a device status enum. The actual derivation
 * (stale → offline) happens in `deriveDeviceHealth` so the UI never guesses.
 */
const STATUS_META: Record<
  DeviceStatus,
  { label: string; tone: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  online: {
    label: "Online",
    tone: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    Icon: Activity,
  },
  offline: {
    label: "Device Offline",
    tone: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
    Icon: AlertTriangle,
  },
  low_battery: {
    label: "Low Battery",
    tone: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    Icon: BatteryLow,
  },
  maintenance: {
    label: "Maintenance",
    tone: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
    Icon: Wrench,
  },
  unknown: {
    label: "Unknown",
    tone: "border-border bg-muted text-muted-foreground",
    Icon: Circle,
  },
};

export function DeviceHealth({
  status,
  lastSeenAt,
  minutesSinceLastSeen,
  className,
}: {
  status: DeviceStatus;
  lastSeenAt?: string | null;
  minutesSinceLastSeen?: number | null;
  className?: string;
}) {
  const meta = STATUS_META[status];
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span
        className={cn(
          "inline-flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
          meta.tone,
        )}
      >
        <meta.Icon className="h-3 w-3" />
        {meta.label}
      </span>
      <span className="text-[10px] text-muted-foreground">
        {lastSeenAt
          ? `Last sync ${formatRelative(minutesSinceLastSeen)} · ${new Date(lastSeenAt).toLocaleString()}`
          : "Never synced"}
      </span>
    </div>
  );
}

function formatRelative(minutes: number | null | undefined) {
  if (minutes == null) return "—";
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const h = Math.floor(minutes / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
