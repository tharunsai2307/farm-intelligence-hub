import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FlaskConical, Droplets, Eye, Trash2, Upload, Image as ImageIcon } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { CardSkeleton } from "@/components/common/loading-skeleton";
import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { getPrimaryFarm } from "@/lib/services/farms.functions";
import { listFarmPlots } from "@/lib/services/farm-plots.functions";
import {
  createCropObservation,
  createIrrigationRecord,
  createSoilRecord,
  deleteCropObservation,
  deleteIrrigationRecord,
  deleteSoilRecord,
  listCropObservations,
  listIrrigationRecords,
  listSoilRecords,
} from "@/lib/services/records.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/app/farm/records")({
  head: () => ({ meta: [{ title: "Farm Records — AgriTwin OS" }] }),
  component: RecordsPage,
});

function nowLocal(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

function RecordsPage() {
  const farmQ = useQuery({ queryKey: ["primary-farm"], queryFn: () => getPrimaryFarm() });
  const farm = farmQ.data?.farm;
  const plotsQ = useQuery({
    queryKey: ["farm-plots", farm?.id],
    queryFn: () => listFarmPlots({ data: { farm_id: farm!.id } }),
    enabled: !!farm?.id,
  });
  const plots = plotsQ.data?.items ?? [];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Farm Records"
        description="Manually log soil, irrigation, and crop observations. Charts on the dashboard render only from these records."
      />

      {farmQ.isLoading && <CardSkeleton />}
      {!farmQ.isLoading && !farm && (
        <EmptyState icon={FlaskConical} title="Add a farm to start recording" />
      )}

      {farm && (
        <Tabs defaultValue="soil" className="w-full">
          <TabsList>
            <TabsTrigger value="soil">Soil</TabsTrigger>
            <TabsTrigger value="irrigation">Irrigation</TabsTrigger>
            <TabsTrigger value="observation">Crop observations</TabsTrigger>
          </TabsList>

          <TabsContent value="soil" className="mt-6">
            <SoilSection farmId={farm.id} plots={plots} />
          </TabsContent>
          <TabsContent value="irrigation" className="mt-6">
            <IrrigationSection farmId={farm.id} plots={plots} />
          </TabsContent>
          <TabsContent value="observation" className="mt-6">
            <ObservationSection farmId={farm.id} plots={plots} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

type PlotLite = { id: string; name: string };

function PlotSelect({
  plots,
  value,
  onChange,
}: {
  plots: PlotLite[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Select value={value || "none"} onValueChange={(v) => onChange(v === "none" ? "" : v)}>
      <SelectTrigger>
        <SelectValue placeholder="Whole farm" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">Whole farm</SelectItem>
        {plots.map((p) => (
          <SelectItem key={p.id} value={p.id}>
            {p.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ---------------- Soil ----------------

function SoilSection({ farmId, plots }: { farmId: string; plots: PlotLite[] }) {
  const qc = useQueryClient();
  const listQ = useQuery({
    queryKey: ["soil-records", farmId],
    queryFn: () => listSoilRecords({ data: { farm_id: farmId } }),
  });
  type F = {
    plot_id: string;
    recorded_at: string;
    moisture: string;
    ph: string;
    nitrogen: string;
    phosphorus: string;
    potassium: string;
    temperature: string;
    notes: string;
  };
  const form = useForm<F>({
    defaultValues: {
      plot_id: "",
      recorded_at: nowLocal(),
      moisture: "",
      ph: "",
      nitrogen: "",
      phosphorus: "",
      potassium: "",
      temperature: "",
      notes: "",
    },
  });
  const num = (s: string) => (s === "" ? null : Number(s));

  const createMut = useMutation({
    mutationFn: (v: F) => {
      const moisture = num(v.moisture);
      if (moisture !== null && (moisture < 0 || moisture > 100)) throw new Error("Moisture 0–100");
      const ph = num(v.ph);
      if (ph !== null && (ph < 0 || ph > 14)) throw new Error("pH 0–14");
      return createSoilRecord({
        data: {
          farm_id: farmId,
          plot_id: v.plot_id || null,
          recorded_at: new Date(v.recorded_at).toISOString(),
          moisture,
          ph,
          nitrogen: num(v.nitrogen),
          phosphorus: num(v.phosphorus),
          potassium: num(v.potassium),
          temperature: num(v.temperature),
          notes: v.notes || null,
        },
      });
    },
    onSuccess: () => {
      toast.success("Soil record added");
      form.reset({ ...form.getValues(), moisture: "", ph: "", nitrogen: "", phosphorus: "", potassium: "", temperature: "", notes: "", recorded_at: nowLocal() });
      qc.invalidateQueries({ queryKey: ["soil-records"] });
      qc.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteSoilRecord({ data: { id } }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["soil-records"] });
    },
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
      <form className="surface-card flex flex-col gap-3 p-5" onSubmit={form.handleSubmit((v) => createMut.mutate(v))}>
        <h3 className="text-sm font-semibold">Add soil record</h3>
        <FieldRow label="Plot">
          <PlotSelect plots={plots} value={form.watch("plot_id")} onChange={(v) => form.setValue("plot_id", v)} />
        </FieldRow>
        <FieldRow label="Date / time">
          <Input type="datetime-local" {...form.register("recorded_at", { required: true })} />
        </FieldRow>
        <div className="grid grid-cols-2 gap-3">
          <FieldRow label="Moisture %"><Input type="number" step="0.1" {...form.register("moisture")} /></FieldRow>
          <FieldRow label="pH"><Input type="number" step="0.1" {...form.register("ph")} /></FieldRow>
          <FieldRow label="Nitrogen"><Input type="number" step="0.1" {...form.register("nitrogen")} /></FieldRow>
          <FieldRow label="Phosphorus"><Input type="number" step="0.1" {...form.register("phosphorus")} /></FieldRow>
          <FieldRow label="Potassium"><Input type="number" step="0.1" {...form.register("potassium")} /></FieldRow>
          <FieldRow label="Temp °C"><Input type="number" step="0.1" {...form.register("temperature")} /></FieldRow>
        </div>
        <FieldRow label="Notes"><Textarea rows={2} {...form.register("notes")} /></FieldRow>
        <Button type="submit" disabled={createMut.isPending}>
          {createMut.isPending ? "Saving…" : "Save soil record"}
        </Button>
      </form>

      <RecordsTable
        isLoading={listQ.isLoading}
        isError={listQ.isError}
        rows={listQ.data?.items ?? []}
        emptyLabel="No soil records yet."
        onRetry={() => listQ.refetch()}
        columns={[
          { key: "recorded_at", label: "Date", render: (r) => new Date(r.recorded_at).toLocaleString() },
          { key: "moisture", label: "Moisture", render: (r) => fmt(r.moisture, "%") },
          { key: "ph", label: "pH", render: (r) => fmt(r.ph) },
          { key: "temperature", label: "Temp", render: (r) => fmt(r.temperature, "°C") },
          { key: "nitrogen", label: "N", render: (r) => fmt(r.nitrogen) },
          { key: "phosphorus", label: "P", render: (r) => fmt(r.phosphorus) },
          { key: "potassium", label: "K", render: (r) => fmt(r.potassium) },
        ]}
        onDelete={(id) => deleteMut.mutateAsync(id)}
      />
    </div>
  );
}

// ---------------- Irrigation ----------------

function IrrigationSection({ farmId, plots }: { farmId: string; plots: PlotLite[] }) {
  const qc = useQueryClient();
  const listQ = useQuery({
    queryKey: ["irrigation-records", farmId],
    queryFn: () => listIrrigationRecords({ data: { farm_id: farmId } }),
  });
  type F = {
    plot_id: string;
    started_at: string;
    method: string;
    volume_liters: string;
    duration_minutes: string;
    energy_used: string;
    notes: string;
  };
  const form = useForm<F>({
    defaultValues: {
      plot_id: "",
      started_at: nowLocal(),
      method: "drip",
      volume_liters: "",
      duration_minutes: "",
      energy_used: "",
      notes: "",
    },
  });
  const num = (s: string) => (s === "" ? null : Number(s));

  const createMut = useMutation({
    mutationFn: (v: F) =>
      createIrrigationRecord({
        data: {
          farm_id: farmId,
          plot_id: v.plot_id || null,
          started_at: new Date(v.started_at).toISOString(),
          method: v.method,
          volume_liters: num(v.volume_liters),
          duration_minutes: num(v.duration_minutes),
          energy_used: num(v.energy_used),
          notes: v.notes || null,
        },
      }),
    onSuccess: () => {
      toast.success("Irrigation logged");
      form.reset({ ...form.getValues(), volume_liters: "", duration_minutes: "", energy_used: "", notes: "", started_at: nowLocal() });
      qc.invalidateQueries({ queryKey: ["irrigation-records"] });
      qc.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteIrrigationRecord({ data: { id } }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["irrigation-records"] });
    },
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
      <form className="surface-card flex flex-col gap-3 p-5" onSubmit={form.handleSubmit((v) => createMut.mutate(v))}>
        <h3 className="text-sm font-semibold">Add irrigation record</h3>
        <FieldRow label="Plot">
          <PlotSelect plots={plots} value={form.watch("plot_id")} onChange={(v) => form.setValue("plot_id", v)} />
        </FieldRow>
        <FieldRow label="Started at">
          <Input type="datetime-local" {...form.register("started_at", { required: true })} />
        </FieldRow>
        <FieldRow label="Method">
          <Select value={form.watch("method")} onValueChange={(v) => form.setValue("method", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["drip", "sprinkler", "flood", "furrow", "manual", "other"].map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldRow>
        <div className="grid grid-cols-2 gap-3">
          <FieldRow label="Volume (L)"><Input type="number" step="0.1" {...form.register("volume_liters")} /></FieldRow>
          <FieldRow label="Duration (min)"><Input type="number" step="1" {...form.register("duration_minutes")} /></FieldRow>
        </div>
        <FieldRow label="Energy used"><Input type="number" step="0.1" {...form.register("energy_used")} /></FieldRow>
        <FieldRow label="Notes"><Textarea rows={2} {...form.register("notes")} /></FieldRow>
        <Button type="submit" disabled={createMut.isPending}>
          {createMut.isPending ? "Saving…" : "Save irrigation record"}
        </Button>
      </form>

      <RecordsTable
        isLoading={listQ.isLoading}
        isError={listQ.isError}
        rows={listQ.data?.items ?? []}
        emptyLabel="No irrigation records yet."
        onRetry={() => listQ.refetch()}
        columns={[
          { key: "started_at", label: "Date", render: (r) => new Date(r.started_at).toLocaleString() },
          { key: "method", label: "Method", render: (r) => r.method ?? "—" },
          { key: "volume_liters", label: "Volume (L)", render: (r) => fmt(r.volume_liters) },
          { key: "duration_minutes", label: "Duration (min)", render: (r) => fmt(r.duration_minutes) },
          { key: "energy_used", label: "Energy", render: (r) => fmt(r.energy_used) },
        ]}
        onDelete={(id) => deleteMut.mutateAsync(id)}
      />
    </div>
  );
}

// ---------------- Observations ----------------

function ObservationSection({ farmId, plots }: { farmId: string; plots: PlotLite[] }) {
  const qc = useQueryClient();
  const listQ = useQuery({
    queryKey: ["crop-observations", farmId],
    queryFn: () => listCropObservations({ data: { farm_id: farmId } }),
  });
  type F = {
    plot_id: string;
    recorded_at: string;
    crop_stage: string;
    visual_condition: string;
    notes: string;
  };
  const form = useForm<F>({
    defaultValues: {
      plot_id: "",
      recorded_at: nowLocal(),
      crop_stage: "",
      visual_condition: "",
      notes: "",
    },
  });
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const createMut = useMutation({
    mutationFn: async (v: F) => {
      let image_url: string | null = null;
      const file = fileRef.current?.files?.[0] ?? null;
      if (file) {
        setUploading(true);
        const { data: u } = await supabase.auth.getUser();
        if (!u.user) throw new Error("Not authenticated");
        const path = `${u.user.id}/${crypto.randomUUID()}-${file.name.replace(/[^\w.\-]/g, "_")}`;
        const { error } = await supabase.storage
          .from("crop-observations")
          .upload(path, file, { upsert: false });
        if (error) throw new Error(error.message);
        image_url = path;
      }
      try {
        return await createCropObservation({
          data: {
            farm_id: farmId,
            plot_id: v.plot_id || null,
            recorded_at: new Date(v.recorded_at).toISOString(),
            crop_stage: v.crop_stage || null,
            visual_condition: v.visual_condition || null,
            notes: v.notes || null,
            image_url,
          },
        });
      } finally {
        setUploading(false);
      }
    },
    onSuccess: () => {
      toast.success("Observation saved");
      if (fileRef.current) fileRef.current.value = "";
      form.reset({ ...form.getValues(), crop_stage: "", visual_condition: "", notes: "", recorded_at: nowLocal() });
      qc.invalidateQueries({ queryKey: ["crop-observations"] });
      qc.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteCropObservation({ data: { id } }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["crop-observations"] });
    },
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
      <form className="surface-card flex flex-col gap-3 p-5" onSubmit={form.handleSubmit((v) => createMut.mutate(v))}>
        <h3 className="text-sm font-semibold">Add crop observation</h3>
        <FieldRow label="Plot">
          <PlotSelect plots={plots} value={form.watch("plot_id")} onChange={(v) => form.setValue("plot_id", v)} />
        </FieldRow>
        <FieldRow label="Date / time">
          <Input type="datetime-local" {...form.register("recorded_at", { required: true })} />
        </FieldRow>
        <FieldRow label="Crop stage">
          <Input {...form.register("crop_stage")} placeholder="Flowering" />
        </FieldRow>
        <FieldRow label="Visual condition">
          <Input {...form.register("visual_condition")} placeholder="Healthy / Stressed / Pest" />
        </FieldRow>
        <FieldRow label="Notes"><Textarea rows={3} {...form.register("notes")} /></FieldRow>
        <FieldRow label="Image (optional)">
          <Input ref={fileRef} type="file" accept="image/*" />
        </FieldRow>
        <Button type="submit" disabled={createMut.isPending || uploading}>
          <Upload className="mr-2 h-4 w-4" />
          {createMut.isPending || uploading ? "Saving…" : "Save observation"}
        </Button>
      </form>

      <RecordsTable
        isLoading={listQ.isLoading}
        isError={listQ.isError}
        rows={listQ.data?.items ?? []}
        emptyLabel="No crop observations yet."
        onRetry={() => listQ.refetch()}
        columns={[
          { key: "recorded_at", label: "Date", render: (r) => new Date(r.recorded_at).toLocaleString() },
          { key: "crop_stage", label: "Stage", render: (r) => r.crop_stage ?? "—" },
          { key: "visual_condition", label: "Condition", render: (r) => r.visual_condition ?? "—" },
          {
            key: "image_url",
            label: "Image",
            render: (r) =>
              r.image_url ? (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <ImageIcon className="h-3.5 w-3.5" /> attached
                </span>
              ) : (
                "—"
              ),
          },
        ]}
        onDelete={(id) => deleteMut.mutateAsync(id)}
      />
    </div>
  );
}

// ---------------- Shared bits ----------------

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function fmt(v: number | null | undefined, suffix = "") {
  return v == null ? "—" : `${v}${suffix}`;
}

type Row = { id: string };
function RecordsTable<T extends Row>({
  isLoading,
  isError,
  rows,
  emptyLabel,
  onRetry,
  columns,
  onDelete,
}: {
  isLoading: boolean;
  isError: boolean;
  rows: T[];
  emptyLabel: string;
  onRetry: () => void;
  columns: { key: string; label: string; render: (row: T) => React.ReactNode }[];
  onDelete: (id: string) => Promise<unknown>;
}) {
  const visible = useMemo(() => rows, [rows]);

  if (isLoading) return <CardSkeleton />;
  if (isError) return <ErrorState onRetry={onRetry} />;
  if (visible.length === 0) {
    return <EmptyState icon={Eye} title={emptyLabel} description="Use the form to add the first record." />;
  }
  return (
    <div className="surface-card overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((c) => (
              <TableHead key={c.key}>{c.label}</TableHead>
            ))}
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.map((r) => (
            <TableRow key={r.id}>
              {columns.map((c) => (
                <TableCell key={c.key} className="text-sm">
                  {c.render(r)}
                </TableCell>
              ))}
              <TableCell className="text-right">
                <ConfirmDeleteDialog
                  onConfirm={() => onDelete(r.id)}
                  trigger={
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  }
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// silence unused imports for tabs decoration
void Droplets;
