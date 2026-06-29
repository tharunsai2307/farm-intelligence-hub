import { createFileRoute, Outlet } from "@tanstack/react-router";
import { FarmOSNav } from "@/components/farmos/farmos-nav";

export const Route = createFileRoute("/_authenticated/app/farmos")({
  head: () => ({ meta: [{ title: "FarmOS — AgriTwin OS" }] }),
  component: () => (
    <div className="mx-auto max-w-7xl">
      <FarmOSNav />
      <Outlet />
    </div>
  ),
});
