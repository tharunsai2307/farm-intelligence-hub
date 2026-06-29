import { createFileRoute } from "@tanstack/react-router";
import { Bot } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";

export const Route = createFileRoute("/_authenticated/assistant")({
  head: () => ({ meta: [{ title: "AI Assistant — AgriTwin OS" }] }),
  component: () => (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="AI Assistant" description="Ask anything about your farm in natural language." />
      <EmptyState
        icon={Bot}
        title="AI Assistant arriving in Phase 1 Part 2"
        description="Backed by Lovable AI — answers will be grounded in your real farm data, never fabricated."
      />
    </div>
  ),
});
