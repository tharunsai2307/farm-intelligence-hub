import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type SettingsRow = {
  user_id: string;
  theme: "light" | "dark" | "system";
  language: string;
  notif_email: boolean;
  notif_push: boolean;
  privacy_share_analytics: boolean;
};

export type SettingsPatch = {
  theme?: "light" | "dark" | "system";
  language?: string;
  notif_email?: boolean;
  notif_push?: boolean;
  privacy_share_analytics?: boolean;
};

export const getMySettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_settings")
      .select("user_id, theme, language, notif_email, notif_push, privacy_share_analytics")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { settings: data as SettingsRow | null };
  });

const settingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  language: z.string().min(2).max(8).optional(),
  notif_email: z.boolean().optional(),
  notif_push: z.boolean().optional(),
  privacy_share_analytics: z.boolean().optional(),
});

export const updateMySettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: z.infer<typeof settingsSchema>) => settingsSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("user_settings")
      .update(data)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
