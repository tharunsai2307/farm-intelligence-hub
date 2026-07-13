import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link, useSearch, createFileRoute } from "@tanstack/react-router";
import { Loader2, Leaf, ShieldCheck, Sparkles, LineChart } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleIcon } from "@/components/auth/google-icon";
import { Login3DScene } from "@/components/auth/login-3d-scene";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(6, "Minimum 6 characters"),
});
type Values = z.infer<typeof schema>;

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/login")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — AgriTwin OS" },
      {
        name: "description",
        content:
          "Sign in to AgriTwin OS to view your farm dashboard, weather, sensors, and AI recommendations.",
      },
      { property: "og:title", content: "Sign in — AgriTwin OS" },
      { property: "og:description", content: "Access your AgriTwin OS farm dashboard." },
      { property: "og:url", content: "/login" },
    ],
    links: [{ rel: "canonical", href: "/login" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const search = useSearch({ from: "/login" });
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const goNext = () => {
    const raw = search.redirect;
    const safeDest =
      raw && raw.startsWith("/") && !raw.startsWith("//") && !raw.startsWith("/\\")
        ? raw
        : "/app/dashboard";
    navigate({ to: safeDest, replace: true });
  };

  const onSubmit = async (values: Values) => {
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword(values);
    setSubmitting(false);
    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        return toast.error("Please verify your email first.");
      }
      return toast.error(error.message);
    }
    toast.success("Welcome back");
    goNext();
  };

  const handleGoogle = async () => {
    setSubmitting(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setSubmitting(false);
      return toast.error(result.error.message ?? "Google sign-in failed");
    }
    if (result.redirected) return;
    goNext();
  };

  return (
    <div className="login-scene grid lg:grid-cols-[1.05fr_1fr]">
      <div className="login-aurora" aria-hidden />
      <div className="login-grid" aria-hidden />

      {/* Brand pane — hidden on mobile */}
      <aside className="login-brand hidden lg:flex flex-col justify-between p-12 xl:p-16">
        <div className="relative z-10 flex items-center gap-3">
          <div className="login-mark">
            <Leaf className="h-6 w-6 text-[oklch(0.92_0.06_142)]" />
          </div>
          <div>
            <p className="font-serif text-xl tracking-tight">AgriTwin OS</p>
            <p className="text-xs uppercase tracking-[0.18em] text-[oklch(0.92_0.06_142)]/70">
              Digital twin for agriculture
            </p>
          </div>
        </div>

        {/* Real WebGL 3D scene */}
        <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden>
          <Login3DScene />
        </div>

        {/* Animated accent orb */}
        <div className="login-orb" style={{ top: "18%", right: "-6%" }} aria-hidden />

        <div className="relative z-10 space-y-8 max-w-md">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[oklch(0.92_0.12_88)]/90 mb-3">
              Welcome back
            </p>
            <h2 className="font-serif text-4xl xl:text-5xl leading-[1.05] tracking-tight login-shimmer-text">
              Decisions, grounded in real field data.
            </h2>
            <p className="text-sm text-[oklch(0.98_0.012_150)]/85 mt-4 leading-relaxed">
              Weather intelligence, crop vision, soil signals and AgriMind recommendations — unified
              in one calm operating surface.
            </p>
          </div>

          <div className="login-stat-rule" />

          <div className="grid grid-cols-3 gap-6">
            <Feature icon={LineChart} label="Live telemetry" delay={0} />
            <Feature icon={Sparkles} label="AgriMind AI" delay={0.6} />
            <Feature icon={ShieldCheck} label="Private &amp; secure" delay={1.2} />
          </div>
        </div>

        <p className="relative z-10 text-xs text-[oklch(0.92_0.06_142)]/55">
          © {new Date().getFullYear()} AgriTwin OS · Crafted by Tharun Sai
        </p>
      </aside>

      {/* Form pane */}
      <main className="relative z-10 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="login-mark" style={{ width: 44, height: 44, borderRadius: 12 }}>
              <Leaf className="h-5 w-5 text-[oklch(0.92_0.06_142)]" />
            </div>
            <div>
              <p className="font-serif text-lg tracking-tight">AgriTwin OS</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Digital twin for agriculture
              </p>
            </div>
          </div>

          {/* Mobile 3D scene */}
          <div className="lg:hidden relative h-48 -mx-2 mb-6 rounded-2xl overflow-hidden border border-border bg-gradient-to-br from-[oklch(0.62_0.10_158)] via-[oklch(0.52_0.10_160)] to-[oklch(0.46_0.09_162)]">
            <Login3DScene />
            <div
              className="login-orb"
              style={{ top: "-30%", right: "-15%", width: 220, height: 220 }}
              aria-hidden
            />
          </div>

          <div className="login-card p-7 sm:p-9">
            <div className="mb-7">
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
                Account
              </p>
              <h1 className="font-serif text-3xl tracking-tight">Sign in to AgriTwin&nbsp;OS</h1>
              <p className="text-sm text-muted-foreground mt-2">Continue to your farm dashboard.</p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="login-input"
                  placeholder="you@farm.com"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                    Forgot?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className="login-input"
                  placeholder="••••••••"
                  {...form.register("password")}
                />
                {form.formState.errors.password && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="login-cta w-full h-11 text-base font-medium"
                disabled={submitting}
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign in
              </Button>
            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em]">
                <span className="px-3 bg-card text-muted-foreground">or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-11"
              disabled={submitting}
              onClick={handleGoogle}
            >
              <GoogleIcon className="mr-2 h-4 w-4" /> Continue with Google
            </Button>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:underline font-medium">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function Feature({
  icon: Icon,
  label,
  delay = 0,
}: {
  icon: typeof Leaf;
  label: string;
  delay?: number;
}) {
  return (
    <div className="space-y-2">
      <div
        className="login-feature-icon h-9 w-9 rounded-lg grid place-items-center bg-[oklch(1_0_0/0.10)] border border-[oklch(0.86_0.12_88/0.40)]"
        style={{ animationDelay: `${delay}s` }}
      >
        <Icon className="h-4 w-4 text-[oklch(0.95_0.10_88)]" />
      </div>
      <p className="text-xs text-[oklch(0.98_0.012_150)]/85 leading-snug">{label}</p>
    </div>
  );
}
