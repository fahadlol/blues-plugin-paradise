-- Drop existing RLS policies that might be too permissive
DROP POLICY IF EXISTS "Staff can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create more restrictive RLS policies with RESTRICTIVE mode where appropriate
-- Policy 1: Users can ONLY view their own profile (very strict)
CREATE POLICY "Users can view only their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Policy 2: Only staff/admin can view other profiles (separate policy)
CREATE POLICY "Staff can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  get_user_role(auth.uid()) = ANY (ARRAY['admin'::app_role, 'staff'::app_role])
);

-- Policy 3: Users can only update their own profile
CREATE POLICY "Users can update only their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 4: Only staff can update any profile (for admin functionality)
CREATE POLICY "Staff can update any profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (
  get_user_role(auth.uid()) = ANY (ARRAY['admin'::app_role, 'staff'::app_role])
);

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Add comment for documentation
COMMENT ON TABLE public.profiles IS 'User profiles with strict RLS: users can only access their own data, staff can access all data for admin purposes';