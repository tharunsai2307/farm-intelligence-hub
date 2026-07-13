import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  OnboardingShell,
  ONBOARDING_STEPS,
  FormSection,
} from "@/components/onboarding/onboarding-shell";
import { updateMyProfile } from "@/lib/services/profile.functions";
import { createFarm } from "@/lib/services/farms.functions";

const FARM_TYPES = [
  { value: "open_field", label: "Open Field" },
  { value: "greenhouse", label: "Greenhouse" },
  { value: "hydroponic", label: "Hydroponic" },
  { value: "mixed", label: "Mixed" },
] as const;

const SOIL_TYPES = [
  "Red Soil",
  "Black Soil",
  "Alluvial Soil",
  "Sandy Soil",
  "Clay Soil",
  "Loamy Soil",
  "Unknown",
] as const;

const IRRIGATION_TYPES = ["Drip", "Sprinkler", "Flood", "Manual", "Rainfed", "Unknown"] as const;

const WATER_SOURCES = [
  "Borewell",
  "Canal",
  "River",
  "Tank",
  "Rainwater",
  "Mixed",
  "Unknown",
] as const;

const SEASONS = ["Kharif", "Rabi", "Zaid", "Year-round"] as const;

const optionalNum = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
  z.number().optional(),
) as unknown as z.ZodType<number | undefined>;

const schema = z.object({
  name: z.string().trim().min(2, "Required").max(120),
  owner_name: z.string().trim().min(2, "Required").max(120),
  area: z.coerce.number().positive("Enter a positive number"),
  area_unit: z.enum(["hectares", "acres"]),
  farm_type: z.enum(["open_field", "greenhouse", "hydroponic", "mixed"]),

  country: z.string().trim().min(2, "Required").max(80),
  state: z.string().trim().min(2, "Required").max(80),
  district: z.string().trim().min(2, "Required").max(80),
  village: z.string().trim().min(1, "Required").max(120),
  pincode: z.string().trim().min(3, "Required").max(20),
  latitude: optionalNum,
  longitude: optionalNum,

  primary_crop: z.string().trim().min(2, "Required").max(80),
  crop_variety: z.string().trim().max(80).optional(),
  sowing_date: z.string().optional(),
  expected_harvest: z.string().optional(),
  farming_season: z.string().optional(),

  soil_type: z.string(),
  irrigation_type: z.string(),
  water_source: z.string(),

  has_soil_sensors: z.boolean(),
  has_weather_station: z.boolean(),
  wants_api_connection: z.boolean(),
});

type Values = z.infer<typeof schema>;

export const Route = createFileRoute("/_authenticated/onboarding/farm")({
  head: () => ({ meta: [{ title: "Add your first farm — AgriTwin OS" }] }),
  component: FarmOnboarding,
});

