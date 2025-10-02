# 🔍 Code Audit Report - Tzigla Bakery

**Date:** October 2, 2025  
**Project:** Tzigla Bakery - Next.js E-commerce Application

---

## 📋 Executive Summary

This audit identified **17 issues** across security, bugs, code quality, and performance. The application has good foundations but requires immediate attention to security vulnerabilities and code quality improvements.

**Total Issues:** 17 (4 Critical/High Security, 6 Bugs, 3 Code Quality, 1 Redundancy, 1 Complexity, 1 Performance, 0 Configuration, 1 Testing)

**Completed:** 4 security issues fixed (Environment Variables, Phone Validation, Rate Limiting, OAuth Callback)

**Priority Levels:**

- 🔴 **CRITICAL** - Immediate action required
- 🟠 **HIGH** - Should be addressed soon
- 🟡 **MEDIUM** - Should be planned
- 🟢 **LOW** - Nice to have

---

## 🗂️ Issues Index

### 🐛 Bugs & Logic Errors (6)

12. 🟡 `Profile Creation` Trigger Has Wrong Default Role
13. 🟡 Missing Error Handling in Server Actions

### 🔧 Code Quality Issues (3)

17. 🟡 Component Too Large - app/page.tsx (937 lines)
18. 🟡 Admin Page Too Large - app/admin/page.tsx (852 lines)
19. 🟢 Console.error in Production

### ♻️ Redundancy Issues (1)

### 🎨 Complexity Issues (1)

### ⚡ Performance Issues (1)

29. 🟡 No Image Optimization

## 🐛 BUGS & LOGIC ERRORS

### 12. 🟡 Profile Creation Trigger Has Wrong Default Role (MEDIUM)

**File:** `supabase/migrations/20241001000008_auto_create_profile.sql`  
**Issue:** Default role is 'user' instead of 'customer', inconsistent with rest of application.

**Current Code:**

```sql
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
  NEW.id,
  NEW.email,
  COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
  'user'  -- ❌ Should be 'customer'
);
```

**Problem:** The application uses 'customer' and 'admin' roles, but trigger creates 'user' role.

**Fix Required:**

```sql
-- Update trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'customer'  -- ✅ Correct role
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix existing users with 'user' role
UPDATE profiles SET role = 'customer' WHERE role = 'user';
```

---

### 13. 🟡 Admin Login Has Client-Side Role Check (MEDIUM)

**File:** `app/admin/login/page.tsx`  
**Issue:** Role check happens on client after login, creates security gap.

**Current Code:**

```typescript
if (data.user) {
  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    setError("אין לך הרשאות גישה למערכת הניהול");
    await supabase.auth.signOut();
    setIsLoading(false);
    return;
  }

  // Redirect to admin dashboard
  router.push("/admin");
  router.refresh();
}
```

**Problem:**

1. Briefly authenticated before role check
2. Multiple round trips (login → check → redirect)
3. Could bypass if client-side code is manipulated

**Better Approach:**
Move login to server action:

```typescript
// app/actions/auth.ts
"use server";

export async function adminLogin(email: string, password: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { success: false, error: "שגיאה בהתחברות" };
  }

  // Check role server-side
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    await supabase.auth.signOut();
    return { success: false, error: "אין הרשאות" };
  }

  revalidatePath("/admin");
  return { success: true };
}
```

---

### 14. 🟡 Missing Error Handling in Server Actions (MEDIUM)

**File:** `app/actions/orders.ts`  
**Issue:** Generic error messages don't help debug issues.

**Current Code:**

```typescript
if (error) {
  console.error("Error creating order:", error);
  return {
    success: false,
    error: "שגיאה בשליחת ההזמנה. אנא נסה שוב",
  };
}
```

**Problems:**

1. User sees generic error
2. No error tracking/logging
3. Cannot debug production issues

**Fix Required:**

