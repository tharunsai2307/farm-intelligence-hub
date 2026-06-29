import { useState, type ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, AlertTriangle, PackageX, Clock, Boxes } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/common/empty-state";
import { saveInventoryItem, deleteInventoryItem } from "@/lib/services/farmos.service";
import type { InventoryRow, InventoryWithAlerts, InventoryAlertKind } from "@/lib/services/farmos.server";

const CATEGORIES = ["seeds", "fertilizers", "pesticides", "organic_inputs", "tools", "spare_parts", "storage_materials", "other"] as const;

function alertLabel(a: InventoryAlertKind): { label: string; icon: ReactNode; tone: string } {
  switch (a) {
    case "out_of_stock": return { label: "Out of stock", icon: <PackageX className="h-3 w-3" />, tone: "bg-destructive/15 text-destructive" };
    case "expired": return { label: "Expired", icon: <AlertTriangle className="h-3 w-3" />, tone: "bg-destructive/15 text-destructive" };
    case "low_stock": return { label: "Low stock", icon: <AlertTriangle className="h-3 w-3" />, tone: "bg-amber-500/15 text-amber-700 dark:text-amber-400" };
    case "expiring_soon": return { label: "Expiring soon", icon: <Clock className="h-3 w-3" />, tone: "bg-amber-500/15 text-amber-700 dark:text-amber-400" };
  }
}

export function InventoryForm({
  farmId,
  initial,
  trigger,
  onSaved,
}: {
  farmId: string;
  initial?: InventoryRow;
  trigger?: ReactNode;
  onSaved?: () => void;
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    category: (initial?.category ?? "seeds") as (typeof CATEGORIES)[number],
    quantity: initial?.quantity ?? 0,
    unit: initial?.unit ?? "kg",
    supplier: initial?.supplier ?? "",
    purchase_date: initial?.purchase_date ?? "",
    expiry_date: initial?.expiry_date ?? "",
    cost: initial?.cost ?? "",
    storage_location: initial?.storage_location ?? "",
    min_stock_level: initial?.min_stock_level ?? "",
    notes: initial?.notes ?? "",
  });

  const m = useMutation({
    mutationFn: async () => {
      const payload: any = {
        ...(initial?.id ? { id: initial.id } : {}),
        farm_id: farmId,
        name: form.name.trim(),
        category: form.category,
        quantity: Number(form.quantity) || 0,
        unit: form.unit.trim() || "unit",
        supplier: form.supplier.trim() || null,
        purchase_date: form.purchase_date || null,
        expiry_date: form.expiry_date || null,
        cost: form.cost === "" ? null : Number(form.cost),
        storage_location: form.storage_location.trim() || null,
        min_stock_level: form.min_stock_level === "" ? null : Number(form.min_stock_level),
        notes: form.notes.trim() || null,
      };
      const res = await saveInventoryItem({ data: payload });
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      toast.success(initial ? "Item updated" : "Item added");
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({ queryKey: ["farmos-overview"] });
      setOpen(false);
      onSaved?.();
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to save"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" /> Add item
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit inventory item" : "Add inventory item"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Item name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as any })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c.replace("_", " ")}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Storage location</Label>
            <Input value={form.storage_location} onChange={(e) => setForm({ ...form, storage_location: e.target.value })} />
          </div>
          <div>
            <Label>Quantity</Label>
            <Input type="number" step="0.01" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
          </div>
          <div>
            <Label>Unit</Label>
            <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="kg, l, bag" />
          </div>
          <div>
            <Label>Min stock level</Label>
            <Input type="number" step="0.01" value={form.min_stock_level} onChange={(e) => setForm({ ...form, min_stock_level: e.target.value as any })} />
          </div>
          <div>
            <Label>Cost</Label>
            <Input type="number" step="0.01" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value as any })} />
          </div>
          <div>
            <Label>Supplier</Label>
            <Input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} />
          </div>
          <div>
            <Label>Purchase date</Label>
            <Input type="date" value={form.purchase_date} onChange={(e) => setForm({ ...form, purchase_date: e.target.value })} />
          </div>
          <div>
            <Label>Expiry date</Label>
            <Input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Label>Notes</Label>
            <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => m.mutate()} disabled={!form.name.trim() || m.isPending}>
            {m.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function InventoryTable({
  items,
  farmId,
}: {
  items: InventoryWithAlerts[];
  farmId: string;
}) {
  const qc = useQueryClient();
  const del = useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteInventoryItem({ data: { id } });
      if (!res.success) throw new Error(res.error);
    },
    onSuccess: () => {
      toast.success("Item removed");
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({ queryKey: ["farmos-overview"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Boxes}
        title="No inventory yet"
        description="Add seeds, fertilisers, tools, or spare parts to start tracking stock."
        action={<InventoryForm farmId={farmId} />}
      />
    );
  }

  return (
    <div className="surface-card overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Expiry</TableHead>
            <TableHead>Alerts</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((i) => (
            <TableRow key={i.id}>
              <TableCell className="font-medium">{i.name}</TableCell>
              <TableCell className="capitalize text-muted-foreground">{i.category.replace("_", " ")}</TableCell>
              <TableCell>
                {Number(i.quantity)} {i.unit}
                {i.min_stock_level ? (
                  <span className="ml-1 text-xs text-muted-foreground">/ min {Number(i.min_stock_level)}</span>
                ) : null}
              </TableCell>
              <TableCell className="text-muted-foreground">{i.storage_location ?? "—"}</TableCell>
              <TableCell className="text-muted-foreground">{i.expiry_date ?? "—"}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {i.alerts.length === 0 ? (
                    <Badge variant="outline" className="text-[10px]">OK</Badge>
                  ) : (
                    i.alerts.map((a) => {
                      const v = alertLabel(a);
                      return (
                        <span key={a} className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] ${v.tone}`}>
                          {v.icon} {v.label}
                        </span>
                      );
                    })
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <InventoryForm
                    farmId={farmId}
                    initial={i}
                    trigger={<Button size="icon" variant="ghost" aria-label="Edit inventory item"><Pencil className="h-4 w-4" /></Button>}
                  />
                  <Button size="icon" variant="ghost" aria-label="Delete inventory item" onClick={() => del.mutate(i.id)} disabled={del.isPending}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
