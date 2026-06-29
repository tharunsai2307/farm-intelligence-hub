
-- Crop analysis tables
CREATE TABLE public.crop_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id uuid NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  plot_id uuid REFERENCES public.farm_plots(id) ON DELETE SET NULL,
  observation_id uuid REFERENCES public.crop_observations(id) ON DELETE SET NULL,
  image_path text NOT NULL,
  crop_type text,
  prediction text,
  scientific_name text,
  confidence numeric,
  severity text,
  affected_area numeric,
  recommendation text,
  explanation text,
  raw_response jsonb,
  model_name text NOT NULL,
  model_version text,
  processing_time_ms integer,
  status text NOT NULL DEFAULT 'completed',
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.crop_analysis TO authenticated;
GRANT ALL ON public.crop_analysis TO service_role;

ALTER TABLE public.crop_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own_analysis" ON public.crop_analysis
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_analysis" ON public.crop_analysis
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_update_own_analysis" ON public.crop_analysis
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users_delete_own_analysis" ON public.crop_analysis
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX crop_analysis_user_created_idx ON public.crop_analysis(user_id, created_at DESC);
CREATE INDEX crop_analysis_farm_idx ON public.crop_analysis(farm_id, created_at DESC);
CREATE INDEX crop_analysis_plot_idx ON public.crop_analysis(plot_id, created_at DESC);

CREATE TRIGGER set_crop_analysis_updated_at
  BEFORE UPDATE ON public.crop_analysis
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Disease reference table (public read)
CREATE TABLE public.crop_disease_reference (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disease_key text NOT NULL UNIQUE,
  disease_name text NOT NULL,
  scientific_name text,
  description text,
  symptoms text,
  causes text,
  treatment text,
  prevention text,
  organic_solution text,
  chemical_solution text,
  reference_source text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.crop_disease_reference TO authenticated, anon;
GRANT ALL ON public.crop_disease_reference TO service_role;

ALTER TABLE public.crop_disease_reference ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_disease_reference" ON public.crop_disease_reference
  FOR SELECT TO authenticated, anon USING (true);

CREATE TRIGGER set_disease_reference_updated_at
  BEFORE UPDATE ON public.crop_disease_reference
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
