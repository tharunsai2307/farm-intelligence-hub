
-- ============ ENUMS ============
DO $$ BEGIN CREATE TYPE public.listing_status AS ENUM ('draft','active','sold','withdrawn','expired'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.order_status AS ENUM ('pending','confirmed','in_transit','delivered','cancelled','disputed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.logistics_status AS ENUM ('planned','dispatched','in_transit','delivered','cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.warehouse_type AS ENUM ('cold_storage','dry_storage','silo','open_yard','controlled_atmosphere'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.booking_status AS ENUM ('pending','confirmed','active','completed','cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.scheme_category AS ENUM ('subsidy','insurance','credit','equipment','irrigation','training','market_support','sustainability','other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.application_status AS ENUM ('draft','submitted','under_review','approved','rejected','disbursed','closed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.collaborator_role AS ENUM ('manager','worker','viewer'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.invitation_status AS ENUM ('pending','accepted','revoked','expired'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.carbon_source AS ENUM ('fertilizer','fuel','electricity','irrigation','livestock','residue_burning','sequestration_cover','sequestration_trees','sequestration_soil','other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'admin'; EXCEPTION WHEN others THEN NULL; END $$;

-- ============ FARM COLLABORATORS ============
CREATE TABLE IF NOT EXISTS public.farm_collaborators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.collaborator_role NOT NULL DEFAULT 'viewer',
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (farm_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.farm_collaborators TO authenticated;
GRANT ALL ON public.farm_collaborators TO service_role;
ALTER TABLE public.farm_collaborators ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.can_access_farm(_farm_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.farms WHERE id = _farm_id AND owner_id = auth.uid())
      OR EXISTS (SELECT 1 FROM public.farm_collaborators WHERE farm_id = _farm_id AND user_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.can_manage_farm(_farm_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.farms WHERE id = _farm_id AND owner_id = auth.uid())
      OR EXISTS (SELECT 1 FROM public.farm_collaborators WHERE farm_id = _farm_id AND user_id = auth.uid() AND role = 'manager');
$$;

DROP POLICY IF EXISTS "farm_collab_select" ON public.farm_collaborators;
CREATE POLICY "farm_collab_select" ON public.farm_collaborators FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.owns_farm(farm_id));
DROP POLICY IF EXISTS "farm_collab_owner_manage" ON public.farm_collaborators;
CREATE POLICY "farm_collab_owner_manage" ON public.farm_collaborators FOR ALL TO authenticated
  USING (public.owns_farm(farm_id)) WITH CHECK (public.owns_farm(farm_id));
DROP TRIGGER IF EXISTS farm_collab_set_updated_at ON public.farm_collaborators;
CREATE TRIGGER farm_collab_set_updated_at BEFORE UPDATE ON public.farm_collaborators
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ FARM INVITATIONS ============
CREATE TABLE public.farm_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  email text NOT NULL,
  role public.collaborator_role NOT NULL DEFAULT 'viewer',
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24),'hex'),
  status public.invitation_status NOT NULL DEFAULT 'pending',
  invited_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '14 days'),
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.farm_invitations TO authenticated;
GRANT ALL ON public.farm_invitations TO service_role;
ALTER TABLE public.farm_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invites_owner_manage" ON public.farm_invitations FOR ALL TO authenticated
  USING (public.owns_farm(farm_id)) WITH CHECK (public.owns_farm(farm_id));
CREATE POLICY "invites_self_view" ON public.farm_invitations FOR SELECT TO authenticated
  USING (lower(email) = lower((auth.jwt() ->> 'email')));
CREATE TRIGGER farm_invitations_set_updated_at BEFORE UPDATE ON public.farm_invitations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ MARKET PRICES ============
CREATE TABLE public.market_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commodity text NOT NULL,
  variety text,
  grade text,
  state text NOT NULL,
  district text,
  market text NOT NULL,
  min_price numeric(12,2),
  max_price numeric(12,2),
  modal_price numeric(12,2),
  unit text NOT NULL DEFAULT 'INR/quintal',
  arrival_date date NOT NULL,
  source text NOT NULL DEFAULT 'data.gov.in',
  raw jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.market_prices TO authenticated;
GRANT ALL ON public.market_prices TO service_role;
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "market_prices_read" ON public.market_prices FOR SELECT TO authenticated USING (true);
CREATE UNIQUE INDEX market_prices_unique_row ON public.market_prices
  (commodity, market, state, arrival_date, COALESCE(variety,''), COALESCE(grade,''));
CREATE INDEX market_prices_commodity_date_idx ON public.market_prices (commodity, arrival_date DESC);
CREATE INDEX market_prices_market_idx ON public.market_prices (state, market);

-- ============ BUYER PROFILES ============
CREATE TABLE public.buyer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  business_type text,
  gstin text,
  phone text,
  state text,
  district text,
  city text,
  preferred_commodities text[] DEFAULT '{}',
  bio text,
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.buyer_profiles TO authenticated;
GRANT ALL ON public.buyer_profiles TO service_role;
ALTER TABLE public.buyer_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "buyer_profiles_read_all_auth" ON public.buyer_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "buyer_profiles_manage_own" ON public.buyer_profiles FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER buyer_profiles_set_updated_at BEFORE UPDATE ON public.buyer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ MARKETPLACE LISTINGS ============
CREATE TABLE public.marketplace_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  commodity text NOT NULL,
  variety text,
  grade text,
  quantity numeric(12,2) NOT NULL CHECK (quantity > 0),
  unit text NOT NULL DEFAULT 'quintal',
  price_per_unit numeric(12,2) NOT NULL CHECK (price_per_unit >= 0),
  currency text NOT NULL DEFAULT 'INR',
  description text,
  harvest_date date,
  available_from date,
  available_until date,
  pickup_address text,
  pickup_state text,
  pickup_district text,
  pickup_lat double precision,
  pickup_lng double precision,
  image_urls text[] DEFAULT '{}',
  status public.listing_status NOT NULL DEFAULT 'active',
  views_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketplace_listings TO authenticated;
GRANT ALL ON public.marketplace_listings TO service_role;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "listings_browse_active" ON public.marketplace_listings FOR SELECT TO authenticated
  USING (status = 'active' OR owner_id = auth.uid() OR public.owns_farm(farm_id));
CREATE POLICY "listings_owner_manage" ON public.marketplace_listings FOR ALL TO authenticated
  USING (owner_id = auth.uid() OR public.owns_farm(farm_id))
  WITH CHECK (owner_id = auth.uid() AND public.owns_farm(farm_id));
CREATE INDEX listings_commodity_idx ON public.marketplace_listings (commodity, status);
CREATE INDEX listings_owner_idx ON public.marketplace_listings (owner_id);
CREATE TRIGGER listings_set_updated_at BEFORE UPDATE ON public.marketplace_listings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ MARKETPLACE ORDERS ============
CREATE TABLE public.marketplace_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id uuid NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  quantity numeric(12,2) NOT NULL CHECK (quantity > 0),
  unit text NOT NULL,
  unit_price numeric(12,2) NOT NULL,
  total_amount numeric(14,2) NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  delivery_address text,
  delivery_state text,
  delivery_district text,
  delivery_date date,
  status public.order_status NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketplace_orders TO authenticated;
GRANT ALL ON public.marketplace_orders TO service_role;
ALTER TABLE public.marketplace_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_party_select" ON public.marketplace_orders FOR SELECT TO authenticated
  USING (buyer_id = auth.uid() OR seller_id = auth.uid() OR public.owns_farm(farm_id));
CREATE POLICY "orders_buyer_insert" ON public.marketplace_orders FOR INSERT TO authenticated
  WITH CHECK (buyer_id = auth.uid());
CREATE POLICY "orders_party_update" ON public.marketplace_orders FOR UPDATE TO authenticated
  USING (buyer_id = auth.uid() OR seller_id = auth.uid() OR public.owns_farm(farm_id))
  WITH CHECK (buyer_id = auth.uid() OR seller_id = auth.uid() OR public.owns_farm(farm_id));
CREATE POLICY "orders_party_delete" ON public.marketplace_orders FOR DELETE TO authenticated
  USING (buyer_id = auth.uid() OR seller_id = auth.uid() OR public.owns_farm(farm_id));
CREATE INDEX orders_buyer_idx ON public.marketplace_orders (buyer_id, created_at DESC);
CREATE INDEX orders_seller_idx ON public.marketplace_orders (seller_id, created_at DESC);
CREATE TRIGGER orders_set_updated_at BEFORE UPDATE ON public.marketplace_orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ LOGISTICS PLANS ============
CREATE TABLE public.logistics_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.marketplace_orders(id) ON DELETE CASCADE,
  farm_id uuid NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  pickup_address text NOT NULL,
  pickup_lat double precision,
  pickup_lng double precision,
  dropoff_address text NOT NULL,
  dropoff_lat double precision,
  dropoff_lng double precision,
  distance_km numeric(8,2),
  vehicle_type text,
  weight_kg numeric(10,2),
  estimated_cost numeric(12,2),
  scheduled_at timestamptz,
  carrier_name text,
  carrier_phone text,
  status public.logistics_status NOT NULL DEFAULT 'planned',
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.logistics_plans TO authenticated;
GRANT ALL ON public.logistics_plans TO service_role;
ALTER TABLE public.logistics_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "logistics_party_access" ON public.logistics_plans FOR ALL TO authenticated
  USING (created_by = auth.uid() OR public.owns_farm(farm_id))
  WITH CHECK (created_by = auth.uid() OR public.owns_farm(farm_id));
CREATE TRIGGER logistics_set_updated_at BEFORE UPDATE ON public.logistics_plans
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ WAREHOUSES ============
CREATE TABLE public.warehouses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type public.warehouse_type NOT NULL DEFAULT 'dry_storage',
  address text NOT NULL,
  state text NOT NULL,
  district text,
  pincode text,
  lat double precision,
  lng double precision,
  capacity_kg numeric(14,2) NOT NULL,
  available_kg numeric(14,2) NOT NULL,
  rate_per_kg_per_day numeric(10,4) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'INR',
  features text[] DEFAULT '{}',
  contact_phone text,
  description text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.warehouses TO authenticated;
GRANT ALL ON public.warehouses TO service_role;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "warehouses_browse" ON public.warehouses FOR SELECT TO authenticated
  USING (active = true OR owner_id = auth.uid());
CREATE POLICY "warehouses_owner_manage" ON public.warehouses FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE TRIGGER warehouses_set_updated_at BEFORE UPDATE ON public.warehouses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ WAREHOUSE BOOKINGS ============
CREATE TABLE public.warehouse_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id uuid NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id uuid REFERENCES public.farms(id) ON DELETE SET NULL,
  commodity text NOT NULL,
  quantity_kg numeric(14,2) NOT NULL CHECK (quantity_kg > 0),
  start_date date NOT NULL,
  end_date date NOT NULL,
  rate_per_kg_per_day numeric(10,4) NOT NULL,
  total_cost numeric(14,2) NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  status public.booking_status NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.warehouse_bookings TO authenticated;
GRANT ALL ON public.warehouse_bookings TO service_role;
ALTER TABLE public.warehouse_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wb_party_access" ON public.warehouse_bookings FOR ALL TO authenticated
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.warehouses w WHERE w.id = warehouse_id AND w.owner_id = auth.uid()))
  WITH CHECK (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.warehouses w WHERE w.id = warehouse_id AND w.owner_id = auth.uid()));
