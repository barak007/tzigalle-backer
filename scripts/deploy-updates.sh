#!/bin/bash
# Quick deployment script for database indexes and security headers

echo "🚀 Deploying Database Indexes and Security Headers"
echo "=================================================="
echo ""

echo "📋 Step 1: Push Database Migration"
echo "-----------------------------------"
echo "Running: npm run migration"
echo ""

npm run migration

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database migration applied successfully!"
    echo ""
else
    echo ""
    echo "❌ Migration failed. Please check the error above."
    echo ""
    exit 1
fi

echo "📋 Step 2: Verify Migration"
echo "---------------------------"
echo "Checking migration status..."
echo ""

npm run db:status

echo ""
echo "✅ You should see '✓ 20241002000005_add_performance_indexes' in the list above"
echo ""

echo "📋 Step 3: Verify Indexes Created"
echo "----------------------------------"
echo "You can verify indexes were created by running this query in Supabase:"
echo ""
echo "  SELECT tablename, indexname FROM pg_indexes"
echo "  WHERE tablename IN ('orders', 'profiles')"
echo "  ORDER BY tablename, indexname;"
echo ""

read -p "Press Enter to continue..."

echo ""
echo "📋 Step 4: Deploy Application (Security Headers)"
echo "------------------------------------------------"
echo "Security headers are already configured in next.config.mjs"
echo ""
echo "Commit and push your changes:"
echo ""
echo "  git add ."
echo "  git commit -m 'feat: add database indexes and security headers'"
echo "  git push"
echo ""

echo "🎉 Deployment Complete!"
echo "======================"
echo ""
echo "✅ Database indexes applied"
echo "✅ Ready to push code changes"
echo ""
echo "After pushing, test security headers at:"
echo "  https://securityheaders.com/?q=your-domain.com"
echo ""
echo "See IMPLEMENTATION_SUMMARY.md for full details."
echo ""
