import { useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Clock, AlertTriangle, CheckCircle2, CircleDashed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveFarmTask, deleteFarmTask, listFarmWorkers } from "@/lib/services/farmos.service";
import type { TaskRow, WorkerRow } from "@/lib/services/farmos.server";

const TASK_TYPES = ["irrigation", "spraying", "harvest", "inspection", "fertilizer_application", "maintenance", "manual_work", "other"] as const;
const PRIORITIES = ["low", "medium", "high", "urgent"] as const;
const STATUSES: TaskRow["status"][] = ["pending", "in_progress", "completed", "cancelled"];

function priorityTone(p: TaskRow["priority"]) {
  if (p === "urgent") return "bg-destructive/15 text-destructive";
  if (p === "high") return "bg-amber-500/15 text-amber-700 dark:text-amber-400";
  if (p === "low") return "bg-muted text-muted-foreground";
  return "bg-primary/15 text-primary";
}

function statusIcon(s: TaskRow["status"]) {
  if (s === "completed") return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  if (s === "in_progress") return <Clock className="h-4 w-4 text-blue-500" />;
  if (s === "cancelled") return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
  return <CircleDashed className="h-4 w-4 text-muted-foreground" />;
}

export function TaskForm({
  farmId,
  initial,
  trigger,
  prefill,
}: {
  farmId: string;
  initial?: TaskRow;
  trigger?: ReactNode;
  prefill?: Partial<TaskRow>;
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const workersQ = useQuery({
    queryKey: ["workers", farmId],
    queryFn: () => listFarmWorkers({ data: { farm_id: farmId } }),
    enabled: open,
  });
  const workers: WorkerRow[] = workersQ.data?.success ? workersQ.data.data.items : [];

  const [form, setForm] = useState({
    title: initial?.title ?? prefill?.title ?? "",
    description: initial?.description ?? prefill?.description ?? "",
    task_type: (initial?.task_type ?? prefill?.task_type ?? "manual_work") as (typeof TASK_TYPES)[number],
    priority: (initial?.priority ?? prefill?.priority ?? "medium") as (typeof PRIORITIES)[number],
    due_date: initial?.due_date ?? "",
    status: (initial?.status ?? "pending") as TaskRow["status"],
    progress: initial?.progress ?? 0,
    worker_id: initial?.worker_id ?? "",
    completion_notes: initial?.completion_notes ?? "",
  });

  const m = useMutation({
    mutationFn: async () => {
      const payload: any = {
        ...(initial?.id ? { id: initial.id } : {}),
        farm_id: farmId,
        title: form.title.trim(),
        description: form.description.trim() || null,
        task_type: form.task_type,
        priority: form.priority,
        due_date: form.due_date || null,
        status: form.status,
        progress: form.progress,
        worker_id: form.worker_id || null,
        completion_notes: form.completion_notes.trim() || null,
        ...(prefill?.source_recommendation_id ? { source_recommendation_id: prefill.source_recommendation_id } : {}),
        ...(prefill?.plot_id ? { plot_id: prefill.plot_id } : {}),
      };
      const res = await saveFarmTask({ data: payload });
      if (!res.success) throw new Error(res.error);
    },
    onSuccess: () => {
      toast.success(initial ? "Task updated" : "Task created");
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["farmos-overview"] });
      qc.invalidateQueries({ queryKey: ["calendar"] });
      setOpen(false);
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button size="sm"><Plus className="mr-2 h-4 w-4" /> New task</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle>{initial ? "Edit task" : "Create task"}</DialogTitle></DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="sm:col-span-2"><Label>Description</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div>
            <Label>Type</Label>
            <Select value={form.task_type} onValueChange={(v) => setForm({ ...form, task_type: v as any })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TASK_TYPES.map((t) => <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Priority</Label>
            <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as any })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{PRIORITIES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Due date</Label>
            <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as TaskRow["status"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Assigned worker</Label>
            <Select value={form.worker_id || "unassigned"} onValueChange={(v) => setForm({ ...form, worker_id: v === "unassigned" ? "" : v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {workers.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Progress ({form.progress}%)</Label>
            <Input type="number" min={0} max={100} value={form.progress} onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })} />
          </div>
          {form.status === "completed" && (
            <div className="sm:col-span-2"><Label>Completion notes</Label><Textarea rows={2} value={form.completion_notes} onChange={(e) => setForm({ ...form, completion_notes: e.target.value })} /></div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => m.mutate()} disabled={!form.title.trim() || m.isPending}>{m.isPending ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function TaskBoard({ tasks, farmId }: { tasks: TaskRow[]; farmId: string }) {
  const qc = useQueryClient();
  const del = useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteFarmTask({ data: { id } });
      if (!res.success) throw new Error(res.error);
    },
    onSuccess: () => {
      toast.success("Task removed");
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["farmos-overview"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const cols: { key: TaskRow["status"]; label: string }[] = [
    { key: "pending", label: "Pending" },
    { key: "in_progress", label: "In progress" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cols.map((col) => {
        const items = tasks.filter((t) => t.status === col.key);
        return (
          <div key={col.key} className="surface-card p-3">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">{col.label}</h3>
              <Badge variant="outline" className="text-[10px]">{items.length}</Badge>
            </div>
            <div className="space-y-2">
              {items.length === 0 && <p className="text-xs text-muted-foreground">No tasks.</p>}
              {items.map((t) => (
                <div key={t.id} className="rounded-md border bg-background p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-start gap-2">
                      {statusIcon(t.status)}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{t.title}</p>
                        <p className="text-xs capitalize text-muted-foreground">{t.task_type.replace("_", " ")}{t.due_date ? ` · due ${t.due_date}` : ""}</p>
                      </div>
                    </div>
                    <Badge className={`shrink-0 text-[10px] capitalize ${priorityTone(t.priority)}`} variant="outline">{t.priority}</Badge>
                  </div>
                  {t.progress > 0 && t.status !== "completed" && (
                    <Progress className="mt-2 h-1.5" value={t.progress} />
                  )}
                  <div className="mt-2 flex justify-end gap-1">
                    <TaskForm farmId={farmId} initial={t} trigger={<Button size="icon" variant="ghost" className="h-7 w-7"><Pencil className="h-3.5 w-3.5" /></Button>} />
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => del.mutate(t.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
