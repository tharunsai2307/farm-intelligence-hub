import { createFileRoute } from "@tanstack/react-router";
import { Leaf } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";

export const Route = createFileRoute("/_authenticated/crop-health")({
  head: () => ({ meta: [{ title: "Crop Health — AgriTwin OS" }] }),
  component: () => (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Crop Health" description="AI-driven disease and stress detection from crop imagery." />
      <EmptyState
        icon={Leaf}
        title="No crop images uploaded yet"
        description="Upload field photos to run computer-vision health analysis. Available in Phase 1 Part 2."
      />
    </div>
  ),
});
