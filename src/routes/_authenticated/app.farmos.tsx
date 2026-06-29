import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { FarmOSNav } from "@/components/farmos/farmos-nav";

export const Route = createFileRoute("/_authenticated/app/farmos")({
  head: () => ({ meta: [{ title: "FarmOS — AgriTwin OS" }] }),
  component: () => (
    <AppShell>
      <div className="mx-auto max-w-7xl">
        <FarmOSNav />
        <Outlet />
      </div>
    </AppShell>
  ),
});
