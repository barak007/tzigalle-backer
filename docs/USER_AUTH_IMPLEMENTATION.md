# User Authentication & Order Management Implementation Plan

## Overview

Implement a complete user authentication system with Google login, separating regular users from admins, and enabling users to place orders and view their order history.

---

## Architecture Changes

### User Flow

1. **Guest** → Browse products → Fill order form → **Prompt to login/signup** → Complete order
2. **Logged-in User** → Browse products → Fill order form → Submit order → View order history
3. **Admin** → Access admin panel (existing) → Manage all orders

### Role Separation

- **Admin**: Access to `/admin` routes, can manage all orders
- **User**: Access to `/orders` (their orders only), can place new orders
- **Guest**: Can browse but must authenticate to place orders

---

## Database Changes

### 1. Update `profiles` Table

**File**: New migration file `supabase/migrations/20241001000006_update_user_roles.sql`

**Changes**:

```sql
-- Ensure profiles table has proper structure
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Update RLS policies for users to see only their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

### 2. Update `orders` Table

**File**: New migration file `supabase/migrations/20241001000007_add_user_id_to_orders.sql`

**Changes**:

```sql
-- Add user_id to orders table (if not exists)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- RLS Policies for orders
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;

-- Users can only view their own orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Users can insert their own orders
CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only admins can update orders
CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

---

## New Files to Create

### 1. User Signup Page

**File**: `app/signup/page.tsx`

**Purpose**: New user registration page with Google OAuth and email/password

**Features**:

- Email/password signup
- Google OAuth signup button
- Automatic profile creation with `role='user'`
- Redirect to home page after signup
- Hebrew UI (RTL)

### 2. User Login Page (Separate from Admin)

**File**: `app/login/page.tsx`

**Purpose**: User login page (separate from admin login)

**Features**:

- Email/password login
- Google OAuth login button
- "Don't have an account? Sign up" link
- Redirect to previous page or home after login
- Hebrew UI (RTL)

### 3. User Orders Page

**File**: `app/orders/page.tsx`

**Purpose**: Display logged-in user's order history

**Features**:

- Fetch and display user's orders from database
- Filter by status (pending, completed, archived)
- Show order details (items, total, date, status)
- Protected route (requires authentication)
- Hebrew UI (RTL)

### 4. Auth Callback Handler

**File**: `app/auth/callback/route.ts`

**Purpose**: Handle OAuth redirect after Google login

**Implementation**:

```typescript
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to home or intended page
  return NextResponse.redirect(`${origin}/`);
}
```

### 5. Protected Route Middleware Enhancement

**File**: `middleware.ts` (update existing)

**Changes**:

- Add `/orders` to protected routes
- Redirect unauthenticated users to `/login`
- Keep admin routes protected and separate

### 6. User Profile Component

**File**: `components/user-profile.tsx`

**Purpose**: Display user profile in header/navbar

**Features**:

- Show user's name/email
- Dropdown menu with links to Orders, Profile, Logout
- Avatar with Google profile picture if available

### 7. Order Form Enhancement

**File**: `app/page.tsx` (update existing order form)

**Changes**:

- Check authentication before form submission
- If not authenticated, redirect to `/signup?returnTo=/`
- Attach `user_id` to order when submitting
- Show "Login to place order" message for guests

---

## Files to Modify

### 1. **`app/page.tsx`** - Home Page with Order Form

**Changes Needed**:

```typescript
// Add authentication check
const supabase = createClient();
const {
  data: { user },
} = await supabase.auth.getUser();

// Before order submission
const handleSubmit = async (e) => {
  e.preventDefault();

  // Check if user is logged in
  if (!user) {
    // Store form data in localStorage
    localStorage.setItem("pendingOrder", JSON.stringify(formData));
    // Redirect to signup/login
    router.push("/signup?returnTo=/");
    return;
  }

  // Add user_id to order
  const orderData = {
    ...formData,
    user_id: user.id,
  };

  // Submit order...
};
```

### 2. **`app/layout.tsx`** - Root Layout

**Changes Needed**:

- Add navigation header with user profile
- Add links to "My Orders" for logged-in users
- Add "Login/Signup" buttons for guests
- Keep existing RTL and Hebrew support

### 3. **`middleware.ts`** - Route Protection

**Current State**: Protects `/admin` routes

**Changes Needed**:

```typescript
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes - check for admin role
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    // Existing admin check logic...
  }

  // User routes - check for authentication
  if (pathname.startsWith("/orders")) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(
        new URL("/login?returnTo=" + pathname, request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/orders/:path*"],
};
```

### 4. **`lib/supabase/client.ts`** - Add Helper Functions

**Add**:

```typescript
// Helper to sign up with Google
export async function signInWithGoogle() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${location.origin}/auth/callback`,
    },
  });
  return { data, error };
}

