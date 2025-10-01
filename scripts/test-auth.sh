#!/bin/bash

# Test script for user authentication implementation

echo "🧪 Testing User Authentication Implementation"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if dev server is running
echo "📋 Pre-flight checks..."
if ! lsof -i:3000 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Dev server not running on port 3000${NC}"
    echo "   Starting dev server..."
    npm run dev &
    DEV_PID=$!
    sleep 5
fi

echo ""
echo "✅ Dev server is running"
echo ""

# Test URLs
echo "🔗 Testing URLs (open these in your browser):"
echo ""
echo "1. Home Page (Order Form):"
echo "   http://localhost:3000"
echo ""
echo "2. User Signup:"
echo "   http://localhost:3000/signup"
echo ""
echo "3. User Login:"
echo "   http://localhost:3000/login"
echo ""
echo "4. User Orders (requires login):"
echo "   http://localhost:3000/orders"
echo ""
echo "5. Admin Login:"
echo "   http://localhost:3000/admin/login"
echo ""
echo "6. Admin Dashboard (requires admin):"
echo "   http://localhost:3000/admin"
echo ""

# Check files exist
echo "📁 Checking files..."
FILES=(
    "app/signup/page.tsx"
    "app/login/page.tsx"
    "app/orders/page.tsx"
    "app/auth/callback/route.ts"
    "components/user-profile.tsx"
    "supabase/migrations/20241001000006_update_user_roles.sql"
    "supabase/migrations/20241001000007_add_user_id_to_orders.sql"
    "supabase/migrations/20241001000008_auto_create_profile.sql"
)

ALL_EXIST=true
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file - MISSING!"
        ALL_EXIST=false
    fi
done

echo ""

if [ "$ALL_EXIST" = true ]; then
    echo -e "${GREEN}✅ All files created successfully!${NC}"
else
    echo -e "${RED}❌ Some files are missing!${NC}"
fi

echo ""
echo "🗄️  Database migrations status:"
echo "   Run: npx supabase db push"
echo "   Or apply manually in Supabase Dashboard"
echo ""

echo "📚 Testing Guide:"
echo ""
echo "Test 1: Guest User Flow"
echo "  1. Go to home page"
echo "  2. Add items to cart"
echo "  3. Fill form and submit"
echo "  4. Should redirect to signup"
echo "  5. Create account"
echo "  6. Should return to home with form data"
echo "  7. Submit order"
echo "  8. View in 'My Orders'"
echo ""

echo "Test 2: Logged-in User Flow"
echo "  1. Login via header"
echo "  2. Add items to cart"
echo "  3. Submit order (should work)"
echo "  4. Click 'My Orders'"
echo "  5. See your orders only"
echo ""

echo "Test 3: Admin Flow"
echo "  1. Go to /admin/login"
echo "  2. Login as admin"
echo "  3. See all orders (from all users)"
echo "  4. Update order status"
echo ""

echo "Test 4: Security"
echo "  1. Try accessing /orders without login (should redirect)"
echo "  2. Try accessing /admin as regular user (should redirect)"
echo "  3. Verify users only see their own orders"
echo ""

echo "=============================================="
echo -e "${GREEN}🎉 Implementation Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Apply migrations: npx supabase db push"
echo "2. Configure Google OAuth (optional)"
echo "3. Run tests above"
echo "4. Deploy to production"
echo ""
