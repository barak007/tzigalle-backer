#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";

// Load environment variables
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// Validate environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Error: Missing environment variables");
  console.error(
    "Please check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function clearSessions() {
  console.log("🔄 Clearing all user sessions...\n");

  try {
    // Get all users
    const { data: users, error: usersError } =
      await supabase.auth.admin.listUsers();

    if (usersError) {
      console.error("❌ Error fetching users:", usersError.message);
      process.exit(1);
    }

    for (const user of users?.users || []) {
      // Sign out user from all sessions
      const { error } = await supabase.auth.admin.signOut(user.id);

      if (error) {
        console.error(`❌ Error signing out ${user.email}:`, error.message);
      } else {
        console.log(`✅ Signed out: ${user.email}`);
      }
    }

    console.log("\n✅ All sessions cleared!");
    console.log("\n📝 Next steps:");
    console.log("   1. Go to: http://localhost:3000/admin/login");
    console.log("   2. Log in with your admin credentials");
    console.log("   3. You should now have full admin access");
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
  }
}

// Run the script
clearSessions();