// Helper to sign up with email
export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string
) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  return { data, error };
}
```

### 5. **`app/admin/login/page.tsx`** - Admin Login

**Changes Needed**:

- Keep admin login separate
- Remove Google OAuth from admin login (admins use email/password only)
- Ensure it checks for admin role after login
- Add clear messaging: "Admin Access Only"

---

## Supabase Configuration

### Google OAuth Setup

1. **Supabase Dashboard**: https://supabase.com/dashboard/project/rftpwqpxcanosgnqxqyv
2. Navigate to **Authentication** → **Providers**
3. Enable **Google** provider
4. Configure Google Cloud Console:
   - Create OAuth 2.0 Client ID
   - Add redirect URI: `https://rftpwqpxcanosgnqxqyv.supabase.co/auth/v1/callback`
   - Add for local dev: `http://localhost:3000/auth/callback`
5. Add Client ID and Client Secret to Supabase

### Automatic Profile Creation

Set up a database trigger to create profile on signup:

**File**: New migration `supabase/migrations/20241001000008_auto_create_profile.sql`

```sql
-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## UI/UX Flow

### Order Submission Flow

```
1. User fills order form
2. Clicks "Submit Order"
3. System checks authentication:

   IF NOT LOGGED IN:
   - Save form data to localStorage
   - Redirect to /signup?returnTo=/
   - Show message: "Please login or signup to complete your order"

   IF LOGGED IN:
   - Submit order with user_id
   - Show success message
   - Redirect to /orders
```

### Navigation Changes

```
Header/Navbar:
├── Logo / Home
├── For Guests:
│   ├── Login Button
│   └── Signup Button
└── For Logged-in Users:
    ├── My Orders
    └── Profile Dropdown
        ├── Account Settings
        ├── My Orders
        └── Logout
```

---

## Implementation Order

### Phase 1: Database & Auth Setup

1. ✅ Create migration for user roles
2. ✅ Create migration for orders user_id and RLS
3. ✅ Create auto-profile creation trigger
4. ✅ Run migrations
5. ✅ Configure Google OAuth in Supabase

### Phase 2: Auth Pages

1. ✅ Create `/signup/page.tsx`
2. ✅ Create `/login/page.tsx`
3. ✅ Create `/auth/callback/route.ts`
4. ✅ Update admin login to be admin-only

### Phase 3: User Features

1. ✅ Create `/orders/page.tsx`
2. ✅ Create `components/user-profile.tsx`
3. ✅ Update `app/layout.tsx` with navigation
4. ✅ Update middleware for user route protection

### Phase 4: Order Form Integration

1. ✅ Update home page order form with auth check
2. ✅ Add localStorage for pending orders
3. ✅ Attach user_id to orders on submission
4. ✅ Handle returnTo after login/signup

### Phase 5: Testing

1. ✅ Test user signup with Google
2. ✅ Test user signup with email/password
3. ✅ Test order placement as authenticated user
4. ✅ Test order placement as guest (should redirect)
5. ✅ Test viewing orders in `/orders`
6. ✅ Test admin cannot be created through signup
7. ✅ Test existing admin login still works

---

## Security Considerations

### RLS (Row Level Security)

- ✅ Users can only see their own orders
- ✅ Admins can see all orders
- ✅ Users can only insert orders for themselves
- ✅ Only admins can update order status

### Route Protection

- ✅ `/admin/*` requires admin role
- ✅ `/orders` requires authentication
- ✅ Order form submission requires authentication

### Data Validation

- ✅ Server-side validation for user_id matches auth.uid()
- ✅ Client-side checks are verified server-side
- ✅ No way to elevate to admin through signup

---

## Environment Variables

**File**: `.env` (no changes needed)

Current variables are sufficient:

```env
NEXT_PUBLIC_SUPABASE_URL=https://rftpwqpxcanosgnqxqyv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Testing Checklist

### User Signup & Login

- [ ] User can signup with email/password
- [ ] User can signup with Google OAuth
- [ ] New users get `role='user'` by default
- [ ] User can login with email/password
- [ ] User can login with Google OAuth
- [ ] Failed login shows appropriate error
- [ ] Successful login redirects to returnTo or home

### Order Placement

- [ ] Guest cannot submit order (redirected to signup)
- [ ] Logged-in user can submit order
- [ ] Order includes user_id in database
- [ ] Pending order data preserved through login flow
- [ ] Success message shown after order placement

### Order Viewing

- [ ] User can access `/orders` page
- [ ] User sees only their own orders
- [ ] Orders display correct information
- [ ] Guest redirected to login when accessing `/orders`

### Admin Separation

- [ ] Admin login still works at `/admin/login`
- [ ] Admins can access `/admin` panel
- [ ] Admins can see all orders
- [ ] Regular users cannot access `/admin`
- [ ] Cannot create admin through signup flow

---

## Next Steps After Implementation

1. **Email Verification**: Add email confirmation for new signups
2. **Password Reset**: Implement forgot password flow
3. **Profile Editing**: Allow users to update their profile
4. **Order Tracking**: Add order status updates and notifications
5. **Social Logins**: Add Facebook, Apple sign-in if needed

---

## Notes

- All UI will maintain Hebrew (RTL) support
- Keep existing admin functionality intact
- Use existing shadcn/ui components for consistency
- Maintain responsive design for mobile users
- Follow existing code patterns and structure
