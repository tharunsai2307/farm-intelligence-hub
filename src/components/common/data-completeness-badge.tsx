import { cn } from "@/lib/utils";

export function DataCompletenessBadge({ percent }: { percent: number }) {
  const p = Math.max(0, Math.min(100, Math.round(percent)));
  const tone = p >= 80 ? "emerald" : p >= 50 ? "amber" : "rose";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        tone === "emerald" &&
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        tone === "amber" &&
          "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
        tone === "rose" && "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {p}% complete
    </span>
  );
}
