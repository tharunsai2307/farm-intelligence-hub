
-- Extend existing weather_records
ALTER TABLE public.weather_records
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS longitude NUMERIC,
  ADD COLUMN IF NOT EXISTS pressure NUMERIC,
  ADD COLUMN IF NOT EXISTS uv_index NUMERIC,
  ADD COLUMN IF NOT EXISTS weather_condition TEXT,
  ADD COLUMN IF NOT EXISTS fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS trg_weather_records_updated_at ON public.weather_records;
CREATE TRIGGER trg_weather_records_updated_at BEFORE UPDATE ON public.weather_records
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS weather_records_farm_fetched_idx
  ON public.weather_records(farm_id, fetched_at DESC);

-- weather_forecasts
CREATE TABLE IF NOT EXISTS public.weather_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  forecast_date DATE NOT NULL,
  min_temp NUMERIC,
  max_temp NUMERIC,
  humidity NUMERIC,
  rain_probability NUMERIC,
  rainfall NUMERIC,
  wind_speed NUMERIC,
  weather_condition TEXT,
  source TEXT NOT NULL DEFAULT 'openweather',
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (farm_id, forecast_date)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.weather_forecasts TO authenticated;
GRANT ALL ON public.weather_forecasts TO service_role;

ALTER TABLE public.weather_forecasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view forecasts for their farms" ON public.weather_forecasts
  FOR SELECT TO authenticated USING (public.owns_farm(farm_id));
CREATE POLICY "Users insert forecasts for their farms" ON public.weather_forecasts
  FOR INSERT TO authenticated WITH CHECK (public.owns_farm(farm_id) AND user_id = auth.uid());
CREATE POLICY "Users update forecasts for their farms" ON public.weather_forecasts
  FOR UPDATE TO authenticated USING (public.owns_farm(farm_id)) WITH CHECK (public.owns_farm(farm_id));
CREATE POLICY "Users delete forecasts for their farms" ON public.weather_forecasts
  FOR DELETE TO authenticated USING (public.owns_farm(farm_id));

DROP TRIGGER IF EXISTS trg_weather_forecasts_updated_at ON public.weather_forecasts;
CREATE TRIGGER trg_weather_forecasts_updated_at BEFORE UPDATE ON public.weather_forecasts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS weather_forecasts_farm_date_idx
  ON public.weather_forecasts(farm_id, forecast_date);

-- weather_alerts
CREATE TABLE IF NOT EXISTS public.weather_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low','medium','high')),
  title TEXT NOT NULL,
  description TEXT,
  source TEXT NOT NULL DEFAULT 'openweather',
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.weather_alerts TO authenticated;
GRANT ALL ON public.weather_alerts TO service_role;

ALTER TABLE public.weather_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view alerts for their farms" ON public.weather_alerts
  FOR SELECT TO authenticated USING (public.owns_farm(farm_id));
CREATE POLICY "Users insert alerts for their farms" ON public.weather_alerts
  FOR INSERT TO authenticated WITH CHECK (public.owns_farm(farm_id) AND user_id = auth.uid());
CREATE POLICY "Users update alerts for their farms" ON public.weather_alerts
  FOR UPDATE TO authenticated USING (public.owns_farm(farm_id)) WITH CHECK (public.owns_farm(farm_id));
CREATE POLICY "Users delete alerts for their farms" ON public.weather_alerts
  FOR DELETE TO authenticated USING (public.owns_farm(farm_id));

DROP TRIGGER IF EXISTS trg_weather_alerts_updated_at ON public.weather_alerts;
CREATE TRIGGER trg_weather_alerts_updated_at BEFORE UPDATE ON public.weather_alerts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS weather_alerts_farm_created_idx
  ON public.weather_alerts(farm_id, created_at DESC);
