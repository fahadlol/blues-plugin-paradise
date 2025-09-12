-- Create function to increment coupon usage count
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(coupon_code TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  UPDATE discounts 
  SET used_count = COALESCE(used_count, 0) + 1,
      updated_at = now()
  WHERE code = coupon_code;
END;
$function$;