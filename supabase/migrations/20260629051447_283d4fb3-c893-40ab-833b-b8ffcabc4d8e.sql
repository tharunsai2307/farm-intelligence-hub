
-- =====================================================
-- ENUMS
-- =====================================================
CREATE TYPE public.inventory_category AS ENUM (
  'seeds','fertilizers','pesticides','organic_inputs','tools','spare_parts','storage_materials','other'
);

CREATE TYPE public.equipment_type AS ENUM (
  'tractor','pump_set','drip_system','sprayer','harvest_machine','sensor','other'
);

CREATE TYPE public.equipment_status AS ENUM ('operational','maintenance_due','out_of_service');

CREATE TYPE public.task_type AS ENUM (
  'irrigation','spraying','harvest','inspection','fertilizer_application','maintenance','manual_work','other'
);

CREATE TYPE public.task_priority AS ENUM ('low','medium','high','urgent');

CREATE TYPE public.task_status AS ENUM ('pending','in_progress','completed','cancelled');

CREATE TYPE public.expense_category AS ENUM (
  'seeds','labor','fuel','water','electricity','equipment','maintenance','transport','other'
);

CREATE TYPE public.payment_method AS ENUM ('cash','bank_transfer','upi','card','credit','other');

CREATE TYPE public.harvest_status AS ENUM ('planned','in_progress','completed','sold','cancelled');

CREATE TYPE public.calendar_event_type AS ENUM (
  'task','harvest','maintenance','weather','observation','irrigation','custom'
);

CREATE TYPE public.attendance_status AS ENUM ('present','absent','half_day','leave');

-- =====================================================
-- INVENTORY ITEMS
-- =====================================================
CREATE TABLE public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category public.inventory_category NOT NULL,
  quantity NUMERIC(14,3) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'unit',
  supplier TEXT,
  purchase_date DATE,
  expiry_date DATE,
  cost NUMERIC(14,2),
  storage_location TEXT,
  min_stock_level NUMERIC(14,3) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory_items TO authenticated;
