import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

async function checkSetup() {
  console.log("🔍 Checking Admin Security Setup...\n");

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase environment variables");
    process.exit(1);
  }

  console.log("✅ Environment variables found");

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Check if profiles table exists
  console.log("\n🔄 Checking profiles table...");
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, email, role")
    .limit(1);

  if (profilesError) {
    console.error("❌ Profiles table not found or not accessible");
    console.error("   Please run the migration: npm run migrate:security");
    console.error("   Error:", profilesError.message);
  } else {
    console.log("✅ Profiles table exists and is accessible");
  }

  // Check for admin users
  console.log("\n🔄 Checking for admin users...");
  const { data: admins, error: adminsError } = await supabase
    .from("profiles")
    .select("id, email, role")
    .eq("role", "admin");

  if (adminsError) {
    console.error("❌ Error checking for admins:", adminsError.message);
  } else if (!admins || admins.length === 0) {
    console.log("⚠️  No admin users found");
    console.log(
      "   Please create an admin user following the instructions in QUICK_START.md"
    );
  } else {
    console.log(`✅ Found ${admins.length} admin user(s):`);
    admins.forEach((admin) => {
      console.log(`   - ${admin.email} (ID: ${admin.id})`);
    });
  }

  // Check orders table
  console.log("\n🔄 Checking orders table...");
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("id")
    .limit(1);

  if (ordersError) {
    console.error("❌ Orders table not accessible");
    console.error("   This is expected - only admins can view orders");
    console.error("   Error:", ordersError.message);
  } else {
    console.log("✅ Orders table is accessible");
  }

  console.log("\n📋 Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  if (!profilesError && admins && admins.length > 0) {
    console.log("✅ Setup appears to be complete!");
    console.log("   You can now log in at: /admin/login");
  } else {
    console.log("⚠️  Setup is incomplete. Please:");
    if (profilesError) {
      console.log("   1. Run the migration: npm run migrate:security");
    }
    if (!admins || admins.length === 0) {
      console.log("   2. Create an admin user (see QUICK_START.md)");
    }
  }

  console.log("\n📚 For detailed instructions, see QUICK_START.md");
}

checkSetup().catch((error) => {
  console.error("❌ Error running setup check:", error);
  process.exit(1);
});
