import { useState, useMemo, type ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Receipt, Upload } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/common/empty-state";
import { supabase } from "@/integrations/supabase/client";
import { saveFarmExpense, deleteFarmExpense } from "@/lib/services/farmos.service";
import type { ExpenseRow } from "@/lib/services/farmos.server";

const CATEGORIES = ["seeds", "labor", "fuel", "water", "electricity", "equipment", "maintenance", "transport", "other"] as const;
const METHODS = ["cash", "bank_transfer", "upi", "card", "credit", "other"] as const;
const COLORS = ["#10b981", "#0ea5e9", "#f59e0b", "#ef4444", "#6366f1", "#a855f7", "#14b8a6", "#f97316", "#84cc16"];

export function ExpenseForm({
  farmId,
  initial,
  trigger,
}: {
  farmId: string;
  initial?: ExpenseRow;
  trigger?: ReactNode;
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    amount: initial?.amount ?? "",
    currency: initial?.currency ?? "INR",
    category: (initial?.category ?? "seeds") as (typeof CATEGORIES)[number],
    description: initial?.description ?? "",
    expense_date: initial?.expense_date ?? new Date().toISOString().slice(0, 10),
    receipt_url: initial?.receipt_url ?? "",
    payment_method: (initial?.payment_method ?? "cash") as (typeof METHODS)[number],
  });

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in");
      const ext = file.name.split(".").pop() ?? "bin";
      const path = `${u.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("farmos-receipts").upload(path, file, { upsert: false });
      if (upErr) throw upErr;
      const { data: signed, error: sErr } = await supabase.storage.from("farmos-receipts").createSignedUrl(path, 60 * 60 * 24 * 365);
      if (sErr) throw sErr;
      setForm((f) => ({ ...f, receipt_url: signed.signedUrl }));
      toast.success("Receipt uploaded");
    } catch (e: any) {
      toast.error(e?.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const m = useMutation({
    mutationFn: async () => {
      const payload: any = {
        ...(initial?.id ? { id: initial.id } : {}),
        farm_id: farmId,
        amount: Number(form.amount),
        currency: form.currency.trim() || "INR",
        category: form.category,
        description: form.description.trim() || null,
        expense_date: form.expense_date,
        receipt_url: form.receipt_url || null,
        payment_method: form.payment_method,
      };
      const res = await saveFarmExpense({ data: payload });
      if (!res.success) throw new Error(res.error);
    },
    onSuccess: () => {
      toast.success(initial ? "Expense updated" : "Expense added");
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["farmos-overview"] });
      setOpen(false);
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Log expense</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle>{initial ? "Edit expense" : "Log expense"}</DialogTitle></DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Amount</Label>
            <Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value as any })} />
          </div>
          <div>
            <Label>Currency</Label>
            <Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
          </div>
          <div>
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as any })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Payment method</Label>
            <Select value={form.payment_method} onValueChange={(v) => setForm({ ...form, payment_method: v as any })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{METHODS.map((c) => <SelectItem key={c} value={c}>{c.replace("_", " ")}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} />
          </div>
          <div>
            <Label>Receipt (optional)</Label>
            <Input type="file" accept="image/*,application/pdf" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} disabled={uploading} />
            {form.receipt_url && (
              <a href={form.receipt_url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-primary underline">View receipt</a>
            )}
          </div>
          <div className="sm:col-span-2">
            <Label>Description</Label>
            <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => m.mutate()} disabled={!form.amount || m.isPending || uploading}>
            {m.isPending ? "Saving…" : uploading ? <><Upload className="mr-2 h-3 w-3 animate-pulse" /> Uploading…</> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ExpenseChart({
  items,
  totals,
  farmId,
}: {
  items: ExpenseRow[];
  totals: { byCategory: Record<string, number>; byMonth: Record<string, number>; grandTotal: number };
  farmId: string;
}) {
  const qc = useQueryClient();
  const del = useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteFarmExpense({ data: { id } });
      if (!res.success) throw new Error(res.error);
    },
    onSuccess: () => {
      toast.success("Expense removed");
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["farmos-overview"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const pieData = useMemo(
    () => Object.entries(totals.byCategory).map(([name, value]) => ({ name, value })),
    [totals.byCategory],
  );
  const monthData = useMemo(
    () => Object.entries(totals.byMonth).sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([m, v]) => ({ m, v })),
    [totals.byMonth],
  );

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="No expenses logged"
        description="Track seeds, labour, fuel, and other inputs to see breakdowns and trends."
        action={<ExpenseForm farmId={farmId} />}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="surface-card p-4">
          <p className="text-xs text-muted-foreground">Total spend</p>
          <p className="mt-1 text-2xl font-semibold">₹{totals.grandTotal.toLocaleString()}</p>
          <p className="mt-1 text-xs text-muted-foreground">{items.length} entries</p>
        </div>
        <div className="surface-card p-4 md:col-span-2">
          <h3 className="text-sm font-semibold">By month</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={monthData} margin={{ top: 10, right: 12, bottom: 0, left: -12 }}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis dataKey="m" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="v" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="surface-card p-4">
          <h3 className="text-sm font-semibold">By category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={70} label={false}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="surface-card overflow-x-auto lg:col-span-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.slice(0, 30).map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="text-xs text-muted-foreground">{e.expense_date}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px] capitalize">{e.category}</Badge></TableCell>
                  <TableCell className="max-w-[260px] truncate">{e.description ?? "—"}</TableCell>
                  <TableCell className="text-right font-medium">{e.currency} {Number(e.amount).toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <ExpenseForm farmId={farmId} initial={e} trigger={<Button size="icon" variant="ghost" className="h-7 w-7"><Pencil className="h-3.5 w-3.5" /></Button>} />
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => del.mutate(e.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
