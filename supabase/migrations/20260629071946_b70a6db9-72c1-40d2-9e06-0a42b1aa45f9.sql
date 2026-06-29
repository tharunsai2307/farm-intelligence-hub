CREATE OR REPLACE FUNCTION public.prevent_marketplace_order_field_tamper()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.unit_price IS DISTINCT FROM OLD.unit_price
     OR NEW.total_amount IS DISTINCT FROM OLD.total_amount
     OR NEW.currency IS DISTINCT FROM OLD.currency
     OR NEW.quantity IS DISTINCT FROM OLD.quantity
     OR NEW.unit IS DISTINCT FROM OLD.unit
     OR NEW.listing_id IS DISTINCT FROM OLD.listing_id
     OR NEW.buyer_id IS DISTINCT FROM OLD.buyer_id
     OR NEW.seller_id IS DISTINCT FROM OLD.seller_id
     OR NEW.farm_id IS DISTINCT FROM OLD.farm_id
  THEN
    RAISE EXCEPTION 'Cannot modify immutable order fields (pricing, parties, listing, quantity)';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_marketplace_order_field_tamper ON public.marketplace_orders;
CREATE TRIGGER trg_prevent_marketplace_order_field_tamper
  BEFORE UPDATE ON public.marketplace_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_marketplace_order_field_tamper();