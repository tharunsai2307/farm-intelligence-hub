import { createFileRoute } from "@tanstack/react-router";
import { FileBarChart2 } from "lucide-react";
import { ComingSoonPage } from "@/components/common/coming-soon";

export const Route = createFileRoute("/_authenticated/app/reports")({
  head: () => ({ meta: [{ title: "Sustainability & Yield Reports — AgriTwin OS" }] }),
  component: () => (
    <ComingSoonPage
      icon={FileBarChart2}
      title="Sustainability & Yield Reports"
      description="Generate downloadable reports from your real farm data \u2014 water use, soil health, yield, and emissions."
      bullets={[
    'Water footprint reports',
    'Soil-health reports',
    'Yield and revenue reports',
    'Exports as PDF or CSV',
      ]}
    />
  ),
});
