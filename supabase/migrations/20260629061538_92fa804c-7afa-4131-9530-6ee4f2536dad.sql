
-- 1. Private schema for SECURITY DEFINER helpers (not exposed by PostgREST)
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

-- 2. Recreate the four helpers inside `private`
CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE OR REPLACE FUNCTION private.owns_farm(_farm_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.farms WHERE id = _farm_id AND owner_id = auth.uid()) $$;

CREATE OR REPLACE FUNCTION private.can_access_farm(_farm_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.farms WHERE id = _farm_id AND owner_id = auth.uid())
      OR EXISTS (SELECT 1 FROM public.farm_collaborators WHERE farm_id = _farm_id AND user_id = auth.uid())
$$;

CREATE OR REPLACE FUNCTION private.can_manage_farm(_farm_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.farms WHERE id = _farm_id AND owner_id = auth.uid())
      OR EXISTS (SELECT 1 FROM public.farm_collaborators WHERE farm_id = _farm_id AND user_id = auth.uid() AND role = 'manager')
$$;

-- Lock down direct API access; only allow what's needed for RLS evaluation
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.owns_farm(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.can_access_farm(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.can_manage_farm(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.owns_farm(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.can_access_farm(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.can_manage_farm(uuid) TO authenticated, service_role;

-- 3. Recreate every policy that referenced the public helpers, now using private.*
-- admin_audit_log
DROP POLICY IF EXISTS "audit_admins_read" ON public.admin_audit_log;
CREATE POLICY "audit_admins_read" ON public.admin_audit_log FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));

-- calendar_events
DROP POLICY IF EXISTS "Users insert own calendar" ON public.calendar_events;
CREATE POLICY "Users insert own calendar" ON public.calendar_events FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id) AND private.owns_farm(farm_id));

-- carbon_records
DROP POLICY IF EXISTS "carbon_records_farm" ON public.carbon_records;
CREATE POLICY "carbon_records_farm" ON public.carbon_records FOR ALL TO authenticated USING (private.can_access_farm(farm_id)) WITH CHECK (private.can_manage_farm(farm_id));

-- crop_images
DROP POLICY IF EXISTS "crop_images owner all" ON public.crop_images;
CREATE POLICY "crop_images owner all" ON public.crop_images FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.crops c WHERE c.id = crop_images.crop_id AND private.owns_farm(c.farm_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.crops c WHERE c.id = crop_images.crop_id AND private.owns_farm(c.farm_id)));

-- crop_observations
DROP POLICY IF EXISTS "obs: owners insert" ON public.crop_observations;
CREATE POLICY "obs: owners insert" ON public.crop_observations FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id) AND private.owns_farm(farm_id));

-- crops
DROP POLICY IF EXISTS "crops owner all" ON public.crops;
CREATE POLICY "crops owner all" ON public.crops FOR ALL TO authenticated USING (private.owns_farm(farm_id)) WITH CHECK (private.owns_farm(farm_id));

-- drone_surveys
DROP POLICY IF EXISTS "Users insert their drone surveys" ON public.drone_surveys;
CREATE POLICY "Users insert their drone surveys" ON public.drone_surveys FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id) AND private.owns_farm(farm_id));

-- equipment
DROP POLICY IF EXISTS "Users insert own equipment" ON public.equipment;
CREATE POLICY "Users insert own equipment" ON public.equipment FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id) AND private.owns_farm(farm_id));

-- expenses
DROP POLICY IF EXISTS "Users insert own expenses" ON public.expenses;
CREATE POLICY "Users insert own expenses" ON public.expenses FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id) AND private.owns_farm(farm_id));

-- farm_collaborators
DROP POLICY IF EXISTS "farm_collab_owner_manage" ON public.farm_collaborators;
CREATE POLICY "farm_collab_owner_manage" ON public.farm_collaborators FOR ALL TO authenticated USING (private.owns_farm(farm_id)) WITH CHECK (private.owns_farm(farm_id));
DROP POLICY IF EXISTS "farm_collab_select" ON public.farm_collaborators;
CREATE POLICY "farm_collab_select" ON public.farm_collaborators FOR SELECT TO authenticated USING ((user_id = auth.uid()) OR private.owns_farm(farm_id));

-- farm_invitations
DROP POLICY IF EXISTS "invites_owner_manage" ON public.farm_invitations;
CREATE POLICY "invites_owner_manage" ON public.farm_invitations FOR ALL TO authenticated USING (private.owns_farm(farm_id)) WITH CHECK (private.owns_farm(farm_id));

