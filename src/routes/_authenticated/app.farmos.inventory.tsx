import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { Input } from "@/components/ui/input";
import { CardSkeleton } from "@/components/common/loading-skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FarmSelector, useFarms } from "@/components/farmos/farm-selector";
import { InventoryForm, InventoryTable } from "@/components/farmos/inventory-form";
import { listInventoryItems } from "@/lib/services/farmos.service";

export const Route = createFileRoute("/_authenticated/app/farmos/inventory")({
  head: () => ({ meta: [{ title: "Inventory — FarmOS" }] }),
  component: InventoryPage,
});

const CATEGORIES = ["all", "seeds", "fertilizers", "pesticides", "organic_inputs", "tools", "spare_parts", "storage_materials", "other"] as const;

function InventoryPage() {
  const farmsQ = useFarms();
  const [farmId, setFarmId] = useState<string | undefined>();
  const activeFarm = farmId ?? farmsQ.data?.items[0]?.id;
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("all");

  const invQ = useQuery({
    queryKey: ["inventory", activeFarm],
    queryFn: () => listInventoryItems({ data: { farm_id: activeFarm } }),
    enabled: !!activeFarm,
  });

  const filtered = useMemo(() => {
    if (!invQ.data?.success) return [];
    return invQ.data.data.items.filter((i) => {
      if (cat !== "all" && i.category !== cat) return false;
      if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [invQ.data, cat, search]);

  return (
    <div>
      <PageHeader
        title="Inventory"
        description="Seeds, fertilisers, pesticides, tools, and spares — with low-stock and expiry alerts derived from your records."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <FarmSelector value={activeFarm} onChange={setFarmId} />
            {activeFarm && <InventoryForm farmId={activeFarm} />}
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Input className="w-[240px]" placeholder="Search items…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={cat} onValueChange={(v) => setCat(v as any)}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c === "all" ? "All categories" : c.replace("_", " ")}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {invQ.isLoading || !activeFarm ? <CardSkeleton /> : <InventoryTable items={filtered} farmId={activeFarm} />}
    </div>
  );
}