CREATE TRIGGER wb_set_updated_at BEFORE UPDATE ON public.warehouse_bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ GOVERNMENT SCHEMES ============
CREATE TABLE public.government_schemes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text UNIQUE,
  name text NOT NULL,
  agency text,
  level text,
  state text,
  category public.scheme_category NOT NULL DEFAULT 'other',
  description text,
  eligibility jsonb DEFAULT '{}'::jsonb,
  benefits text,
  documents_required text[] DEFAULT '{}',
  application_url text,
  helpline text,
  source text NOT NULL DEFAULT 'data.gov.in',
  last_synced_at timestamptz NOT NULL DEFAULT now(),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.government_schemes TO authenticated;
GRANT ALL ON public.government_schemes TO service_role;
ALTER TABLE public.government_schemes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "schemes_read" ON public.government_schemes FOR SELECT TO authenticated USING (active = true);
CREATE TRIGGER schemes_set_updated_at BEFORE UPDATE ON public.government_schemes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX schemes_category_idx ON public.government_schemes (category, state);

-- ============ SCHEME APPLICATIONS ============
CREATE TABLE public.scheme_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id uuid REFERENCES public.farms(id) ON DELETE SET NULL,
  scheme_id uuid NOT NULL REFERENCES public.government_schemes(id) ON DELETE CASCADE,
  status public.application_status NOT NULL DEFAULT 'draft',
  reference_no text,
  notes text,
  submitted_at timestamptz,
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scheme_applications TO authenticated;
GRANT ALL ON public.scheme_applications TO service_role;
ALTER TABLE public.scheme_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "scheme_apps_own" ON public.scheme_applications FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER scheme_apps_set_updated_at BEFORE UPDATE ON public.scheme_applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ LOAN PRODUCTS / APPLICATIONS ============
CREATE TABLE public.loan_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  lender text NOT NULL,
  loan_type text NOT NULL,
  min_amount numeric(14,2),
  max_amount numeric(14,2),
  interest_rate_min numeric(5,2),
  interest_rate_max numeric(5,2),
  tenure_months_min int,
  tenure_months_max int,
  eligibility jsonb DEFAULT '{}'::jsonb,
  documents_required text[] DEFAULT '{}',
  application_url text,
  description text,
  active boolean NOT NULL DEFAULT true,
  source text NOT NULL DEFAULT 'curated',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.loan_products TO authenticated;
