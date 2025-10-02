-- Add performance indexes for frequently queried columns
-- These indexes improve query performance for common operations

-- Index on delivery_date for filtering and sorting orders by delivery date
-- Used by admin dashboard when viewing orders by date
CREATE INDEX IF NOT EXISTS idx_orders_delivery_date ON orders(delivery_date);

-- Index on profiles.role for RLS policy checks
-- This is heavily used in RLS policies to check if user is admin
-- Every SELECT/UPDATE/DELETE on orders table checks this
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Composite index for common query patterns
-- Used when filtering orders by both status and delivery date
CREATE INDEX IF NOT EXISTS idx_orders_status_delivery_date ON orders(status, delivery_date);

-- Index on user_id and status for user's order history queries
-- Useful when users want to see their own orders filtered by status
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status) WHERE user_id IS NOT NULL;
