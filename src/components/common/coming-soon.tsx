import type { LucideIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ComingSoonPage({
  icon: Icon,
  title,
  description,
  bullets,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  bullets?: string[];
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="surface-card flex flex-col items-start gap-6 p-8 sm:p-12">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-accent-foreground">
            <Icon className="h-5 w-5" />
          </div>
          <Badge variant="outline" className="gap-1">
            <Sparkles className="h-3 w-3 text-primary" /> Coming soon
          </Badge>
        </div>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{description}</p>
        </div>

        {bullets && bullets.length > 0 && (
          <ul className="grid w-full gap-2 text-sm">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-2 rounded-lg border bg-muted/30 px-3 py-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}

        <p className="text-xs text-muted-foreground">
          No predictions or values will be shown until real data and models are connected.
        </p>

        <Button asChild variant="outline">
          <Link to="/app/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> Return to dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
