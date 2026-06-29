
-- Drop the unsafe insert policy and revoke direct insert
DROP POLICY IF EXISTS "orders_buyer_insert" ON public.marketplace_orders;
REVOKE INSERT ON public.marketplace_orders FROM authenticated;

-- Positive amount checks
ALTER TABLE public.marketplace_orders
  DROP CONSTRAINT IF EXISTS marketplace_orders_unit_price_check;
ALTER TABLE public.marketplace_orders
  ADD CONSTRAINT marketplace_orders_unit_price_check CHECK (unit_price > 0);
ALTER TABLE public.marketplace_orders
  DROP CONSTRAINT IF EXISTS marketplace_orders_total_amount_check;
ALTER TABLE public.marketplace_orders
  ADD CONSTRAINT marketplace_orders_total_amount_check CHECK (total_amount > 0);

-- Secure RPC to place an order, sourcing trusted fields from the listing
CREATE OR REPLACE FUNCTION public.place_order(
  _listing_id uuid,
  _quantity numeric,
  _delivery_address text DEFAULT NULL,
  _delivery_state text DEFAULT NULL,
  _delivery_district text DEFAULT NULL,
  _delivery_date date DEFAULT NULL,
  _notes text DEFAULT NULL
) RETURNS public.marketplace_orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_listing public.marketplace_listings%ROWTYPE;
  v_order public.marketplace_orders%ROWTYPE;
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF _quantity IS NULL OR _quantity <= 0 THEN
    RAISE EXCEPTION 'Quantity must be greater than zero';
  END IF;

  SELECT * INTO v_listing FROM public.marketplace_listings WHERE id = _listing_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Listing not found';
  END IF;
  IF v_listing.status <> 'active' THEN
    RAISE EXCEPTION 'Listing is not active';
  END IF;
  IF v_listing.owner_id = v_uid THEN
    RAISE EXCEPTION 'Cannot order your own listing';
  END IF;
  IF v_listing.price_per_unit IS NULL OR v_listing.price_per_unit <= 0 THEN
    RAISE EXCEPTION 'Listing price is invalid';
  END IF;

  INSERT INTO public.marketplace_orders (
    listing_id, buyer_id, seller_id, farm_id,
    quantity, unit, unit_price, total_amount, currency,
    delivery_address, delivery_state, delivery_district, delivery_date, notes
  ) VALUES (
    v_listing.id, v_uid, v_listing.owner_id, v_listing.farm_id,
    _quantity, v_listing.unit, v_listing.price_per_unit,
    ROUND(_quantity * v_listing.price_per_unit, 2),
    COALESCE(v_listing.currency, 'INR'),
    _delivery_address, _delivery_state, _delivery_district, _delivery_date, _notes
  ) RETURNING * INTO v_order;

  RETURN v_order;
END;
$$;

REVOKE ALL ON FUNCTION public.place_order(uuid, numeric, text, text, text, date, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_order(uuid, numeric, text, text, text, date, text) TO authenticated;
