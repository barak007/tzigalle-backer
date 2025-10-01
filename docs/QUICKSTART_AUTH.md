# Quick Start Guide - User Authentication

## 🚀 Getting Started (5 minutes)

### Step 1: Apply Database Migrations

Run migrations to add user authentication to your database:

```bash
# Make sure you're in the project directory
cd /Users/barakigal/projects/tzigla-bakery

# Apply migrations using Supabase CLI
npx supabase db push
```

Or manually in Supabase Dashboard:
1. Go to: https://supabase.com/dashboard/project/rftpwqpxcanosgnqxqyv/sql
2. Open and run each file in `supabase/migrations/` (files 06, 07, 08)

### Step 2: Configure Google OAuth (Optional)

If you want Google sign-in:

1. Go to: https://supabase.com/dashboard/project/rftpwqpxcanosgnqxqyv/auth/providers
2. Click on **Google** provider
3. Enable it and add your OAuth credentials

**Don't have Google OAuth credentials?** Users can still sign up with email/password!

### Step 3: Start Development Server

```bash
npm run dev
```

### Step 4: Test the Features

1. **As Guest:**
   - Go to http://localhost:3000
   - Add items to cart
   - Try to order → You'll be asked to sign up

2. **Sign Up:**
   - Click "Sign Up" or fill order and submit
   - Create account with email/password
   - You'll be redirected back to complete your order

3. **Place Order:**
   - Submit your order
   - View it in "My Orders"

4. **Admin:**
   - Go to http://localhost:3000/admin/login
   - Login with admin credentials
   - See all orders

## ✅ What Was Implemented

### New Pages
- `/signup` - User registration
- `/login` - User login
- `/orders` - User's order history
- `/auth/callback` - OAuth handler

### Updated Pages
- Home page now checks authentication before orders
- Layout has user navigation with profile dropdown
- Admin login remains separate and admin-only

### Database Changes
- Orders now linked to users via `user_id`
- Profiles have `role` field ('user' or 'admin')
- RLS policies ensure users only see their own data

## 🔧 Common Tasks

### Create a New Admin User
```bash
npm run create-admin
# Follow the prompts
```

### Check User Roles
```bash
npm run check-admin
```

### Test the System
```bash
# Run dev server
npm run dev

# In another terminal, check for errors
npm run build
```

## 📖 Documentation

- Full implementation details: `IMPLEMENTATION_COMPLETE.md`
- Original plan: `USER_AUTH_IMPLEMENTATION.md`
- Admin setup: `ADMIN_SETUP.md`

## 🆘 Troubleshooting

### "Can't submit order"
- Make sure you're logged in
- Check browser console for errors
- Verify migrations were applied

### "Can't log in with Google"
- Verify Google OAuth is configured in Supabase
- Check redirect URIs are correct
- Email/password login should still work

### "User can't see orders"
- Check RLS policies are applied (migration 07)
- Verify user_id is being set on orders
- Check browser console for errors

### "Admin panel not working"
- Admin functionality is unchanged
- Use existing admin scripts to verify admin access
- Check `scripts/check-admin.ts` for your admin status

## 🎉 You're Done!

Your bakery now has:
- ✅ User authentication (email/password + Google)
- ✅ User-specific order history
- ✅ Secure order placement
- ✅ Protected routes
- ✅ Maintained admin functionality

Start the server and try it out! 🥖
