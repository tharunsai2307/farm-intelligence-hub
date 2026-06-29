import { createFileRoute } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";

export const Route = createFileRoute("/_authenticated/marketplace")({
  head: () => ({ meta: [{ title: "Marketplace — AgriTwin OS" }] }),
  component: () => (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Marketplace" description="Buy inputs and sell produce — coming soon." />
      <EmptyState
        icon={ShoppingBag}
        title="Marketplace not yet live"
        description="A trusted marketplace for inputs and buyers will launch with Phase 2."
      />
    </div>
  ),
});
