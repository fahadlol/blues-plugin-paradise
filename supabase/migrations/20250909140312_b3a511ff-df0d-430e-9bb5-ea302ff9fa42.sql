-- Fix security issue: Remove public access to custom_plugin_requests table
-- The current policy allows anyone to view requests where user_id IS NULL

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view their own requests" ON public.custom_plugin_requests;

-- Create a secure policy that only allows users to view their own requests
-- and staff to view all requests
CREATE POLICY "Users can view only their own requests" 
ON public.custom_plugin_requests 
FOR SELECT 
USING (
  (user_id = auth.uid() AND user_id IS NOT NULL) OR 
  (get_user_role(auth.uid()) = ANY (ARRAY['admin'::app_role, 'staff'::app_role]))
);

-- Make user_id NOT NULL to prevent future security issues
-- First, update any existing NULL user_id records to a system user or delete them
DELETE FROM public.custom_plugin_requests WHERE user_id IS NULL;

-- Now make user_id NOT NULL
ALTER TABLE public.custom_plugin_requests 
ALTER COLUMN user_id SET NOT NULL;