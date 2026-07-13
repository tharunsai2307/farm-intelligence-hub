import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Droplets, Plus, Trash2 } from "lucide-react";
import { z } from "zod";

import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FarmSelector, useFarms } from "@/components/farmos/farm-selector";
import {
  createIrrigationRecord,
  deleteIrrigationRecord,
  listIrrigationRecords,
} from "@/lib/services/records.functions";

export const Route = createFileRoute("/_authenticated/app/irrigation")({
  head: () => ({
    meta: [
      { title: "Irrigation Records — AgriTwin OS" },
      {
        name: "description",
        content: "Log every irrigation event by source, method, volume, and duration.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: IrrigationPage,
});

const METHODS = ["drip", "sprinkler", "flood", "furrow", "manual", "pivot"];

function IrrigationPage() {
  const farmsQ = useFarms();
  const [farmId, setFarmId] = useState<string | undefined>();
  const activeFarmId = farmId ?? farmsQ.data?.items[0]?.id;

  const listFn = useServerFn(listIrrigationRecords);
  const q = useQuery({
    queryKey: ["irrigation", activeFarmId ?? "all"],
    queryFn: () => listFn({ data: { farm_id: activeFarmId } }),
    enabled: !!activeFarmId,
  });

  const totals = useMemo(() => {
    const items = q.data?.items ?? [];
    const last30 = items.filter(
      (r) => new Date(r.started_at) >= new Date(Date.now() - 30 * 86400_000),
    );
    return {
      events: items.length,
      last30Events: last30.length,
      last30Liters: last30.reduce((s, r) => s + (r.volume_liters ?? 0), 0),
    };
  }, [q.data]);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      <PageHeader
        title="Irrigation Records"
        description="Log every irrigation event by source, method, and volume."
        actions={
          <div className="flex items-center gap-2">
            <FarmSelector value={activeFarmId} onChange={setFarmId} />
            <NewRecordDialog farmId={activeFarmId} />
          </div>
        }
      />

      {!activeFarmId ? (
        <EmptyState
          icon={Droplets}
          title="Add a farm to log irrigation"
          description="Create a farm first to start tracking."
        />
      ) : (
        <div className="grid gap-6">
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Total events" value={totals.events.toString()} />
            <Stat label="Last 30 days" value={totals.last30Events.toString()} />
            <Stat
              label="Water used (30d)"
              value={`${Math.round(totals.last30Liters).toLocaleString()} L`}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent events</CardTitle>
            </CardHeader>
            <CardContent>
              {q.isLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : !q.data?.items.length ? (
                <p className="text-sm text-muted-foreground">No irrigation events logged yet.</p>
              ) : (
                <ul className="divide-y">
                  {q.data.items.map((r) => (
                    <RecordRow key={r.id} row={r} />
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-card/50 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

type IrrigationRow = {
  id: string;
  started_at: string;
  method: string | null;
  volume_liters: number | null;
  duration_minutes: number | null;
  notes: string | null;
};

function RecordRow({ row }: { row: IrrigationRow }) {
  const qc = useQueryClient();
  const delFn = useServerFn(deleteIrrigationRecord);
  const del = useMutation({
    mutationFn: () => delFn({ data: { id: row.id } }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["irrigation"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });
  return (
    <li className="flex items-center gap-3 py-3">
      <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary">
        <Droplets className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium capitalize">{row.method ?? "irrigation"}</span>
          {row.volume_liters != null && (
            <span className="text-sm text-muted-foreground">· {row.volume_liters} L</span>
          )}
          {row.duration_minutes != null && (
            <span className="text-sm text-muted-foreground">· {row.duration_minutes} min</span>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          {new Date(row.started_at).toLocaleString()}
          {row.notes ? ` — ${row.notes}` : ""}
        </div>
      </div>
      <Button
        size="icon"
        variant="ghost"
        aria-label="Delete record"
        onClick={() => del.mutate()}
        disabled={del.isPending}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </li>
  );
}

const formSchema = z.object({
  started_at: z.string().min(1),
  method: z.string().min(1),
  volume_liters: z.string().optional(),
  duration_minutes: z.string().optional(),
  notes: z.string().optional(),
});

function NewRecordDialog({ farmId }: { farmId: string | undefined }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    started_at: new Date().toISOString().slice(0, 16),
    method: "drip",
    volume_liters: "",
    duration_minutes: "",
    notes: "",
  });
  const qc = useQueryClient();
  const createFn = useServerFn(createIrrigationRecord);
  const create = useMutation({
    mutationFn: async () => {
      if (!farmId) throw new Error("Select a farm first");
      const parsed = formSchema.parse(form);
      return createFn({
        data: {
          farm_id: farmId,
          started_at: new Date(parsed.started_at).toISOString(),
          method: parsed.method,
          volume_liters: parsed.volume_liters ? Number(parsed.volume_liters) : null,
          duration_minutes: parsed.duration_minutes ? Number(parsed.duration_minutes) : null,
          notes: parsed.notes || null,
        },
      });
    },
    onSuccess: () => {
      toast.success("Irrigation event logged");
      qc.invalidateQueries({ queryKey: ["irrigation"] });
      setOpen(false);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={!farmId}>
          <Plus className="mr-2 h-4 w-4" /> Log event
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log irrigation event</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="when">When</Label>
            <Input
              id="when"
              type="datetime-local"
              value={form.started_at}
              onChange={(e) => setForm({ ...form, started_at: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="method">Method</Label>
            <Select value={form.method} onValueChange={(v) => setForm({ ...form, method: v })}>
              <SelectTrigger id="method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METHODS.map((m) => (
                  <SelectItem key={m} value={m} className="capitalize">
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="vol">Volume (L)</Label>
              <Input
                id="vol"
                inputMode="decimal"
                value={form.volume_liters}
                onChange={(e) => setForm({ ...form, volume_liters: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="dur">Duration (min)</Label>
              <Input
                id="dur"
                inputMode="decimal"
                value={form.duration_minutes}
                onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => create.mutate()} disabled={create.isPending}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
