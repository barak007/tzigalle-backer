# Admin Security Setup Guide

## Overview

The admin panel is now secured with authentication and role-based access control. Only users with the "admin" role can access the admin dashboard and modify orders.

## Security Features Implemented

1. **Authentication Required**: Admin routes require login via Supabase Auth
2. **Role-Based Access Control**: Only users with "admin" role can access admin features
3. **Row Level Security (RLS)**: Database policies ensure:
   - Anyone can INSERT orders (customers placing orders)
   - Only admins can SELECT, UPDATE, and DELETE orders
4. **Middleware Protection**: `/admin` routes are protected at the application level
5. **Logout Functionality**: Admins can securely log out

## Setup Instructions

### Step 1: Run the Database Migration

Run the security migration script in your Supabase SQL Editor:

```bash
# Option 1: Using the migration script (recommended)
npm run migrate:security

# Option 2: Manually copy the contents of scripts/002_add_admin_security.sql
# and run it in the Supabase SQL Editor at:
# https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql
```

### Step 2: Create Your First Admin User

1. **Sign up through Supabase Dashboard**:

   - Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/auth/users
   - Click "Add user" → "Create new user"
   - Enter your email and password
   - Click "Create user"

2. **Set the user as admin**:
   After creating the user, run this SQL in the Supabase SQL Editor:

   ```sql
   -- Replace 'your-email@example.com' with your actual email
   insert into public.profiles (id, email, role)
   values (
     (select id from auth.users where email = 'your-email@example.com'),
     'your-email@example.com',
     'admin'
   )
   on conflict (id) do update set role = 'admin';
   ```

### Step 3: Test the Setup

1. Navigate to `/admin` - you should be redirected to `/admin/login`
2. Log in with your admin credentials
3. You should now have access to the admin dashboard
4. Regular users without admin role will be redirected to the home page

## Usage

### Admin Login

- URL: `/admin/login`
- Enter your email and password
- Only users with "admin" role can access the dashboard

### Customer Orders

- URL: `/` (home page)
- Customers can still place orders without authentication
- Orders are created with "pending" status

### Admin Dashboard

- URL: `/admin`
- View all orders
- Filter by status
- Update order status
- View customer details and order items
- Logout functionality

## Security Notes

- ✅ Public can INSERT orders (customer orders)
- ✅ Only admins can SELECT orders (view dashboard)
- ✅ Only admins can UPDATE orders (change status)
- ✅ Only admins can DELETE orders
- ✅ Middleware protects admin routes before they load
- ✅ Database RLS provides additional security layer
- ✅ Automatic profile creation for new users (default role: "customer")

## Adding More Admins

To add more admin users:

1. Have them sign up through your app or create them in Supabase Dashboard
2. Run this SQL to promote them to admin:

```sql
update public.profiles
set role = 'admin'
where email = 'new-admin@example.com';
```

## Troubleshooting

### "Row-level security" error

- Make sure you've run the migration script
- Verify the user has admin role in the profiles table
- Try logging out and back in

### Can't access admin dashboard

- Check if you're logged in: look for the auth cookie
- Verify your profile has role = 'admin'
- Check browser console for errors

### Orders not showing

- Verify the RLS policies are set correctly
- Check if the user session is valid
- Try refreshing the page

## File Changes Made

1. **`scripts/002_add_admin_security.sql`**: Database migration for security
2. **`app/admin/login/page.tsx`**: New admin login page
3. **`app/admin/page.tsx`**: Updated with logout and auth handling
4. **`middleware.ts`**: Added route protection for `/admin` paths
5. **`scripts/setup-admin.ts`**: Helper script to create admin users
6. **`ADMIN_SETUP.md`**: This guide

## Environment Variables

Make sure these are set in your `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
