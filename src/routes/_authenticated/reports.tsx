import { createFileRoute } from "@tanstack/react-router";
import { FileBarChart2 } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({ meta: [{ title: "Reports — AgriTwin OS" }] }),
  component: () => (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Reports" description="Auto-generated PDF and CSV exports for every module." />
      <EmptyState
        icon={FileBarChart2}
        title="No reports generated yet"
        description="Reports will appear here once you start logging data across your farms."
      />
    </div>
  ),
});
