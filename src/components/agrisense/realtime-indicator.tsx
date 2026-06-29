import { useEffect, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * RealtimeIndicator
 *
 * Tiny status pill driven by an external `connected` flag (e.g. from a
 * Supabase realtime channel `SUBSCRIBED` state). Animates a soft pulse while
 * connected. Never claims connectivity it can't verify.
 */
export function RealtimeIndicator({
  connected,
  label,
  lastEventAt,
}: {
  connected: boolean;
  label?: string;
  lastEventAt?: string | null;
}) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!lastEventAt) return;
    setTick((t) => t + 1);
    const id = setTimeout(() => setTick(0), 1200);
    return () => clearTimeout(id);
  }, [lastEventAt]);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors",
        connected
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "border-border bg-muted text-muted-foreground",
      )}
    >
      <span className="relative inline-flex h-2 w-2">
        {connected && (
          <span
            className={cn(
              "absolute inset-0 rounded-full bg-emerald-500/60",
              tick > 0 && "animate-ping",
            )}
            aria-hidden
          />
        )}
        <span
          className={cn(
            "relative inline-block h-2 w-2 rounded-full",
            connected ? "bg-emerald-500" : "bg-muted-foreground/50",
          )}
        />
      </span>
      {connected ? (
        <Wifi className="h-3 w-3" />
      ) : (
        <WifiOff className="h-3 w-3" />
      )}
      <span>{label ?? (connected ? "Live" : "Offline")}</span>
    </span>
  );
}
