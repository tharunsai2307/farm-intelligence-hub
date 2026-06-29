import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sprout, FlaskConical, Shield, Clock, Eye, Zap } from "lucide-react";

export type TreatmentCardProps = {
  immediateAction?: string;
  organicTreatment?: string;
  chemicalTreatment?: string;
  prevention?: string;
  estimatedRecovery?: string;
  monitoring?: string;
};

export function TreatmentCard(p: TreatmentCardProps) {
  const hasAny =
    p.immediateAction ||
    p.organicTreatment ||
    p.chemicalTreatment ||
    p.prevention ||
    p.estimatedRecovery ||
    p.monitoring;

  if (!hasAny) return null;

  const items: Array<{ icon: typeof Sprout; title: string; body?: string }> = [
    { icon: Zap, title: "Immediate action", body: p.immediateAction },
    { icon: Sprout, title: "Organic treatment", body: p.organicTreatment },
    { icon: FlaskConical, title: "Chemical treatment", body: p.chemicalTreatment },
    { icon: Shield, title: "Prevention", body: p.prevention },
    { icon: Clock, title: "Estimated recovery", body: p.estimatedRecovery },
    { icon: Eye, title: "Monitoring", body: p.monitoring },
  ].filter((i) => i.body);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Treatment plan</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        {items.map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-lg border p-3">
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Icon className="h-3.5 w-3.5" /> {title}
            </p>
            <p className="mt-1 text-sm leading-relaxed">{body}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
