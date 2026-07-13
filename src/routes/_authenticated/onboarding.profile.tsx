import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { getMyProfile, updateMyProfile } from "@/lib/services/profile.functions";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "ta", label: "Tamil" },
  { value: "te", label: "Telugu" },
  { value: "hi", label: "Hindi" },
  { value: "kn", label: "Kannada" },
  { value: "ml", label: "Malayalam" },
] as const;

const ROLES = [
  { value: "farmer", label: "Farmer" },
  { value: "manager", label: "Farm Manager" },
  { value: "expert", label: "Agriculture Expert" },
  { value: "student", label: "Student / Researcher" },
] as const;

const schema = z.object({
  full_name: z.string().trim().min(2, "Required").max(120),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone")
    .max(20)
    .regex(/^[+\d\s\-()]+$/, "Invalid characters"),
  language: z.enum(["en", "ta", "te", "hi", "kn", "ml"]),
  state: z.string().trim().min(2, "Required").max(80),
  district: z.string().trim().min(2, "Required").max(80),
  user_role: z.enum(["farmer", "manager", "expert", "student"]),
});

type Values = z.infer<typeof schema>;

export const Route = createFileRoute("/_authenticated/onboarding/profile")({
  head: () => ({ meta: [{ title: "Set up your profile — AgriTwin OS" }] }),
  component: ProfileOnboarding,
});

function ProfileOnboarding() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [submitting, setSubmitting] = useState(false);

  const { data } = useQuery({
    queryKey: ["profile", "me"],
    queryFn: () => getMyProfile(),
  });

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    values: {
      full_name: data?.profile?.full_name ?? "",
      phone: data?.profile?.phone ?? "",
      language: (data?.profile?.language as Values["language"]) ?? "en",
      state: data?.profile?.state ?? "",
      district: data?.profile?.district ?? "",
      user_role: (data?.profile?.user_role as Values["user_role"]) ?? "farmer",
    },
  });

  const mutation = useMutation({
    mutationFn: (patch: Values) => updateMyProfile({ data: { ...patch } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });

  const onSubmit = async (values: Values) => {
    setSubmitting(true);
    try {
      await mutation.mutateAsync(values);
      toast.success("Profile saved");
      navigate({ to: "/onboarding/farm", replace: true });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <OnboardingShell
      title="Tell us about you"
      subtitle="We'll personalize AgriTwin OS to your region and language."
      steps={ONBOARDING_STEPS}
      current="profile"
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormSection title="Basic details">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input id="full_name" {...form.register("full_name")} />
            {form.formState.errors.full_name && (
              <p className="text-xs text-danger">{form.formState.errors.full_name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+91 98765 43210"
              {...form.register("phone")}
            />
            {form.formState.errors.phone && (
              <p className="text-xs text-danger">{form.formState.errors.phone.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Preferred language</Label>
            <Select
              value={form.watch("language")}
              onValueChange={(v) =>
                form.setValue("language", v as Values["language"], { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.value} value={l.value}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </FormSection>

        <FormSection title="Location & role">
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input id="state" {...form.register("state")} />
            {form.formState.errors.state && (
              <p className="text-xs text-danger">{form.formState.errors.state.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="district">District</Label>
            <Input id="district" {...form.register("district")} />
            {form.formState.errors.district && (
              <p className="text-xs text-danger">{form.formState.errors.district.message}</p>
            )}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>I am a</Label>
            <Select
              value={form.watch("user_role")}
              onValueChange={(v) =>
                form.setValue("user_role", v as Values["user_role"], { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </FormSection>

        <div className="flex items-center justify-between border-t pt-6">
          <p className="text-xs text-muted-foreground">Profile photo: coming soon</p>
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue to farm setup
          </Button>
        </div>
      </form>
    </OnboardingShell>
  );
}
