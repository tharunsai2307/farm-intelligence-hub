
DROP POLICY IF EXISTS "Users insert own inventory" ON public.inventory_items;
CREATE POLICY "Users insert own inventory" ON public.inventory_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND public.owns_farm(farm_id));

DROP POLICY IF EXISTS "Users insert own equipment" ON public.equipment;
CREATE POLICY "Users insert own equipment" ON public.equipment FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND public.owns_farm(farm_id));

DROP POLICY IF EXISTS "Users insert own workers" ON public.workers;
CREATE POLICY "Users insert own workers" ON public.workers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND public.owns_farm(farm_id));

DROP POLICY IF EXISTS "Users insert own harvest" ON public.harvest_records;
CREATE POLICY "Users insert own harvest" ON public.harvest_records FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND public.owns_farm(farm_id));

DROP POLICY IF EXISTS "Users insert own tasks" ON public.tasks;
CREATE POLICY "Users insert own tasks" ON public.tasks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND public.owns_farm(farm_id));

DROP POLICY IF EXISTS "Users insert own expenses" ON public.expenses;
CREATE POLICY "Users insert own expenses" ON public.expenses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND public.owns_farm(farm_id));

DROP POLICY IF EXISTS "Users insert own calendar" ON public.calendar_events;
CREATE POLICY "Users insert own calendar" ON public.calendar_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND public.owns_farm(farm_id));

DROP POLICY IF EXISTS "Users update their readings" ON public.sensor_readings;
CREATE POLICY "Users update their readings" ON public.sensor_readings FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.sensor_devices d WHERE d.id = sensor_readings.device_id AND d.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.sensor_devices d WHERE d.id = sensor_readings.device_id AND d.user_id = auth.uid()));

DROP POLICY IF EXISTS "buyer_profiles_read_all_auth" ON public.buyer_profiles;
CREATE POLICY "buyer_profiles_read_own" ON public.buyer_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "audit_self_insert" ON public.admin_audit_log;
CREATE POLICY "audit_service_insert" ON public.admin_audit_log FOR INSERT TO service_role WITH CHECK (true);

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, authenticated, anon;
