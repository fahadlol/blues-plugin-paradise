-- Create storage buckets for file management
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('plugin-files', 'plugin-files', false),
  ('plugin-previews', 'plugin-previews', true);

-- Create storage policies for plugin files (private)
CREATE POLICY "Staff can upload plugin files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'plugin-files' AND 
  get_user_role(auth.uid()) = ANY(ARRAY['admin'::app_role, 'staff'::app_role])
);

CREATE POLICY "Staff can update plugin files" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'plugin-files' AND 
  get_user_role(auth.uid()) = ANY(ARRAY['admin'::app_role, 'staff'::app_role])
);

CREATE POLICY "Staff can delete plugin files" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'plugin-files' AND 
  get_user_role(auth.uid()) = ANY(ARRAY['admin'::app_role, 'staff'::app_role])
);

-- Create storage policies for plugin previews (public)
CREATE POLICY "Anyone can view plugin previews" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'plugin-previews');

CREATE POLICY "Staff can upload plugin previews" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'plugin-previews' AND 
  get_user_role(auth.uid()) = ANY(ARRAY['admin'::app_role, 'staff'::app_role])
);

CREATE POLICY "Staff can update plugin previews" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'plugin-previews' AND 
  get_user_role(auth.uid()) = ANY(ARRAY['admin'::app_role, 'staff'::app_role])
);

CREATE POLICY "Staff can delete plugin previews" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'plugin-previews' AND 
  get_user_role(auth.uid()) = ANY(ARRAY['admin'::app_role, 'staff'::app_role])
);

-- Add file management columns to plugins table
ALTER TABLE public.plugins 
ADD COLUMN file_path text,
ADD COLUMN file_version integer DEFAULT 1,
ADD COLUMN file_size bigint,
ADD COLUMN download_count integer DEFAULT 0;

-- Create plugin_downloads tracking table
CREATE TABLE public.plugin_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plugin_id uuid NOT NULL REFERENCES public.plugins(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  download_url text NOT NULL,
  expires_at timestamptz NOT NULL,
  downloaded_at timestamptz,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on plugin_downloads
ALTER TABLE public.plugin_downloads ENABLE ROW LEVEL SECURITY;

-- Plugin downloads policies
CREATE POLICY "Customers can view their own download links" 
ON public.plugin_downloads 
FOR SELECT 
USING (customer_id = auth.uid() AND expires_at > now());

CREATE POLICY "Staff can manage all download links" 
ON public.plugin_downloads 
FOR ALL 
USING (get_user_role(auth.uid()) = ANY(ARRAY['admin'::app_role, 'staff'::app_role]));

-- Create function to generate secure download URLs
CREATE OR REPLACE FUNCTION public.create_download_link(
  p_plugin_id uuid,
  p_customer_id uuid,
  p_order_id uuid,
  p_expires_hours integer DEFAULT 24
) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  download_id uuid;
  secure_token text;
BEGIN
  -- Generate unique download ID and secure token
  download_id := gen_random_uuid();
  secure_token := encode(gen_random_bytes(32), 'hex');
  
  -- Insert download record
  INSERT INTO plugin_downloads (
    id,
    plugin_id,
    customer_id,
    order_id,
    download_url,
    expires_at
  ) VALUES (
    download_id,
    p_plugin_id,
    p_customer_id,
    p_order_id,
    secure_token,
    now() + (p_expires_hours || ' hours')::interval
  );
  
  RETURN download_id || '::' || secure_token;
END;
$$;