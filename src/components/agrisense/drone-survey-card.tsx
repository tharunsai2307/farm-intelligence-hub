import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Plane,
  Upload,
  FileText,
  Map as MapIcon,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import {
  createDroneSurveyFn,
  deleteDroneSurveyFn,
} from "@/lib/services/agrisense.service";
import type { DroneSurveyRow } from "@/lib/services/agrisense.server";

/**
 * DroneSurveyCard
 *
 * Lists one drone survey with download links to the report / GeoJSON /
 * orthomosaic stored privately in `drone-uploads`. No automated insights are
 * generated — analytics are out of scope for Phase 2.
 */
export function DroneSurveyCard({
  survey,
  onDeleted,
}: {
  survey: DroneSurveyRow;
  onDeleted?: () => void;
}) {
  const qc = useQueryClient();
  const removeMutation = useMutation({
    mutationFn: async () => deleteDroneSurveyFn({ data: { id: survey.id } }),
    onSuccess: (res) => {
      if (!res.success) return toast.error(res.error);
      toast.success("Survey deleted");
      qc.invalidateQueries({ queryKey: ["agrisense", "drone"] });
      onDeleted?.();
    },
  });

  return (
    <article className="surface-card p-4">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent text-accent-foreground">
            <Plane className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">
              Survey — {new Date(survey.survey_date).toLocaleDateString()}
            </h3>
            <p className="text-xs text-muted-foreground">
              {survey.pilot ?? "Unknown pilot"} ·{" "}
              {survey.coverage_area ? `${survey.coverage_area} ha · ` : ""}
              {survey.image_count} images
            </p>
          </div>
        </div>
        <Badge variant="outline">{survey.status}</Badge>
      </header>

      <div className="mt-3 flex flex-wrap gap-2">
        <AssetLink url={survey.report_url} label="Report" Icon={FileText} />
        <AssetLink url={survey.geojson_url} label="GeoJSON" Icon={MapIcon} />
        <AssetLink url={survey.orthomosaic_url} label="Orthomosaic" Icon={ImageIcon} />
      </div>

      {survey.notes && (
        <p className="mt-3 rounded border bg-muted/30 p-2 text-xs text-muted-foreground">
          {survey.notes}
        </p>
      )}

      <div className="mt-3 flex justify-end">
        <Button
          size="sm"
          variant="ghost"
          className="text-rose-600 hover:text-rose-700"
          onClick={() => removeMutation.mutate()}
          disabled={removeMutation.isPending}
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
        </Button>
      </div>
    </article>
  );
}

function AssetLink({
  url,
  label,
  Icon,
}: {
  url: string | null;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  if (!url) {
    return (
      <span className="inline-flex items-center gap-1 rounded border bg-muted/30 px-2 py-1 text-[11px] text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}: —
      </span>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded border bg-accent/40 px-2 py-1 text-[11px] font-medium hover:bg-accent"
    >
      <Icon className="h-3 w-3" /> {label}
    </a>
  );
}

// -------------------- Upload dialog --------------------

const STATUSES = ["planned", "in_progress", "completed", "failed", "cancelled"] as const;

export function DroneSurveyUploader({
  farmId,
  userId,
}: {
  farmId: string;
  userId: string;
}) {
  const [open, setOpen] = useState(false);
  const [surveyDate, setSurveyDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [pilot, setPilot] = useState("");
  const [coverage, setCoverage] = useState("");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("completed");
  const [notes, setNotes] = useState("");
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [geoFile, setGeoFile] = useState<File | null>(null);
  const [orthoFile, setOrthoFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const qc = useQueryClient();

  async function uploadIfPresent(file: File | null, kind: string): Promise<string | null> {
    if (!file) return null;
    const path = `${userId}/${farmId}/${Date.now()}-${kind}-${file.name}`;
    const { error } = await supabase.storage.from("drone-uploads").upload(path, file, {
      upsert: false,
      contentType: file.type || "application/octet-stream",
    });
    if (error) throw new Error(`${kind} upload failed: ${error.message}`);
    const { data } = await supabase.storage.from("drone-uploads").createSignedUrl(path, 60 * 60 * 24 * 7);
    return data?.signedUrl ?? null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const [report_url, geojson_url, orthomosaic_url] = await Promise.all([
        uploadIfPresent(reportFile, "report"),
        uploadIfPresent(geoFile, "geojson"),
        uploadIfPresent(orthoFile, "ortho"),
      ]);
      const res = await createDroneSurveyFn({
        data: {
          farm_id: farmId,
          survey_date: surveyDate,
          pilot: pilot.trim() || null,
          coverage_area: coverage ? Number(coverage) : null,
          image_count: 0,
          status,
          notes: notes.trim() || null,
          report_url,
          geojson_url,
          orthomosaic_url,
        },
      });
      if (!res.success) throw new Error(res.error);
      toast.success("Drone survey saved");
      qc.invalidateQueries({ queryKey: ["agrisense", "drone"] });
      setOpen(false);
      setPilot("");
      setCoverage("");
      setNotes("");
      setReportFile(null);
      setGeoFile(null);
      setOrthoFile(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" /> Upload drone survey
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload drone survey</DialogTitle>
          <DialogDescription>
            Attach the survey report, GeoJSON boundary, and orthomosaic. Files are stored privately;
            only you can access them.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="ds-date">Date</Label>
              <Input
                id="ds-date"
                type="date"
                value={surveyDate}
                onChange={(e) => setSurveyDate(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="ds-status">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                <SelectTrigger id="ds-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="ds-pilot">Pilot</Label>
              <Input id="ds-pilot" value={pilot} onChange={(e) => setPilot(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="ds-area">Coverage (ha)</Label>
              <Input
                id="ds-area"
                type="number"
                step="0.01"
                min="0"
                value={coverage}
                onChange={(e) => setCoverage(e.target.value)}
              />
            </div>
          </div>
          <FileField label="Survey report (PDF, DOCX)" onChange={setReportFile} accept=".pdf,.doc,.docx" />
          <FileField label="GeoJSON boundary" onChange={setGeoFile} accept=".json,.geojson" />
          <FileField label="Orthomosaic (TIF, JPG, PNG)" onChange={setOrthoFile} accept="image/*,.tif,.tiff" />
          <div className="grid gap-1.5">
            <Label htmlFor="ds-notes">Notes</Label>
            <Input id="ds-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Uploading…" : "Save survey"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FileField({
  label,
  accept,
  onChange,
}: {
  label: string;
  accept: string;
  onChange: (f: File | null) => void;
}) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      <Input
        type="file"
        accept={accept}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
