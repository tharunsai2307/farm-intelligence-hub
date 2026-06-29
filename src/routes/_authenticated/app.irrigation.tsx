import { createFileRoute } from "@tanstack/react-router";
import { Droplets } from "lucide-react";
import { ComingSoonPage } from "@/components/common/coming-soon";

export const Route = createFileRoute("/_authenticated/app/irrigation")({
  head: () => ({ meta: [{ title: "Irrigation Records — AgriTwin OS" }] }),
  component: () => (
    <ComingSoonPage
      icon={Droplets}
      title="Irrigation Records"
      description="Log every irrigation event by source, method, and volume. We never invent moisture values \u2014 only show what you log or what your sensors report."
      bullets={[
    'Per-plot irrigation history',
    'Sensor-driven moisture tracking (when connected)',
    'Water-use summaries by crop and season',
    'Schedule planning informed by weather',
      ]}
    />
  ),
});
