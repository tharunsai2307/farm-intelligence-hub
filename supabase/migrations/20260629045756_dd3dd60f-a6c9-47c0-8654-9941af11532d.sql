
CREATE TABLE public.farm_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id uuid NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  plot_id uuid REFERENCES public.farm_plots(id) ON DELETE SET NULL,
  recommendation_type text NOT NULL,
  title text NOT NULL,
  recommendation text NOT NULL,
  reason text NOT NULL,
  confidence text NOT NULL DEFAULT 'rule-based',
  source_modules text[] NOT NULL DEFAULT '{}',
  language text NOT NULL DEFAULT 'en',
  translations jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'active',
  accepted boolean NOT NULL DEFAULT false,
  dismissed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.farm_recommendations TO authenticated;
GRANT ALL ON public.farm_recommendations TO service_role;

ALTER TABLE public.farm_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rec_select_own" ON public.farm_recommendations
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "rec_insert_own" ON public.farm_recommendations
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "rec_update_own" ON public.farm_recommendations
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "rec_delete_own" ON public.farm_recommendations
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX rec_user_created_idx ON public.farm_recommendations(user_id, created_at DESC);
CREATE INDEX rec_farm_created_idx ON public.farm_recommendations(farm_id, created_at DESC);

CREATE TRIGGER set_rec_updated_at
  BEFORE UPDATE ON public.farm_recommendations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'en';
