"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserProfile } from "@/components/user-profile";
import { Button } from "@/components/ui/button";
import { User } from "@supabase/supabase-js";

interface HeaderProps {
  user: User | null;
}

export function Header({ user }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`border-b sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-amber-50/80 backdrop-blur-md shadow-lg border-amber-300"
          : "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200"
      }`}
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
              <UserProfile user={user} />
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-amber-900 hover:text-amber-700 hover:bg-amber-100"
                  >
                    התחבר
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                    הירשם
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
