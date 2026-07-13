import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, Activity, Clock, Cpu } from "lucide-react";

export type PredictionCardProps = {
  prediction: string;
  scientificName: string | null;
  confidence: number;
  severity: string;
  modelName: string;
  modelVersion: string;
  processingMs: number;
  imageUrl: string | null;
  explanation?: string | null;
};

function severityTone(sev: string) {
  switch (sev) {
    case "high":
      return { label: "High severity", variant: "destructive" as const, Icon: AlertTriangle };
    case "medium":
      return { label: "Medium severity", variant: "default" as const, Icon: Activity };
    case "low":
      return { label: "Low severity", variant: "secondary" as const, Icon: CheckCircle2 };
    default:
      return { label: "Severity unknown", variant: "outline" as const, Icon: Activity };
  }
}

export function PredictionCard(p: PredictionCardProps) {
  const sev = severityTone(p.severity);
  const confPct = (p.confidence * 100).toFixed(1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span>AI Diagnosis</span>
          <Badge variant={sev.variant}>
            <sev.Icon className="mr-1 h-3.5 w-3.5" />
            {sev.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {p.imageUrl && (
          <img
            src={p.imageUrl}
            alt={p.prediction}
            className="max-h-[360px] w-full rounded-lg border object-contain"
          />
        )}
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Predicted condition
          </p>
          <h3 className="text-xl font-semibold">{p.prediction}</h3>
          {p.scientificName && (
            <p className="text-sm italic text-muted-foreground">{p.scientificName}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric label="Confidence" value={`${confPct}%`} />
          <Metric label="Severity" value={p.severity} />
          <Metric label="Model" value={`${p.modelName}`} sub={p.modelVersion} Icon={Cpu} />
          <Metric
            label="Processing"
            value={`${(p.processingMs / 1000).toFixed(1)}s`}
            Icon={Clock}
          />
        </div>

        {p.explanation && (
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Why AI predicted this
            </p>
            <p className="mt-1 text-sm leading-relaxed">{p.explanation}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              The LLM only explains the model's output — it never changes the prediction.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Metric({
  label,
  value,
  sub,
  Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  Icon?: typeof Cpu;
}) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
        {Icon && <Icon className="h-3 w-3" />} {label}
      </p>
      <p className="mt-1 text-sm font-medium capitalize">{value}</p>
      {sub && <p className="truncate text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}
