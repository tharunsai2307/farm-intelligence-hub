import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, MapPinned, Trash2, Sprout, Pencil } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { CardSkeleton } from "@/components/common/loading-skeleton";
import { DataCompletenessBadge } from "@/components/common/data-completeness-badge";
import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { getPrimaryFarm } from "@/lib/services/farms.functions";
import {
  createFarmPlot,
  deleteFarmPlot,
  listFarmPlots,
  type FarmPlotRow,
} from "@/lib/services/farm-plots.functions";

export const Route = createFileRoute("/_authenticated/app/farm/plots")({
  head: () => ({ meta: [{ title: "Farm Plots — AgriTwin OS" }] }),
  component: PlotsPage,
});

const plotForm = z.object({
  name: z.string().trim().min(1, "Required").max(120),
  crop: z.string().trim().max(80).optional().or(z.literal("")),
  crop_variety: z.string().trim().max(80).optional().or(z.literal("")),
  area: z
    .union([z.string(), z.number()])
    .transform((v) => (v === "" || v === undefined ? null : Number(v)))
    .refine((v) => v === null || (Number.isFinite(v) && v > 0), "Must be positive")
    .optional(),
  area_unit: z.enum(["hectares", "acres"]).default("hectares"),
  soil_type: z.string().trim().max(60).optional().or(z.literal("")),
  irrigation_type: z.string().trim().max(60).optional().or(z.literal("")),
  latitude: z
    .union([z.string(), z.number()])
    .transform((v) => (v === "" || v === undefined ? null : Number(v)))
    .refine((v) => v === null || (Number.isFinite(v) && v >= -90 && v <= 90), "Invalid latitude")
    .optional(),
  longitude: z
    .union([z.string(), z.number()])
    .transform((v) => (v === "" || v === undefined ? null : Number(v)))
    .refine((v) => v === null || (Number.isFinite(v) && v >= -180 && v <= 180), "Invalid longitude")
    .optional(),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});
type PlotFormValues = z.input<typeof plotForm>;

const REQUIRED_FIELDS: Array<keyof FarmPlotRow> = [
  "name",
  "crop",
  "area",
  "soil_type",
  "irrigation_type",
];
function completeness(p: FarmPlotRow) {
  const filled = REQUIRED_FIELDS.filter((k) => {
    const v = p[k];
    return v !== null && v !== undefined && v !== "";
  }).length;
  return (filled / REQUIRED_FIELDS.length) * 100;
}

