import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { CardSkeleton } from "@/components/common/loading-skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FarmSelector, useFarms } from "@/components/farmos/farm-selector";
import { TaskForm, TaskBoard } from "@/components/farmos/task-form";
import { listFarmTasks } from "@/lib/services/farmos.service";

export const Route = createFileRoute("/_authenticated/app/farmos/tasks")({
  head: () => ({ meta: [{ title: "Tasks — FarmOS" }] }),
  component: TasksPage,
});

function TasksPage() {
  const farmsQ = useFarms();
  const [farmId, setFarmId] = useState<string | undefined>();
  const activeFarm = farmId ?? farmsQ.data?.items[0]?.id;
  const [tab, setTab] = useState<"all" | "today" | "ai">("all");

  const q = useQuery({
    queryKey: ["tasks", activeFarm],
    queryFn: () => listFarmTasks({ data: { farm_id: activeFarm } }),
    enabled: !!activeFarm,
  });

  const all = q.data?.success ? q.data.data.items : [];
  const today = useMemo(() => {
    const d = new Date().toISOString().slice(0, 10);
    return all.filter(
      (t) => t.due_date && t.due_date <= d && t.status !== "completed" && t.status !== "cancelled",
    );
  }, [all]);
  const fromAI = useMemo(() => all.filter((t) => !!t.source_recommendation_id), [all]);

  const list = tab === "today" ? today : tab === "ai" ? fromAI : all;

  return (
    <div>
      <PageHeader
        title="Tasks"
        description="Plan, assign, and track farm work. AgriMind recommendations can be converted to tasks in one click."
        actions={
          <div className="flex items-center gap-2">
            <FarmSelector value={activeFarm} onChange={setFarmId} />
            {activeFarm && <TaskForm farmId={activeFarm} />}
          </div>
        }
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="mb-4">
        <TabsList>
          <TabsTrigger value="all">All ({all.length})</TabsTrigger>
          <TabsTrigger value="today">Today ({today.length})</TabsTrigger>
          <TabsTrigger value="ai">From AgriMind ({fromAI.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" />
        <TabsContent value="today" />
        <TabsContent value="ai" />
      </Tabs>

      {q.isLoading || !activeFarm ? (
        <CardSkeleton />
      ) : (
        <TaskBoard tasks={list} farmId={activeFarm} />
      )}
    </div>
  );
}
