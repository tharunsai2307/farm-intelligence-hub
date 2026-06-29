import { createFileRoute } from "@tanstack/react-router";
import { CloudSun } from "lucide-react";
import { ComingSoonPage } from "@/components/common/coming-soon";

export const Route = createFileRoute("/_authenticated/app/weather")({
  head: () => ({ meta: [{ title: "Weather Intelligence — AgriTwin OS" }] }),
  component: () => (
    <ComingSoonPage
      icon={CloudSun}
      title="Weather Intelligence"
      description="Hyperlocal weather, rainfall, and forecast data \u2014 powered by real weather APIs configured for your farm location. Nothing is shown until an API is connected."
      bullets={[
    'Live conditions for your exact farm coordinates',
    '7-day forecast tuned for agriculture',
    'Rainfall, ET, and degree-day tracking',
    'Severe-weather alerts via notifications',
      ]}
    />
  ),
});
