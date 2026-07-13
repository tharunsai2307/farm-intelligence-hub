import { useState, type ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Wrench } from "lucide-react";
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
import { saveEquipmentItem, deleteEquipmentItem } from "@/lib/services/farmos.service";
import type { EquipmentRow } from "@/lib/services/farmos.server";

const TYPES = [
  "tractor",
  "pump_set",
  "drip_system",
  "sprayer",
  "harvest_machine",
  "sensor",
  "other",
] as const;
const STATUSES = ["operational", "maintenance_due", "out_of_service"] as const;

function statusTone(s: EquipmentRow["status"]) {
  if (s === "operational") return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400";
  if (s === "maintenance_due") return "bg-amber-500/15 text-amber-700 dark:text-amber-400";
  return "bg-destructive/15 text-destructive";
}

export function EquipmentForm({
  farmId,
  initial,
  trigger,
}: {
  farmId: string;
  initial?: EquipmentRow;
  trigger?: ReactNode;
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    type: (initial?.type ?? "tractor") as (typeof TYPES)[number],
    manufacturer: initial?.manufacturer ?? "",
    purchase_date: initial?.purchase_date ?? "",
    status: (initial?.status ?? "operational") as (typeof STATUSES)[number],
    last_maintenance_date: initial?.last_maintenance_date ?? "",
    next_maintenance_date: initial?.next_maintenance_date ?? "",
    operating_hours: initial?.operating_hours ?? "",
    serial_number: initial?.serial_number ?? "",
    notes: initial?.notes ?? "",
  });

  const m = useMutation({
    mutationFn: async () => {
      const payload: any = {
        ...(initial?.id ? { id: initial.id } : {}),
        farm_id: farmId,
        name: form.name.trim(),
        type: form.type,
        manufacturer: form.manufacturer.trim() || null,
        purchase_date: form.purchase_date || null,
        status: form.status,
        last_maintenance_date: form.last_maintenance_date || null,
        next_maintenance_date: form.next_maintenance_date || null,
        operating_hours: form.operating_hours === "" ? null : Number(form.operating_hours),
        serial_number: form.serial_number.trim() || null,
        notes: form.notes.trim() || null,
      };
      const res = await saveEquipmentItem({ data: payload });
      if (!res.success) throw new Error(res.error);
    },
    onSuccess: () => {
      toast.success(initial ? "Equipment updated" : "Equipment added");
      qc.invalidateQueries({ queryKey: ["equipment"] });
      qc.invalidateQueries({ queryKey: ["farmos-overview"] });
      setOpen(false);
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" /> Add equipment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit equipment" : "Add equipment"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>Type</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Label>Manufacturer</Label>
            <Input
              value={form.manufacturer}
              onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
            />
          </div>
          <div>
            <Label>Serial number</Label>
            <Input
              value={form.serial_number}
              onChange={(e) => setForm({ ...form, serial_number: e.target.value })}
            />
          </div>
          <div>
            <Label>Purchase date</Label>
            <Input
              type="date"
              value={form.purchase_date}
              onChange={(e) => setForm({ ...form, purchase_date: e.target.value })}
            />
          </div>
          <div>
            <Label>Operating hours</Label>
            <Input
              type="number"
              step="0.1"
              value={form.operating_hours}
              onChange={(e) => setForm({ ...form, operating_hours: e.target.value as any })}
            />
          </div>
          <div>
            <Label>Last maintenance</Label>
            <Input
              type="date"
              value={form.last_maintenance_date}
              onChange={(e) => setForm({ ...form, last_maintenance_date: e.target.value })}
            />
          </div>
          <div>
            <Label>Next maintenance</Label>
            <Input
              type="date"
              value={form.next_maintenance_date}
              onChange={(e) => setForm({ ...form, next_maintenance_date: e.target.value })}
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
          <Button onClick={() => m.mutate()} disabled={!form.name.trim() || m.isPending}>
            {m.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function EquipmentCard({ item }: { item: EquipmentRow }) {
  const qc = useQueryClient();
  const del = useMutation({
    mutationFn: async () => {
      const res = await deleteEquipmentItem({ data: { id: item.id } });
      if (!res.success) throw new Error(res.error);
    },
    onSuccess: () => {
      toast.success("Removed");
      qc.invalidateQueries({ queryKey: ["equipment"] });
      qc.invalidateQueries({ queryKey: ["farmos-overview"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  return (
    <div className="surface-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-muted-foreground" />
            <h3 className="truncate text-sm font-semibold">{item.name}</h3>
          </div>
          <p className="mt-1 text-xs capitalize text-muted-foreground">
            {item.type.replace("_", " ")}
            {item.manufacturer ? ` · ${item.manufacturer}` : ""}
          </p>
        </div>
        <Badge className={`text-[10px] ${statusTone(item.status)}`} variant="outline">
          {item.status.replace("_", " ")}
        </Badge>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div>
          <dt className="text-muted-foreground">Hours</dt>
          <dd>{item.operating_hours ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Serial</dt>
          <dd className="truncate">{item.serial_number ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Last service</dt>
          <dd>{item.last_maintenance_date ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Next service</dt>
          <dd>{item.next_maintenance_date ?? "—"}</dd>
        </div>
      </dl>
      <div className="mt-3 flex justify-end gap-1">
        <EquipmentForm
          farmId={item.farm_id}
          initial={item}
          trigger={
            <Button size="icon" variant="ghost" aria-label="Edit equipment">
              <Pencil className="h-4 w-4" />
            </Button>
          }
        />
        <Button
          size="icon"
          variant="ghost"
          aria-label="Delete equipment"
          onClick={() => del.mutate()}
          disabled={del.isPending}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}