function PlotsPage() {
  const qc = useQueryClient();
  const farmQ = useQuery({ queryKey: ["primary-farm"], queryFn: () => getPrimaryFarm() });
  const farm = farmQ.data?.farm;

  const plotsQ = useQuery({
    queryKey: ["farm-plots", farm?.id],
    queryFn: () => listFarmPlots({ data: { farm_id: farm!.id } }),
    enabled: !!farm?.id,
  });

  const [open, setOpen] = useState(false);

  const createMut = useMutation({
    mutationFn: (values: PlotFormValues) => {
      const parsed = plotForm.parse(values);
      return createFarmPlot({
        data: {
          farm_id: farm!.id,
          name: parsed.name,
          crop: parsed.crop || null,
          crop_variety: parsed.crop_variety || null,
          area: parsed.area ?? null,
          area_unit: parsed.area_unit,
          soil_type: parsed.soil_type || null,
          irrigation_type: parsed.irrigation_type || null,
          latitude: parsed.latitude ?? null,
          longitude: parsed.longitude ?? null,
          notes: parsed.notes || null,
        },
      });
    },
    onSuccess: () => {
      toast.success("Plot created");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["farm-plots"] });
      qc.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteFarmPlot({ data: { id } }),
    onSuccess: () => {
      toast.success("Plot deleted");
      qc.invalidateQueries({ queryKey: ["farm-plots"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Farm Plots"
        description="Define the real plots, blocks, or fields on your farm. Used to power the Digital Twin and records."
        actions={
          farm && (
            <PlotSheet
              open={open}
              onOpenChange={setOpen}
              loading={createMut.isPending}
              onSubmit={(v) => createMut.mutate(v)}
            />
          )
        }
      />

      {farmQ.isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      )}

      {!farmQ.isLoading && !farm && (
        <EmptyState
          icon={Sprout}
          title="Add a farm first"
          description="Plots belong to a farm. Set up your farm to start creating plots."
          action={
            <Button asChild>
              <Link to="/onboarding/farm">Add farm</Link>
            </Button>
          }
        />
      )}

      {farm && plotsQ.isError && (
        <ErrorState message="Could not load plots." onRetry={() => plotsQ.refetch()} />
      )}

      {farm && plotsQ.isSuccess && plotsQ.data.items.length === 0 && (
        <EmptyState
          icon={MapPinned}
          title="No farm plots created yet"
          description="Create your first plot to start building the Digital Twin layout."
          action={
            <PlotSheet
              open={open}
              onOpenChange={setOpen}
              loading={createMut.isPending}
              onSubmit={(v) => createMut.mutate(v)}
              label="Create First Plot"
            />
          }
        />
      )}

      {farm && plotsQ.isSuccess && plotsQ.data.items.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plotsQ.data.items.map((p) => (
            <article key={p.id} className="surface-card flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold">{p.name}</h3>
                  <p className="truncate text-xs text-muted-foreground">
                    {p.crop ?? "No crop set"}
                    {p.crop_variety ? ` · ${p.crop_variety}` : ""}
                  </p>
                </div>
                <DataCompletenessBadge percent={completeness(p)} />
              </div>
              <dl className="grid grid-cols-2 gap-2 text-xs">
                <Fact label="Area" value={p.area ? `${p.area} ${p.area_unit ?? "ha"}` : "—"} />
                <Fact label="Soil" value={p.soil_type ?? "—"} />
                <Fact label="Irrigation" value={p.irrigation_type ?? "—"} />
                <Fact
                  label="Coords"
                  value={p.latitude != null && p.longitude != null ? `${p.latitude.toFixed(4)}, ${p.longitude.toFixed(4)}` : "—"}
                />
              </dl>
              <div className="mt-auto flex items-center justify-end gap-2 pt-2">
                <ConfirmDeleteDialog
                  title={`Delete plot "${p.name}"?`}
                  description="This will hide the plot and its association with records."
                  onConfirm={() => deleteMut.mutateAsync(p.id)}
                  loading={deleteMut.isPending}
                  trigger={
                    <Button variant="ghost" size="sm" className="text-destructive">
                      <Trash2 className="mr-1 h-4 w-4" /> Delete
                    </Button>
                  }
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-muted/30 px-2 py-1.5">
      <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="truncate text-xs font-medium">{value}</dd>
    </div>
  );
}

function PlotSheet({
  open,
  onOpenChange,
  onSubmit,
  loading,
  label = "Add plot",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (values: PlotFormValues) => void;
  loading?: boolean;
  label?: string;
}) {
  const form = useForm<PlotFormValues>({
    defaultValues: {
      name: "",
      crop: "",
      crop_variety: "",
      area: "",
      area_unit: "hectares",
      soil_type: "",
      irrigation_type: "",
      latitude: "",
      longitude: "",
      notes: "",
    },
  });

  const handleOpenChange = (v: boolean) => {
    if (!v) form.reset();
    onOpenChange(v);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> {label}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Pencil className="h-4 w-4" /> Create farm plot
          </SheetTitle>
          <SheetDescription>
            Enter real details only. Optional fields can be added later.
          </SheetDescription>
        </SheetHeader>

        <form
          className="grid gap-4 px-4 pb-6"
          onSubmit={form.handleSubmit((v) => onSubmit(v))}
        >
          <Field label="Plot name" error={form.formState.errors.name?.message}>
            <Input {...form.register("name")} placeholder="North Field" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Crop">
              <Input {...form.register("crop")} placeholder="Wheat" />
            </Field>
            <Field label="Variety">
              <Input {...form.register("crop_variety")} placeholder="HD 2967" />
            </Field>
          </div>

          <div className="grid grid-cols-[1fr_120px] gap-3">
            <Field label="Area" error={form.formState.errors.area?.message as string}>
              <Input type="number" step="0.01" {...form.register("area")} placeholder="2.5" />
            </Field>
            <Field label="Unit">
              <Select
                value={form.watch("area_unit")}
                onValueChange={(v) => form.setValue("area_unit", v as "hectares" | "acres")}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hectares">hectares</SelectItem>
                  <SelectItem value="acres">acres</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Soil type">
              <Input {...form.register("soil_type")} placeholder="Loamy" />
            </Field>
            <Field label="Irrigation">
              <Input {...form.register("irrigation_type")} placeholder="Drip" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Latitude" error={form.formState.errors.latitude?.message as string}>
              <Input type="number" step="0.000001" {...form.register("latitude")} placeholder="28.6139" />
            </Field>
            <Field label="Longitude" error={form.formState.errors.longitude?.message as string}>
              <Input type="number" step="0.000001" {...form.register("longitude")} placeholder="77.2090" />
            </Field>
          </div>

          <Field label="Notes">
            <Textarea rows={3} {...form.register("notes")} />
          </Field>

          <SheetFooter className="px-0">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : "Save plot"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
