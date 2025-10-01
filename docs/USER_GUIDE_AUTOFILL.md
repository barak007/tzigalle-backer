# Quick Guide: Profile Auto-fill Feature

## 🎯 What's New?

Your bakery ordering system now saves your contact information and automatically fills it in when you order!

## 📝 How to Use

### First Time Setup (Optional)

1. When signing up, you can optionally add:
   - Phone number
   - Address
   - City
2. Don't worry! You can skip these and add them later.

### Managing Your Profile

1. Click on your avatar (top right)
2. Select **"הגדרות פרופיל"** (Profile Settings)
3. Update your information:
   - Full Name
   - Phone Number
   - Address
   - City
4. Click **"שמור שינויים"** (Save Changes)

### Placing an Order

#### If You Have Saved Info:

- ✅ Your info is automatically filled
- 🟢 Green box shows your saved details
- Click **"ערוך"** (Edit) if you want to change something for THIS order only

#### If You Don't Have Saved Info:

- Fill in all fields manually (as before)
- Consider saving them in your profile for next time!

## 💡 Tips

### Want to Change Info for One Order Only?

Click the **"ערוך"** button on the green box. Your changes will only apply to this order - your saved profile stays the same.

### Want to Update Your Default Info?

Go to **Profile Settings** from the avatar menu. Changes here will be used for all future orders.

### Privacy & Security

- ✅ Only YOU can see your information
- ✅ Only YOU can edit your information
- ✅ Your data is protected by Row Level Security (RLS)

## 🔍 Where to Find Things

| What            | Where                         |
| --------------- | ----------------------------- |
| Update Profile  | Avatar Menu → "הגדרות פרופיל" |
| View Orders     | "ההזמנות שלי" button          |
| Sign Out        | Avatar Menu → "התנתק"         |
| Edit Order Info | Green box → "ערוך" button     |

## 🎨 Visual Guide

### Logged in WITHOUT saved info:

```
┌─────────────────────────┐
│ שם מלא *                │
│ [text field]            │
│                         │
│ טלפון *                 │
│ [text field]            │
│                         │
│ כתובת *                 │
│ [text field]            │
│                         │
│ עיר *                   │
│ [text field]            │
└─────────────────────────┘
```

### Logged in WITH saved info:

```
┌─────────────────────────┐
│ ✓ הפרטים שלך ימולאו     │
│   אוטומטית:             │
│ 📧 John Doe            │
│ 📞 050-1234567         │
│ 📍 Main St 123, City   │
│              [ערוך]     │
└─────────────────────────┘
│                         │
│ שם מלא *                │
│ [John Doe]             │
│                         │
│ (phone/address hidden)  │
```

---

**Questions?** Contact support or check the full documentation in `/docs/USER_PROFILE_AUTOFILL.md`
