import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  language: string;
  location: string | null;
  state: string | null;
  district: string | null;
  user_role: string | null;
  onboarded: boolean;
};

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select(
        "id, full_name, email, phone, avatar_url, language, location, state, district, user_role, onboarded",
      )
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { profile: data as ProfileRow | null };
  });

const profileSchema = z.object({
  full_name: z.string().min(1).max(120).optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  language: z.string().min(2).max(8).optional(),
  location: z.string().max(160).optional().nullable(),
  state: z.string().max(80).optional().nullable(),
  district: z.string().max(80).optional().nullable(),
  user_role: z.enum(["farmer", "manager", "expert", "student"]).optional().nullable(),
  avatar_url: z.string().url().optional().nullable(),
  onboarded: z.boolean().optional(),
});

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: z.infer<typeof profileSchema>) => profileSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("profiles").update(data).eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
