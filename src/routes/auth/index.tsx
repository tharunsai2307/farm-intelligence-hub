import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link, useSearch } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AuthLayout } from "@/components/auth/auth-layout";
import { GoogleIcon } from "@/components/auth/google-icon";

import { createFileRoute } from "@tanstack/react-router";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Minimum 6 characters"),
});

const registerSchema = loginSchema.extend({
  fullName: z.string().min(2, "Enter your name"),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

const searchSchema = z.object({
  redirect: z.string().optional(),
  mode: z.enum(["login", "register"]).optional(),
});

export const Route = createFileRoute("/auth/")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — AgriTwin OS" },
      { name: "description", content: "Sign in to AgriTwin OS to access your farm dashboard." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const search = useSearch({ from: "/auth/" });
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "register">(search.mode ?? "login");
  const [submitting, setSubmitting] = useState(false);

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  const goNext = () => {
    const dest = search.redirect ?? "/dashboard";
    navigate({ to: dest, replace: true });
  };

  const handleLogin = async (values: LoginValues) => {
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword(values);
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back");
    goNext();
  };

  const handleRegister = async (values: RegisterValues) => {
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/verify`,
        data: { full_name: values.fullName },
      },
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Check your email to confirm your account");
    setTab("login");
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
    <AuthLayout
      title={tab === "login" ? "Welcome back" : "Create your account"}
      subtitle={
        tab === "login"
          ? "Sign in to continue to AgriTwin OS."
          : "Start managing your farm with AI-powered insights."
      }
    >
      <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "register")} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Sign in</TabsTrigger>
          <TabsTrigger value="register">Create account</TabsTrigger>
        </TabsList>

        <TabsContent value="login" className="mt-6 space-y-4">
          <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input id="login-email" type="email" autoComplete="email" {...loginForm.register("email")} />
              {loginForm.formState.errors.email && (
                <p className="text-xs text-danger">{loginForm.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password">Password</Label>
                <Link to="/auth/forgot" className="text-xs text-primary hover:underline">
                  Forgot?
                </Link>
              </div>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                {...loginForm.register("password")}
              />
              {loginForm.formState.errors.password && (
                <p className="text-xs text-danger">{loginForm.formState.errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign in
            </Button>
          </form>
          <Divider />
          <Button type="button" variant="outline" className="w-full" disabled={submitting} onClick={handleGoogle}>
            <GoogleIcon className="mr-2 h-4 w-4" /> Continue with Google
          </Button>
        </TabsContent>

        <TabsContent value="register" className="mt-6 space-y-4">
          <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reg-name">Full name</Label>
              <Input id="reg-name" autoComplete="name" {...registerForm.register("fullName")} />
              {registerForm.formState.errors.fullName && (
                <p className="text-xs text-danger">{registerForm.formState.errors.fullName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-email">Email</Label>
              <Input id="reg-email" type="email" autoComplete="email" {...registerForm.register("email")} />
              {registerForm.formState.errors.email && (
                <p className="text-xs text-danger">{registerForm.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-password">Password</Label>
              <Input
                id="reg-password"
                type="password"
                autoComplete="new-password"
                {...registerForm.register("password")}
              />
              {registerForm.formState.errors.password && (
                <p className="text-xs text-danger">{registerForm.formState.errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create account
            </Button>
          </form>
          <Divider />
          <Button type="button" variant="outline" className="w-full" disabled={submitting} onClick={handleGoogle}>
            <GoogleIcon className="mr-2 h-4 w-4" /> Continue with Google
          </Button>
        </TabsContent>
      </Tabs>
    </AuthLayout>
  );
}

function Divider() {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-background px-2 text-muted-foreground">or</span>
      </div>
    </div>
  );
}
