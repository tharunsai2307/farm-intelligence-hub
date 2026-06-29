import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Brain, ArrowRight, Sparkles, ClipboardPlus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getLatestAgriMindRecommendation } from "@/lib/services/agrimind.service";
import { taskFromRecommendation } from "@/lib/services/farmos.service";

/**
 * Dashboard widget — shows the most recent AgriMind recommendation for the
 * given farm. Never fabricates data; if none is available, prompts to generate.
 */
export function AgriMindInsightsWidget({ farmId }: { farmId: string }) {
  const latestFn = useServerFn(getLatestAgriMindRecommendation);
  const q = useQuery({
    queryKey: ["agrimind", "latest", farmId],
    queryFn: () => latestFn({ data: { farm_id: farmId } }),
    enabled: !!farmId,
  });

  const qc = useQueryClient();
  const createTask = useMutation({
    mutationFn: async (id: string) => {
      const res = await taskFromRecommendation({ data: { recommendation_id: id } });
      if (!res.success) throw new Error(res.error);
    },
    onSuccess: () => {
      toast.success("Task created from recommendation");
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["farmos-overview"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const rec = q.data?.success ? q.data.data : null;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary">
            <Brain className="h-4 w-4" />
          </div>
          <CardTitle className="text-base">AgriMind Insights</CardTitle>
        </div>
        <Button asChild size="sm" variant="ghost">
          <Link to="/app/agrimind">
            View details <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {q.isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : rec ? (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{rec.recommendation_type}</Badge>
              <Badge variant="outline">{rec.confidence}</Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(rec.created_at).toLocaleString()}
              </span>
            </div>
            <p className="font-medium">{rec.title}</p>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {rec.recommendation}
            </p>
            <div className="flex justify-end pt-1">
              <Button size="sm" variant="outline" onClick={() => createTask.mutate(rec.id)} disabled={createTask.isPending}>
                <ClipboardPlus className="mr-2 h-3.5 w-3.5" />
                {createTask.isPending ? "Creating…" : "Create task"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 text-sm">
            <p className="text-muted-foreground">
              No recommendations yet. Generate insights from your farm's real data.
            </p>
            <Button asChild size="sm">
              <Link to="/app/agrimind">
                <Sparkles className="mr-2 h-4 w-4" /> Open AgriMind
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
