-- Fix function search path security issues
DROP FUNCTION public.update_plugin_rating();
DROP FUNCTION public.increment_download_count();

-- Recreate functions with proper security settings
CREATE OR REPLACE FUNCTION public.update_plugin_rating()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.increment_download_count()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Increment actual download count
  UPDATE plugins 
  SET download_count = COALESCE(download_count, 0) + 1,
      downloads = COALESCE(download_count, 0) + 1, -- Keep legacy field in sync
      updated_at = now()
  WHERE id = NEW.plugin_id;
  
  RETURN NEW;
END;
$$;

-- Recreate the triggers
CREATE TRIGGER update_plugin_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.plugin_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_plugin_rating();

CREATE TRIGGER increment_download_count_trigger
AFTER UPDATE ON public.plugin_downloads
FOR EACH ROW
WHEN (OLD.downloaded_at IS NULL AND NEW.downloaded_at IS NOT NULL)
EXECUTE FUNCTION public.increment_download_count();