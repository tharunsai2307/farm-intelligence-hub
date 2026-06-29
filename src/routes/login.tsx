import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link, useSearch, createFileRoute } from "@tanstack/react-router";
import { Loader2, Leaf, Sprout, Sun, Cloud, Droplets } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleIcon } from "@/components/auth/google-icon";

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
      { name: "description", content: "Sign in to AgriTwin OS to view your farm dashboard, weather, sensors, and AI recommendations." },
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
  const cardRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  // 3D parallax tilt on mouse move
  useEffect(() => {
    const scene = sceneRef.current;
    const card = cardRef.current;
    if (!scene || !card) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      const rect = scene.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        card.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 14}deg) translateZ(0)`;
        scene.style.setProperty("--mx", `${x * 40}px`);
        scene.style.setProperty("--my", `${y * 40}px`);
      });
    };
    const onLeave = () => {
      card.style.transform = "rotateY(0deg) rotateX(0deg)";
    };
    scene.addEventListener("mousemove", onMove);
    scene.addEventListener("mouseleave", onLeave);
    return () => {
      scene.removeEventListener("mousemove", onMove);
      scene.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

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
    <div
      ref={sceneRef}
      className="login3d-scene relative min-h-screen w-full overflow-hidden flex items-center justify-center px-4 py-10"
    >
      {/* Animated gradient backdrop */}
      <div className="login3d-bg" aria-hidden />
      <div className="login3d-grid" aria-hidden />

      {/* Floating 3D orbs */}
      <div className="login3d-orb login3d-orb-1" aria-hidden />
      <div className="login3d-orb login3d-orb-2" aria-hidden />
      <div className="login3d-orb login3d-orb-3" aria-hidden />

      {/* Floating icons (parallax with --mx/--my) */}
      <FloatingIcon Icon={Leaf} className="top-[12%] left-[8%]" depth={1.2} delay="0s" />
      <FloatingIcon Icon={Sprout} className="bottom-[14%] left-[12%]" depth={0.8} delay="1.2s" />
      <FloatingIcon Icon={Sun} className="top-[18%] right-[10%]" depth={1.5} delay="0.6s" />
      <FloatingIcon Icon={Cloud} className="bottom-[20%] right-[8%]" depth={1} delay="1.8s" />
      <FloatingIcon Icon={Droplets} className="top-[48%] left-[4%] hidden md:block" depth={0.6} delay="2.4s" />
      <FloatingIcon Icon={Leaf} className="top-[55%] right-[5%] hidden md:block" depth={0.9} delay="3s" />

      {/* 3D rotating ring */}
      <div className="login3d-ring" aria-hidden>
        <span /><span /><span /><span /><span /><span />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md" style={{ perspective: "1200px" }}>
        <div
          ref={cardRef}
          className="login3d-card relative rounded-3xl p-8 md:p-10 transition-transform duration-200 ease-out will-change-transform"
        >
          <div className="login3d-card-shine" aria-hidden />
          <div className="flex flex-col items-center text-center mb-7">
            <div className="login3d-logo mb-4">
              <Leaf className="h-7 w-7 text-emerald-200" />
            </div>
            <h1 className="text-3xl font-serif text-white tracking-tight">
              Welcome <em className="italic text-[var(--gold,#c9a84c)] not-italic-fix">back</em>
            </h1>
            <p className="text-sm text-emerald-100/70 mt-2">
              Sign in to your AgriTwin OS dashboard
            </p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-emerald-50/90">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                className="login3d-input"
                placeholder="you@farm.com"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-xs text-rose-300">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-emerald-50/90">Password</Label>
                <Link to="/forgot-password" className="text-xs text-[var(--gold,#c9a84c)] hover:underline">
                  Forgot?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                className="login3d-input"
                placeholder="••••••••"
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p className="text-xs text-rose-300">{form.formState.errors.password.message}</p>
              )}
            </div>
            <Button
              type="submit"
              className="login3d-btn w-full h-11 text-base font-medium"
              disabled={submitting}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign in
            </Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-emerald-100/15" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em]">
              <span className="px-3 text-emerald-100/50 bg-transparent">or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="login3d-google w-full h-11"
            disabled={submitting}
            onClick={handleGoogle}
          >
            <GoogleIcon className="mr-2 h-4 w-4" /> Continue with Google
          </Button>

          <p className="text-center text-sm text-emerald-100/70 mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-[var(--gold,#c9a84c)] hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function FloatingIcon({
  Icon,
  className,
  depth,
  delay,
}: {
  Icon: typeof Leaf;
  className?: string;
  depth: number;
  delay: string;
}) {
  return (
    <div
      className={`login3d-float absolute ${className ?? ""}`}
      style={{
        // @ts-expect-error css var
        "--depth": depth,
        animationDelay: delay,
      }}
      aria-hidden
    >
      <Icon className="h-8 w-8 text-emerald-200/70" />
    </div>
  );
}
