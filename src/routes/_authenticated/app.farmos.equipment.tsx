import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Wrench } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { CardSkeleton } from "@/components/common/loading-skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { FarmSelector, useFarms } from "@/components/farmos/farm-selector";
import { EquipmentForm, EquipmentCard } from "@/components/farmos/equipment-form";
import { listEquipmentItems } from "@/lib/services/farmos.service";

export const Route = createFileRoute("/_authenticated/app/farmos/equipment")({
  head: () => ({ meta: [{ title: "Equipment — FarmOS" }] }),
  component: EquipmentPage,
});

function EquipmentPage() {
  const farmsQ = useFarms();
  const [farmId, setFarmId] = useState<string | undefined>();
  const activeFarm = farmId ?? farmsQ.data?.items[0]?.id;

  const q = useQuery({
    queryKey: ["equipment", activeFarm],
    queryFn: () => listEquipmentItems({ data: { farm_id: activeFarm } }),
    enabled: !!activeFarm,
  });

  const items = q.data?.success ? q.data.data.items : [];

  return (
    <div>
      <PageHeader
        title="Equipment"
        description="Tractors, pumps, drip systems, sensors, and more. Status reflects what you record — never guessed."
        actions={
          <div className="flex items-center gap-2">
            <FarmSelector value={activeFarm} onChange={setFarmId} />
            {activeFarm && <EquipmentForm farmId={activeFarm} />}
          </div>
        }
      />
      {q.isLoading || !activeFarm ? (
        <CardSkeleton />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No equipment yet"
          description="Add tractors, pumps, sprayers, or sensors to track operating status and maintenance schedules."
          action={activeFarm ? <EquipmentForm farmId={activeFarm} /> : undefined}
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {items.map((e) => <EquipmentCard key={e.id} item={e} />)}
        </div>
      )}
    </div>
  );
}
