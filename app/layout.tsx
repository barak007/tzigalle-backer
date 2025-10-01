import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { UserProfile } from "@/components/user-profile";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "ציגלה - מאפייה ביתית",
  description: "לחמים טריים ואיכותיים עם משלוח עד הבית",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if on admin or auth pages to hide navigation
  const hideNav = false; // We'll handle this in the component

  return (
    <html lang="he">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          {/* Navigation Header */}
          <nav
            className="bg-white border-b border-amber-200 sticky top-0 z-50"
            dir="rtl"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <Link
                  href="/"
                  className="text-2xl font-bold text-amber-900 hover:text-amber-700 transition"
                >
                  🥖 ציגלה
                </Link>

                <div className="flex items-center gap-4">
                  {user ? (
                    <>
                      <Link href="/orders">
                        <Button variant="ghost">ההזמנות שלי</Button>
                      </Link>
                      <UserProfile user={user} />
                    </>
                  ) : (
                    <>
                      <Link href="/login">
                        <Button variant="ghost">התחבר</Button>
                      </Link>
                      <Link href="/signup">
                        <Button>הירשם</Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </nav>

          {children}
          <Analytics />
          <Toaster />
        </Suspense>
      </body>
    </html>
  );
}
