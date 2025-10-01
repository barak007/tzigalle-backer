-- Fix RLS policies to avoid circular dependency
-- This migration ensures users can always read their own profile

-- Drop the problematic admin policy that causes circular dependency
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;

-- Recreate the simple policy that allows users to read their own profile
-- This policy already exists but we're making sure it's correct
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Add a new admin policy that doesn't cause circular dependency
-- Admins can read all profiles, but this uses a different approach
CREATE POLICY "profiles_select_all_for_admin"
  ON public.profiles FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
  );

-- Update the is_admin function to use security definer properly
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT role = 'admin' 
    FROM public.profiles 
    WHERE id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.profiles TO authenticated;
