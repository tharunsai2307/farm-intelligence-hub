import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { CardSkeleton } from "@/components/common/loading-skeleton";
import { FarmSelector, useFarms } from "@/components/farmos/farm-selector";
import { HarvestForm, HarvestPlanner } from "@/components/farmos/harvest-form";
import { listFarmHarvests } from "@/lib/services/farmos.service";

export const Route = createFileRoute("/_authenticated/app/farmos/harvest")({
  head: () => ({ meta: [{ title: "Harvest Planning — FarmOS" }] }),
  component: HarvestPage,
});

function HarvestPage() {
  const farmsQ = useFarms();
  const [farmId, setFarmId] = useState<string | undefined>();
  const activeFarm = farmId ?? farmsQ.data?.items[0]?.id;

  const q = useQuery({
    queryKey: ["harvest", activeFarm],
    queryFn: () => listFarmHarvests({ data: { farm_id: activeFarm } }),
    enabled: !!activeFarm,
  });

  const items = q.data?.success ? q.data.data.items : [];

  return (
    <div>
      <PageHeader
        title="Harvest planning"
        description="Plan and record harvests — expected vs actual quantities, storage, and buyers. No yield predictions here."
        actions={
          <div className="flex items-center gap-2">
            <FarmSelector value={activeFarm} onChange={setFarmId} />
            {activeFarm && <HarvestForm farmId={activeFarm} />}
          </div>
        }
      />
      {q.isLoading || !activeFarm ? <CardSkeleton /> : <HarvestPlanner items={items} farmId={activeFarm} />}
    </div>
  );
}
