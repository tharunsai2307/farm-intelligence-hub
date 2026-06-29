import { createFileRoute } from "@tanstack/react-router";
import { Droplets } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";

export const Route = createFileRoute("/_authenticated/irrigation")({
  head: () => ({ meta: [{ title: "Irrigation — AgriTwin OS" }] }),
  component: () => (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Smart Irrigation" description="Schedule and track water use across every block." />
      <EmptyState
        icon={Droplets}
        title="No irrigation events recorded"
        description="Log irrigation cycles manually or connect a controller to see real usage analytics."
      />
    </div>
  ),
});
