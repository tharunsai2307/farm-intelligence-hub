import { createFileRoute } from "@tanstack/react-router";
import { LineChart } from "lucide-react";
import { ComingSoonPage } from "@/components/common/coming-soon";

export const Route = createFileRoute("/_authenticated/app/yield-prediction")({
  head: () => ({ meta: [{ title: "Yield Prediction — AgriTwin OS" }] }),
  component: () => (
    <ComingSoonPage
      icon={LineChart}
      title="Yield Prediction"
      description="Yield modeling will require real crop, soil, and historical records. Nothing is estimated until enough real data is captured."
      bullets={[
        "Crop-specific yield models",
        "Inputs: sowing date, variety, weather, soil",
        "Confidence intervals — not point guesses",
        "Season-over-season comparison",
      ]}
    />
  ),
});
