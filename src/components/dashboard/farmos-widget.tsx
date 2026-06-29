import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Tractor, ClipboardList, Boxes, Wrench, Sprout, Receipt, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CardSkeleton } from "@/components/common/loading-skeleton";
import { getFarmOSOverview } from "@/lib/services/farmos.service";

export function FarmOSDashboardWidget({ farmId }: { farmId: string }) {
  const q = useQuery({
    queryKey: ["farmos-overview", farmId],
    queryFn: () => getFarmOSOverview({ data: { farm_id: farmId } }),
    enabled: !!farmId,
  });

  const d = q.data?.success ? q.data.data : null;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Tractor className="h-4 w-4" /> FarmOS operations
        </h2>
        <Button asChild variant="ghost" size="sm">
          <Link to="/app/farmos">Open FarmOS <ArrowRight className="ml-1 h-3 w-3" /></Link>
        </Button>
      </div>
      {q.isLoading || !d ? (
        <CardSkeleton />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Tile href="/app/farmos/tasks" icon={ClipboardList} label="Today's tasks" value={d.today_tasks.length} tone={d.today_tasks.length ? "warn" : "default"}>
            {d.today_tasks.slice(0, 3).map((t) => <li key={t.id} className="truncate text-xs text-muted-foreground">• {t.title}</li>)}
          </Tile>
          <Tile href="/app/farmos/tasks" icon={ClipboardList} label="Open tasks" value={d.open_task_count} />
          <Tile href="/app/farmos/inventory" icon={Boxes} label="Stock alerts" value={d.low_stock.length} tone={d.low_stock.length ? "warn" : "default"}>
            {d.low_stock.slice(0, 3).map((i) => <li key={i.id} className="truncate text-xs text-muted-foreground">• {i.name}</li>)}
          </Tile>
          <Tile href="/app/farmos/equipment" icon={Wrench} label="Maintenance due" value={d.maintenance_due.length} tone={d.maintenance_due.length ? "warn" : "default"} />
          <Tile href="/app/farmos/harvest" icon={Sprout} label="Upcoming harvest" value={d.upcoming_harvest.length}>
            {d.upcoming_harvest.slice(0, 3).map((h) => <li key={h.id} className="truncate text-xs text-muted-foreground">• {h.crop} · {h.expected_harvest_date}</li>)}
          </Tile>
          <Tile href="/app/farmos/expenses" icon={Receipt} label="This month spend" value={`₹${d.expense_summary.thisMonth.toLocaleString()}`} />
        </div>
      )}
    </section>
  );
}

function Tile({
  href, icon: Icon, label, value, tone, children,
}: {
  href: string; icon: any; label: string; value: number | string; tone?: "warn" | "default"; children?: React.ReactNode;
}) {
  return (
    <Link to={href} className="surface-card group block p-4 transition hover:bg-accent">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="h-3.5 w-3.5" /> {label}</span>
        {tone === "warn" && Number(value) > 0 && <Badge variant="outline" className="text-[10px] text-amber-600">attention</Badge>}
      </div>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      {children && <ul className="mt-2 space-y-0.5">{children}</ul>}
    </Link>
  );
}
