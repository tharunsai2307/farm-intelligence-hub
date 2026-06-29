import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/layout/app-shell";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }

    const path = location.pathname;
    const onOnboarding = path.startsWith("/onboarding");

    // Pull profile + farm count to gate access to /app/*
    const [{ data: profile }, { count: farmCount }] = await Promise.all([
      supabase
        .from("profiles")
        .select("onboarded, full_name")
        .eq("id", data.user.id)
        .maybeSingle(),
      supabase
        .from("farms")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", data.user.id),
    ]);

    const profileComplete = Boolean(profile?.onboarded || profile?.full_name);
    const hasFarm = (farmCount ?? 0) > 0;

    if (!onOnboarding) {
      if (!profileComplete) {
        throw redirect({ to: "/onboarding/profile" });
      }
      if (!hasFarm) {
        throw redirect({ to: "/onboarding/farm" });
      }
    }

    return { user: data.user };
  },

  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