-- farm_locations
DROP POLICY IF EXISTS "farm_locations owner all" ON public.farm_locations;
CREATE POLICY "farm_locations owner all" ON public.farm_locations FOR ALL TO authenticated USING (private.owns_farm(farm_id)) WITH CHECK (private.owns_farm(farm_id));

-- farm_plots
DROP POLICY IF EXISTS "plots: owners insert" ON public.farm_plots;
CREATE POLICY "plots: owners insert" ON public.farm_plots FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id) AND private.owns_farm(farm_id));

-- harvest_records
DROP POLICY IF EXISTS "Users insert own harvest" ON public.harvest_records;
CREATE POLICY "Users insert own harvest" ON public.harvest_records FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id) AND private.owns_farm(farm_id));

-- insurance_policies
DROP POLICY IF EXISTS "insurance_policies_own" ON public.insurance_policies;
CREATE POLICY "insurance_policies_own" ON public.insurance_policies FOR ALL TO authenticated USING ((user_id = auth.uid()) OR private.owns_farm(farm_id)) WITH CHECK (user_id = auth.uid());

-- inventory_items
DROP POLICY IF EXISTS "Users insert own inventory" ON public.inventory_items;
CREATE POLICY "Users insert own inventory" ON public.inventory_items FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id) AND private.owns_farm(farm_id));

-- irrigation_records
DROP POLICY IF EXISTS "irrigation owner all" ON public.irrigation_records;
CREATE POLICY "irrigation owner all" ON public.irrigation_records FOR ALL TO authenticated USING (private.owns_farm(farm_id)) WITH CHECK (private.owns_farm(farm_id));
DROP POLICY IF EXISTS "irrigation: owners full" ON public.irrigation_records;
CREATE POLICY "irrigation: owners full" ON public.irrigation_records FOR ALL TO authenticated USING (private.owns_farm(farm_id)) WITH CHECK (private.owns_farm(farm_id));

-- logistics_plans
DROP POLICY IF EXISTS "logistics_party_access" ON public.logistics_plans;
CREATE POLICY "logistics_party_access" ON public.logistics_plans FOR ALL TO authenticated USING ((created_by = auth.uid()) OR private.owns_farm(farm_id)) WITH CHECK ((created_by = auth.uid()) OR private.owns_farm(farm_id));

-- marketplace_listings
DROP POLICY IF EXISTS "listings_browse_active" ON public.marketplace_listings;
CREATE POLICY "listings_browse_active" ON public.marketplace_listings FOR SELECT TO authenticated USING ((status = 'active'::listing_status) OR (owner_id = auth.uid()) OR private.owns_farm(farm_id));
DROP POLICY IF EXISTS "listings_owner_manage" ON public.marketplace_listings;
CREATE POLICY "listings_owner_manage" ON public.marketplace_listings FOR ALL TO authenticated USING ((owner_id = auth.uid()) OR private.owns_farm(farm_id)) WITH CHECK ((owner_id = auth.uid()) AND private.owns_farm(farm_id));

-- marketplace_orders
DROP POLICY IF EXISTS "orders_party_delete" ON public.marketplace_orders;
CREATE POLICY "orders_party_delete" ON public.marketplace_orders FOR DELETE TO authenticated USING ((buyer_id = auth.uid()) OR (seller_id = auth.uid()) OR private.owns_farm(farm_id));
DROP POLICY IF EXISTS "orders_party_select" ON public.marketplace_orders;
CREATE POLICY "orders_party_select" ON public.marketplace_orders FOR SELECT TO authenticated USING ((buyer_id = auth.uid()) OR (seller_id = auth.uid()) OR private.owns_farm(farm_id));
DROP POLICY IF EXISTS "orders_party_update" ON public.marketplace_orders;
CREATE POLICY "orders_party_update" ON public.marketplace_orders FOR UPDATE TO authenticated USING ((buyer_id = auth.uid()) OR (seller_id = auth.uid()) OR private.owns_farm(farm_id)) WITH CHECK ((buyer_id = auth.uid()) OR (seller_id = auth.uid()) OR private.owns_farm(farm_id));

-- satellite_records
DROP POLICY IF EXISTS "Users insert their satellite records" ON public.satellite_records;
CREATE POLICY "Users insert their satellite records" ON public.satellite_records FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id) AND private.owns_farm(farm_id));

-- sensor_devices
DROP POLICY IF EXISTS "Users insert their devices" ON public.sensor_devices;
CREATE POLICY "Users insert their devices" ON public.sensor_devices FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id) AND private.owns_farm(farm_id));

