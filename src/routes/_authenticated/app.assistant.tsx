import { createFileRoute } from "@tanstack/react-router";
import { Bot } from "lucide-react";
import { ComingSoonPage } from "@/components/common/coming-soon";

export const Route = createFileRoute("/_authenticated/app/assistant")({
  head: () => ({ meta: [{ title: "AI Farm Assistant — AgriTwin OS" }] }),
  component: () => (
    <ComingSoonPage
      icon={Bot}
      title="AI Farm Assistant"
      description="A conversational assistant grounded in your farm data and trusted agricultural sources. Disabled until a model is connected."
      bullets={[
    'Ask questions about your farm in plain language',
    'Multilingual support',
    'Grounded in your real records — not hallucinations',
    'Always shows its sources',
      ]}
    />
  ),
});
