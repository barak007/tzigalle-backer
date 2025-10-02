"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logError, getUserErrorMessage } from "@/lib/utils/error-handler";
import { checkRateLimit, RATE_LIMITS } from "@/lib/utils/rate-limit";

export async function adminLogin(email: string, password: string) {
  try {
    // Rate limiting: Prevent brute force attacks
    // Use email as identifier for login attempts
    const rateLimitResult = checkRateLimit(email, RATE_LIMITS.LOGIN);

    if (!rateLimitResult.success) {
      const resetDate = new Date(rateLimitResult.resetTime);
      const resetTimeStr = resetDate.toLocaleTimeString("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
      });

      logError(new Error("Rate limit exceeded for login"), {
        action: "adminLogin:rateLimit",
        data: { email },
      });

      return {
        success: false,
        error: `יותר מדי ניסיונות התחברות. אנא נסה שוב ב-${resetTimeStr}`,
      };
    }

    const supabase = await createClient();

    // Attempt to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      logError(error || new Error("No user data"), {
        action: "adminLogin:signIn",
        data: { email },
      });

      return {
        success: false,
        error: getUserErrorMessage(
          error,
          "שגיאה בהתחברות. אנא בדוק את הפרטים ונסה שוב."
        ),
      };
    }

    // Check role server-side - CRITICAL SECURITY
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      logError(profileError, {
        action: "adminLogin:fetchProfile",
        userId: data.user.id,
      });

      await supabase.auth.signOut();
      return {
        success: false,
        error: getUserErrorMessage(profileError, "שגיאה בבדיקת הרשאות"),
      };
    }

    if (!profile || profile.role !== "admin") {
      logError(new Error("Unauthorized admin access attempt"), {
        action: "adminLogin:unauthorized",
        userId: data.user.id,
        data: { email, role: profile?.role },
      });

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
  } catch (error) {
    logError(error, {
      action: "adminLogin:unexpected",
      data: { email },
    });

    return {
      success: false,
      error: getUserErrorMessage(error, "שגיאה בלתי צפויה"),
    };
  }
}
