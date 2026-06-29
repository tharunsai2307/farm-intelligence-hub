import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Brain,
  Sparkles,
  Volume2,
  CheckCircle2,
  XCircle,
  Loader2,
  Info,
  Languages,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { listFarms } from "@/lib/services/farms.functions";
import {
  generateAgriMindRecommendation,
  listAgriMindRecommendations,
  speakAgriText,
  updateAgriMindRecommendationStatus,
} from "@/lib/services/agrimind.service";
import type { AgriMindRecommendation } from "@/lib/services/agrimind.server";

export const Route = createFileRoute("/_authenticated/app/agrimind")({
  head: () => ({
    meta: [
      { title: "AgriMind AI — AgriTwin OS" },
      {
        name: "description",
        content:
          "AgriMind is the AI decision engine that turns your real farm data into explainable, multilingual recommendations with voice playback.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "AgriMind AI — AgriTwin OS" },
      { property: "og:description", content: "AI decision engine turning real farm data into explainable recommendations." },
      { property: "og:url", content: "https://agri-twin-os.lovable.app/app/agrimind" },
    ],
  }),
  component: AgriMindPage,
});

type Lang = "en" | "ta" | "te";
const LANGS: Array<{ code: Lang; label: string }> = [
  { code: "en", label: "English" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
];

function AgriMindPage() {
  const qc = useQueryClient();
  const farmsFn = useServerFn(listFarms);
  const listFn = useServerFn(listAgriMindRecommendations);
  const generateFn = useServerFn(generateAgriMindRecommendation);
  const updateFn = useServerFn(updateAgriMindRecommendationStatus);

  const [lang, setLang] = useState<Lang>("en");
  const [farmId, setFarmId] = useState<string | undefined>();

  const farms = useQuery({
    queryKey: ["farms"],
    queryFn: () => farmsFn({ data: undefined }),
  });

  const items = farms.data?.items ?? [];
  const activeFarmId = farmId ?? items[0]?.id;

  const recs = useQuery({
    queryKey: ["agrimind", "list", activeFarmId, false],
    queryFn: () =>
      listFn({ data: { farm_id: activeFarmId, include_dismissed: false } }),
    enabled: !!activeFarmId,
  });

  const generate = useMutation({
    mutationFn: () =>
      generateFn({ data: { farm_id: activeFarmId!, language: lang } }),
    onSuccess: (r) => {
      if (!r.success) {
        toast.error(r.error);
        return;
      }
      toast.success(`Generated ${r.data.generated} recommendation${r.data.generated === 1 ? "" : "s"}`);
      qc.invalidateQueries({ queryKey: ["agrimind"] });
    },
    onError: () => toast.error("AgriMind AI is currently unavailable."),
  });

  const updateStatus = useMutation({
    mutationFn: (vars: { id: string; accepted?: boolean; dismissed?: boolean }) =>
      updateFn({ data: vars }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agrimind"] }),
  });

  const rows = recs.data?.success && recs.data.data ? recs.data.data : [];
  const active = useMemo(() => rows.filter((r) => !r.dismissed), [rows]);
  const accepted = useMemo(() => rows.filter((r) => r.accepted), [rows]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 space-y-6">
      <PageHeader
        title="AgriMind AI"
        description="The intelligence behind every farm decision. Recommendations are generated only from real data — never fabricated."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-muted-foreground" />
              <Select value={lang} onValueChange={(v) => setLang(v as Lang)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGS.map((l) => (
                    <SelectItem key={l.code} value={l.code}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {items.length > 1 && (
              <Select value={activeFarmId} onValueChange={setFarmId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select farm" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button
              onClick={() => generate.mutate()}
              disabled={!activeFarmId || generate.isPending}
            >
              {generate.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Generate insights
            </Button>
          </div>
        }
      />

      {!activeFarmId && !farms.isLoading && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Add a farm first to enable AgriMind recommendations.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={<Brain className="h-5 w-5" />}
          label="Active recommendations"
          value={active.length.toString()}
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Accepted"
          value={accepted.length.toString()}
        />
        <StatCard
          icon={<Info className="h-5 w-5" />}
          label="Language"
          value={LANGS.find((l) => l.code === lang)?.label ?? "English"}
        />
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Today's recommendations</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => qc.invalidateQueries({ queryKey: ["agrimind"] })}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {recs.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : active.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No recommendations yet. Click <strong>Generate insights</strong>{" "}
              to produce decisions from your latest weather, crop AI, soil, and irrigation data.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {active.map((r) => (
              <RecommendationCard
                key={r.id}
                rec={r}
                lang={lang}
                onAccept={() =>
                  updateStatus.mutate({ id: r.id, accepted: !r.accepted })
                }
                onDismiss={() =>
                  updateStatus.mutate({ id: r.id, dismissed: true })
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card className="bg-card/60 backdrop-blur">
      <CardContent className="flex items-center gap-4 py-5">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

type Rec = AgriMindRecommendation;

function RecommendationCard({
  rec,
  lang,
  onAccept,
  onDismiss,
}: {
  rec: Rec;
  lang: Lang;
  onAccept: () => void;
  onDismiss: () => void;
}) {
  const speakFn = useServerFn(speakAgriText);
  const [speaking, setSpeaking] = useState(false);

  const t = rec.translations?.[lang] ?? {
    title: rec.title,
    recommendation: rec.recommendation,
    reason: rec.reason,
  };

  const confidenceColor =
    rec.confidence === "high"
      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
      : rec.confidence === "low"
        ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
        : "bg-sky-500/15 text-sky-700 dark:text-sky-400";

  async function play() {
    setSpeaking(true);
    try {
      const r = await speakFn({
        data: {
          text: `${t.title}. ${t.recommendation}. ${t.reason}`.slice(0, 1800),
          language: lang,
        },
      });
      if (!r.success) {
        toast.error(r.error);
        return;
      }
      const audio = new Audio(`data:${r.data.mime};base64,${r.data.audio_base64}`);
      audio.onended = () => setSpeaking(false);
      await audio.play();
    } catch {
      toast.error("Voice playback unavailable.");
      setSpeaking(false);
    }
  }

  return (
    <Card className="overflow-hidden border-border/70 bg-card/70 backdrop-blur">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{rec.recommendation_type}</Badge>
            <Badge className={confidenceColor} variant="outline">
              {rec.confidence}
            </Badge>
            {rec.accepted && (
              <Badge variant="default">
                <CheckCircle2 className="mr-1 h-3 w-3" /> Accepted
              </Badge>
            )}
          </div>
          <CardTitle className="text-base md:text-lg">{t.title}</CardTitle>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={play}
          disabled={speaking}
          title="Play audio"
        >
          {speaking ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed">{t.recommendation}</p>

        <Accordion type="single" collapsible>
          <AccordionItem value="why" className="border-t">
            <AccordionTrigger className="text-sm">
              Why this recommendation?
            </AccordionTrigger>
            <AccordionContent>
              <p className="mb-3 text-sm text-muted-foreground">{t.reason}</p>
              <div className="flex flex-wrap gap-1.5">
                {rec.source_modules.map((m) => (
                  <Badge key={m} variant="outline" className="text-[10px]">
                    {m}
                  </Badge>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex items-center justify-between border-t pt-3">
          <span className="text-xs text-muted-foreground">
            Updated {new Date(rec.created_at).toLocaleString()}
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onDismiss}>
              <XCircle className="mr-2 h-4 w-4" />
              Dismiss
            </Button>
            <Button size="sm" onClick={onAccept}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {rec.accepted ? "Unaccept" : "Accept"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Surface a tiny note if/when the LLM is misconfigured at runtime
export function _Unused() {
  return <AlertTriangle className="hidden" />;
}
