import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Sprout,
  ArrowRight,
  Boxes,
  CloudSun,
  Leaf,
  Droplets,
  LineChart,
  Tractor,
  ShoppingBag,
  FileBarChart2,
  CheckCircle2,
  ShieldCheck,
  Database,
  Activity,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/app/dashboard" });
  },
  head: () => ({
    meta: [
      { title: "AgriTwin OS — Smart Farming OS" },
      {
        name: "description",
        content:
          "Monitor crops, water, soil, weather, and farm operations from one intelligent operating system built for modern agriculture.",
      },
      { property: "og:title", content: "AgriTwin OS — Smart Farming OS" },
      {
        property: "og:description",
        content:
          "AI-powered Digital Twin platform that helps farmers monitor, predict, and optimize using real data — never guesses.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "AgriTwin OS",
          url: "/",
          description:
            "AI-powered Digital Twin platform for modern agriculture.",
        }),
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Hero />
      <ImpactSection />
      <ProblemSection />
      <SolutionSection />
      <FeatureGrid />
      <Workflow />
      <FinalCTA />
      <SiteFooter />
    </div>
  );
}

/* ---------- Header ---------- */
function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-brand text-primary-foreground">
            <Sprout className="h-4 w-4" />
          </div>
          AgriTwin OS
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#workflow" className="hover:text-foreground">How it works</a>
          <a href="#solution" className="hover:text-foreground">Platform</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link to="/login">Sign in</Link>
          </Button>
          <Button asChild>
            <Link to="/register">Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

/* ---------- Hero ---------- */
function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-surface" />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
            <Sprout className="mr-1.5 h-3 w-3 text-primary" /> AgriTwin OS · v0.2
          </Badge>
          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            AI-Powered Digital Twin{" "}
            <span className="bg-gradient-brand bg-clip-text text-transparent">for Smart Farming.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
            Monitor crops, water, soil, weather, and farm operations from one
            intelligent operating system built for modern agriculture. Real data.
            Real decisions. No guesses.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/register">
                Start Monitoring My Farm <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="#features">View Platform Preview</a>
            </Button>
          </div>
          <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-success" />
            Your farm data is private. RLS-secured. No third-party sharing.
          </p>
        </motion.div>

        <PlatformPreviewCard />
      </div>
    </section>
  );
}

function PlatformPreviewCard() {
  const tiles = [
    { label: "Farm Health", state: "Connect farm data" },
    { label: "Weather", state: "API not connected" },
    { label: "Soil Moisture", state: "Awaiting sensor data" },
    { label: "Crop Status", state: "Add farm to begin" },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="surface-elevated overflow-hidden"
    >
      <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-danger/70" />
          <span className="h-2 w-2 rounded-full bg-warning/70" />
          <span className="h-2 w-2 rounded-full bg-success/70" />
          <span className="ml-2">agritwin.app/app/dashboard</span>
        </div>
        <Badge variant="outline" className="text-[10px]">Preview</Badge>
      </div>
      <div className="grid grid-cols-2 gap-3 p-5">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-xl border bg-card p-4">
            <div className="text-xs text-muted-foreground">{t.label}</div>
            <div className="mt-3 flex items-center gap-2 text-sm font-medium">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{t.state}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t bg-muted/30 px-5 py-3 text-xs text-muted-foreground">
        Empty by design — AgriTwin OS only shows data you've actually connected.
      </div>
    </motion.div>
  );
}

