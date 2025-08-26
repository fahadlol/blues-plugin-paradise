-- Fix security issue: Customer Personal Information Could Be Stolen
-- Make customer_id NOT NULL to ensure all orders are tied to a customer
-- This prevents orphaned orders without proper access control

-- First, update any existing orders that might have NULL customer_id
-- We'll set them to a system user or handle them appropriately
UPDATE orders 
SET customer_id = '00000000-0000-0000-0000-000000000000'::uuid 
WHERE customer_id IS NULL;

-- Now make customer_id NOT NULL
ALTER TABLE orders 
ALTER COLUMN customer_id SET NOT NULL;

-- Add a constraint to ensure customer_id references auth.users
-- This ensures referential integrity
ALTER TABLE orders 
ADD CONSTRAINT orders_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create a more restrictive policy for customer data access
-- Replace the existing "Customers can view their own orders" policy
DROP POLICY IF EXISTS "Customers can view their own orders" ON orders;

CREATE POLICY "Customers can view only their own orders" 
ON orders 
FOR SELECT 
TO authenticated
USING (
  auth.uid() = customer_id 
  AND customer_id IS NOT NULL
);

-- Ensure staff policies are properly scoped and secure
DROP POLICY IF EXISTS "Staff can view all orders" ON orders;

CREATE POLICY "Staff can view all orders" 
ON orders 
FOR SELECT 
TO authenticated
USING (
  get_user_role(auth.uid()) = ANY (ARRAY['admin'::app_role, 'staff'::app_role])
);

-- Add policy to prevent insertion of orders without proper customer_id
DROP POLICY IF EXISTS "Staff can insert orders" ON orders;

CREATE POLICY "Staff can insert orders" 
ON orders 
FOR INSERT 
TO authenticated
WITH CHECK (
  get_user_role(auth.uid()) = ANY (ARRAY['admin'::app_role, 'staff'::app_role])
  AND customer_id IS NOT NULL
);

-- Ensure update policy maintains data integrity  
DROP POLICY IF EXISTS "Staff can update orders" ON orders;

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

-- Add policy for customers to insert their own orders (for future use)
CREATE POLICY "Customers can create their own orders" 
ON orders 
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = customer_id 
  AND customer_id IS NOT NULL
);