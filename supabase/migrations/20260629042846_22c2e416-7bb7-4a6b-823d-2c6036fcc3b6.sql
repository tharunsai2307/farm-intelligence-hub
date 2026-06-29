
-- ============================================================================
-- PHASE 1 PART 3 — farm plots, crop observations, extend soil & irrigation
-- ============================================================================

-- ---------- farm_plots ------------------------------------------------------
CREATE TABLE public.farm_plots (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id      UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL,
  name         TEXT NOT NULL,
  crop         TEXT,
  crop_variety TEXT,
  area         NUMERIC,
  area_unit    TEXT DEFAULT 'hectares',
  soil_type    TEXT,
  irrigation_type TEXT,
  latitude     DOUBLE PRECISION,
  longitude    DOUBLE PRECISION,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at   TIMESTAMPTZ
);
CREATE INDEX farm_plots_farm_id_idx ON public.farm_plots(farm_id);
CREATE INDEX farm_plots_user_id_idx ON public.farm_plots(user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.farm_plots TO authenticated;
GRANT ALL ON public.farm_plots TO service_role;

ALTER TABLE public.farm_plots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plots: owners read"   ON public.farm_plots FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "plots: owners insert" ON public.farm_plots FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND public.owns_farm(farm_id));
CREATE POLICY "plots: owners update" ON public.farm_plots FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "plots: owners delete" ON public.farm_plots FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER farm_plots_set_updated_at BEFORE UPDATE ON public.farm_plots
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------- crop_observations -----------------------------------------------
CREATE TABLE public.crop_observations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id         UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  plot_id         UUID REFERENCES public.farm_plots(id) ON DELETE SET NULL,
  user_id         UUID NOT NULL,
  recorded_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  crop_stage      TEXT,
  visual_condition TEXT,
  notes           TEXT,
  image_url       TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);
CREATE INDEX crop_observations_farm_idx ON public.crop_observations(farm_id);
CREATE INDEX crop_observations_user_idx ON public.crop_observations(user_id);
CREATE INDEX crop_observations_plot_idx ON public.crop_observations(plot_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.crop_observations TO authenticated;
GRANT ALL ON public.crop_observations TO service_role;

ALTER TABLE public.crop_observations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "obs: owners read"   ON public.crop_observations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "obs: owners insert" ON public.crop_observations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND public.owns_farm(farm_id));
CREATE POLICY "obs: owners update" ON public.crop_observations FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "obs: owners delete" ON public.crop_observations FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER crop_observations_set_updated_at BEFORE UPDATE ON public.crop_observations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------- extend soil_records ---------------------------------------------
ALTER TABLE public.soil_records
  ADD COLUMN IF NOT EXISTS plot_id      UUID REFERENCES public.farm_plots(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS user_id      UUID,
  ADD COLUMN IF NOT EXISTS temperature  NUMERIC,
  ADD COLUMN IF NOT EXISTS notes        TEXT,
  ADD COLUMN IF NOT EXISTS updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS deleted_at   TIMESTAMPTZ;

-- backfill user_id from farms
UPDATE public.soil_records sr
SET user_id = f.owner_id
FROM public.farms f
WHERE sr.farm_id = f.id AND sr.user_id IS NULL;

CREATE INDEX IF NOT EXISTS soil_records_user_idx ON public.soil_records(user_id);
CREATE INDEX IF NOT EXISTS soil_records_plot_idx ON public.soil_records(plot_id);

DROP TRIGGER IF EXISTS soil_records_set_updated_at ON public.soil_records;
CREATE TRIGGER soil_records_set_updated_at BEFORE UPDATE ON public.soil_records
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- add owner-scoped policies in addition to existing farm-scoped ones
DROP POLICY IF EXISTS "soil: owners full" ON public.soil_records;
CREATE POLICY "soil: owners full" ON public.soil_records
  FOR ALL TO authenticated
  USING (public.owns_farm(farm_id))
  WITH CHECK (public.owns_farm(farm_id));

-- ---------- extend irrigation_records ---------------------------------------
ALTER TABLE public.irrigation_records
  ADD COLUMN IF NOT EXISTS plot_id          UUID REFERENCES public.farm_plots(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS user_id          UUID,
  ADD COLUMN IF NOT EXISTS duration_minutes NUMERIC,
  ADD COLUMN IF NOT EXISTS energy_used      NUMERIC,
  ADD COLUMN IF NOT EXISTS notes            TEXT,
  ADD COLUMN IF NOT EXISTS updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS deleted_at       TIMESTAMPTZ;

UPDATE public.irrigation_records ir
SET user_id = f.owner_id
FROM public.farms f
WHERE ir.farm_id = f.id AND ir.user_id IS NULL;

CREATE INDEX IF NOT EXISTS irrigation_records_user_idx ON public.irrigation_records(user_id);
CREATE INDEX IF NOT EXISTS irrigation_records_plot_idx ON public.irrigation_records(plot_id);

DROP TRIGGER IF EXISTS irrigation_records_set_updated_at ON public.irrigation_records;
CREATE TRIGGER irrigation_records_set_updated_at BEFORE UPDATE ON public.irrigation_records
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP POLICY IF EXISTS "irrigation: owners full" ON public.irrigation_records;
CREATE POLICY "irrigation: owners full" ON public.irrigation_records
  FOR ALL TO authenticated
  USING (public.owns_farm(farm_id))
  WITH CHECK (public.owns_farm(farm_id));
