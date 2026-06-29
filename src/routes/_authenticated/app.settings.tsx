import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { getMyProfile, updateMyProfile, type ProfileRow } from "@/lib/services/profile.functions";
import { getMySettings, updateMySettings, type SettingsRow, type SettingsPatch } from "@/lib/services/settings.functions";
import { useTheme } from "@/components/theme/theme-provider";

export const Route = createFileRoute("/_authenticated/app/settings")({
  head: () => ({ meta: [{ title: "Settings — AgriTwin OS" }] }),
  component: SettingsPage,
});

const profileSchema = z.object({
  full_name: z.string().min(1, "Required").max(120),
  phone: z.string().max(40).optional().or(z.literal("")),
  location: z.string().max(160).optional().or(z.literal("")),
});
type ProfileForm = z.infer<typeof profileSchema>;

function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Settings" description="Your profile, preferences, and notifications." />
      <div className="space-y-8">
        <ProfileSection />
        <PreferencesSection />
        <NotificationsSection />
      </div>
    </div>
  );
}

function ProfileSection() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["profile", "me"],
    queryFn: () => getMyProfile(),
  });
  const profile: ProfileRow | null = data?.profile ?? null;

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: "", phone: "", location: "" },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        full_name: profile.full_name ?? "",
        phone: profile.phone ?? "",
        location: profile.location ?? "",
      });
    }
  }, [profile, form]);

  const mutation = useMutation({
    mutationFn: (values: ProfileForm) =>
      updateMyProfile({
        data: {
          full_name: values.full_name,
          phone: values.phone || null,
          location: values.location || null,
        },
      }),
    onSuccess: () => {
      toast.success("Profile updated");
      qc.invalidateQueries({ queryKey: ["profile", "me"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <section className="surface-card p-6">
      <h2 className="text-lg font-semibold">Profile</h2>
      <p className="mt-1 text-sm text-muted-foreground">Update your personal information.</p>
      <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="full_name">Full name</Label>
          <Input id="full_name" disabled={isLoading} {...form.register("full_name")} />
          {form.formState.errors.full_name && (
            <p className="text-xs text-danger">{form.formState.errors.full_name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" disabled={isLoading} {...form.register("phone")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" disabled={isLoading} {...form.register("location")} />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={mutation.isPending || isLoading}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save profile
          </Button>
        </div>
      </form>
    </section>
  );
}

function PreferencesSection() {
  const qc = useQueryClient();
  const { setTheme } = useTheme();
  const { data, isLoading } = useQuery({
    queryKey: ["settings", "me"],
    queryFn: () => getMySettings(),
  });
  const settings: SettingsRow | null = data?.settings ?? null;

  const mutation = useMutation({
    mutationFn: (patch: SettingsPatch) => updateMySettings({ data: patch }),
    onSuccess: () => {
      toast.success("Preferences saved");
      qc.invalidateQueries({ queryKey: ["settings", "me"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <section className="surface-card p-6">
      <h2 className="text-lg font-semibold">Preferences</h2>
      <p className="mt-1 text-sm text-muted-foreground">Theme and language.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Theme</Label>
          <Select
            disabled={isLoading}
            value={settings?.theme ?? "system"}
            onValueChange={(v) => {
              setTheme(v as "light" | "dark" | "system");
              mutation.mutate({ theme: v as "light" | "dark" | "system" });
            }}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Language</Label>
          <Select
            disabled={isLoading}
            value={settings?.language ?? "en"}
            onValueChange={(v) => mutation.mutate({ language: v })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="hi">Hindi</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>
  );
}

function NotificationsSection() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["settings", "me"],
    queryFn: () => getMySettings(),
  });
  const settings: SettingsRow | null = data?.settings ?? null;

  const mutation = useMutation({
    mutationFn: (patch: SettingsPatch) => updateMySettings({ data: patch }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings", "me"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const Row = ({
    label,
    description,
    field,
  }: {
    label: string;
    description: string;
    field: "notif_email" | "notif_push" | "privacy_share_analytics";
  }) => (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch
        disabled={isLoading}
        checked={settings?.[field] ?? false}
        onCheckedChange={(checked) => mutation.mutate({ [field]: checked } as SettingsPatch)}
      />
    </div>
  );

  return (
    <section className="surface-card p-6">
      <h2 className="text-lg font-semibold">Notifications & privacy</h2>
      <div className="mt-4 divide-y">
        <Row label="Email notifications" description="Critical alerts about your farm." field="notif_email" />
        <Row label="Push notifications" description="In-app and mobile push alerts." field="notif_push" />
        <Row
          label="Share anonymous analytics"
          description="Help improve AgriTwin OS by sharing anonymous usage data."
          field="privacy_share_analytics"
        />
      </div>
    </section>
  );
}
