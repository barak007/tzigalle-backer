# 🥖 ציגלה - מאפייה ביתית

אפליקציית Next.js לניהול הזמנות לחמים עם פאנל ניהול מאובטח.

## 🚀 תכונות

### לקוחות

- הזמנת לחמים בקלות עם ממשק עברי
- בחירת תאריך משלוח (שלישי/שישי)
- עגלת קניות דינמית
- מעקב אחר סה"כ הזמנה
- שמירה אוטומטית של הזמנות
- ממשק רספונסיבי ונגיש

### מנהלים

- פאנל ניהול מאובטח עם הזדהות
- סטטיסטיקות הזמנות בזמן אמת
- מעקב הכנסות (כולל וצפי למשלוח הבא)
- סינון לפי סטטוס ויום משלוח
- מערכת ארכיון להזמנות ישנות
- עדכון סטטוס הזמנות

## 🏗️ ארכיטקטורה

### מבנה רכיבים מודולרי

הפרויקט עבר רפקטורינג משמעותי (אוקטובר 2025) לארכיטקטורה מודולרית:

```
app/
├── page.tsx              # דף ראשי (330 שורות - 66% הפחתה)
├── actions/              # Server Actions
│   ├── orders.ts        # פעולות הזמנות
│   └── auth.ts          # פעולות אימות
└── admin/               # פאנל ניהול

components/
└── order/               # רכיבי הזמנה
    ├── OrderForm.tsx           # טופס פרטי לקוח
    ├── ProductList.tsx         # רשימת מוצרים
    ├── OrderSummary.tsx        # סיכום הזמנה
    ├── DeliveryOptions.tsx     # בחירת תאריך משלוח
    ├── SuccessMessage.tsx      # הודעת הצלחה
    ├── FooterInfo.tsx          # מידע עסקי
    └── ClearOrderDialog.tsx    # אישור ניקוי

hooks/
├── use-order-state.ts   # ניהול state של הזמנות
├── use-debounce.ts      # Debouncing לביצועים
└── use-toast.ts         # הודעות למשתמש

lib/
├── utils/
│   ├── order-delivery.ts     # חישובי תאריכים
│   ├── rate-limit.ts         # הגנת Rate limiting
│   ├── phone-validator.ts    # אימות טלפון
│   └── delivery-dates.ts     # תאריכי משלוח משותפים
└── constants/
    └── bread-categories.ts    # קטגוריות לחמים
```

### תכונות ארכיטקטוניות

- ✅ **Separation of Concerns** - כל רכיב עם אחריות יחידה
- ✅ **Reusability** - רכיבים ניתנים לשימוש חוזר
- ✅ **Testability** - קל לבדיקות unit ו-integration
- ✅ **Type Safety** - TypeScript Strict Mode
- ✅ **Performance** - Debouncing, memoization, lazy loading
- ✅ **Accessibility** - תמיכה מלאה ב-ARIA ונגישות

## 🛠️ טכנולוגיות

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **UI Components**: Shadcn UI + Radix UI
- **Styling**: Tailwind CSS
- **Language**: TypeScript (Strict Mode)
- **State Management**: Custom Hooks
- **Deployment**: Vercel

## 🔒 אבטחה

- Rate limiting על login ויצירת הזמנות
- אימות קלט מקיף בצד שרת
- Row Level Security (RLS) ב-Supabase
- הגנה מפני Open Redirect
- אימות מספרי טלפון ישראליים
- Middleware מאובטח לבדיקת הרשאות

## 📦 התקנה

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd tzigla-bakery
```

2. **Install dependencies**

```bash
npm install
# or
pnpm install
```

3. **Setup environment variables**

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. **Run database migrations**

Go to your Supabase SQL Editor and run all migrations in order from `supabase/migrations/`:

- `20241001000001_create_orders_table.sql`
- `20241001000002_add_admin_security.sql`
- `20241001000003_fix_rls_policies.sql`
- `20241001000004_fix_infinite_recursion.sql`
- `20241001000005_add_archived_field.sql`

5. **Create admin user**

See [ADMIN_SETUP.md](./ADMIN_SETUP.md) for detailed instructions.

6. **Run development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📚 Documentation

- [Quick Start Guide](./QUICK_START.md) - מדריך התחלה מהירה
- [Admin Setup](./ADMIN_SETUP.md) - הגדרת מנהל ואבטחה

## 🔐 Security

- Row-Level Security (RLS) policies protect all data
- Admin routes protected by middleware
- Role-based access control (admin/customer)
- Secure authentication via Supabase Auth

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run add-admin    # Add new admin user
npm run check-admin  # Verify admin access
npm run fix-admin    # Fix admin access issues
npm run clear-sessions # Clear all user sessions
```

## 🏗️ Project Structure

```
tzigla-bakery/
├── app/
│   ├── page.tsx           # Customer ordering page
│   ├── layout.tsx         # Root layout
│   └── admin/
│       ├── page.tsx       # Admin dashboard
│       └── login/
│           └── page.tsx   # Admin login
├── components/
│   └── ui/                # Shadcn UI components
├── lib/
│   └── supabase/          # Supabase clients
├── supabase/
│   └── migrations/        # Database migrations
├── scripts/               # Admin utility scripts
└── middleware.ts          # Route protection
```

## 📞 Contact

**ציגלה - לחמים טריים ואיכותיים**

- טלפון: 052-5757744
- איש קשר: יורם

## 📄 License

Private project - All rights reserved