GRANT ALL ON public.inventory_items TO service_role;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users select own inventory" ON public.inventory_items FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own inventory" ON public.inventory_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own inventory" ON public.inventory_items FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own inventory" ON public.inventory_items FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX idx_inventory_user_farm ON public.inventory_items(user_id, farm_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_inventory_expiry ON public.inventory_items(expiry_date) WHERE deleted_at IS NULL AND expiry_date IS NOT NULL;
CREATE TRIGGER trg_inventory_updated BEFORE UPDATE ON public.inventory_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================
-- EQUIPMENT
-- =====================================================
CREATE TABLE public.equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type public.equipment_type NOT NULL,
  manufacturer TEXT,
  purchase_date DATE,
  status public.equipment_status NOT NULL DEFAULT 'operational',
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  operating_hours NUMERIC(10,1) DEFAULT 0,
  serial_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.equipment TO authenticated;
GRANT ALL ON public.equipment TO service_role;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users select own equipment" ON public.equipment FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own equipment" ON public.equipment FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own equipment" ON public.equipment FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own equipment" ON public.equipment FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX idx_equipment_user_farm ON public.equipment(user_id, farm_id) WHERE deleted_at IS NULL;
CREATE TRIGGER trg_equipment_updated BEFORE UPDATE ON public.equipment FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================
-- WORKERS
-- =====================================================
CREATE TABLE public.workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT,
  daily_wage NUMERIC(10,2),
  skills TEXT[] DEFAULT '{}',
  available BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workers TO authenticated;
GRANT ALL ON public.workers TO service_role;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users select own workers" ON public.workers FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own workers" ON public.workers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own workers" ON public.workers FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own workers" ON public.workers FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX idx_workers_user_farm ON public.workers(user_id, farm_id) WHERE deleted_at IS NULL;
CREATE TRIGGER trg_workers_updated BEFORE UPDATE ON public.workers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================
-- WORKER ATTENDANCE
-- =====================================================
CREATE TABLE public.worker_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status public.attendance_status NOT NULL DEFAULT 'present',
  hours_worked NUMERIC(5,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(worker_id, date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.worker_attendance TO authenticated;
GRANT ALL ON public.worker_attendance TO service_role;
ALTER TABLE public.worker_attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users select own attendance" ON public.worker_attendance FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own attendance" ON public.worker_attendance FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own attendance" ON public.worker_attendance FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own attendance" ON public.worker_attendance FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX idx_attendance_worker_date ON public.worker_attendance(worker_id, date DESC);
CREATE TRIGGER trg_attendance_updated BEFORE UPDATE ON public.worker_attendance FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================
-- TASKS
-- =====================================================
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  plot_id UUID REFERENCES public.farm_plots(id) ON DELETE SET NULL,
  worker_id UUID REFERENCES public.workers(id) ON DELETE SET NULL,
  source_recommendation_id UUID REFERENCES public.farm_recommendations(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  task_type public.task_type NOT NULL DEFAULT 'manual_work',
  priority public.task_priority NOT NULL DEFAULT 'medium',
  due_date DATE,
  status public.task_status NOT NULL DEFAULT 'pending',
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  completion_notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users select own tasks" ON public.tasks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own tasks" ON public.tasks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own tasks" ON public.tasks FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own tasks" ON public.tasks FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX idx_tasks_user_farm ON public.tasks(user_id, farm_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_status_due ON public.tasks(status, due_date) WHERE deleted_at IS NULL;
CREATE TRIGGER trg_tasks_updated BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================
-- EXPENSES
-- =====================================================
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  amount NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  category public.expense_category NOT NULL,
  description TEXT,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_url TEXT,
  payment_method public.payment_method,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO authenticated;
GRANT ALL ON public.expenses TO service_role;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users select own expenses" ON public.expenses FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own expenses" ON public.expenses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own expenses" ON public.expenses FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own expenses" ON public.expenses FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX idx_expenses_user_farm_date ON public.expenses(user_id, farm_id, expense_date DESC) WHERE deleted_at IS NULL;
CREATE TRIGGER trg_expenses_updated BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================
-- HARVEST RECORDS
-- =====================================================
CREATE TABLE public.harvest_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  plot_id UUID REFERENCES public.farm_plots(id) ON DELETE SET NULL,
  crop TEXT NOT NULL,
  expected_harvest_date DATE,
  actual_harvest_date DATE,
  expected_quantity NUMERIC(14,3),
  actual_quantity NUMERIC(14,3),
  unit TEXT DEFAULT 'kg',
  storage_location TEXT,
  buyer TEXT,
  status public.harvest_status NOT NULL DEFAULT 'planned',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.harvest_records TO authenticated;
GRANT ALL ON public.harvest_records TO service_role;
ALTER TABLE public.harvest_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users select own harvest" ON public.harvest_records FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own harvest" ON public.harvest_records FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own harvest" ON public.harvest_records FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own harvest" ON public.harvest_records FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX idx_harvest_user_farm ON public.harvest_records(user_id, farm_id) WHERE deleted_at IS NULL;
CREATE TRIGGER trg_harvest_updated BEFORE UPDATE ON public.harvest_records FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================
-- CALENDAR EVENTS (ad-hoc; combines with tasks/harvest in UI)
-- =====================================================
CREATE TABLE public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_type public.calendar_event_type NOT NULL DEFAULT 'custom',
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  all_day BOOLEAN NOT NULL DEFAULT false,
  related_task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  related_harvest_id UUID REFERENCES public.harvest_records(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_events TO authenticated;
GRANT ALL ON public.calendar_events TO service_role;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users select own calendar" ON public.calendar_events FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own calendar" ON public.calendar_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own calendar" ON public.calendar_events FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own calendar" ON public.calendar_events FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX idx_calendar_user_farm_starts ON public.calendar_events(user_id, farm_id, starts_at) WHERE deleted_at IS NULL;
CREATE TRIGGER trg_calendar_updated BEFORE UPDATE ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
