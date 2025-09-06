-- Create reviews table for accurate ratings
CREATE TABLE public.plugin_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plugin_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  order_id UUID, -- Only verified purchasers can review
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_verified_purchase BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(plugin_id, customer_id) -- One review per user per plugin
);

-- Enable RLS
ALTER TABLE public.plugin_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reviews
CREATE POLICY "Everyone can view approved reviews"
ON public.plugin_reviews FOR SELECT
USING (true);

CREATE POLICY "Verified purchasers can create reviews"
ON public.plugin_reviews FOR INSERT
WITH CHECK (
  auth.uid() = customer_id AND
  customer_id IS NOT NULL AND
  -- Must have purchased the plugin
  EXISTS (
    SELECT 1 FROM orders 
    WHERE customer_id = auth.uid() 
    AND status IN ('paid', 'completed')
    AND items::jsonb @> json_build_array(json_build_object('plugin_id', plugin_id::text))::jsonb
  )
);

CREATE POLICY "Users can update their own reviews"
ON public.plugin_reviews FOR UPDATE
USING (auth.uid() = customer_id AND customer_id IS NOT NULL)
WITH CHECK (auth.uid() = customer_id AND customer_id IS NOT NULL);

CREATE POLICY "Users can delete their own reviews"
ON public.plugin_reviews FOR DELETE
USING (auth.uid() = customer_id AND customer_id IS NOT NULL);

CREATE POLICY "Staff can manage all reviews"
ON public.plugin_reviews FOR ALL
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::app_role, 'staff'::app_role]));

-- Add updated_at trigger
CREATE TRIGGER update_plugin_reviews_updated_at
BEFORE UPDATE ON public.plugin_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update plugin ratings from reviews
CREATE OR REPLACE FUNCTION public.update_plugin_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the plugin's rating based on all reviews
  UPDATE plugins 
  SET rating = (
    SELECT ROUND(AVG(rating::numeric), 1) 
    FROM plugin_reviews 
    WHERE plugin_id = COALESCE(NEW.plugin_id, OLD.plugin_id)
  ),
  updated_at = now()
  WHERE id = COALESCE(NEW.plugin_id, OLD.plugin_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update plugin rating when reviews change
CREATE TRIGGER update_plugin_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.plugin_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_plugin_rating();

-- Function to increment download count
CREATE OR REPLACE FUNCTION public.increment_download_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment actual download count
  UPDATE plugins 
  SET download_count = COALESCE(download_count, 0) + 1,
      downloads = COALESCE(download_count, 0) + 1, -- Keep legacy field in sync
      updated_at = now()
  WHERE id = NEW.plugin_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update download count when someone actually downloads
CREATE TRIGGER increment_download_count_trigger
AFTER UPDATE ON public.plugin_downloads
FOR EACH ROW
WHEN (OLD.downloaded_at IS NULL AND NEW.downloaded_at IS NOT NULL)
EXECUTE FUNCTION public.increment_download_count();

-- Reset current fake download counts to match actual downloads
UPDATE plugins 
SET downloads = COALESCE(download_count, 0),
    rating = 0.0 -- Reset ratings until real reviews come in
WHERE id IN (
  SELECT id FROM plugins
);