import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Tractor, ClipboardList, Boxes, Wrench, Receipt, Sprout, AlertTriangle, ArrowRight } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { CardSkeleton } from "@/components/common/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FarmSelector, useFarms } from "@/components/farmos/farm-selector";
import { FarmOSNotificationPanel } from "@/components/farmos/notification-panel";
import { getFarmOSOverview } from "@/lib/services/farmos.service";

export const Route = createFileRoute("/_authenticated/app/farmos/")({
  head: () => ({ meta: [{ title: "FarmOS Overview — AgriTwin OS" }] }),
  component: FarmOSIndexPage,
});

function FarmOSIndexPage() {
  const farmsQ = useFarms();
  const farms = farmsQ.data?.items ?? [];
  const [farmId, setFarmId] = useState<string | undefined>();
  const activeFarm = farmId ?? farms[0]?.id;

  const overviewQ = useQuery({
    queryKey: ["farmos-overview", activeFarm],
    queryFn: () => getFarmOSOverview({ data: { farm_id: activeFarm } }),
    enabled: !!activeFarm,
  });

  if (farmsQ.isLoading) return <CardSkeleton />;
  if (!activeFarm) {
    return (
      <EmptyState
        icon={Tractor}
        title="Add a farm to use FarmOS"
        description="FarmOS turns AgriMind recommendations into real tasks, inventory, equipment, expenses, and harvest plans."
        action={<Button asChild><Link to="/onboarding/farm">Add farm</Link></Button>}
      />
    );
  }

  const data = overviewQ.data?.success ? overviewQ.data.data : null;
  const exp = data?.expense_summary;

  return (
    <div>
      <PageHeader
        title="FarmOS"
        description="Operations powered by your real farm data. AgriMind recommends — FarmOS executes."
        actions={<FarmSelector value={activeFarm} onChange={setFarmId} />}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ClipboardList} label="Today's tasks" value={data?.today_tasks.length ?? 0} href="/app/farmos/tasks" />
        <StatCard icon={ClipboardList} label="Open tasks" value={data?.open_task_count ?? 0} href="/app/farmos/tasks" />
        <StatCard icon={Boxes} label="Stock alerts" value={data?.low_stock.length ?? 0} tone={data?.low_stock.length ? "warn" : undefined} href="/app/farmos/inventory" />
        <StatCard icon={Wrench} label="Maintenance due" value={data?.maintenance_due.length ?? 0} tone={data?.maintenance_due.length ? "warn" : undefined} href="/app/farmos/equipment" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="surface-card p-4 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Expense summary</h2>
            <Button asChild variant="ghost" size="sm"><Link to="/app/farmos/expenses">Open <ArrowRight className="ml-1 h-3 w-3" /></Link></Button>
          </div>
          {exp && (exp.thisMonth || exp.lastMonth) ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div><p className="text-xs text-muted-foreground">This month</p><p className="text-xl font-semibold">₹{exp.thisMonth.toLocaleString()}</p></div>
              <div><p className="text-xs text-muted-foreground">Last month</p><p className="text-xl font-semibold">₹{exp.lastMonth.toLocaleString()}</p></div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-xs text-muted-foreground">Top categories</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {Object.entries(exp.byCategory).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, v]) => (
                    <Badge key={k} variant="outline" className="text-[10px] capitalize">{k}: ₹{v.toLocaleString()}</Badge>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No expenses logged yet.</p>
          )}
        </div>

        <div className="surface-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Upcoming harvest</h2>
            <Button asChild variant="ghost" size="sm"><Link to="/app/farmos/harvest">Open</Link></Button>
          </div>
          {(data?.upcoming_harvest ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming harvest in the next 30 days.</p>
          ) : (
            <ul className="space-y-2">
              {data!.upcoming_harvest.map((h) => (
                <li key={h.id} className="flex items-center gap-2 text-sm">
                  <Sprout className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="flex-1 truncate">{h.crop}</span>
                  <span className="text-xs text-muted-foreground">{h.expected_harvest_date}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold">Live alerts</h2>
        {data && <FarmOSNotificationPanel data={data} />}
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone, href }: { icon: any; label: string; value: number; tone?: "warn"; href: string }) {
  return (
    <Link to={href} className="surface-card group flex items-center gap-3 p-4 transition hover:bg-accent">
      <div className={`grid h-10 w-10 place-items-center rounded-lg ${tone === "warn" ? "bg-amber-500/15 text-amber-600" : "bg-primary/15 text-primary"}`}>
        {tone === "warn" && value > 0 ? <AlertTriangle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
    </Link>
  );
}
