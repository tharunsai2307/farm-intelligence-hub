import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { CardSkeleton } from "@/components/common/loading-skeleton";
import { FarmSelector, useFarms } from "@/components/farmos/farm-selector";
import { ExpenseForm, ExpenseChart } from "@/components/farmos/expense-form";
import { listFarmExpenses } from "@/lib/services/farmos.service";

export const Route = createFileRoute("/_authenticated/app/farmos/expenses")({
  head: () => ({ meta: [{ title: "Expenses — FarmOS" }] }),
  component: ExpensesPage,
});

function ExpensesPage() {
  const farmsQ = useFarms();
  const [farmId, setFarmId] = useState<string | undefined>();
  const activeFarm = farmId ?? farmsQ.data?.items[0]?.id;

  const q = useQuery({
    queryKey: ["expenses", activeFarm],
    queryFn: () => listFarmExpenses({ data: { farm_id: activeFarm } }),
    enabled: !!activeFarm,
  });

  const data = q.data?.success
    ? q.data.data
    : { items: [], totals: { byCategory: {}, byMonth: {}, grandTotal: 0 } };

  return (
    <div>
      <PageHeader
        title="Expenses"
        description="Track seeds, labour, fuel, water, electricity, and more. Upload receipts for every entry."
        actions={
          <div className="flex items-center gap-2">
            <FarmSelector value={activeFarm} onChange={setFarmId} />
            {activeFarm && <ExpenseForm farmId={activeFarm} />}
          </div>
        }
      />
      {q.isLoading || !activeFarm ? (
        <CardSkeleton />
      ) : (
        <ExpenseChart items={data.items} totals={data.totals} farmId={activeFarm} />
      )}
    </div>
  );
}
