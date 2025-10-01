import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ENV } from "./lib/env";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to login and signup pages without authentication
  if (
    pathname === "/admin/login" ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/auth/")
  ) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    ENV.NEXT_PUBLIC_SUPABASE_URL,
    ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          response.cookies.delete({
            name,
            ...options,
          });
        },
      },
    }
  );

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect /orders routes - require authentication
  if (pathname.startsWith("/orders")) {
    if (!user) {
      const redirectUrl = new URL("/login?returnTo=" + pathname, request.url);
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!user) {
      // Redirect to login if not authenticated
      const redirectUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // Check if user has admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      // Redirect to home if not admin
      const redirectUrl = new URL("/", request.url);
      return NextResponse.redirect(redirectUrl);
    }

    return response;
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
