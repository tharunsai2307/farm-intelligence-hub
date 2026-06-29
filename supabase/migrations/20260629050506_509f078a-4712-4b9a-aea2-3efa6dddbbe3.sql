-- ============================================================
-- AgriSense: sensor devices
-- ============================================================
CREATE TYPE public.sensor_device_status AS ENUM
  ('online', 'offline', 'low_battery', 'maintenance', 'unknown');

CREATE TYPE public.sensor_device_type AS ENUM
  ('esp32', 'arduino', 'lora', 'mqtt', 'weather_station', 'soil_probe', 'camera', 'other');

CREATE TABLE public.sensor_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  plot_id UUID REFERENCES public.farm_plots(id) ON DELETE SET NULL,
  device_name TEXT NOT NULL,
  device_type public.sensor_device_type NOT NULL DEFAULT 'other',
  manufacturer TEXT,
  serial_number TEXT,
  firmware_version TEXT,
  status public.sensor_device_status NOT NULL DEFAULT 'unknown',
  battery_level INT,
  last_seen TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT sensor_devices_battery_chk CHECK (battery_level IS NULL OR (battery_level BETWEEN 0 AND 100))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sensor_devices TO authenticated;
GRANT ALL ON public.sensor_devices TO service_role;

ALTER TABLE public.sensor_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their devices"
  ON public.sensor_devices FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users insert their devices"
  ON public.sensor_devices FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.owns_farm(farm_id));
CREATE POLICY "Users update their devices"
  ON public.sensor_devices FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete their devices"
  ON public.sensor_devices FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX sensor_devices_farm_idx ON public.sensor_devices (farm_id, created_at DESC);
CREATE INDEX sensor_devices_plot_idx ON public.sensor_devices (plot_id);

CREATE TRIGGER sensor_devices_set_updated_at
  BEFORE UPDATE ON public.sensor_devices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- AgriSense: sensor readings (append-only)
-- ============================================================
CREATE TABLE public.sensor_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id UUID NOT NULL REFERENCES public.sensor_devices(id) ON DELETE CASCADE,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  plot_id UUID REFERENCES public.farm_plots(id) ON DELETE SET NULL,
  sensor_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, DELETE ON public.sensor_readings TO authenticated;
GRANT ALL ON public.sensor_readings TO service_role;

ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their readings"
  ON public.sensor_readings FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users insert their readings"
  ON public.sensor_readings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.owns_farm(farm_id));
CREATE POLICY "Users delete their readings"
  ON public.sensor_readings FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX sensor_readings_farm_time_idx ON public.sensor_readings (farm_id, recorded_at DESC);
CREATE INDEX sensor_readings_device_time_idx ON public.sensor_readings (device_id, recorded_at DESC);

ALTER PUBLICATION supabase_realtime ADD TABLE public.sensor_readings;
ALTER TABLE public.sensor_readings REPLICA IDENTITY FULL;

-- ============================================================
-- AgriSense: satellite records
-- ============================================================
CREATE TABLE public.satellite_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  image_date DATE NOT NULL,
  provider TEXT NOT NULL,
  resolution TEXT,
  ndvi NUMERIC,
  moisture_index NUMERIC,
  vegetation_index NUMERIC,
  image_url TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.satellite_records TO authenticated;
GRANT ALL ON public.satellite_records TO service_role;

ALTER TABLE public.satellite_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their satellite records"
  ON public.satellite_records FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users insert their satellite records"
  ON public.satellite_records FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.owns_farm(farm_id));
CREATE POLICY "Users update their satellite records"
  ON public.satellite_records FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete their satellite records"
  ON public.satellite_records FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX satellite_records_farm_date_idx ON public.satellite_records (farm_id, image_date DESC);

-- ============================================================
-- AgriSense: drone surveys
-- ============================================================
CREATE TYPE public.drone_survey_status AS ENUM
  ('planned', 'in_progress', 'completed', 'failed', 'cancelled');

CREATE TABLE public.drone_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  survey_date DATE NOT NULL,
  pilot TEXT,
  coverage_area NUMERIC,
  coverage_area_unit TEXT DEFAULT 'hectares',
  image_count INT NOT NULL DEFAULT 0,
  status public.drone_survey_status NOT NULL DEFAULT 'planned',
  notes TEXT,
  report_url TEXT,
  geojson_url TEXT,
  orthomosaic_url TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.drone_surveys TO authenticated;
GRANT ALL ON public.drone_surveys TO service_role;

ALTER TABLE public.drone_surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their drone surveys"
  ON public.drone_surveys FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users insert their drone surveys"
  ON public.drone_surveys FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.owns_farm(farm_id));
CREATE POLICY "Users update their drone surveys"
  ON public.drone_surveys FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete their drone surveys"
  ON public.drone_surveys FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX drone_surveys_farm_date_idx ON public.drone_surveys (farm_id, survey_date DESC);

CREATE TRIGGER drone_surveys_set_updated_at
  BEFORE UPDATE ON public.drone_surveys
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();