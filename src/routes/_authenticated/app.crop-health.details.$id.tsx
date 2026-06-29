import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PredictionCard } from "@/components/crop-health/prediction-card";
import { TreatmentCard } from "@/components/crop-health/treatment-card";
import { getCropAnalysis } from "@/lib/services/ai-crop.service";

export const Route = createFileRoute(
  "/_authenticated/app/crop-health/details/$id",
)({
  head: () => ({ meta: [{ title: "Analysis Details — AgriTwin OS" }] }),
  component: DetailsPage,
});

type LlmExplanation = {
  immediate_action?: string;
  organic_treatment?: string;
  chemical_treatment?: string;
  prevention?: string;
  estimated_recovery?: string;
  monitoring?: string;
  symptoms?: string;
};

function DetailsPage() {
  const { id } = Route.useParams();
  const fn = useServerFn(getCropAnalysis);
  const q = useQuery({
    queryKey: ["crop-analysis", id],
    queryFn: () => fn({ data: { id } }),
  });

  if (q.isLoading) {
    return <div className="p-8 text-sm text-muted-foreground">Loading…</div>;
  }
  if (!q.data?.success) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <Alert variant="destructive">
          <AlertTitle>Could not load analysis</AlertTitle>
          <AlertDescription>{q.data?.error ?? "Unknown error."}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const a = q.data.data;
  const llm = ((a.raw_response as { llm?: LlmExplanation } | null)?.llm ?? {}) as LlmExplanation;

  const onPrint = () => window.print();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6">
      <PageHeader
        title="Analysis Details"
        description={new Date(a.created_at).toLocaleString()}
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/app/crop-health/history">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button size="sm" onClick={onPrint}>
              <Download className="mr-2 h-4 w-4" />
              Print / Save PDF
            </Button>
          </div>
        }
      />

      <PredictionCard
        prediction={a.prediction ?? "Unknown"}
        scientificName={a.scientific_name}
        confidence={Number(a.confidence ?? 0)}
        severity={a.severity ?? "unknown"}
        modelName={a.model_name}
        modelVersion={a.model_version ?? ""}
        processingMs={a.processing_time_ms ?? 0}
        imageUrl={a.signed_image_url ?? null}
        explanation={a.explanation}
      />

      {llm.symptoms && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Visible symptoms
            </p>
            <p className="mt-1 text-sm leading-relaxed">{llm.symptoms}</p>
          </CardContent>
        </Card>
      )}

      <TreatmentCard
        immediateAction={llm.immediate_action}
        organicTreatment={llm.organic_treatment}
        chemicalTreatment={llm.chemical_treatment}
        prevention={llm.prevention}
        estimatedRecovery={llm.estimated_recovery}
        monitoring={llm.monitoring}
      />
    </div>
  );
}