```typescript
// Add proper error tracking
import * as Sentry from "@sentry/nextjs"; // or similar

if (error) {
  console.error("Error creating order:", error);

  // Log to error tracking service
  Sentry.captureException(error, {
    extra: {
      orderId: orderData.customerId,
      orderData: {
        totalPrice: orderData.totalPrice,
        deliveryDate: orderData.deliveryDate,
      },
    },
  });

  // Return more specific errors in development
  const errorMessage =
    process.env.NODE_ENV === "development"
      ? `שגיאה: ${error.message}`
      : "שגיאה בשליחת ההזמנה. אנא נסה שוב";

  return {
    success: false,
    error: errorMessage,
  };
}
```

---

## 🔧 CODE QUALITY ISSUES

### 17. 🟡 Duplicate Code - Date Formatting (MEDIUM)

**Files:** Multiple files  
**Issue:** Date formatting logic duplicated across files.

**Current:**

```typescript
// In app/page.tsx
dateString: deliveryDate.toLocaleDateString("he-IL", {
  day: "numeric",
  month: "numeric",
  year: "numeric",
});

// In app/orders/page.tsx
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("he-IL", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// In app/admin/page.tsx
new Date(order.created_at).toLocaleDateString("he-IL");
```

**Fix Required:**

```typescript
// lib/utils/dates.ts
export const formatDate = (
  date: Date | string,
  format: "short" | "long" | "full" = "short"
) => {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  const formats = {
    short: {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    },
    long: {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
    full: {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  };

  return new Intl.DateTimeFormat("he-IL", formats[format]).format(dateObj);
};
```

---

### 19. 🟢 Missing TypeScript Types (LOW)

**Files:** Multiple  
**Issue:** Using `any` type in several places.

**Examples:**

```typescript
// app/page.tsx
const [user, setUser] = useState<any>(null);
const [userProfile, setUserProfile] = useState<any>(null);

// app/orders/page.tsx
return (order.items as any[]).map((item: any, index: number) => // ...
```

**Fix Required:**

```typescript
// types/index.ts
export interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
  };
}

export interface UserProfile {
  id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  role: "admin" | "customer";
  created_at: string;
}

export interface OrderItem {
  breadId: number;
  name: string;
  quantity: number;
  price: number;
}

// Use in components
const [user, setUser] = useState<User | null>(null);
const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
```

---

## ♻️ REDUNDANT CODE

### 21. 🟡 Duplicate Supabase Client Creation (MEDIUM)

**Issue:** Creating Supabase client multiple times in same component.

**Example in `app/admin/page.tsx`:**

```typescript
const fetchOrders = async () => {
  const supabase = createClient(); // ❌ Creates new client
  // ...
};

const updateOrderStatus = async (orderId: string, newStatus: string) => {
  const supabase = createClient(); // ❌ Creates new client again
  // ...
};

const handleLogout = async () => {
  const supabase = createClient(); // ❌ Creates new client again
  // ...
};
```

**Fix Required:**

```typescript
export default function AdminPage() {
  const supabase = useMemo(() => createClient(), []);

  // Use same client instance throughout component
  const fetchOrders = useCallback(async () => {
    const { data, error } = await supabase.from("orders").select("*");
    // ...
  }, [supabase]);
}
```

---

### 22. 🟡 Duplicate Status Labels (MEDIUM)

**Files:** `app/admin/page.tsx`, `app/orders/page.tsx`  
**Issue:** Status labels and colors defined separately in multiple files.

**Fix Required:**

```typescript
// lib/constants/order-status.ts
export const ORDER_STATUSES = {
  pending: {
    label: "ממתין",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    badge: "secondary",
  },
  confirmed: {
    label: "אושר",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    badge: "default",
  },
  // ... rest
} as const;

export type OrderStatus = keyof typeof ORDER_STATUSES;
```

---

## 🎨 COMPLEXITY ISSUES

