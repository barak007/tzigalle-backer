-- Convert order items back to old format with fixed prices
-- This migration converts from: { "Bread Name": quantity }
-- To: [{ breadId: number, name: string, quantity: number, price: number }]

-- First, let's see what we have currently
-- SELECT id, items FROM orders WHERE items::text LIKE '{%' LIMIT 5;

-- Helper function to get bread price by name
CREATE OR REPLACE FUNCTION get_bread_price(bread_name text)
RETURNS integer AS $$
DECLARE
  price integer;
BEGIN
  -- Parse category and bread name from format "Category - Bread Name"
  CASE
    WHEN bread_name LIKE 'לחם חיטה מלאה%' THEN price := 24;
    WHEN bread_name LIKE 'לחם זרעים%' THEN price := 28;
    WHEN bread_name LIKE 'לחם כוסמין%' THEN price := 28;
    WHEN bread_name LIKE 'לחם ארבעה קמחים%' THEN price := 28;
    ELSE price := 0; -- Fallback
  END CASE;

  RETURN price;
END;
$$ LANGUAGE plpgsql;

-- Convert orders that use the new format (object) to old format (array)
UPDATE orders
SET items = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'breadId', 0, -- We don't have the original breadId, so use 0
      'name', key,
      'quantity', value,
      'price', get_bread_price(key)
    )
  )
  FROM jsonb_object_keys(items) AS key,
       jsonb_extract_path(items, key) AS value
  WHERE jsonb_typeof(items) = 'object'
    AND NOT jsonb_typeof(items) = 'array'
)
WHERE jsonb_typeof(items) = 'object'
  AND NOT jsonb_typeof(items) = 'array';

-- Drop the helper function
DROP FUNCTION get_bread_price(text);

-- Add comment to document the format
COMMENT ON COLUMN orders.items IS 'Order items in format: [{breadId: number, name: string, quantity: number, price: number}]';