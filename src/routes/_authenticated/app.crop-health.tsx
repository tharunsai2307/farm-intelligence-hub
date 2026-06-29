import { createFileRoute } from "@tanstack/react-router";
import { Leaf } from "lucide-react";
import { ComingSoonPage } from "@/components/common/coming-soon";

export const Route = createFileRoute("/_authenticated/app/crop-health")({
  head: () => ({ meta: [{ title: "Crop Health Monitoring — AgriTwin OS" }] }),
  component: () => (
    <ComingSoonPage
      icon={Leaf}
      title="Crop Health Monitoring"
      description="This module will analyze real crop images using a connected AI model. No predictions are shown until images are uploaded and an AI model is connected."
      bullets={[
    'Upload field photos from your phone or drone',
    'AI-powered disease and stress detection',
    'Track health changes over time',
    'Get treatment recommendations from agronomists',
      ]}
    />
  ),
});
