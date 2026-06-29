import { createFileRoute } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { ComingSoonPage } from "@/components/common/coming-soon";

export const Route = createFileRoute("/_authenticated/app/marketplace")({
  head: () => ({ meta: [{ title: "Marketplace — AgriTwin OS" }] }),
  component: () => (
    <ComingSoonPage
      icon={ShoppingBag}
      title="Marketplace"
      description="Connect to verified input suppliers and produce buyers. Activates after KYC and partner onboarding."
      bullets={[
    'Discover inputs at transparent prices',
    'List produce for verified buyers',
    'Logistics and contract templates',
    'No middleman markup',
      ]}
    />
  ),
});
