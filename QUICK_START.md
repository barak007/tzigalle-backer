# 🔒 Admin Security - Quick Start

## ✅ What's Been Done

Your admin panel is now fully secured! Here's what was implemented:

### Security Features

- ✅ **Login Required**: Admin dashboard requires authentication
- ✅ **Role-Based Access**: Only users with "admin" role can access
- ✅ **Database Security**: Row-Level Security (RLS) policies protect data
- ✅ **Middleware Protection**: Routes protected at application level
- ✅ **Logout Button**: Secure logout functionality added

### Files Created/Modified

1. `scripts/002_add_admin_security.sql` - Database security migration
2. `app/admin/login/page.tsx` - New admin login page
3. `app/admin/page.tsx` - Updated with auth and logout
4. `middleware.ts` - Protected admin routes
5. `ADMIN_SETUP.md` - Detailed setup guide
6. `package.json` - Added setup scripts

---

## 🚀 Setup (3 Steps)

### Step 1: Run the Database Migration

Open your Supabase SQL Editor and run the migration:

- Go to: https://supabase.com/dashboard/project/rftpwqpxcanosgnqxqyv/sql
- Copy the contents of `scripts/002_add_admin_security.sql`
- Paste and click "Run"

### Step 2: Create Your Admin User

In the same SQL Editor, run this (replace with your email):

```sql
-- First, create the user in Supabase Auth Dashboard or sign up through the app
-- Then run this to make them admin:

insert into public.profiles (id, email, role)
values (
  (select id from auth.users where email = 'YOUR_EMAIL@example.com'),
  'YOUR_EMAIL@example.com',
  'admin'
)
on conflict (id) do update set role = 'admin';
```

**OR** create the user through Supabase Dashboard:

1. Go to: https://supabase.com/dashboard/project/rftpwqpxcanosgnqxqyv/auth/users
2. Click "Add user" → "Create new user"
3. Enter email and password
4. Then run the SQL above to set admin role

### Step 3: Test It!

1. Navigate to `/admin` - should redirect to login
2. Log in with your admin credentials
3. Access granted! 🎉

---

## 🔐 How It Works

### For Customers (No Change)

- Can visit homepage and place orders ✅
- No login required ✅
- Orders are saved to database ✅

### For Admins (Now Protected)

- Must log in at `/admin/login` 🔒
- Only "admin" role users can view orders 🔒
- Only "admin" role users can update order status 🔒
- Can log out securely 🔒

### Security Layers

**Layer 1 - Middleware**: Checks authentication before page loads
**Layer 2 - Database RLS**: Enforces permissions at database level
**Layer 3 - Role Check**: Verifies admin role exists

---

## 📱 Usage

### Admin Login

```
URL: /admin/login
```

Enter your email and password created in Step 2.

### Admin Dashboard

```
URL: /admin
```

View and manage all orders (only accessible after login).

### Customer Orders

```
URL: /
```

Public - anyone can place orders (no change in behavior).

---

## 🔧 Adding More Admins

To add another admin user:

```sql
-- Option 1: Promote existing user
update public.profiles
set role = 'admin'
where email = 'new-admin@example.com';

-- Option 2: Create new admin user (after they sign up)
insert into public.profiles (id, email, role)
values (
  (select id from auth.users where email = 'new-admin@example.com'),
  'new-admin@example.com',
  'admin'
)
on conflict (id) do update set role = 'admin';
```

---

## 🆘 Troubleshooting

**Q: Can't access admin dashboard**

- Make sure you ran the migration (Step 1)
- Verify your user has role='admin' in profiles table
- Try clearing cookies and logging in again

**Q: Orders not showing in admin panel**

- Check if you're logged in (look for auth cookie)
- Verify RLS policies are active
- Check browser console for errors

**Q: "Row-level security" error**

- This means the migration wasn't run yet
- Go to Step 1 and run the SQL migration

---

## 📚 More Info

See `ADMIN_SETUP.md` for detailed documentation.

---

**🎉 That's it! Your admin panel is now secure!**

Customers can still place orders freely, but only authenticated admins can view and manage them.
