import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { CardSkeleton } from "@/components/common/loading-skeleton";
import { FarmSelector, useFarms } from "@/components/farmos/farm-selector";
import { TaskCalendar } from "@/components/farmos/task-calendar";
import { listFarmCalendar } from "@/lib/services/farmos.service";

export const Route = createFileRoute("/_authenticated/app/farmos/calendar")({
  head: () => ({ meta: [{ title: "Calendar — FarmOS" }] }),
  component: CalendarPage,
});

function CalendarPage() {
  const farmsQ = useFarms();
  const [farmId, setFarmId] = useState<string | undefined>();
  const activeFarm = farmId ?? farmsQ.data?.items[0]?.id;
  const [month, setMonth] = useState<Date>(() => new Date());

  const { from, to } = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth() - 1, 1).toISOString().slice(0, 10);
    const last = new Date(month.getFullYear(), month.getMonth() + 2, 0).toISOString().slice(0, 10);
    return { from: first, to: last };
  }, [month]);

  const q = useQuery({
    queryKey: ["calendar", activeFarm, from, to],
    queryFn: () => listFarmCalendar({ data: { farm_id: activeFarm, from, to } }),
    enabled: !!activeFarm,
  });

  const items = q.data?.success ? q.data.data.items : [];

  return (
    <div>
      <PageHeader
        title="Farm calendar"
        description="Tasks, harvests, maintenance and custom events — combined from real records."
        actions={<FarmSelector value={activeFarm} onChange={setFarmId} />}
      />
      {q.isLoading || !activeFarm ? (
        <CardSkeleton />
      ) : (
        <TaskCalendar items={items} month={month} onMonthChange={setMonth} />
      )}
    </div>
  );
}