GRANT ALL ON public.loan_products TO service_role;
ALTER TABLE public.loan_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "loan_products_read" ON public.loan_products FOR SELECT TO authenticated USING (active = true);
CREATE TRIGGER loan_products_set_updated_at BEFORE UPDATE ON public.loan_products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.loan_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  loan_product_id uuid NOT NULL REFERENCES public.loan_products(id) ON DELETE CASCADE,
  farm_id uuid REFERENCES public.farms(id) ON DELETE SET NULL,
  requested_amount numeric(14,2) NOT NULL,
  tenure_months int,
  purpose text,
  status public.application_status NOT NULL DEFAULT 'draft',
  reference_no text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.loan_applications TO authenticated;
GRANT ALL ON public.loan_applications TO service_role;
ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "loan_apps_own" ON public.loan_applications FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER loan_apps_set_updated_at BEFORE UPDATE ON public.loan_applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ INSURANCE ============
CREATE TABLE public.insurance_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  provider text NOT NULL,
  scheme_code text,
  crops_covered text[] DEFAULT '{}',
  states_covered text[] DEFAULT '{}',
  premium_rate_pct numeric(5,2),
  coverage_details text,
  documents_required text[] DEFAULT '{}',
  application_url text,
  active boolean NOT NULL DEFAULT true,
  source text NOT NULL DEFAULT 'curated',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.insurance_products TO authenticated;