function FarmOnboarding() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      owner_name: "",
      area: undefined as unknown as number,
      area_unit: "hectares",
      farm_type: "open_field",
      country: "India",
      state: "",
      district: "",
      village: "",
      pincode: "",
      latitude: undefined,
      longitude: undefined,
      primary_crop: "",
      crop_variety: "",
      sowing_date: "",
      expected_harvest: "",
      farming_season: "Kharif",
      soil_type: "Unknown",
      irrigation_type: "Unknown",
      water_source: "Unknown",
      has_soil_sensors: false,
      has_weather_station: false,
      wants_api_connection: false,
    },
  });

  const useMyLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        form.setValue("latitude", Number(pos.coords.latitude.toFixed(6)));
        form.setValue("longitude", Number(pos.coords.longitude.toFixed(6)));
        setLocating(false);
        toast.success("Location captured");
      },
      (err) => {
        setLocating(false);
        toast.error(err.message || "Could not get location");
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  const onSubmit = async (values: Values) => {
    setSubmitting(true);
    try {
      const area_hectares = values.area_unit === "acres" ? values.area * 0.404686 : values.area;

      await createFarm({
        data: {
          name: values.name,
          owner_name: values.owner_name,
          area_hectares,
          area_unit: values.area_unit,
          farm_type: values.farm_type,
          country: values.country,
          state: values.state,
          district: values.district,
          village: values.village,
          pincode: values.pincode,
          latitude: values.latitude ?? null,
          longitude: values.longitude ?? null,
          primary_crop: values.primary_crop,
          crop_variety: values.crop_variety || null,
          sowing_date: values.sowing_date || null,
          planting_date: values.sowing_date || null,
          expected_harvest: values.expected_harvest || null,
          farming_season: values.farming_season || null,
          soil_type: values.soil_type,
          irrigation_type: values.irrigation_type,
          water_source: values.water_source,
          has_soil_sensors: values.has_soil_sensors,
          has_weather_station: values.has_weather_station,
          wants_api_connection: values.wants_api_connection,
        },
      });

      await updateMyProfile({ data: { onboarded: true } });
      qc.invalidateQueries();

      toast.success("Farm created — welcome to AgriTwin OS");
      navigate({ to: "/app/dashboard", replace: true });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <OnboardingShell
      title="Add your first farm"
      subtitle="Real details only. Anything you don't know, leave as Unknown — never a guess."
      steps={ONBOARDING_STEPS}
      current="farm"
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
        <FormSection title="Basic details">
          <Field label="Farm name" error={form.formState.errors.name?.message}>
            <Input {...form.register("name")} />
          </Field>
          <Field label="Farm owner" error={form.formState.errors.owner_name?.message}>
            <Input {...form.register("owner_name")} />
          </Field>
          <Field label="Farm size" error={form.formState.errors.area?.message}>
            <Input type="number" step="0.01" {...form.register("area")} />
          </Field>
          <Field label="Unit">
            <SelectInput
              value={form.watch("area_unit")}
              onChange={(v) => form.setValue("area_unit", v as Values["area_unit"])}
              options={[
                { value: "hectares", label: "Hectares" },
                { value: "acres", label: "Acres" },
              ]}
            />
          </Field>
          <Field label="Farm type">
            <SelectInput
              value={form.watch("farm_type")}
              onChange={(v) => form.setValue("farm_type", v as Values["farm_type"])}
              options={FARM_TYPES.map((t) => ({ value: t.value, label: t.label }))}
            />
          </Field>
        </FormSection>

        <FormSection
          title="Location"
          description="We use location to fetch weather and satellite data later."
        >
          <Field label="Country" error={form.formState.errors.country?.message}>
            <Input {...form.register("country")} />
          </Field>
          <Field label="State" error={form.formState.errors.state?.message}>
            <Input {...form.register("state")} />
          </Field>
          <Field label="District" error={form.formState.errors.district?.message}>
            <Input {...form.register("district")} />
          </Field>
          <Field label="Village / Town" error={form.formState.errors.village?.message}>
            <Input {...form.register("village")} />
          </Field>
          <Field label="Pincode" error={form.formState.errors.pincode?.message}>
            <Input {...form.register("pincode")} />
          </Field>
          <div className="sm:col-span-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={useMyLocation}
              disabled={locating}
            >
              {locating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <MapPin className="mr-2 h-4 w-4" />
              )}
              Use my current location
            </Button>
          </div>
          <Field label="Latitude">
            <Input type="number" step="0.000001" {...form.register("latitude")} />
          </Field>
          <Field label="Longitude">
            <Input type="number" step="0.000001" {...form.register("longitude")} />
          </Field>
        </FormSection>

        <FormSection title="Crop">
          <Field label="Primary crop" error={form.formState.errors.primary_crop?.message}>
            <Input placeholder="e.g. Paddy, Tomato, Cotton" {...form.register("primary_crop")} />
          </Field>
          <Field label="Crop variety (optional)">
            <Input {...form.register("crop_variety")} />
          </Field>
          <Field label="Sowing date">
            <Input type="date" {...form.register("sowing_date")} />
          </Field>
          <Field label="Expected harvest">
            <Input type="date" {...form.register("expected_harvest")} />
          </Field>
          <Field label="Farming season">
            <SelectInput
              value={form.watch("farming_season") ?? "Kharif"}
              onChange={(v) => form.setValue("farming_season", v)}
              options={SEASONS.map((s) => ({ value: s, label: s }))}
            />
          </Field>
        </FormSection>

        <FormSection title="Soil & water">
          <Field label="Soil type">
            <SelectInput
              value={form.watch("soil_type")}
              onChange={(v) => form.setValue("soil_type", v)}
              options={SOIL_TYPES.map((s) => ({ value: s, label: s }))}
            />
          </Field>
          <Field label="Irrigation type">
            <SelectInput
              value={form.watch("irrigation_type")}
              onChange={(v) => form.setValue("irrigation_type", v)}
              options={IRRIGATION_TYPES.map((s) => ({ value: s, label: s }))}
            />
          </Field>
          <Field label="Water source">
            <SelectInput
              value={form.watch("water_source")}
              onChange={(v) => form.setValue("water_source", v)}
              options={WATER_SOURCES.map((s) => ({ value: s, label: s }))}
            />
          </Field>
        </FormSection>

        <FormSection
          title="Data sources"
          description="No data is generated. We only show what you connect."
        >
          <ToggleRow
            label="I have soil moisture sensors"
            checked={form.watch("has_soil_sensors")}
            onChange={(c) => form.setValue("has_soil_sensors", c)}
          />
          <ToggleRow
            label="I have weather station data"
            checked={form.watch("has_weather_station")}
            onChange={(c) => form.setValue("has_weather_station", c)}
          />
          <ToggleRow
            label="I'd like to connect APIs later"
            checked={form.watch("wants_api_connection")}
            onChange={(c) => form.setValue("wants_api_connection", c)}
          />
        </FormSection>

        <div className="flex items-center justify-between border-t pt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate({ to: "/onboarding/profile" })}
          >
            Back
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create farm
          </Button>
        </div>
      </form>
    </OnboardingShell>
  );
}

/* ---------- helpers ---------- */
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
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: ReadonlyArray<{ value: string; label: string }>;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border bg-card p-4 sm:col-span-2">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
