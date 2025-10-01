#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";
import * as readline from "readline";

// Load environment variables
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Error: Missing environment variables");
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function checkAdmin() {
  console.log("🔍 Checking admin users...\n");

  try {
    // Get all users
    const { data: users, error: usersError } =
      await supabase.auth.admin.listUsers();

    if (usersError) {
      console.error("❌ Error fetching users:", usersError.message);
      process.exit(1);
    }

    console.log(`📊 Total users: ${users?.users.length || 0}\n`);

    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*");

    if (profilesError) {
      console.error("❌ Error fetching profiles:", profilesError.message);
      process.exit(1);
    }

    console.log("👥 Users and their roles:\n");
    console.log("=".repeat(70));

    for (const user of users?.users || []) {
      const profile = profiles?.find((p) => p.id === user.id);
      console.log(`📧 Email: ${user.email}`);
      console.log(`🆔 ID: ${user.id}`);
      console.log(`👤 Role: ${profile?.role || "NO PROFILE"}`);
      console.log(
        `✅ Email Confirmed: ${user.email_confirmed_at ? "Yes" : "No"}`
      );
      console.log(`📅 Created: ${new Date(user.created_at).toLocaleString()}`);
      console.log("-".repeat(70));
    }

    const adminCount = profiles?.filter((p) => p.role === "admin").length || 0;
    console.log(`\n🔐 Total admin users: ${adminCount}`);

    if (adminCount === 0) {
      console.log("\n⚠️  WARNING: No admin users found!");
      console.log("Run 'npm run add-admin' to create an admin user.");
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
  }
}

// Run the script
checkAdmin();
