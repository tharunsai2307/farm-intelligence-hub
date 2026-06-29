import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth/verify")({
  head: () => ({ meta: [{ title: "Email verified — AgriTwin OS" }] }),
  component: VerifyPage,
});

function VerifyPage() {
  return (
    <AuthLayout title="Email verified" subtitle="Your account is ready to use.">
      <div className="flex flex-col items-center gap-4 rounded-2xl border bg-card p-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-success" />
        <p className="text-sm text-muted-foreground">You can now sign in and start using AgriTwin OS.</p>
        <Button asChild className="w-full">
          <Link to="/auth">Continue to sign in</Link>
        </Button>
      </div>
    </AuthLayout>
  );
}
