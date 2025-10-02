"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function adminLogin(email: string, password: string) {
  const supabase = await createClient();

  // Attempt to sign in
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return {
      success: false,
      error: "שגיאה בהתחברות. אנא בדוק את הפרטים ונסה שוב.",
    };
  }

  // Check role server-side - CRITICAL SECURITY
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    // Sign out immediately if not admin
    await supabase.auth.signOut();
    return {
      success: false,
      error: "אין לך הרשאות גישה למערכת הניהול",
    };
  }

  // Revalidate the admin path to ensure fresh data
  revalidatePath("/admin");

  return { success: true };
}
