
-- Tighten INSERT policies to verify farm ownership
DROP POLICY IF EXISTS "Users insert own calendar" ON public.calendar_events;
CREATE POLICY "Users insert own calendar" ON public.calendar_events
  FOR INSERT WITH CHECK (auth.uid() = user_id AND public.owns_farm(farm_id));

DROP POLICY IF EXISTS "Users insert own equipment" ON public.equipment;
CREATE POLICY "Users insert own equipment" ON public.equipment
  FOR INSERT WITH CHECK (auth.uid() = user_id AND public.owns_farm(farm_id));

DROP POLICY IF EXISTS "Users insert own expenses" ON public.expenses;
CREATE POLICY "Users insert own expenses" ON public.expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id AND public.owns_farm(farm_id));

DROP POLICY IF EXISTS "Users insert own harvest" ON public.harvest_records;
CREATE POLICY "Users insert own harvest" ON public.harvest_records
  FOR INSERT WITH CHECK (auth.uid() = user_id AND public.owns_farm(farm_id));

DROP POLICY IF EXISTS "Users insert own inventory" ON public.inventory_items;
CREATE POLICY "Users insert own inventory" ON public.inventory_items
  FOR INSERT WITH CHECK (auth.uid() = user_id AND public.owns_farm(farm_id));

DROP POLICY IF EXISTS "Users insert own tasks" ON public.tasks;
CREATE POLICY "Users insert own tasks" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id AND public.owns_farm(farm_id));

DROP POLICY IF EXISTS "Users insert own workers" ON public.workers;
CREATE POLICY "Users insert own workers" ON public.workers
  FOR INSERT WITH CHECK (auth.uid() = user_id AND public.owns_farm(farm_id));

-- Add missing UPDATE policy on sensor_readings
DROP POLICY IF EXISTS "Users update their readings" ON public.sensor_readings;
CREATE POLICY "Users update their readings" ON public.sensor_readings
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id AND public.owns_farm(farm_id));
