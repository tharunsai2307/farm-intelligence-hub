import { CheckCircle2, CircleAlert, MinusCircle, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type DataStatus =
  | "connected"
  | "configured"
  | "has_records"
  | "set"
  | "no_records"
  | "none"
  | "missing"
  | "not_configured"
  | "not_available";

const MAP: Record<
  DataStatus,
  { label: string; tone: "success" | "warning" | "muted"; icon: LucideIcon }
> = {
  connected: { label: "Connected", tone: "success", icon: CheckCircle2 },
  configured: { label: "Configured", tone: "success", icon: CheckCircle2 },
  has_records: { label: "Has records", tone: "success", icon: CheckCircle2 },
  set: { label: "Set", tone: "success", icon: CheckCircle2 },
  no_records: { label: "No records", tone: "warning", icon: CircleAlert },
  none: { label: "Not created", tone: "warning", icon: CircleAlert },
  missing: { label: "Missing", tone: "warning", icon: CircleAlert },
  not_configured: { label: "Not configured", tone: "muted", icon: MinusCircle },
  not_available: { label: "Phase 2", tone: "muted", icon: MinusCircle },
};


export function DataSourceStatusBadge({ status }: { status: DataStatus }) {
  const m = MAP[status];
  const Icon = m.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
        m.tone === "success" && "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        m.tone === "warning" && "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
        m.tone === "muted" && "border-border bg-muted/40 text-muted-foreground",
      )}
    >
      <Icon className="h-3 w-3" />
      {m.label}
    </span>
  );
}
