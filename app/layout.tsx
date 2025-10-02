import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: "ציגלה - מאפייה ביתית | הזמנת לחמים",
  description:
    "הזמינו לחם ביתי איכותי עם משלוח ישירות לכפר יהושע ולסביבה. לחמים טריים ואיכותיים מאפייה ביתית",
  keywords: "לחם, מאפייה ביתית, כפר יהושע, משלוחים, לחם ביתי, מאפים, לחם טרי",
  authors: [{ name: "ציגלה מאפייה ביתית" }],
  openGraph: {
    title: "ציגלה - מאפייה ביתית | הזמנת לחמים",
    description: "הזמינו לחם ביתי איכותי עם משלוח ישירות לכפר יהושע ולסביבה",
    type: "website",
    locale: "he_IL",
    siteName: "ציגלה - מאפייה ביתית",
    images: [
      {
        url: "/bakery-1.jpg",
        width: 1200,
        height: 630,
        alt: "ציגלה - מאפייה ביתית",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ציגלה - מאפייה ביתית | הזמנת לחמים",
    description: "הזמינו לחם ביתי איכותי עם משלוח ישירות לכפר יהושע",
    images: ["/bakery-1.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
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

  return (
    <html lang="he">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          {/* Navigation Header */}
          <Header user={user} />
          {children}
          <Analytics />
          <Toaster />
        </Suspense>
      </body>
    </html>
  );
}
