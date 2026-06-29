import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
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
  Menu,
  X,
  Linkedin,
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
      { title: "AgriTwin OS — AI Digital Twin for Farms" },
      {
        name: "description",
        content:
          "AgriTwin OS unifies crop, soil, water, weather, and operations data into one AI-powered digital twin built for modern farmers.",
      },
      { property: "og:title", content: "AgriTwin OS — AI Digital Twin for Farms" },
      {
        property: "og:description",
        content:
          "AI-powered Digital Twin platform that helps farmers monitor, predict, and optimize using real data — never guesses.",
      },
      { property: "og:url", content: "https://agri-twin-os.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://agri-twin-os.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "AgriTwin OS",
          url: "https://agri-twin-os.lovable.app/",
          description:
            "AI-powered Digital Twin platform for modern agriculture.",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "AgriTwin OS",
          url: "https://agri-twin-os.lovable.app/",
          logo: "https://agri-twin-os.lovable.app/favicon.ico",
          description:
            "AgriTwin OS builds AI-powered digital twins for farms — unifying crop, soil, water, weather, and operations data.",
        }),
      },
    ],
  }),

  component: Landing,
});

function Landing() {
  return (
    <div className="landing-home min-h-screen bg-background pb-24 text-foreground sm:pb-0">
      <SiteHeader />
      <Hero />
      <ImpactSection />
      <ProblemSection />
      <SolutionSection />
      <FeatureGrid />
      <Workflow />
      <FinalCTA />
      <SiteFooter />
      <MobileStickyCTA />
    </div>
  );
}

/* ---------- Header (with mobile drawer) ---------- */
function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3.5 sm:px-6 sm:py-4">
        <Link to="/" className="flex min-w-0 items-center gap-2.5 text-base font-semibold sm:text-lg">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-gold)]">
            <Sprout className="h-4 w-4" />
          </div>
          <span className="truncate">AgriTwin OS</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <a href="#features" className="transition hover:text-foreground">Features</a>
          <a href="#workflow" className="transition hover:text-foreground">How it works</a>
          <a href="#solution" className="transition hover:text-foreground">Platform</a>
        </nav>
        <div className="hidden items-center gap-2 sm:flex">
          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link to="/login">Sign in</Link>
          </Button>
          <Button asChild>
            <Link to="/register">Get started</Link>
          </Button>
        </div>
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((s) => !s)}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-card text-foreground transition active:scale-95 sm:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t border-border/60 bg-background/95 backdrop-blur sm:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-4 text-sm">
            <a onClick={() => setOpen(false)} href="#features" className="rounded-lg px-3 py-2.5 text-foreground hover:bg-muted">Features</a>
            <a onClick={() => setOpen(false)} href="#workflow" className="rounded-lg px-3 py-2.5 text-foreground hover:bg-muted">How it works</a>
            <a onClick={() => setOpen(false)} href="#solution" className="rounded-lg px-3 py-2.5 text-foreground hover:bg-muted">Platform</a>
            <div className="my-2 h-px gold-rule" />
            <Button asChild variant="ghost" className="justify-start">
              <Link to="/login" onClick={() => setOpen(false)}>Sign in</Link>
            </Button>
            <Button asChild className="justify-center">
              <Link to="/register" onClick={() => setOpen(false)}>Get started</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}

