-- Fix Issue #12: Profile Creation Trigger Has Wrong Default Role
-- Update the trigger function to use 'customer' instead of 'user'

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'customer'  -- ✅ Changed from 'user' to 'customer'
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, just return
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix existing users with 'user' role to 'customer'
UPDATE profiles 
SET role = 'customer' 
WHERE role = 'user';
