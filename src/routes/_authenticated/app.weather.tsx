import { createFileRoute } from "@tanstack/react-router";
import { CloudSun } from "lucide-react";
import { ComingSoonPage } from "@/components/common/coming-soon";

export const Route = createFileRoute("/_authenticated/app/weather")({
  head: () => ({
    meta: [
      { title: "Weather Intelligence — AgriTwin OS" },
      { name: "description", content: "Hyperlocal forecasts, rainfall, evapotranspiration, and severe-weather alerts tuned to your farm coordinates." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Weather Intelligence — AgriTwin OS" },
      { property: "og:description", content: "Hyperlocal agricultural weather, rainfall, and forecasts for your exact farm location." },
      { property: "og:url", content: "https://agri-twin-os.lovable.app/app/weather" },
    ],
    links: [{ rel: "canonical", href: "https://agri-twin-os.lovable.app/app/weather" }],
  }),
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