/* ---------- Impact ---------- */
function ImpactSection() {
  const items = [
    { title: "Save water", body: "Data-based irrigation instead of guesswork." },
    { title: "Detect risks earlier", body: "Connect crop images and sensors for early signals." },
    { title: "Plan yield", body: "Combine real farm records with seasonal context." },
    { title: "Run operations", body: "Tasks, inputs, and reports in one place." },
  ];
  return (
    <section className="border-y bg-surface">
      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((i) => (
          <div key={i.title} className="rounded-2xl border bg-card p-6">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <h3 className="mt-3 font-semibold">{i.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{i.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Problem / Solution ---------- */
function ProblemSection() {
  const rows = [
    "Weather data lives in one app",
    "Crop health is monitored separately",
    "Irrigation decisions stay manual",
    "Expenses are tracked on paper",
    "Market timing is a guess, not data",
  ];
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid items-start gap-12 lg:grid-cols-2">
        <div>
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            The problem
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Farm intelligence is scattered across disconnected tools.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Modern farms produce more data than ever — but the data lives in
            silos. Decisions slow down, and good signals get lost.
          </p>
        </div>
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r} className="flex items-start gap-3 rounded-xl border bg-card p-4">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-danger" />
              <span className="text-sm">{r}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function SolutionSection() {
  const items = [
    { icon: Database, title: "Unified farm profile", body: "One record of truth — soil, crop, location, history." },
    { icon: CloudSun, title: "Weather + satellites", body: "Real APIs feed your farm with environmental context." },
    { icon: Activity, title: "Sensors + images", body: "Bring your own data — moisture sensors, crop photos." },
    { icon: Boxes, title: "AI services & reports", body: "Run models against real input, then act on it." },
  ];
  return (
    <section id="solution" className="border-y bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          The solution
        </span>
        <h2 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">
          AgriTwin OS connects every input your farm produces into one digital twin.
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border bg-card p-6">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-accent-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Feature grid ---------- */
function FeatureGrid() {
  const features = [
    { icon: Boxes, title: "Digital Farm Twin", body: "Spatial model of your farm, generated from your data." },
    { icon: LineChart, title: "Smart Farm Dashboard", body: "One view of farm health, operations, and risks." },
    { icon: CloudSun, title: "Weather Intelligence", body: "Hyperlocal forecasts via connected weather APIs." },
    { icon: Leaf, title: "Crop Health Monitoring", body: "Upload crop images for AI-powered analysis." },
    { icon: Droplets, title: "Irrigation Records", body: "Track volumes, sources, and schedules." },
    { icon: LineChart, title: "Yield Planning", body: "Combine crop, soil, and history into estimates." },
    { icon: Tractor, title: "FarmOS Management", body: "Tasks, inputs, and labour in one place." },
    { icon: FileBarChart2, title: "Sustainability Reports", body: "Generate water, soil, and yield reports." },
    { icon: ShoppingBag, title: "Marketplace", body: "Connect to inputs and buyers, on your terms." },
  ];
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-20">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Modules
      </span>
      <h2 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">
        Everything a modern farm needs — one operating system.
      </h2>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Each module activates with real data when connected. No fake numbers,
        no synthetic dashboards, no demo charts pretending to be your farm.
      </p>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ icon: Icon, title, body }) => (
          <div key={title} className="group rounded-2xl border bg-card p-6 transition hover:shadow-[var(--shadow-elevated)]">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-accent-foreground">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            <p className="mt-4 text-xs text-muted-foreground/80">
              Uses real data when connected.
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Workflow ---------- */
function Workflow() {
  const steps = [
    { n: 1, title: "Create account", body: "Sign up in under a minute." },
    { n: 2, title: "Add farm details", body: "Crop, soil, irrigation, location." },
    { n: 3, title: "Connect data sources", body: "Sensors, weather APIs, crop images." },
    { n: 4, title: "Monitor & decide", body: "Dashboard, reports, AI assistant." },
  ];
  return (
    <section id="workflow" className="border-y bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          How it works
        </span>
        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          From zero to a working farm twin in four steps.
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="rounded-2xl border bg-card p-6">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {s.n}
              </div>
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Final CTA ---------- */
function FinalCTA() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-brand p-10 text-primary-foreground sm:p-16">
        <h2 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
          Start building your farm intelligence system today.
        </h2>
        <p className="mt-3 max-w-xl opacity-90">
          Free to start. Your data stays yours. Built for farmers, not for ads.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg" variant="secondary">
            <Link to="/register">Create Free Account <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
            <Link to="/login">Sign in</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-xs text-muted-foreground sm:flex-row">
        <div>© {new Date().getFullYear()} AgriTwin OS · The Intelligent Operating System for Every Farm.</div>
        <div className="flex gap-4">
          <Link to="/login" className="hover:text-foreground">Sign in</Link>
          <Link to="/register" className="hover:text-foreground">Create account</Link>
        </div>
      </div>
    </footer>
  );
}
