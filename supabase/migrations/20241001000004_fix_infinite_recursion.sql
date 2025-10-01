-- Fix infinite recursion in RLS policies
-- The issue: policies were trying to read from profiles table to check if user is admin,
-- but reading from profiles requires the policy to pass first - circular dependency!

-- Drop all existing policies on profiles
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_all_for_admin" ON public.profiles;

-- Create a simple policy that allows users to read their own profile
-- This is the ONLY policy needed for profiles table
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- For INSERT/UPDATE/DELETE on profiles, we'll only allow service role
-- (which bypasses RLS) to modify profiles
-- This means only the add-admin script can modify roles

-- Update the is_admin function to NOT query the profiles table directly
-- Instead, we'll use a more efficient approach with a direct query
-- We use CREATE OR REPLACE instead of DROP to avoid dependency issues
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
DECLARE
  user_role text;
BEGIN
  -- Get the role directly without triggering RLS
  -- SECURITY DEFINER means this runs with the privileges of the function owner
  -- This bypasses RLS and prevents infinite recursion
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role = 'admin', false);
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Ensure the function has proper search path
ALTER FUNCTION public.is_admin() SET search_path = public;

-- Make sure authenticated users can read from profiles
GRANT SELECT ON public.profiles TO authenticated;
