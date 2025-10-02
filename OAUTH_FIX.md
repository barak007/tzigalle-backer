# Google OAuth Redirect Fix

## Problem
The Google login was redirecting to `localhost` instead of the production domain because the code was using `location.origin` which dynamically resolves to the current browser URL.

## Solution
Changed the OAuth redirect URL to use a configurable `NEXT_PUBLIC_SITE_URL` environment variable instead of `location.origin`. This ensures that:
1. The redirect URL is always consistent and points to the correct domain
2. It can be configured differently for development vs production environments
3. Google OAuth will redirect users to the correct URL after authentication

## Changes Made

### 1. Added `NEXT_PUBLIC_SITE_URL` Environment Variable
- Updated `env.d.ts` to include the new type definition
- Updated `lib/env.ts` to validate and export the environment variable
- Created `.env.example` with documentation

### 2. Updated OAuth Function
- Modified `lib/supabase/client.ts` `signInWithGoogle()` function
- Changed from: `${location.origin}/auth/callback`
- Changed to: `${ENV.NEXT_PUBLIC_SITE_URL}/auth/callback`

### 3. Documentation
- Updated `README.md` with setup instructions
- Created `.env.example` file

## Deployment Checklist

### For Production (Vercel/Hosting Platform)
1. **Set Environment Variable**
   ```
   NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
   ```
   (e.g., `https://tzigalle-backer.vercel.app`)

2. **Update Supabase Dashboard**
   - Go to Authentication > URL Configuration
   - Add your production URL to the "Site URL" field
   - Add `https://your-production-domain.com/**` to "Redirect URLs"
   - Ensure `https://your-production-domain.com/auth/callback` is in the allowed redirect URLs

3. **Redeploy the application** to pick up the environment variable changes

### For Local Development
Set in your `.env.local` file:
```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Testing the Fix
1. Navigate to the login or signup page
2. Click "Continue with Google"
3. Complete Google authentication
4. Verify you're redirected back to the production site (not localhost)

## Technical Details
- The fix is minimal and only changes how the redirect URL is constructed
- All existing functionality remains the same
- The callback route (`/auth/callback`) handles the OAuth response unchanged
- TypeScript types ensure the environment variable is properly configured
