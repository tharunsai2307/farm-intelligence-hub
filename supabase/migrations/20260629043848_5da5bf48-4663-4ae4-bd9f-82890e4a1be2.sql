
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['profiles','farms','farm_locations','farm_plots','crops','crop_observations','soil_records','irrigation_records','weather_records','user_settings']
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON public.%I', t);
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', t);
  END LOOP;
END$$;

CREATE INDEX IF NOT EXISTS farms_owner_alive_idx ON public.farms(owner_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS farm_plots_alive_idx ON public.farm_plots(farm_id, user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS soil_records_recorded_at_idx ON public.soil_records(recorded_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS irrigation_records_started_at_idx ON public.irrigation_records(started_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS crop_observations_recorded_at_idx ON public.crop_observations(recorded_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS notifications_user_created_idx ON public.notifications(user_id, created_at DESC);
