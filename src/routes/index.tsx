import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Sprout, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/dashboard" });
  },
  head: () => ({
    meta: [
      { title: "AgriTwin OS — The Intelligent Operating System for Every Farm" },
      {
        name: "description",
        content:
          "Monitor, predict, and optimize your farm with an AI-powered Digital Twin. Real data. Real decisions.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-surface">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-brand text-primary-foreground">
            <Sprout className="h-4 w-4" />
          </div>
          AgriTwin OS
        </div>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" asChild><Link to="/auth">Sign in</Link></Button>
          <Button asChild><Link to="/auth" search={{ mode: "register" }}>Get started</Link></Button>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 pt-16 pb-24 sm:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <span className="inline-flex items-center rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            Phase 1 · Foundation
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
            The intelligent operating system{" "}
            <span className="bg-gradient-brand bg-clip-text text-transparent">for every farm.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
            AgriTwin OS is an AI-powered Digital Twin platform that helps farmers monitor,
            predict, manage, and optimize their operations — using real data from satellites,
            sensors, weather, and machine learning.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/auth" search={{ mode: "register" }}>
                Start free <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/auth">Sign in</Link>
            </Button>
          </div>
        </motion.div>
      </main>

      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-6 py-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} AgriTwin OS · The Intelligent Operating System for Every Farm.
        </div>
      </footer>
    </div>
  );
}
