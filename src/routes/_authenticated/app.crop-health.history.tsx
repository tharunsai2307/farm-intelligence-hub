import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ImageIcon } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listCropAnalyses } from "@/lib/services/ai-crop.service";

export const Route = createFileRoute("/_authenticated/app/crop-health/history")({
  head: () => ({ meta: [{ title: "Analysis History — AgriTwin OS" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const fn = useServerFn(listCropAnalyses);
  const q = useQuery({
    queryKey: ["crop-analyses"],
    queryFn: () => fn({ data: {} }),
  });

  const rows = q.data?.success && q.data.data ? q.data.data : [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <PageHeader
        title="Crop Analysis History"
        description="Every AI crop analysis you've run is stored here."
        actions={
          <Button asChild variant="outline">
            <Link to="/app/crop-health">
              <ArrowLeft className="mr-2 h-4 w-4" />
              New analysis
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          {q.isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Loading…
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <ImageIcon className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-sm font-medium">No analyses yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Upload your first crop photo to see results here.
              </p>
              <Button asChild className="mt-4" size="sm">
                <Link to="/app/crop-health">Analyze a crop</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Crop</TableHead>
                  <TableHead>Prediction</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs">
                      {new Date(r.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>{r.crop_type || "—"}</TableCell>
                    <TableCell className="font-medium">{r.prediction || "—"}</TableCell>
                    <TableCell>
                      {r.confidence != null
                        ? `${(Number(r.confidence) * 100).toFixed(1)}%`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {r.severity || "unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={r.status === "completed" ? "secondary" : "outline"}
                      >
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button asChild size="sm" variant="ghost">
                        <Link
                          to="/app/crop-health/details/$id"
                          params={{ id: r.id }}
                        >
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
