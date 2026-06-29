import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ShoppingBag, Plus, MapPin, Package, CheckCircle2, XCircle, Search } from "lucide-react";
import { z } from "zod";

import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FarmSelector, useFarms } from "@/components/farmos/farm-selector";
import {
  browseListings,
  createListing,
  listMyListings,
  updateListingStatus,
  type MarketplaceListingRow,
} from "@/lib/services/marketplace.functions";

export const Route = createFileRoute("/_authenticated/app/marketplace")({
  head: () => ({
    meta: [
      { title: "Marketplace — AgriTwin OS" },
      { name: "description", content: "List your produce and discover what other farmers are selling. Direct, no middlemen, no payment processing." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: MarketplacePage,
});

function MarketplacePage() {
  const farmsQ = useFarms();
  const [farmId, setFarmId] = useState<string | undefined>();
  const activeFarmId = farmId ?? farmsQ.data?.items[0]?.id;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      <PageHeader
        title="Marketplace"
        description="List produce for buyers, browse listings from other farmers. Inquiries only — no payments."
        actions={
          <div className="flex items-center gap-2">
            <FarmSelector value={activeFarmId} onChange={setFarmId} />
            <NewListingDialog farmId={activeFarmId} />
          </div>
        }
      />

      <Tabs defaultValue="browse">
        <TabsList>
          <TabsTrigger value="browse"><Search className="mr-2 h-4 w-4" />Browse</TabsTrigger>
          <TabsTrigger value="mine"><Package className="mr-2 h-4 w-4" />My listings</TabsTrigger>
        </TabsList>
        <TabsContent value="browse" className="mt-4"><BrowseTab /></TabsContent>
        <TabsContent value="mine" className="mt-4"><MineTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function BrowseTab() {
  const [commodity, setCommodity] = useState("");
  const [state, setState] = useState("");
  const fn = useServerFn(browseListings);
  const q = useQuery({
    queryKey: ["marketplace", "browse", commodity, state],
    queryFn: () => fn({ data: { commodity: commodity || undefined, state: state || undefined } }),
  });

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-2 sm:max-w-md">
        <Input placeholder="Commodity (e.g. tomato)" value={commodity} onChange={(e) => setCommodity(e.target.value)} />
        <Input placeholder="State" value={state} onChange={(e) => setState(e.target.value)} />
      </div>
      {q.isLoading ? <Skeleton className="h-40 w-full" /> :
        !q.data?.items.length ? (
          <EmptyState icon={ShoppingBag} title="No active listings" description="Try clearing filters, or check back later as farmers list new produce." />
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {q.data.items.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}
    </div>
  );
}

function MineTab() {
  const fn = useServerFn(listMyListings);
  const q = useQuery({ queryKey: ["marketplace", "mine"], queryFn: () => fn() });
  if (q.isLoading) return <Skeleton className="h-40 w-full" />;
  if (!q.data?.items.length) {
    return <EmptyState icon={Package} title="No listings yet" description='Click "New listing" to publish produce for sale.' />;
  }
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
      {q.data.items.map((l) => <ListingCard key={l.id} listing={l} mine />)}
    </div>
  );
}

function ListingCard({ listing, mine }: { listing: MarketplaceListingRow; mine?: boolean }) {
  const qc = useQueryClient();
  const updFn = useServerFn(updateListingStatus);
  const upd = useMutation({
    mutationFn: (status: "sold" | "withdrawn" | "active") => updFn({ data: { id: listing.id, status } }),
    onSuccess: () => {
      toast.success("Updated");
      qc.invalidateQueries({ queryKey: ["marketplace"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });
  const statusTone: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    active: "default", sold: "secondary", withdrawn: "outline", draft: "outline",
  };
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate font-semibold">{listing.title}</div>
            <div className="text-xs text-muted-foreground capitalize">{listing.commodity}{listing.variety ? ` · ${listing.variety}` : ""}{listing.grade ? ` · Grade ${listing.grade}` : ""}</div>
          </div>
          <Badge variant={statusTone[listing.status] ?? "outline"} className="capitalize">{listing.status}</Badge>
        </div>
        <div className="text-2xl font-bold tabular-nums">
          {listing.currency} {listing.price_per_unit}
          <span className="text-sm font-normal text-muted-foreground">/{listing.unit}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span><Package className="mr-1 inline h-3 w-3" />{listing.quantity} {listing.unit}</span>
          {(listing.pickup_district || listing.pickup_state) && (
            <span><MapPin className="mr-1 inline h-3 w-3" />{[listing.pickup_district, listing.pickup_state].filter(Boolean).join(", ")}</span>
          )}
        </div>
        {listing.description && <p className="line-clamp-2 text-sm text-muted-foreground">{listing.description}</p>}
        {mine && listing.status === "active" && (
          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="outline" onClick={() => upd.mutate("sold")} disabled={upd.isPending}>
              <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Mark sold
            </Button>
            <Button size="sm" variant="ghost" onClick={() => upd.mutate("withdrawn")} disabled={upd.isPending}>
              <XCircle className="mr-1 h-3.5 w-3.5" /> Withdraw
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const listingSchema = z.object({
  title: z.string().trim().min(3),
  commodity: z.string().trim().min(2),
  quantity: z.string().min(1),
  unit: z.string().min(1),
  price_per_unit: z.string().min(1),
  variety: z.string().optional(),
  grade: z.string().optional(),
  description: z.string().optional(),
  pickup_district: z.string().optional(),
  pickup_state: z.string().optional(),
});

function NewListingDialog({ farmId }: { farmId: string | undefined }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "", commodity: "", quantity: "", unit: "kg", price_per_unit: "",
    variety: "", grade: "", description: "", pickup_district: "", pickup_state: "",
  });
  const qc = useQueryClient();
  const fn = useServerFn(createListing);
  const create = useMutation({
    mutationFn: async () => {
      if (!farmId) throw new Error("Select a farm first");
      const p = listingSchema.parse(form);
      return fn({
        data: {
          farm_id: farmId,
          title: p.title,
          commodity: p.commodity,
          variety: p.variety || null,
          grade: p.grade || null,
          description: p.description || null,
          quantity: Number(p.quantity),
          unit: p.unit,
          price_per_unit: Number(p.price_per_unit),
          currency: "INR",
          pickup_district: p.pickup_district || null,
          pickup_state: p.pickup_state || null,
        },
      });
    },
    onSuccess: () => {
      toast.success("Listing published");
      qc.invalidateQueries({ queryKey: ["marketplace"] });
      setOpen(false);
      setForm({ title: "", commodity: "", quantity: "", unit: "kg", price_per_unit: "", variety: "", grade: "", description: "", pickup_district: "", pickup_state: "" });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={!farmId}><Plus className="mr-2 h-4 w-4" /> New listing</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Publish a listing</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <Field label="Title"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Premium Alphonso mangoes" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Commodity"><Input value={form.commodity} onChange={(e) => setForm({ ...form, commodity: e.target.value })} placeholder="e.g. mango" /></Field>
            <Field label="Variety"><Input value={form.variety} onChange={(e) => setForm({ ...form, variety: e.target.value })} placeholder="Optional" /></Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Quantity"><Input inputMode="decimal" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></Field>
            <Field label="Unit"><Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></Field>
            <Field label="Price / unit"><Input inputMode="decimal" value={form.price_per_unit} onChange={(e) => setForm({ ...form, price_per_unit: e.target.value })} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="District"><Input value={form.pickup_district} onChange={(e) => setForm({ ...form, pickup_district: e.target.value })} /></Field>
            <Field label="State"><Input value={form.pickup_state} onChange={(e) => setForm({ ...form, pickup_state: e.target.value })} /></Field>
          </div>
          <Field label="Description"><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => create.mutate()} disabled={create.isPending}>Publish</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