GRANT ALL ON public.insurance_products TO service_role;
ALTER TABLE public.insurance_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "insurance_products_read" ON public.insurance_products FOR SELECT TO authenticated USING (active = true);
CREATE TRIGGER insurance_products_set_updated_at BEFORE UPDATE ON public.insurance_products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.insurance_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id uuid NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.insurance_products(id) ON DELETE SET NULL,
  policy_no text,
  crop text,
  season text,
  sum_insured numeric(14,2),
  premium_paid numeric(14,2),
  start_date date,
  end_date date,
  status public.application_status NOT NULL DEFAULT 'submitted',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.insurance_policies TO authenticated;
GRANT ALL ON public.insurance_policies TO service_role;
ALTER TABLE public.insurance_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "insurance_policies_own" ON public.insurance_policies FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.owns_farm(farm_id))
  WITH CHECK (user_id = auth.uid());
CREATE TRIGGER insurance_policies_set_updated_at BEFORE UPDATE ON public.insurance_policies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ SUSTAINABILITY + CARBON ============
CREATE TABLE public.sustainability_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  overall_score numeric(5,2) NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  water_score numeric(5,2),
  soil_score numeric(5,2),
  biodiversity_score numeric(5,2),
  carbon_score numeric(5,2),
  breakdown jsonb DEFAULT '{}'::jsonb,
  rating text,
  computed_by text NOT NULL DEFAULT 'rule_engine',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (farm_id, period_start, period_end)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sustainability_scores TO authenticated;
GRANT ALL ON public.sustainability_scores TO service_role;
ALTER TABLE public.sustainability_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sust_scores_farm" ON public.sustainability_scores FOR ALL TO authenticated
  USING (public.can_access_farm(farm_id)) WITH CHECK (public.can_manage_farm(farm_id));
CREATE TRIGGER sust_scores_set_updated_at BEFORE UPDATE ON public.sustainability_scores
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.carbon_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  source public.carbon_source NOT NULL,
  occurred_on date NOT NULL,
  emissions_kg_co2e numeric(12,2) NOT NULL DEFAULT 0,
  sequestration_kg_co2e numeric(12,2) NOT NULL DEFAULT 0,
  activity text,
  quantity numeric(12,4),
  unit text,
  details jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.carbon_records TO authenticated;
GRANT ALL ON public.carbon_records TO service_role;
ALTER TABLE public.carbon_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "carbon_records_farm" ON public.carbon_records FOR ALL TO authenticated
  USING (public.can_access_farm(farm_id)) WITH CHECK (public.can_manage_farm(farm_id));
CREATE TRIGGER carbon_records_set_updated_at BEFORE UPDATE ON public.carbon_records
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX carbon_records_farm_date_idx ON public.carbon_records (farm_id, occurred_on DESC);

-- ============ PUSH SUBSCRIPTIONS ============
CREATE TABLE public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  device_label text,
  user_agent text,
  active boolean NOT NULL DEFAULT true,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_subscriptions TO authenticated;
GRANT ALL ON public.push_subscriptions TO service_role;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "push_subs_own" ON public.push_subscriptions FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER push_subs_set_updated_at BEFORE UPDATE ON public.push_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ ADMIN AUDIT LOG ============
CREATE TABLE public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_table text,
  target_id uuid,
  payload jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.admin_audit_log TO authenticated;
GRANT ALL ON public.admin_audit_log TO service_role;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_admins_read" ON public.admin_audit_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "audit_self_insert" ON public.admin_audit_log FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid());