### 25. 🟡 Deeply Nested Conditionals (MEDIUM)

**File:** `app/page.tsx` lines 669-737  
**Issue:** Complex nested conditionals for showing/hiding form fields.

**Current:**

```typescript
{
  (!user || !userProfile || !userProfile.phone || showEditFields) && (
    <div className="space-y-2">
      <Label htmlFor="phone">טלפון *</Label>
      <Input /* ... */ />
    </div>
  );
}
```

**Fix Required:**

```typescript
// Extract to helper function
const shouldShowField = (fieldName: keyof UserProfile) => {
  if (showEditFields) return true;
  if (!user || !userProfile) return true;
  return !userProfile[fieldName];
};

// Use in JSX
{
  shouldShowField("phone") && (
    <div className="space-y-2">
      <Label htmlFor="phone">טלפון *</Label>
      <Input /* ... */ />
    </div>
  );
}
```

---

## 🔄 PERFORMANCE ISSUES

### 26. 🟠 No Memoization for Expensive Calculations (HIGH)

**File:** `app/page.tsx`  
**Issue:** Delivery date calculations run on every render.

**Current:**

```typescript
const tuesdayData = getNextDeliveryDate(2, 0);
const fridayData = getNextDeliveryDate(5, 3);

const deliveryOptions = [
  {
    value: "tuesday",
    // ...
  },
  // ...
].sort((a, b) => a.date.getTime() - b.date.getTime());
```

**Fix Required:**

```typescript
const deliveryOptions = useMemo(() => {
  const tuesdayData = getNextDeliveryDate(2, 0);
  const fridayData = getNextDeliveryDate(5, 3);

  return [
    {
      value: "tuesday",
      date: tuesdayData.date,
      // ...
    },
    {
      value: "friday",
      date: fridayData.date,
      // ...
    },
  ].sort((a, b) => a.date.getTime() - b.date.getTime());
}, []); // Recalculate only once per day
```

---

### 27. 🟡 No Image Optimization (MEDIUM)

**Files:** Background images in components  
**Issue:** Using direct `backgroundImage` URLs without Next.js Image optimization.

**Current:**

```typescript
<div
  style={{ backgroundImage: "url(/bakery-2.jpg)" }}
>
```

**Problems:**

- No lazy loading
- No automatic format conversion (WebP)
- No responsive sizes
- Large file downloads

**Fix Required:**

```typescript
import Image from "next/image";

<div className="relative">
  <Image
    src="/bakery-2.jpg"
    alt="Background"
    fill
    className="object-cover"
    priority={false}
    quality={75}
  />
  <div className="relative z-10">{/* Content */}</div>
</div>;
```

---

## 📝 CONFIGURATION ISSUES

### 28. 🟠 Build Errors Ignored (HIGH)

**File:** `next.config.mjs`  
**Issue:** TypeScript and ESLint errors ignored during build.

**Current:**

```javascript
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};
```

**Risk:**

- Bugs make it to production
- Technical debt accumulates
- No type safety

**Fix Required:**

```javascript
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false, // Enforce linting
  },
  typescript: {
    ignoreBuildErrors: false, // Enforce type checking
  },
  // Add strict mode
  reactStrictMode: true,
  // Add SWC minification
  swcMinify: true,
};
```

Then fix all TypeScript and ESLint errors:

```bash
npm run lint
npx tsc --noEmit
```

---

### 29. 🟡 Missing Environment Variable Types (MEDIUM)

**Issue:** No type definitions for environment variables.

**Fix Required:**

```typescript
// env.d.ts
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_SUPABASE_URL: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
      SUPABASE_SERVICE_ROLE_KEY: string;
      NODE_ENV: "development" | "production" | "test";
    }
  }
}

export {};
```

---

## 📞 RECOMMENDATIONS

### Architecture

1. Consider moving to App Router fully (some mixed patterns detected)
2. Implement proper state management use simple class with events
