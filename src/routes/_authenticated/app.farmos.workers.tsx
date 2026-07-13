import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Users } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { CardSkeleton } from "@/components/common/loading-skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { FarmSelector, useFarms } from "@/components/farmos/farm-selector";
import { WorkerForm, WorkerCard } from "@/components/farmos/worker-form";
import { listFarmWorkers } from "@/lib/services/farmos.service";

export const Route = createFileRoute("/_authenticated/app/farmos/workers")({
  head: () => ({ meta: [{ title: "Workers — FarmOS" }] }),
  component: WorkersPage,
});

function WorkersPage() {
  const farmsQ = useFarms();
  const [farmId, setFarmId] = useState<string | undefined>();
  const activeFarm = farmId ?? farmsQ.data?.items[0]?.id;

  const q = useQuery({
    queryKey: ["workers", activeFarm],
    queryFn: () => listFarmWorkers({ data: { farm_id: activeFarm } }),
    enabled: !!activeFarm,
  });

  const items = q.data?.success ? q.data.data.items : [];

  return (
    <div>
      <PageHeader
        title="Workers"
        description="Manage farm workers, skills, daily wages, and availability. Assign them to tasks in one click."
        actions={
          <div className="flex items-center gap-2">
            <FarmSelector value={activeFarm} onChange={setFarmId} />
            {activeFarm && <WorkerForm farmId={activeFarm} />}
          </div>
        }
      />
      {q.isLoading || !activeFarm ? (
        <CardSkeleton />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No workers yet"
          description="Add the workers, helpers, and contractors who help run your farm."
          action={activeFarm ? <WorkerForm farmId={activeFarm} /> : undefined}
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {items.map((w) => (
            <WorkerCard key={w.id} worker={w} />
          ))}
        </div>
      )}
    </div>
  );
}
