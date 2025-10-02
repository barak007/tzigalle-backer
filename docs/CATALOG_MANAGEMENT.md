# Product Catalog Management System

## Overview

The product catalog management system allows administrators to edit the bread product catalog through the admin interface. The catalog is stored in the database with revision tracking to ensure order data integrity.

## Features

### 1. **Database-Driven Catalog**

- Catalog stored as JSONB in `product_catalog` table
- Supports multiple versions with revision tracking
- Only one active catalog at a time

### 2. **Revision Tracking**

- Each catalog update increments the revision number
- Local storage orders include the catalog revision they were created with
- Orders from outdated catalog versions are automatically discarded
- Prevents issues when products or prices change

### 3. **Admin Interface**

The admin page now has two tabs:

- **ניהול הזמנות** (Order Management) - existing order management
- **עריכת קטלוג** (Catalog Editor) - new product catalog editor

### 4. **Catalog Editor Features**

- View current catalog with revision number
- Add/remove categories
- Edit category names and prices
- Add/remove products within categories
- Real-time validation
- Confirmation dialog for unsaved changes

## Database Schema

### `product_catalog` Table

```sql
CREATE TABLE product_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  revision INTEGER NOT NULL,
  catalog_data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Fields

- `id` - Unique identifier
- `revision` - Incremental version number
- `catalog_data` - Product catalog as JSON
- `is_active` - Only one catalog should be active at a time
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## Catalog Data Structure

```typescript
interface BreadItem {
  id: number;
  name: string;
}

interface BreadCategory {
  title: string;
  price: number;
  breads: BreadItem[];
}
```

## How It Works

### Order Creation Flow

1. User opens the order page
2. System fetches active catalog from database
3. Catalog revision is stored with the order in localStorage
4. When page reloads, system checks if catalog revision matches
5. If revisions don't match, saved order is discarded with warning

### Catalog Update Flow

1. Admin navigates to admin page → Catalog tab
2. Clicks "ערוך קטלוג" (Edit Catalog)
3. Makes changes to categories/products/prices
4. Clicks "שמור שינויים" (Save Changes)
5. System:
   - Increments revision number
   - Deactivates all existing catalogs
   - Inserts new catalog as active
   - Page reloads to apply changes

### Security

- Only users with `admin` role can access catalog editor
- Server-side validation ensures user is authenticated and authorized
- RLS policies protect catalog data

## Usage

### For Admins

1. Go to `/admin`
2. Click on "עריכת קטלוג" tab
3. Click "ערוך קטלוג" to start editing
4. Make your changes:
   - **Add Category**: Click "הוסף קטגוריה"
   - **Remove Category**: Click trash icon next to category
   - **Edit Category**: Change name or price in input fields
   - **Add Product**: Click "הוסף מוצר" in a category
   - **Remove Product**: Click trash icon next to product
5. Click "שמור שינויים" when done
6. Confirm and page will reload

### For Customers

- No changes needed - catalog loads automatically from database
- If you have a saved order from an old catalog version, you'll see a warning
- Simply create a new order with the updated catalog

## Files Modified

### New Files

- `/supabase/migrations/20241002000006_create_product_catalog.sql` - Database migration
- `/app/actions/catalog.ts` - Server actions for catalog management
- `/components/catalog-editor.tsx` - Catalog editor UI component
- `/docs/CATALOG_MANAGEMENT.md` - This documentation

### Modified Files

- `/app/admin/page.tsx` - Added catalog fetching
- `/app/admin/admin-page-client.tsx` - Added tabs and catalog editor
- `/app/page.tsx` - Updated to use dynamic catalog
- `/hooks/use-order-state.ts` - Added catalog fetching and revision checking

## Benefits

1. **No Code Deploys for Product Changes**: Update products without touching code
2. **Data Integrity**: Old orders can't be loaded with incompatible catalog
3. **Audit Trail**: All catalog versions are preserved in database
4. **User-Friendly**: Simple interface for admins to manage products
5. **Real-Time**: Changes take effect immediately after save

## Future Enhancements

Potential improvements:

- View catalog history and revert to previous versions
- Schedule catalog changes for specific dates
- Export/import catalog as JSON
- Bulk product updates
- Product images
- Category ordering/sorting
- Seasonal product availability

## Troubleshooting

### Issue: Catalog not loading

- Check database connection
- Verify `product_catalog` table has at least one active row
- Check browser console for errors

### Issue: Saved order not loading

- This is expected behavior if catalog was updated
- User will see warning message
- Create new order with current catalog

### Issue: Can't save catalog changes

- Verify user has admin role in `profiles` table
- Check server logs for errors
- Ensure database connection is working