/* ---------- Hero — editorial canopy ---------- */
function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Canopy background */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[68%] landing-canopy" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[68%] opacity-[0.08]"
        style={{ backgroundImage: "radial-gradient(circle at 20% 30%, var(--color-gold) 0, transparent 40%), radial-gradient(circle at 80% 10%, var(--color-gold) 0, transparent 35%)" }}
      />

      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-12 pt-10 sm:gap-12 sm:px-6 sm:pb-16 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-foreground"
        >
          <Badge variant="outline" className="rounded-full border-primary/25 bg-background/55 px-3 py-1 text-[11px] font-medium text-primary shadow-[var(--shadow-soft)] backdrop-blur">
            <Sprout className="mr-1.5 h-3 w-3 text-gold" /> AgriTwin OS · v0.2
          </Badge>
          <h1 className="mt-6 font-serif text-[2.5rem] font-medium leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-[4rem]">
            The intelligent OS for{" "}
            <span className="italic text-gold">every farm.</span>
          </h1>
          <div className="mt-5 h-px max-w-[6rem] gold-rule" />
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            Monitor crops, water, soil, weather, and farm operations from one
            intelligent operating system built for modern agriculture. Real data.
            Real decisions. No guesses.
          </p>
          <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3">
            <Button asChild size="lg" className="h-12 bg-gold text-gold-foreground hover:bg-gold/90 sm:h-11">
              <Link to="/register">
                Start monitoring my farm <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 border-primary/25 bg-background/45 text-primary hover:bg-accent sm:h-11">
              <a href="#features">View platform preview</a>
            </Button>
          </div>
          <p className="mt-6 flex items-center gap-2 text-[12px] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-gold" />
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
      transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="surface-elevated overflow-hidden ring-1 ring-gold/20"
    >
      <div className="flex items-center justify-between gap-2 border-b border-border/70 bg-muted/50 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2 text-[11px] text-muted-foreground">
          <span className="h-2 w-2 shrink-0 rounded-full bg-danger/70" />
          <span className="h-2 w-2 shrink-0 rounded-full bg-warning/70" />
          <span className="h-2 w-2 shrink-0 rounded-full bg-success/70" />
          <span className="ml-1 truncate">agritwin.app/app/dashboard</span>
        </div>
        <Badge variant="outline" className="shrink-0 border-gold/40 text-[10px] text-gold-foreground/80">Preview</Badge>
      </div>
      <div className="grid grid-cols-2 gap-3 p-4 sm:p-5">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-xl border border-border/70 bg-card p-3.5 sm:p-4">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{t.label}</div>
            <div className="mt-3 flex items-center gap-2 text-[13px] font-medium">
              <Activity className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">{t.state}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-border/70 bg-muted/40 px-4 py-3 text-[11px] text-muted-foreground sm:px-5">
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
    <section className="border-y border-border/60 bg-surface" aria-labelledby="impact-heading">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16">
        <h2 id="impact-heading" className="sr-only">Why AgriTwin OS</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {items.map((i) => (
            <div key={i.title} className="group relative rounded-2xl border border-border/70 bg-card p-5 transition hover:border-gold/40">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <h3 className="mt-3 font-serif text-lg font-medium tracking-tight">{i.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{i.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Problem ---------- */
function ProblemSection() {
  const rows = [
    "Weather data lives in one app",
    "Crop health is monitored separately",
    "Irrigation decisions stay manual",
    "Expenses are tracked on paper",
    "Market timing is a guess, not data",
  ];
  return (
    <section className="mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-20">
      <div className="grid items-start gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-12">
        <div>
          <span className="eyebrow">The problem</span>
          <h2 className="mt-3 font-serif text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
            Farm intelligence is scattered across disconnected tools.
          </h2>
          <div className="mt-4 h-px max-w-[5rem] gold-rule" />
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            Modern farms produce more data than ever — but the data lives in
            silos. Decisions slow down, and good signals get lost.
          </p>
        </div>
        <ul className="space-y-2.5">
          {rows.map((r) => (
            <li key={r} className="flex items-start gap-3 rounded-xl border border-border/70 bg-card p-3.5 sm:p-4">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />
              <span className="text-sm">{r}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- Solution ---------- */
function SolutionSection() {
  const items = [
    { icon: Database, title: "Unified farm profile", body: "One record of truth — soil, crop, location, history." },
    { icon: CloudSun, title: "Weather + satellites", body: "Real APIs feed your farm with environmental context." },
    { icon: Activity, title: "Sensors + images", body: "Bring your own data — moisture sensors, crop photos." },
    { icon: Boxes, title: "AI services & reports", body: "Run models against real input, then act on it." },
  ];
  return (
    <section id="solution" className="border-y border-border/60 bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-20">
        <span className="eyebrow">The solution</span>
        <h2 className="mt-3 max-w-3xl font-serif text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
          AgriTwin OS connects every input your farm produces into one digital twin.
        </h2>
        <div className="mt-4 h-px max-w-[5rem] gold-rule" />
        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {items.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-border/70 bg-card p-5 transition hover:border-gold/40">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-serif text-lg font-medium tracking-tight">{title}</h3>
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
    <section id="features" className="mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-20">
      <span className="eyebrow">Modules</span>
      <h2 className="mt-3 max-w-3xl font-serif text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
        Everything a modern farm needs — one operating system.
      </h2>
      <div className="mt-4 h-px max-w-[5rem] gold-rule" />
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
        Each module activates with real data when connected. No fake numbers,
        no synthetic dashboards, no demo charts pretending to be your farm.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {features.map(({ icon: Icon, title, body }) => (
          <div key={title} className="group rounded-2xl border border-border/70 bg-card p-5 transition hover:border-gold/50 hover:shadow-[var(--shadow-elevated)]">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-accent-foreground">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-serif text-lg font-medium tracking-tight">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            <p className="mt-4 text-[11px] uppercase tracking-wide text-muted-foreground/70">
              Real data when connected.
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
    <section id="workflow" className="border-y border-border/60 bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-20">
        <span className="eyebrow">How it works</span>
        <h2 className="mt-3 font-serif text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
          From zero to a working farm twin in four steps.
        </h2>
        <div className="mt-4 h-px max-w-[5rem] gold-rule" />
        <ol className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {steps.map((s) => (
            <li key={s.n} className="relative rounded-2xl border border-border/70 bg-card p-5">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-serif font-medium text-primary-foreground ring-2 ring-gold/40">
                {s.n}
              </div>
              <h3 className="mt-4 font-serif text-lg font-medium tracking-tight">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------- Final CTA ---------- */
function FinalCTA() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-24">
      <div className="landing-cta-panel relative overflow-hidden rounded-3xl p-8 sm:p-14 lg:p-16">
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-gold/20 blur-3xl" aria-hidden />
        <span className="eyebrow text-primary">Get started</span>
        <h2 className="mt-3 max-w-2xl font-serif text-3xl font-medium leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem]">
          Start building your farm intelligence system today.
        </h2>
        <div className="mt-4 h-px max-w-[5rem] gold-rule" />
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          Free to start. Your data stays yours. Built for farmers, not for ads.
        </p>
        <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3">
          <Button asChild size="lg" className="h-12 bg-gold text-gold-foreground hover:bg-gold/90 sm:h-11">
            <Link to="/register">Create free account <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 border-primary/25 bg-background/60 text-primary hover:bg-accent sm:h-11">
            <Link to="/login">Sign in</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-[12px] text-muted-foreground sm:flex-row sm:px-6">
        <div className="text-center sm:text-left">
          <div>© {new Date().getFullYear()} AgriTwin OS · The Intelligent Operating System for Every Farm.</div>
          <div className="mt-2 flex items-center justify-center gap-1.5 sm:justify-start">
            <span>Created and developed by</span>
            <a
              href="https://www.linkedin.com/in/tharun-sai-gangadhar-p-a32245396/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-foreground transition hover:text-gold"
            >
              <Linkedin className="h-3.5 w-3.5" />
              Tharun Sai
            </a>
          </div>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="transition hover:text-foreground">Sign in</Link>
          <Link to="/register" className="transition hover:text-foreground">Create account</Link>
        </div>
      </div>
    </footer>
  );
}


/* ---------- Mobile sticky CTA ---------- */
function MobileStickyCTA() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 px-4 py-3 backdrop-blur sm:hidden">
      <div className="flex items-center gap-2">
        <Button asChild variant="outline" className="h-11 flex-1">
          <Link to="/login">Sign in</Link>
        </Button>
        <Button asChild className="h-11 flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
          <Link to="/register">Get started <ArrowRight className="ml-1 h-4 w-4" /></Link>
        </Button>
      </div>
    </div>
  );
}
