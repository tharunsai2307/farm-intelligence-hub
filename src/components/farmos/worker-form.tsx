import { useState, type ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { saveFarmWorker, deleteFarmWorker } from "@/lib/services/farmos.service";
import type { WorkerRow } from "@/lib/services/farmos.server";

export function WorkerForm({
  farmId,
  initial,
  trigger,
}: {
  farmId: string;
  initial?: WorkerRow;
  trigger?: ReactNode;
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    phone: initial?.phone ?? "",
    role: initial?.role ?? "",
    daily_wage: initial?.daily_wage ?? "",
    skills: (initial?.skills ?? []).join(", "),
    available: initial?.available ?? true,
    notes: initial?.notes ?? "",
  });

  const m = useMutation({
    mutationFn: async () => {
      const payload: any = {
        ...(initial?.id ? { id: initial.id } : {}),
        farm_id: farmId,
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        role: form.role.trim() || null,
        daily_wage: form.daily_wage === "" ? null : Number(form.daily_wage),
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        available: form.available,
        notes: form.notes.trim() || null,
      };
      const res = await saveFarmWorker({ data: payload });
      if (!res.success) throw new Error(res.error);
    },
    onSuccess: () => {
      toast.success(initial ? "Worker updated" : "Worker added");
      qc.invalidateQueries({ queryKey: ["workers"] });
      setOpen(false);
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" /> Add worker
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Edit worker" : "Add worker"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div>
            <Label>Role</Label>
            <Input
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="Field hand, driver…"
            />
          </div>
          <div>
            <Label>Daily wage</Label>
            <Input
              type="number"
              step="0.01"
              value={form.daily_wage}
              onChange={(e) => setForm({ ...form, daily_wage: e.target.value as any })}
            />
          </div>
          <div className="flex items-end gap-2">
            <Switch
              checked={form.available}
              onCheckedChange={(v) => setForm({ ...form, available: v })}
            />
            <Label>Available</Label>
          </div>
          <div className="sm:col-span-2">
            <Label>Skills (comma-separated)</Label>
            <Input
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
              placeholder="spraying, harvesting"
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

export function WorkerCard({ worker }: { worker: WorkerRow }) {
  const qc = useQueryClient();
  const del = useMutation({
    mutationFn: async () => {
      const res = await deleteFarmWorker({ data: { id: worker.id } });
      if (!res.success) throw new Error(res.error);
    },
    onSuccess: () => {
      toast.success("Removed");
      qc.invalidateQueries({ queryKey: ["workers"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });
  return (
    <div className="surface-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
            <User className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{worker.name}</h3>
            <p className="text-xs text-muted-foreground">{worker.role ?? "Worker"}</p>
          </div>
        </div>
        <Badge variant={worker.available ? "default" : "outline"} className="text-[10px]">
          {worker.available ? "Available" : "Off"}
        </Badge>
      </div>
      <dl className="mt-3 space-y-1 text-xs">
        {worker.phone && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-3 w-3" /> {worker.phone}
          </div>
        )}
        {worker.daily_wage != null && (
          <div>
            <span className="text-muted-foreground">Wage:</span> ₹
            {Number(worker.daily_wage).toFixed(2)} / day
          </div>
        )}
        {(worker.skills ?? []).length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {worker.skills!.map((s) => (
              <Badge key={s} variant="outline" className="text-[10px]">
                {s}
              </Badge>
            ))}
          </div>
        )}
      </dl>
      <div className="mt-3 flex justify-end gap-1">
        <WorkerForm
          farmId={worker.farm_id}
          initial={worker}
          trigger={
            <Button size="icon" variant="ghost" aria-label="Edit worker">
              <Pencil className="h-4 w-4" />
            </Button>
          }
        />
        <Button
          size="icon"
          variant="ghost"
          aria-label="Delete worker"
          onClick={() => del.mutate()}
          disabled={del.isPending}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}
