import { createFileRoute } from "@tanstack/react-router";
import { Tractor } from "lucide-react";
import { ComingSoonPage } from "@/components/common/coming-soon";

export const Route = createFileRoute("/_authenticated/app/farmos")({
  head: () => ({ meta: [{ title: "FarmOS Management — AgriTwin OS" }] }),
  component: () => (
    <ComingSoonPage
      icon={Tractor}
      title="FarmOS Management"
      description="Manage tasks, inputs, labour, and expenses in one place \u2014 the operations backbone of your farm."
      bullets={[
    'Task assignments and daily plans',
    'Input inventory and usage tracking',
    'Expense and revenue ledger',
    'Labour and equipment scheduling',
      ]}
    />
  ),
});
