import { createFileRoute } from "@tanstack/react-router";
import { Boxes } from "lucide-react";
import { ComingSoonPage } from "@/components/common/coming-soon";

export const Route = createFileRoute("/_authenticated/app/digital-twin")({
  head: () => ({ meta: [{ title: "Digital Farm Twin — AgriTwin OS" }] }),
  component: () => (
    <ComingSoonPage
      icon={Boxes}
      title="Digital Farm Twin"
      description="A spatial model of your farm built from your real GPS, plot, and crop data. The map will be generated once you connect a primary farm and (optionally) draw plots."
      bullets={[
    'Interactive farm map with plot boundaries',
    'Per-plot crop, soil, and irrigation overlays',
    'Sensor and weather data layered onto geometry',
    'Time-travel view of farm changes',
      ]}
    />
  ),
});
