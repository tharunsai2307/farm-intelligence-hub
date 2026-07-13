import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { FileBarChart2, Download, Droplets, Sprout, TrendingUp, Wallet } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FarmSelector, useFarms } from "@/components/farmos/farm-selector";
import { listIrrigationRecords, listSoilRecords } from "@/lib/services/records.functions";

export const Route = createFileRoute("/_authenticated/app/reports")({
  head: () => ({
    meta: [
      { title: "Reports & Exports — AgriTwin OS" },
      {
        name: "description",
        content: "Export your farm data as CSV — soil, irrigation, and operations records.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const farmsQ = useFarms();
  const [farmId, setFarmId] = useState<string | undefined>();
  const activeFarmId = farmId ?? farmsQ.data?.items[0]?.id;

  const irrFn = useServerFn(listIrrigationRecords);
  const soilFn = useServerFn(listSoilRecords);

  const irrQ = useQuery({
    queryKey: ["reports", "irrigation", activeFarmId],
    queryFn: () => irrFn({ data: { farm_id: activeFarmId } }),
    enabled: !!activeFarmId,
  });
  const soilQ = useQuery({
    queryKey: ["reports", "soil", activeFarmId],
    queryFn: () => soilFn({ data: { farm_id: activeFarmId } }),
    enabled: !!activeFarmId,
  });

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      <PageHeader
        title="Reports & Exports"
        description="Download your farm data as CSV. Exports use only what you've logged — nothing is invented."
        actions={<FarmSelector value={activeFarmId} onChange={setFarmId} />}
      />

      {!activeFarmId ? (
        <EmptyState
          icon={FileBarChart2}
          title="Add a farm to generate reports"
          description="Create a farm first."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ReportCard
            icon={Droplets}
            title="Irrigation log"
            count={irrQ.data?.items.length ?? 0}
            loading={irrQ.isLoading}
            onDownload={() => downloadCsv("irrigation", irrQ.data?.items ?? [])}
          />
          <ReportCard
            icon={Sprout}
            title="Soil records"
            count={soilQ.data?.items.length ?? 0}
            loading={soilQ.isLoading}
            onDownload={() => downloadCsv("soil-records", soilQ.data?.items ?? [])}
          />
          <ComingSoonCard
            icon={TrendingUp}
            title="Yield report"
            note="Available once harvests are logged across a full season."
          />
          <ComingSoonCard
            icon={Wallet}
            title="Expense summary"
            note="Aggregates expenses by category — appears once you log expenses in FarmOS."
          />
        </div>
      )}
    </div>
  );
}

function ReportCard({
  icon: Icon,
  title,
  count,
  loading,
  onDownload,
}: {
  icon: typeof Droplets;
  title: string;
  count: number;
  loading: boolean;
  onDownload: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-16 w-full" />
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-2xl font-semibold tabular-nums">{count}</div>
              <div className="text-xs text-muted-foreground">records available</div>
            </div>
            <Button onClick={onDownload} disabled={count === 0} size="sm">
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ComingSoonCard({
  icon: Icon,
  title,
  note,
}: {
  icon: typeof TrendingUp;
  title: string;
  note: string;
}) {
  return (
    <Card className="opacity-70">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  );
}

function downloadCsv(name: string, rows: Record<string, unknown>[]) {
  if (!rows.length) {
    toast.message("Nothing to export yet.");
    return;
  }
  const headers = Array.from(
    rows.reduce<Set<string>>((acc, r) => {
      Object.keys(r).forEach((k) => acc.add(k));
      return acc;
    }, new Set()),
  );
  const escape = (v: unknown) => {
    if (v == null) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
