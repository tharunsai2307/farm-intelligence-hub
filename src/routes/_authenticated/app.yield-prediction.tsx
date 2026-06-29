import { createFileRoute } from "@tanstack/react-router";
import { LineChart } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";

export const Route = createFileRoute("/_authenticated/yield-prediction")({
  head: () => ({ meta: [{ title: "Yield Prediction — AgriTwin OS" }] }),
  component: () => (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Yield Prediction" description="ML-driven yield forecasts based on your farm telemetry." />
      <EmptyState
        icon={LineChart}
        title="Not enough data to model yield"
        description="Add at least one full season of crop, weather, and soil records to enable predictions."
      />
    </div>
  ),
});
