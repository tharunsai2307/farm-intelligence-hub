import { Cpu, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  type DeviceStatus,
  type SensorDeviceRow,
  type SensorReadingRow,
  deriveDeviceHealth,
} from "@/lib/services/agrisense.server";
import { DeviceHealth } from "./device-health";

/**
 * SensorCard
 *
 * Compact card surface for a single device. Latest reading is **only** shown
 * when one exists — we never display synthetic numbers.
 */
export function SensorCard({
  device,
  latestReadings,
  onRename,
  onRemove,
}: {
  device: SensorDeviceRow;
  latestReadings?: SensorReadingRow[];
  onRename?: (d: SensorDeviceRow) => void;
  onRemove?: (d: SensorDeviceRow) => void;
}) {
  const health = deriveDeviceHealth(device);
  const status: DeviceStatus = health.status;

  return (
    <article className="surface-card relative overflow-hidden p-4">
      <div
        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500"
        aria-hidden
      />
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
            <Cpu className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{device.device_name}</h3>
            <p className="truncate text-xs text-muted-foreground">
              {device.device_type.toUpperCase()}
              {device.manufacturer ? ` · ${device.manufacturer}` : ""}
              {device.serial_number ? ` · ${device.serial_number}` : ""}
            </p>
          </div>
        </div>
        {(onRename || onRemove) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                aria-label={`Device options for ${device.device_name}`}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onRename && (
                <DropdownMenuItem onSelect={() => onRename(device)}>
                  <Pencil className="mr-2 h-4 w-4" /> Rename
                </DropdownMenuItem>
              )}
              {onRemove && (
                <DropdownMenuItem
                  onSelect={() => onRemove(device)}
                  className="text-rose-600 focus:text-rose-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Remove
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </header>

      <div className="mt-3">
        <DeviceHealth
          status={status}
          lastSeenAt={device.last_seen}
          minutesSinceLastSeen={health.minutesSinceLastSeen}
        />
      </div>

      <div className="mt-4 border-t pt-3">
        <h4 className="mb-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Latest readings
        </h4>
        {latestReadings && latestReadings.length > 0 ? (
          <dl className="grid grid-cols-2 gap-2 text-xs">
            {latestReadings.slice(0, 4).map((r) => (
              <div key={r.id} className="rounded border bg-muted/30 px-2 py-1.5">
                <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {r.sensor_type}
                </dt>
                <dd className="font-medium">
                  {r.value}
                  {r.unit ? ` ${r.unit}` : ""}
                </dd>
                <dd className="text-[10px] text-muted-foreground">
                  {new Date(r.recorded_at).toLocaleTimeString()}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-xs text-muted-foreground">No readings received yet.</p>
        )}
      </div>
    </article>
  );
}
