import { Check, CircleDashed, MinusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * TwinStatusPanel
 *
 * Sidebar-style summary of which real-data sources are powering the digital
 * twin. Tri-state per source: connected / partial / unavailable. The page
 * computes the booleans from real query results; never guess.
 */
export type TwinStatusItem = {
  label: string;
  state: "connected" | "partial" | "unavailable";
  detail?: string;
};

export function TwinStatusPanel({ items }: { items: TwinStatusItem[] }) {
  const connected = items.filter((i) => i.state === "connected").length;
  return (
    <div className="surface-card p-4">
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Twin Live Sources</h3>
        <Badge variant="outline" className="text-[10px]">
          {connected}/{items.length}
        </Badge>
      </header>
      <ul className="mt-3 space-y-2 text-sm">
        {items.map((i) => {
          const Icon =
            i.state === "connected" ? Check : i.state === "partial" ? CircleDashed : MinusCircle;
          const tone =
            i.state === "connected"
              ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-600"
              : i.state === "partial"
                ? "border-amber-500/40 bg-amber-500/15 text-amber-600"
                : "border-border text-muted-foreground";
          return (
            <li key={i.label} className="flex items-start gap-2">
              <span className={cn("mt-0.5 grid h-5 w-5 place-items-center rounded-full border", tone)}>
                <Icon className="h-3 w-3" />
              </span>
              <div className="min-w-0">
                <p className={cn("text-sm", i.state === "unavailable" && "text-muted-foreground")}>
                  {i.label}
                </p>
                {i.detail && (
                  <p className="text-[11px] text-muted-foreground">{i.detail}</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
