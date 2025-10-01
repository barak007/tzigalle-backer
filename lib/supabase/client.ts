import { createBrowserClient } from "@supabase/ssr";
import { ENV } from "../env";

export function createClient() {
  return createBrowserClient(
    ENV.NEXT_PUBLIC_SUPABASE_URL,
    ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// Helper to sign in with Google
export async function signInWithGoogle(returnTo?: string) {
  const supabase = createClient();
  const redirectUrl = returnTo
    ? `${location.origin}/auth/callback?returnTo=${encodeURIComponent(
        returnTo
      )}`
    : `${location.origin}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectUrl,
    },
  });
  return { data, error };
}

// Helper to sign up with email
export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string,
  phone?: string,
  address?: string,
  city?: string
) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone || null,
        address: address || null,
        city: city || null,
      },
    },
  });
  return { data, error };
}

// Helper to sign in with email
export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

// Helper to sign out
export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  return { error };
}
