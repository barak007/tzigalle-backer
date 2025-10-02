-- Fix RLS policies to avoid performance issues with EXISTS subquery
-- Replace with direct SELECT pattern similar to is_admin() function

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;

-- Users can view their own orders, admins can view all
-- Using direct SELECT instead of EXISTS for better performance
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (
    auth.uid() = user_id OR
    (SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
  );

-- Users can update their own orders (for cancellation), admins can update all
-- Using direct SELECT instead of EXISTS for better performance
CREATE POLICY "Users can update own orders"
  ON orders FOR UPDATE
  USING (
    auth.uid() = user_id OR
    (SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
  );

-- Also add DELETE policy for admins (might be needed in future)
DROP POLICY IF EXISTS "Admins can delete orders" ON orders;
CREATE POLICY "Admins can delete orders"
  ON orders FOR DELETE
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
  );
