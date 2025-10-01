#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";
import * as readline from "readline";
import { ALL_ENV } from "../lib/env";

// Load environment variables
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const SUPABASE_URL = ALL_ENV.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = ALL_ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create Supabase client (same as the app uses)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function askQuestion(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function testLogin() {
  console.log("🧪 Testing Admin Login Flow\n");

  try {
    const email = await askQuestion("Enter admin email: ");
    const password = await askQuestion("Enter password: ");

    console.log("\n🔄 Step 1: Signing in...");

    const { data: authData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (signInError) {
      console.error("❌ Sign in failed:", signInError.message);
      process.exit(1);
    }

    if (!authData.user) {
      console.error("❌ No user returned");
      process.exit(1);
    }

    console.log("✅ Sign in successful!");
    console.log(`   User ID: ${authData.user.id}`);
    console.log(`   Email: ${authData.user.email}`);

    console.log("\n🔄 Step 2: Fetching profile...");

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    if (profileError) {
      console.error("❌ Profile fetch failed:", profileError);
      console.error("   Code:", profileError.code);
      console.error("   Message:", profileError.message);
      console.error("   Details:", profileError.details);
      console.error("   Hint:", profileError.hint);

      console.log("\n💡 This is likely an RLS (Row Level Security) issue.");
      console.log(
        "   The user cannot read their own profile from the profiles table."
      );

      await supabase.auth.signOut();
      process.exit(1);
    }

    console.log("✅ Profile fetched successfully!");
    console.log(`   Role: ${profile.role}`);

    if (profile.role === "admin") {
      console.log("\n✅ User is an ADMIN!");
      console.log("\n🔄 Step 3: Testing orders access...");

      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("count");

      if (ordersError) {
        console.error("❌ Orders fetch failed:", ordersError.message);
      } else {
        console.log("✅ Can access orders table!");
      }
    } else {
      console.log(`\n❌ User role is "${profile.role}", not "admin"`);
    }

    console.log("\n🎉 Login test completed successfully!");
    console.log(
      "\n📝 If this test passed, the login should work in the browser."
    );
    console.log("   Make sure to:");
    console.log("   1. Clear browser cookies/cache");
    console.log("   2. Use an incognito window");
    console.log("   3. Go to http://localhost:3000/admin/login");

    await supabase.auth.signOut();
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
  }
}

// Run the test
testLogin();
