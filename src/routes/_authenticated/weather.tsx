import { createFileRoute } from "@tanstack/react-router";
import { CloudSun } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";

export const Route = createFileRoute("/_authenticated/weather")({
  head: () => ({ meta: [{ title: "Weather — AgriTwin OS" }] }),
  component: () => (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Weather" description="Hyperlocal forecasts and alerts for every farm." />
      <EmptyState
        icon={CloudSun}
        title="Weather feed not connected"
        description="Connect your farm location to start streaming real weather observations and forecasts."
      />
    </div>
  ),
});
