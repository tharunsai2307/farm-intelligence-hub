import { createFileRoute } from "@tanstack/react-router";
import { Tractor } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";

export const Route = createFileRoute("/_authenticated/farmos")({
  head: () => ({ meta: [{ title: "FarmOS — AgriTwin OS" }] }),
  component: () => (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="FarmOS" description="Operations: tasks, workers, inventory, equipment." />
      <EmptyState
        icon={Tractor}
        title="Operations module not yet enabled"
        description="Schedule tasks, manage labor, and track inventory once Phase 1 Part 2 ships."
      />
    </div>
  ),
});
