import { useState, type ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Sprout, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
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
import { EmptyState } from "@/components/common/empty-state";
import { saveFarmHarvest, deleteFarmHarvest } from "@/lib/services/farmos.service";
import type { HarvestRow } from "@/lib/services/farmos.server";

const STATUSES: HarvestRow["status"][] = [
  "planned",
  "in_progress",
  "completed",
  "sold",
  "cancelled",
];

function statusTone(s: HarvestRow["status"]) {
  if (s === "planned") return "bg-blue-500/15 text-blue-700 dark:text-blue-400";
  if (s === "in_progress") return "bg-amber-500/15 text-amber-700 dark:text-amber-400";
  if (s === "completed") return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400";
  if (s === "sold") return "bg-primary/15 text-primary";
  return "bg-muted text-muted-foreground";
}

export function HarvestForm({
  farmId,
  initial,
  trigger,
}: {
  farmId: string;
  initial?: HarvestRow;
  trigger?: ReactNode;
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    crop: initial?.crop ?? "",
    expected_harvest_date: initial?.expected_harvest_date ?? "",
    actual_harvest_date: initial?.actual_harvest_date ?? "",
    expected_quantity: initial?.expected_quantity ?? "",
    actual_quantity: initial?.actual_quantity ?? "",
    unit: initial?.unit ?? "kg",
    storage_location: initial?.storage_location ?? "",
    buyer: initial?.buyer ?? "",
    status: (initial?.status ?? "planned") as HarvestRow["status"],
    notes: initial?.notes ?? "",
  });

  const m = useMutation({
    mutationFn: async () => {
      const payload: any = {
        ...(initial?.id ? { id: initial.id } : {}),
        farm_id: farmId,
        crop: form.crop.trim(),
        expected_harvest_date: form.expected_harvest_date || null,
        actual_harvest_date: form.actual_harvest_date || null,
        expected_quantity: form.expected_quantity === "" ? null : Number(form.expected_quantity),
        actual_quantity: form.actual_quantity === "" ? null : Number(form.actual_quantity),
        unit: form.unit.trim() || "kg",
        storage_location: form.storage_location.trim() || null,
        buyer: form.buyer.trim() || null,
        status: form.status,
        notes: form.notes.trim() || null,
      };
      const res = await saveFarmHarvest({ data: payload });
      if (!res.success) throw new Error(res.error);
    },
    onSuccess: () => {
      toast.success(initial ? "Harvest updated" : "Harvest planned");
      qc.invalidateQueries({ queryKey: ["harvest"] });
      qc.invalidateQueries({ queryKey: ["farmos-overview"] });
      qc.invalidateQueries({ queryKey: ["calendar"] });
      setOpen(false);
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" /> Plan harvest
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit harvest" : "Plan harvest"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Crop</Label>
            <Input value={form.crop} onChange={(e) => setForm({ ...form, crop: e.target.value })} />
          </div>
          <div>
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => setForm({ ...form, status: v as any })}
            >
              <SelectTrigger>
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
          <div>
            <Label>Expected date</Label>
            <Input
              type="date"
              value={form.expected_harvest_date}
              onChange={(e) => setForm({ ...form, expected_harvest_date: e.target.value })}
            />
          </div>
          <div>
            <Label>Actual date</Label>
            <Input
              type="date"
              value={form.actual_harvest_date}
              onChange={(e) => setForm({ ...form, actual_harvest_date: e.target.value })}
            />
          </div>
          <div>
            <Label>Expected qty</Label>
            <Input
              type="number"
              step="0.01"
              value={form.expected_quantity}
              onChange={(e) => setForm({ ...form, expected_quantity: e.target.value as any })}
            />
          </div>
          <div>
            <Label>Actual qty</Label>
            <Input
              type="number"
              step="0.01"
              value={form.actual_quantity}
              onChange={(e) => setForm({ ...form, actual_quantity: e.target.value as any })}
            />
          </div>
          <div>
            <Label>Unit</Label>
            <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
          </div>
          <div>
            <Label>Buyer</Label>
            <Input
              value={form.buyer}
              onChange={(e) => setForm({ ...form, buyer: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Storage location</Label>
            <Input
              value={form.storage_location}
              onChange={(e) => setForm({ ...form, storage_location: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Notes</Label>
            <Textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => m.mutate()} disabled={!form.crop.trim() || m.isPending}>
            {m.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function HarvestPlanner({ items, farmId }: { items: HarvestRow[]; farmId: string }) {
  const qc = useQueryClient();
  const del = useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteFarmHarvest({ data: { id } });
      if (!res.success) throw new Error(res.error);
    },
    onSuccess: () => {
      toast.success("Removed");
      qc.invalidateQueries({ queryKey: ["harvest"] });
      qc.invalidateQueries({ queryKey: ["farmos-overview"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Sprout}
        title="No harvest plans yet"
        description="Plan a harvest by recording the crop, expected date, and target quantity."
        action={<HarvestForm farmId={farmId} />}
      />
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {items.map((h) => (
        <div key={h.id} className="surface-card p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold">{h.crop}</h3>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" /> Expected: {h.expected_harvest_date ?? "—"}
              </p>
              {h.actual_harvest_date && (
                <p className="text-xs text-muted-foreground">Actual: {h.actual_harvest_date}</p>
              )}
            </div>
            <Badge className={`text-[10px] capitalize ${statusTone(h.status)}`} variant="outline">
              {h.status.replace("_", " ")}
            </Badge>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div>
              <dt className="text-muted-foreground">Expected</dt>
              <dd>
                {h.expected_quantity != null
                  ? `${Number(h.expected_quantity)} ${h.unit ?? ""}`
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Actual</dt>
              <dd>
                {h.actual_quantity != null ? `${Number(h.actual_quantity)} ${h.unit ?? ""}` : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Storage</dt>
              <dd className="truncate">{h.storage_location ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Buyer</dt>
              <dd className="truncate">{h.buyer ?? "—"}</dd>
            </div>
          </dl>
          <div className="mt-3 flex justify-end gap-1">
            <HarvestForm
              farmId={farmId}
              initial={h}
              trigger={
                <Button size="icon" variant="ghost" aria-label="Edit harvest record">
                  <Pencil className="h-4 w-4" />
                </Button>
              }
            />
            <Button
              size="icon"
              variant="ghost"
              aria-label="Delete harvest record"
              onClick={() => del.mutate(h.id)}
              disabled={del.isPending}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
