import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const returnTo = requestUrl.searchParams.get("returnTo");
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("OAuth callback error:", error);
      // Redirect to login with error message
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }
  }

  // Validate returnTo is a safe internal path
  let redirectPath = "/";
  if (returnTo) {
    try {
      const url = new URL(returnTo, origin);
      // Only allow redirects to same origin
      if (url.origin === origin) {
        redirectPath = url.pathname + url.search;
      }
    } catch {
      // Invalid URL, use default
      redirectPath = "/";
    }
  }

  return NextResponse.redirect(`${origin}${redirectPath}`);
}
