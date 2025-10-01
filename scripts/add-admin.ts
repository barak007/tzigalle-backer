#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";
import * as readline from "readline";

// Load environment variables
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// Validate environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Error: Missing required environment variables");
  console.error("Please make sure you have:");
  console.error("  - NEXT_PUBLIC_SUPABASE_URL");
  console.error("  - SUPABASE_SERVICE_ROLE_KEY");
  console.error("in your .env.local file");
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface Question {
  question: string;
  hidden?: boolean;
}

async function askQuestion({
  question,
  hidden = false,
}: Question): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    if (hidden) {
      // Hide input for password
      const stdin = process.stdin;
      (stdin as any).setRawMode(true);
      stdin.resume();
      stdin.setEncoding("utf8");

      process.stdout.write(question);
      let password = "";

      stdin.on("data", function listener(char: string) {
        const charStr = char.toString();

        switch (charStr) {
          case "\n":
          case "\r":
          case "\u0004": // Ctrl-D
            stdin.removeListener("data", listener);
            (stdin as any).setRawMode(false);
            stdin.pause();
            process.stdout.write("\n");
            rl.close();
            resolve(password);
            break;
          case "\u0003": // Ctrl-C
            process.exit();
            break;
          case "\u007f": // Backspace
            password = password.slice(0, -1);
            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
            process.stdout.write(question + "*".repeat(password.length));
            break;
          default:
            password += charStr;
            process.stdout.write("*");
            break;
        }
      });
    } else {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer);
      });
    }
  });
}

async function createAdmin() {
  console.log("🔐 Add New Admin User to Tzigla Bakery\n");

  try {
    // Get email
    const email = await askQuestion({ question: "Enter admin email: " });
    if (!email || !email.includes("@")) {
      console.error("❌ Invalid email address");
      process.exit(1);
    }

    // Get password
    const password = await askQuestion({
      question: "Enter password (min 6 characters): ",
      hidden: true,
    });
    if (!password || password.length < 6) {
      console.error("❌ Password must be at least 6 characters");
      process.exit(1);
    }

    // Confirm password
    const confirmPassword = await askQuestion({
      question: "Confirm password: ",
      hidden: true,
    });
    if (password !== confirmPassword) {
      console.error("❌ Passwords do not match");
      process.exit(1);
    }

    console.log("\n🔄 Creating admin user...");

    // Check if user already exists
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const userExists = existingUser?.users.find((u) => u.email === email);

    let userId: string;

    if (userExists) {
      console.log("⚠️  User already exists, updating role to admin...");
      userId = userExists.id;
    } else {
      // Create new user using Admin API
      const { data: newUser, error: createError } =
        await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true, // Auto-confirm email
        });

      if (createError || !newUser.user) {
        console.error("❌ Error creating user:", createError?.message);
        process.exit(1);
      }

      userId = newUser.user.id;
      console.log("✅ User created successfully");
    }

    // Update or insert profile with admin role
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: userId,
        email: email,
        role: "admin",
      },
      { onConflict: "id" }
    );

    if (profileError) {
      console.error("❌ Error setting admin role:", profileError.message);
      process.exit(1);
    }

    console.log("✅ Admin role assigned successfully");
    console.log("\n🎉 Admin user created successfully!");
    console.log(`📧 Email: ${email}`);
    console.log("🔗 You can now login at: http://localhost:3000/admin/login\n");
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
  }
}

// Run the script
createAdmin();
