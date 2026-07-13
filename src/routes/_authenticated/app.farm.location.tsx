import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { MapPin, Crosshair, Save } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { ErrorState } from "@/components/common/error-state";
import { CardSkeleton } from "@/components/common/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  getFarmLocation,
  getPrimaryFarm,
  updateFarmLocation,
} from "@/lib/services/farms.functions";
import { listFarmPlots } from "@/lib/services/farm-plots.functions";
import { FarmLocationMap, type MapMarker } from "@/components/farm/farm-location-map";

export const Route = createFileRoute("/_authenticated/app/farm/location")({
  head: () => ({
    meta: [
      { title: "Farm Location — AgriTwin OS" },
      {
        name: "description",
        content:
          "Pin your farm's GPS coordinates on a free satellite map and manage plot boundaries for accurate AI insights.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Farm Location — AgriTwin OS" },
      {
        property: "og:description",
        content: "Pin GPS coordinates and manage plot boundaries on a satellite map.",
      },
      { property: "og:url", content: "https://agri-twin-os.lovable.app/app/farm/location" },
    ],
  }),
  component: LocationPage,
});

type Form = { latitude: string; longitude: string; label: string };

function LocationPage() {
  const qc = useQueryClient();
  const farmQ = useQuery({ queryKey: ["primary-farm"], queryFn: () => getPrimaryFarm() });
  const farm = farmQ.data?.farm;

  const locQ = useQuery({
    queryKey: ["farm-location", farm?.id],
    queryFn: () => getFarmLocation({ data: { farm_id: farm!.id } }),
    enabled: !!farm?.id,
  });

  const plotsQ = useQuery({
    queryKey: ["farm-plots", farm?.id],
    queryFn: () => listFarmPlots({ data: { farm_id: farm!.id } }),
    enabled: !!farm?.id,
  });

  const form = useForm<Form>({
    defaultValues: { latitude: "", longitude: "", label: "Primary" },
  });

  useEffect(() => {
    if (locQ.data?.location) {
      form.reset({
        latitude: String(locQ.data.location.latitude),
        longitude: String(locQ.data.location.longitude),
        label: locQ.data.location.label ?? "Primary",
      });
    }
  }, [locQ.data, form]);

  const saveMut = useMutation({
    mutationFn: (v: Form) => {
      const lat = Number(v.latitude);
      const lng = Number(v.longitude);
      if (!Number.isFinite(lat) || lat < -90 || lat > 90) throw new Error("Latitude out of range");
      if (!Number.isFinite(lng) || lng < -180 || lng > 180)
        throw new Error("Longitude out of range");
      return updateFarmLocation({
        data: { farm_id: farm!.id, latitude: lat, longitude: lng, label: v.label || "Primary" },
      });
    },
    onSuccess: () => {
      toast.success("Location saved");
      qc.invalidateQueries({ queryKey: ["farm-location"] });
      qc.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const useCurrent = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        form.setValue("latitude", pos.coords.latitude.toFixed(6));
        form.setValue("longitude", pos.coords.longitude.toFixed(6));
        toast.success("Location captured");
      },
      (err) => toast.error(err.message),
    );
  };

  const lat = Number(form.watch("latitude"));
  const lng = Number(form.watch("longitude"));
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);

  const markers: MapMarker[] = [];
  if (hasCoords)
    markers.push({
      id: "farm",
      latitude: lat,
      longitude: lng,
      label: farm?.name,
      color: "#10b981",
    });
  for (const p of plotsQ.data?.items ?? []) {
    if (p.latitude != null && p.longitude != null) {
      markers.push({
        id: p.id,
        latitude: p.latitude,
        longitude: p.longitude,
        label: p.name,
        color: "#f59e0b",
      });
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Farm Location"
        description="Set the real GPS coordinates of your farm. Tap the satellite map or use your current location — no API key required."
      />

      {farmQ.isLoading && <CardSkeleton />}
      {farmQ.isError && <ErrorState onRetry={() => farmQ.refetch()} />}

      {farm && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <FarmLocationMap
            center={hasCoords ? { latitude: lat, longitude: lng } : null}
            markers={markers}
            onPick={(c) => {
              form.setValue("latitude", c.latitude.toFixed(6));
              form.setValue("longitude", c.longitude.toFixed(6));
            }}
          />

          <form
            className="surface-card flex flex-col gap-4 p-5"
            onSubmit={form.handleSubmit((v) => saveMut.mutate(v))}
          >
            <div className="flex items-center gap-2 text-sm font-semibold">
              <MapPin className="h-4 w-4 text-primary" /> Coordinates
            </div>
            <p className="text-xs text-muted-foreground">
              Tip: click on the map to pick coordinates, or use your device location.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs">Latitude</Label>
                <Input
                  type="number"
                  step="0.000001"
                  {...form.register("latitude")}
                  placeholder="28.6139"
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Longitude</Label>
                <Input
                  type="number"
                  step="0.000001"
                  {...form.register("longitude")}
                  placeholder="77.2090"
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Label</Label>
              <Input {...form.register("label")} placeholder="Primary" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={useCurrent}>
                <Crosshair className="mr-2 h-4 w-4" /> Use my location
              </Button>
              <Button type="submit" disabled={saveMut.isPending || !hasCoords}>
                <Save className="mr-2 h-4 w-4" /> {saveMut.isPending ? "Saving…" : "Save"}
              </Button>
            </div>

            <dl className="mt-2 grid grid-cols-2 gap-2 border-t pt-3 text-xs">
              <div>
                <dt className="text-muted-foreground">Country</dt>
                <dd className="font-medium">{farm.country ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">State</dt>
                <dd className="font-medium">{farm.state ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">District</dt>
                <dd className="font-medium">{farm.district ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Village</dt>
                <dd className="font-medium">{farm.village ?? "—"}</dd>
              </div>
            </dl>
          </form>
        </div>
      )}
    </div>
  );
}
