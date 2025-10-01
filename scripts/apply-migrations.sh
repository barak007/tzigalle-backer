#!/bin/bash

# Script to apply all migrations to Supabase

echo "🔄 Applying database migrations..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

# Apply migrations
echo "📝 Running migrations..."
supabase db push

echo "✅ Migrations applied successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Configure Google OAuth in Supabase Dashboard"
echo "2. Go to: https://supabase.com/dashboard/project/rftpwqpxcanosgnqxqyv/auth/providers"
echo "3. Enable Google provider and add OAuth credentials"
echo "4. Test user signup and login"
