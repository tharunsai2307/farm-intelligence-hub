import { createFileRoute } from "@tanstack/react-router";
import { Boxes } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";

export const Route = createFileRoute("/_authenticated/digital-twin")({
  head: () => ({ meta: [{ title: "Digital Twin — AgriTwin OS" }] }),
  component: () => (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Digital Twin" description="A live 3D model of your farm — coming in Phase 1 Part 2." />
      <EmptyState
        icon={Boxes}
        title="Digital Twin not yet provisioned"
        description="This module will render a real-time geospatial twin of your farm using satellite and sensor data."
      />
    </div>
  ),
});
