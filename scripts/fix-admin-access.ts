#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";
import { ALL_ENV } from "../lib/env";

// Load environment variables
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const SUPABASE_URL = ALL_ENV.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = ALL_ENV.SUPABASE_SERVICE_ROLE_KEY;

// Create Supabase admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function fixAdminAccess() {
  console.log("🔧 Fixing admin access issues...\n");

  try {
    // 1. Check current RLS policies
    console.log("📋 Step 1: Checking RLS policies...");

    const { data: policies, error: policiesError } = await supabase
      .rpc("exec_sql", {
        sql: `
          SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
          FROM pg_policies 
          WHERE tablename = 'profiles';
        `,
      })
      .single();

    if (policiesError) {
      console.log("⚠️  Could not check policies (this is okay)");
    }

    // 2. Ensure the profile exists and has admin role
    console.log("📋 Step 2: Verifying profile...");

    const { data: users } = await supabase.auth.admin.listUsers();
    const user = users?.users[0];

    if (!user) {
      console.error("❌ No users found");
      process.exit(1);
    }

    console.log(`   Found user: ${user.email}`);

    // 3. Update/insert profile with admin role (using service role to bypass RLS)
    console.log("📋 Step 3: Ensuring admin role is set...");

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          email: user.email,
          role: "admin",
          created_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
          ignoreDuplicates: false,
        }
      )
      .select()
      .single();

    if (profileError) {
      console.error("❌ Error updating profile:", profileError);
      process.exit(1);
    }

    console.log("   ✅ Profile updated successfully");

    // 4. Verify the profile can be read
    console.log("📋 Step 4: Verifying profile access...");

    const { data: verifyProfile, error: verifyError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (verifyError) {
      console.error("❌ Error reading profile:", verifyError);
      process.exit(1);
    }

    console.log("   ✅ Profile can be read:", verifyProfile);

    // 5. Test if user can see orders
    console.log("📋 Step 5: Testing orders access...");

    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("count")
      .limit(1);

    if (ordersError) {
      console.error("⚠️  Cannot access orders:", ordersError.message);
    } else {
      console.log("   ✅ Orders table accessible");
    }

    console.log("\n✅ Admin access fixed!");
    console.log("\n📝 Next steps:");
    console.log("   1. Close all browser tabs with your app");
    console.log("   2. Open a new incognito/private window");
    console.log("   3. Go to: http://localhost:3000/admin/login");
    console.log("   4. Log in with:");
    console.log(`      Email: ${user.email}`);
    console.log("      Password: (the one you created)");
    console.log(
      "\n   If it still doesn't work, check the browser console for errors."
    );
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
  }
}

// Run the script
fixAdminAccess();
