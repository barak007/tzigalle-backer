-- CRITICAL FIX: Remove old permissive RLS policies that conflict with new secure ones
-- 
-- PROBLEM: Migration 001 created permissive policies that allow ANYONE to access orders
-- Migration 007 created strict policies but didn't remove the old ones
-- PostgreSQL grants access if ANY policy allows it, so old policies override new ones
--
-- IMPACT: Users can currently see ALL orders, not just their own
--
-- This migration removes the old insecure policies

-- Drop the old permissive policies from migration 001
DROP POLICY IF EXISTS "orders_insert_public" ON orders;
DROP POLICY IF EXISTS "orders_select_all" ON orders;
DROP POLICY IF EXISTS "orders_update_all" ON orders;

-- Verify current policies (for documentation)
-- After this migration, only these policies should exist:
-- 1. "Users can view own orders" - SELECT restricted to user_id or admin
-- 2. "Users can insert own orders" - INSERT requires user_id match
-- 3. "Admins can update orders" - UPDATE requires admin role

-- Test query to verify policies:
-- SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'orders';