-- sensor_readings
DROP POLICY IF EXISTS "Users insert their readings" ON public.sensor_readings;
CREATE POLICY "Users insert their readings" ON public.sensor_readings FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id) AND private.owns_farm(farm_id));

-- soil_records
DROP POLICY IF EXISTS "soil owner all" ON public.soil_records;
CREATE POLICY "soil owner all" ON public.soil_records FOR ALL TO authenticated USING (private.owns_farm(farm_id)) WITH CHECK (private.owns_farm(farm_id));
DROP POLICY IF EXISTS "soil: owners full" ON public.soil_records;
CREATE POLICY "soil: owners full" ON public.soil_records FOR ALL TO authenticated USING (private.owns_farm(farm_id)) WITH CHECK (private.owns_farm(farm_id));

-- sustainability_scores
DROP POLICY IF EXISTS "sust_scores_farm" ON public.sustainability_scores;
CREATE POLICY "sust_scores_farm" ON public.sustainability_scores FOR ALL TO authenticated USING (private.can_access_farm(farm_id)) WITH CHECK (private.can_manage_farm(farm_id));

-- tasks
DROP POLICY IF EXISTS "Users insert own tasks" ON public.tasks;
CREATE POLICY "Users insert own tasks" ON public.tasks FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id) AND private.owns_farm(farm_id));

-- weather_alerts
DROP POLICY IF EXISTS "Users delete alerts for their farms" ON public.weather_alerts;
CREATE POLICY "Users delete alerts for their farms" ON public.weather_alerts FOR DELETE TO authenticated USING (private.owns_farm(farm_id));
DROP POLICY IF EXISTS "Users insert alerts for their farms" ON public.weather_alerts;
CREATE POLICY "Users insert alerts for their farms" ON public.weather_alerts FOR INSERT TO authenticated WITH CHECK (private.owns_farm(farm_id) AND (user_id = auth.uid()));
DROP POLICY IF EXISTS "Users update alerts for their farms" ON public.weather_alerts;
CREATE POLICY "Users update alerts for their farms" ON public.weather_alerts FOR UPDATE TO authenticated USING (private.owns_farm(farm_id)) WITH CHECK (private.owns_farm(farm_id));
DROP POLICY IF EXISTS "Users view alerts for their farms" ON public.weather_alerts;
CREATE POLICY "Users view alerts for their farms" ON public.weather_alerts FOR SELECT TO authenticated USING (private.owns_farm(farm_id));

-- weather_forecasts
DROP POLICY IF EXISTS "Users delete forecasts for their farms" ON public.weather_forecasts;
CREATE POLICY "Users delete forecasts for their farms" ON public.weather_forecasts FOR DELETE TO authenticated USING (private.owns_farm(farm_id));
DROP POLICY IF EXISTS "Users insert forecasts for their farms" ON public.weather_forecasts;
CREATE POLICY "Users insert forecasts for their farms" ON public.weather_forecasts FOR INSERT TO authenticated WITH CHECK (private.owns_farm(farm_id) AND (user_id = auth.uid()));
DROP POLICY IF EXISTS "Users update forecasts for their farms" ON public.weather_forecasts;
CREATE POLICY "Users update forecasts for their farms" ON public.weather_forecasts FOR UPDATE TO authenticated USING (private.owns_farm(farm_id)) WITH CHECK (private.owns_farm(farm_id));
DROP POLICY IF EXISTS "Users view forecasts for their farms" ON public.weather_forecasts;
CREATE POLICY "Users view forecasts for their farms" ON public.weather_forecasts FOR SELECT TO authenticated USING (private.owns_farm(farm_id));

-- weather_records
DROP POLICY IF EXISTS "weather owner all" ON public.weather_records;
CREATE POLICY "weather owner all" ON public.weather_records FOR ALL TO authenticated USING (private.owns_farm(farm_id)) WITH CHECK (private.owns_farm(farm_id));

-- workers
DROP POLICY IF EXISTS "Users insert own workers" ON public.workers;
CREATE POLICY "Users insert own workers" ON public.workers FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id) AND private.owns_farm(farm_id));

-- 4. Drop the now-unused public helpers so signed-in users can no longer call them via the Data API
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
DROP FUNCTION IF EXISTS public.owns_farm(uuid);
DROP FUNCTION IF EXISTS public.can_access_farm(uuid);
DROP FUNCTION IF EXISTS public.can_manage_farm(uuid);
