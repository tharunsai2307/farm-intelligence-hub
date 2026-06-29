
-- =====================================================================
-- AgriTwin OS — Phase 1 Part 1 schema
-- =====================================================================

-- Shared utility: updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- =====================================================================
-- Roles
-- =====================================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'agronomist', 'farmer');

CREATE TABLE public.user_roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        public.app_role NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles read own" ON public.user_roles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- =====================================================================
-- Profiles (1:1 auth.users)
-- =====================================================================
CREATE TABLE public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name    TEXT,
  email        TEXT,
  phone        TEXT,
  avatar_url   TEXT,
  language     TEXT NOT NULL DEFAULT 'en',
  location     TEXT,
  onboarded    BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at   TIMESTAMPTZ
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles read own" ON public.profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles update own" ON public.profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles insert own" ON public.profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================================
-- User settings
-- =====================================================================
CREATE TABLE public.user_settings (
  user_id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme                    TEXT NOT NULL DEFAULT 'system',  -- light | dark | system
  language                 TEXT NOT NULL DEFAULT 'en',
  notif_email              BOOLEAN NOT NULL DEFAULT true,
  notif_push               BOOLEAN NOT NULL DEFAULT true,
  privacy_share_analytics  BOOLEAN NOT NULL DEFAULT false,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.user_settings TO authenticated;
GRANT ALL ON public.user_settings TO service_role;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings read own" ON public.user_settings FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "settings upsert own" ON public.user_settings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "settings update own" ON public.user_settings FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER user_settings_updated_at BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================================
-- Farms
-- =====================================================================
CREATE TABLE public.farms (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  area_hectares     NUMERIC(10,3),
  soil_type         TEXT,
  irrigation_type   TEXT,
  water_source      TEXT,
  planting_date     DATE,
  expected_harvest  DATE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at        TIMESTAMPTZ
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.farms TO authenticated;
GRANT ALL ON public.farms TO service_role;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
CREATE INDEX farms_owner_idx ON public.farms(owner_id) WHERE deleted_at IS NULL;
CREATE POLICY "farms owner all" ON public.farms FOR ALL
  TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE TRIGGER farms_updated_at BEFORE UPDATE ON public.farms
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Helper: is the caller the owner of a farm?
CREATE OR REPLACE FUNCTION public.owns_farm(_farm_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.farms WHERE id = _farm_id AND owner_id = auth.uid());
$$;

-- =====================================================================
-- Farm locations
-- =====================================================================
CREATE TABLE public.farm_locations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id     UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  label       TEXT,
  latitude    DOUBLE PRECISION NOT NULL,
  longitude   DOUBLE PRECISION NOT NULL,
  geojson     JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.farm_locations TO authenticated;
GRANT ALL ON public.farm_locations TO service_role;
ALTER TABLE public.farm_locations ENABLE ROW LEVEL SECURITY;
CREATE INDEX farm_locations_farm_idx ON public.farm_locations(farm_id);
CREATE POLICY "farm_locations owner all" ON public.farm_locations FOR ALL
  TO authenticated USING (public.owns_farm(farm_id)) WITH CHECK (public.owns_farm(farm_id));
CREATE TRIGGER farm_locations_updated_at BEFORE UPDATE ON public.farm_locations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================================
-- Crops
-- =====================================================================
CREATE TABLE public.crops (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id           UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  variety           TEXT,
  planted_on        DATE,
  expected_harvest  DATE,
  status            TEXT NOT NULL DEFAULT 'growing',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at        TIMESTAMPTZ
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crops TO authenticated;
GRANT ALL ON public.crops TO service_role;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
CREATE INDEX crops_farm_idx ON public.crops(farm_id) WHERE deleted_at IS NULL;
CREATE POLICY "crops owner all" ON public.crops FOR ALL
  TO authenticated USING (public.owns_farm(farm_id)) WITH CHECK (public.owns_farm(farm_id));
CREATE TRIGGER crops_updated_at BEFORE UPDATE ON public.crops
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================================
-- Crop images
-- =====================================================================
CREATE TABLE public.crop_images (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id      UUID NOT NULL REFERENCES public.crops(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  captured_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crop_images TO authenticated;
GRANT ALL ON public.crop_images TO service_role;
ALTER TABLE public.crop_images ENABLE ROW LEVEL SECURITY;
CREATE INDEX crop_images_crop_idx ON public.crop_images(crop_id);
CREATE POLICY "crop_images owner all" ON public.crop_images FOR ALL
  TO authenticated USING (EXISTS (
    SELECT 1 FROM public.crops c WHERE c.id = crop_id AND public.owns_farm(c.farm_id)
  )) WITH CHECK (EXISTS (
    SELECT 1 FROM public.crops c WHERE c.id = crop_id AND public.owns_farm(c.farm_id)
  ));

-- =====================================================================
-- Weather records
-- =====================================================================
CREATE TABLE public.weather_records (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id       UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  recorded_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  temp_c        NUMERIC(5,2),
  humidity      NUMERIC(5,2),
  rainfall_mm   NUMERIC(7,2),
  wind_kph      NUMERIC(6,2),
  source        TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.weather_records TO authenticated;
GRANT ALL ON public.weather_records TO service_role;
ALTER TABLE public.weather_records ENABLE ROW LEVEL SECURITY;
CREATE INDEX weather_records_farm_time_idx ON public.weather_records(farm_id, recorded_at DESC);
CREATE POLICY "weather owner all" ON public.weather_records FOR ALL
  TO authenticated USING (public.owns_farm(farm_id)) WITH CHECK (public.owns_farm(farm_id));

-- =====================================================================
-- Soil records
-- =====================================================================
CREATE TABLE public.soil_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id         UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  recorded_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  ph              NUMERIC(4,2),
  moisture        NUMERIC(5,2),
  nitrogen        NUMERIC(6,2),
  phosphorus      NUMERIC(6,2),
  potassium       NUMERIC(6,2),
  organic_matter  NUMERIC(5,2),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.soil_records TO authenticated;
GRANT ALL ON public.soil_records TO service_role;
ALTER TABLE public.soil_records ENABLE ROW LEVEL SECURITY;
CREATE INDEX soil_records_farm_time_idx ON public.soil_records(farm_id, recorded_at DESC);
CREATE POLICY "soil owner all" ON public.soil_records FOR ALL
  TO authenticated USING (public.owns_farm(farm_id)) WITH CHECK (public.owns_farm(farm_id));

-- =====================================================================
-- Irrigation records
-- =====================================================================
CREATE TABLE public.irrigation_records (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id        UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  started_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at       TIMESTAMPTZ,
  volume_liters  NUMERIC(10,2),
  method         TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.irrigation_records TO authenticated;
GRANT ALL ON public.irrigation_records TO service_role;
ALTER TABLE public.irrigation_records ENABLE ROW LEVEL SECURITY;
CREATE INDEX irrigation_records_farm_time_idx ON public.irrigation_records(farm_id, started_at DESC);
CREATE POLICY "irrigation owner all" ON public.irrigation_records FOR ALL
  TO authenticated USING (public.owns_farm(farm_id)) WITH CHECK (public.owns_farm(farm_id));

-- =====================================================================
-- Notifications
-- =====================================================================
CREATE TABLE public.notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  body        TEXT,
  severity    TEXT NOT NULL DEFAULT 'info',
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE INDEX notifications_user_idx ON public.notifications(user_id, created_at DESC);
CREATE POLICY "notifications owner all" ON public.notifications FOR ALL
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =====================================================================
-- New user bootstrap: create profile + default settings + farmer role
-- =====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name')
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_settings (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'farmer')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
