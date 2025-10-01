# User Profile Auto-fill Feature

## Overview

Implemented a user profile system that stores contact information and auto-fills order forms for logged-in users.

## Features Implemented

### 1. Enhanced User Profiles

- **Database Schema**: Added `phone`, `address`, and `city` fields to the `profiles` table
- **Security**: RLS policies ensure users can only view and update their own profile
- **Auto-creation**: Profiles are automatically created on signup with optional contact info

### 2. Enhanced Signup Form (`/signup`)

- Added optional fields for phone, address, and city
- Users can skip these fields during signup and fill them later
- Clean UI with a separator showing these are optional fields

### 3. User Settings Page (`/settings`)

- New dedicated page for users to manage their profile
- Editable fields:
  - Full name (required)
  - Phone number (optional)
  - Address (optional)
  - City (optional)
- Email is displayed but not editable
- Accessible from the user profile dropdown menu
- Changes are saved to the database and reflected immediately

### 4. Smart Order Form Auto-fill (`/`)

- **Auto-fill**: When logged in, user's saved contact info is automatically loaded
- **Hidden Fields**: Fields with saved data are hidden from the form
- **Summary Display**: Shows a green summary box with saved info instead
- **Edit Button**: Users can click "ערוך" (Edit) to modify info for a specific order
- **Flexibility**: Users can change details per order without updating their profile

## User Flow

### For New Users:

1. **Signup** → Optionally add phone/address/city
2. **Order** → Form is auto-filled with saved info
3. **Settings** → Can update profile anytime via avatar menu

### For Existing Users:

1. **Login** → Profile data loaded automatically
2. **Order** → Saved fields are hidden, shown in green summary box
3. **Edit** → Click "ערוך" button to modify info for this order only
4. **Settings** → Update default info via avatar menu → "הגדרות פרופיל"

## Technical Details

### Database Migration

```sql
File: supabase/migrations/20241002000001_add_user_contact_info.sql
- Added phone, address, city columns to profiles table
- Verified RLS policies (users can only access their own data)
- Updated handle_new_user() function to save optional signup fields
```

### Security

✅ **Row Level Security (RLS)** enabled on profiles table
✅ **SELECT Policy**: Users can only view their own profile (`auth.uid() = id`)
✅ **UPDATE Policy**: Users can only update their own profile (`auth.uid() = id`)
✅ **No privilege escalation** possible
✅ **Server-side validation** via Supabase RLS

### Files Modified

1. **Database**

   - `supabase/migrations/20241002000001_add_user_contact_info.sql` (new)

2. **Authentication**

   - `lib/supabase/client.ts` - Updated signUpWithEmail to accept optional fields
   - `app/signup/page.tsx` - Added optional phone/address/city fields

3. **UI Components**

   - `components/user-profile.tsx` - Added "הגדרות פרופיל" link to dropdown
   - `app/settings/page.tsx` (new) - User settings page

4. **Order Form**
   - `app/page.tsx` - Smart auto-fill with show/hide logic
   - Added userProfile state and loading logic
   - Conditional rendering of form fields
   - Green summary box with edit button

## UI/UX Improvements

### Order Form Behavior:

- **Guest users**: See all fields (as before)
- **Logged-in users without profile data**: See all fields
- **Logged-in users with profile data**:
  - See green summary box with their info
  - Hidden fields are auto-filled in the background
  - Click "ערוך" to reveal and modify fields
  - Name field always visible

### Visual Indicators:

- ✓ Green checkmark on summary box
- 📧 Email icon for name
- 📞 Phone icon for phone
- 📍 Location icon for address
- Edit button with outline style

## Testing Checklist

### Signup Flow

- [ ] Sign up without optional fields → Should work
- [ ] Sign up with all fields → Should save to profile
- [ ] Sign up with partial fields → Should save what's provided

### Settings Page

- [ ] Access via avatar menu → "הגדרות פרופיל"
- [ ] Update phone → Should save
- [ ] Update address → Should save
- [ ] Update city → Should save
- [ ] Changes reflect immediately on order form

### Order Form

- [ ] Guest user → Sees all fields
- [ ] Logged-in user without profile → Sees all fields
- [ ] Logged-in user with profile → Sees summary box
- [ ] Click "ערוך" button → Fields become visible
- [ ] Submit order with hidden fields → Uses saved data
- [ ] Submit order with edited fields → Uses edited data

### Security

- [ ] User A cannot view User B's profile
- [ ] User A cannot update User B's profile
- [ ] Profile updates are properly validated

## Future Enhancements (Optional)

- Add validation for phone number format
- Add address autocomplete
- Allow multiple saved addresses
- Add shipping preferences
- Order history with reorder functionality using saved addresses

---

**Status**: ✅ Implemented and Deployed
**Date**: October 2, 2025
**Migration**: 20241002000001_add_user_contact_info.sql
