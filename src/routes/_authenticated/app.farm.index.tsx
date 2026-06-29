import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/app/farm/")({
  beforeLoad: () => {
    throw redirect({ to: "/app/farm/plots" });
  },
});
