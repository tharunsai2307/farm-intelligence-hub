import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/verify-email")({
  head: () => ({
    meta: [
      { title: "Verify your email — AgriTwin OS" },
      { name: "description", content: "Confirm your email address to activate your AgriTwin OS account and access your farm dashboard." },
      { property: "og:title", content: "Verify your email — AgriTwin OS" },
      { property: "og:description", content: "Confirm your email to finish setting up AgriTwin OS." },
      { property: "og:url", content: "/verify-email" },
    ],
    links: [{ rel: "canonical", href: "/verify-email" }],
  }),
  component: VerifyPage,
});

function VerifyPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const resend = async () => {
    if (!email) return toast.error("Enter the email you registered with");
    setSubmitting(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/verify-email` },
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Verification email sent");
  };

  return (
    <AuthLayout
      title="Check your inbox"
      subtitle="We've sent you a verification link. Click it to activate your AgriTwin OS account."
      footer={<Link to="/login" className="text-primary hover:underline">Back to sign in</Link>}
    >
      <div className="flex flex-col items-center gap-4 rounded-2xl border bg-card p-8 text-center">
        <Mail className="h-10 w-10 text-primary" />
        <p className="text-sm text-muted-foreground">
          Didn't get the email? Check your spam folder, or resend it below.
        </p>
        <div className="w-full space-y-2 text-left">
          <Label htmlFor="resend-email">Email</Label>
          <Input
            id="resend-email"
            type="email"
            placeholder="you@farm.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <Button onClick={resend} disabled={submitting} className="w-full">
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Resend verification email
        </Button>
      </div>
    </AuthLayout>
  );
}
