import {
  Sprout,
  CloudSun,
  Activity,
  Leaf,
  Eye,
  Bot,
  Boxes,
  Plane,
  Satellite,
  Droplets,
  FlaskConical,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * FarmTimeline
 *
 * Unified chronological feed of every meaningful real-data event for the farm.
 * The page assembles items from real query results; this component only renders.
 */
export type TimelineKind =
  | "farm_created"
  | "weather"
  | "sensor"
  | "crop_scan"
  | "recommendation"
  | "observation"
  | "harvest"
  | "soil"
  | "irrigation"
  | "plot"
  | "drone"
  | "satellite";

export type TimelineEvent = {
  id: string;
  ts: string;
  kind: TimelineKind;
  title: string;
  detail?: string;
};

const KIND_META: Record<
  TimelineKind,
  { Icon: React.ComponentType<{ className?: string }>; tone: string; label: string }
> = {
  farm_created: {
    Icon: Sprout,
    tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    label: "Farm",
  },
  weather: {
    Icon: CloudSun,
    tone: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
    label: "Weather",
  },
  sensor: {
    Icon: Activity,
    tone: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    label: "Sensor",
  },
  crop_scan: {
    Icon: Leaf,
    tone: "bg-teal-500/15 text-teal-700 dark:text-teal-300",
    label: "Crop AI",
  },
  recommendation: {
    Icon: Bot,
    tone: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
    label: "AgriMind",
  },
  observation: {
    Icon: Eye,
    tone: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
    label: "Observation",
  },
  harvest: {
    Icon: Sprout,
    tone: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
    label: "Harvest",
  },
  soil: {
    Icon: FlaskConical,
    tone: "bg-stone-500/15 text-stone-700 dark:text-stone-300",
    label: "Soil",
  },
  irrigation: {
    Icon: Droplets,
    tone: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300",
    label: "Irrigation",
  },
  plot: {
    Icon: Boxes,
    tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    label: "Plot",
  },
  drone: {
    Icon: Plane,
    tone: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
    label: "Drone",
  },
  satellite: {
    Icon: Satellite,
    tone: "bg-purple-500/15 text-purple-700 dark:text-purple-300",
    label: "Satellite",
  },
};

export function FarmTimeline({ events, limit = 20 }: { events: TimelineEvent[]; limit?: number }) {
  const sorted = [...events].sort((a, b) => (a.ts < b.ts ? 1 : -1)).slice(0, limit);
  return (
    <ol className="relative space-y-3 border-l pl-5">
      {sorted.map((e) => {
        const meta = KIND_META[e.kind];
        return (
          <li key={e.id} className="relative">
            <span
              className={cn(
                "absolute -left-[27px] grid h-6 w-6 place-items-center rounded-full ring-2 ring-background",
                meta.tone,
              )}
            >
              <meta.Icon className="h-3 w-3" />
            </span>
            <div className="surface-card p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium">{e.title}</p>
                <span className="shrink-0 text-[10px] uppercase tracking-wide text-muted-foreground">
                  {meta.label}
                </span>
              </div>
              {e.detail && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{e.detail}</p>
              )}
              <p className="mt-1 text-[11px] text-muted-foreground">
                {new Date(e.ts).toLocaleString()}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
