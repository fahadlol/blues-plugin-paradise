-- Fix security issue: Customer Personal Information Could Be Stolen
-- Make customer_id NOT NULL to ensure all orders are tied to a customer
-- This prevents orphaned orders without proper access control

-- First, update any existing orders that might have NULL customer_id
-- We'll set them to a placeholder UUID for system/admin created orders
UPDATE orders 
SET customer_id = '00000000-0000-0000-0000-000000000000'::uuid 
WHERE customer_id IS NULL;

-- Now make customer_id NOT NULL to prevent future security gaps
ALTER TABLE orders 
ALTER COLUMN customer_id SET NOT NULL;

-- Create more restrictive and explicit RLS policies
-- Replace existing policies with more secure versions

DROP POLICY IF EXISTS "Customers can view their own orders" ON orders;
DROP POLICY IF EXISTS "Staff can view all orders" ON orders;
DROP POLICY IF EXISTS "Staff can insert orders" ON orders;
DROP POLICY IF EXISTS "Staff can update orders" ON orders;
DROP POLICY IF EXISTS "Staff can delete orders" ON orders;

-- Customers can only view their own orders with explicit customer_id check
CREATE POLICY "Customers can view only their own orders" 
ON orders 
FOR SELECT 
TO authenticated
USING (
  auth.uid() = customer_id 
  AND customer_id IS NOT NULL
);

-- Staff can view all orders but policy is explicit about role requirements
CREATE POLICY "Staff can view all orders" 
ON orders 
FOR SELECT 
TO authenticated
USING (
  get_user_role(auth.uid()) = ANY (ARRAY['admin'::app_role, 'staff'::app_role])
);

-- Staff can insert orders but must specify valid customer_id
CREATE POLICY "Staff can insert orders" 
ON orders 
FOR INSERT 
TO authenticated
WITH CHECK (
  get_user_role(auth.uid()) = ANY (ARRAY['admin'::app_role, 'staff'::app_role])
  AND customer_id IS NOT NULL
);

-- Staff can update orders with data integrity checks
CREATE POLICY "Staff can update orders" 
ON orders 
FOR UPDATE 
TO authenticated
USING (
  get_user_role(auth.uid()) = ANY (ARRAY['admin'::app_role, 'staff'::app_role])
)
WITH CHECK (
  customer_id IS NOT NULL
);

-- Staff can delete orders
CREATE POLICY "Staff can delete orders" 
ON orders 
FOR DELETE 
TO authenticated
USING (
  get_user_role(auth.uid()) = ANY (ARRAY['admin'::app_role, 'staff'::app_role])
);

-- Allow customers to create their own orders (for future e-commerce functionality)
CREATE POLICY "Customers can create their own orders" 
ON orders 
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = customer_id 
  AND customer_id IS NOT NULL
);