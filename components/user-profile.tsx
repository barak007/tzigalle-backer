"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User } from "@supabase/supabase-js";

interface UserProfileProps {
  user: User;
}

export function UserProfile({ user }: UserProfileProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  const getInitials = (name?: string) => {
    if (!name) return user.email?.[0].toUpperCase() || "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isHebrew = (text: string) => {
    // Check if text contains Hebrew characters (Unicode range: \u0590-\u05FF)
    return /[\u0590-\u05FF]/.test(text);
  };

  const displayName = user.user_metadata?.full_name || user.email;
  const avatarUrl = user.user_metadata?.avatar_url;
  const nameAlignment = isHebrew(displayName || "")
    ? "text-center"
    : "text-left";

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        onClick={() => router.push("/orders")}
        className="border-amber-300 text-amber-900 hover:bg-amber-100 hover:border-amber-400"
        aria-label="עבור לדף ההזמנות שלי"
      >
        ההזמנות שלי
      </Button>
      <div className="relative group">
        <button
          className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-amber-400 hover:ring-offset-2 transition-all"
          aria-label="פתח תפריט פרופיל"
        >
          <Avatar className="h-10 w-10 border-2 border-amber-300">
            <AvatarImage src={avatarUrl} alt={displayName || ""} />
            <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white font-semibold">
              {getInitials(user.user_metadata?.full_name)}
            </AvatarFallback>
          </Avatar>
        </button>
        <div className="absolute left-0 mt-2 w-56 bg-gradient-to-br from-amber-50 to-orange-50 rounded-md shadow-xl border-2 border-amber-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="p-3 border-b border-amber-200">
            <p
              className={`text-sm font-medium text-amber-900 ${nameAlignment}`}
            >
              {displayName}
            </p>
            <p className={`text-xs text-amber-700 mt-1 ${nameAlignment}`}>
              {user.email}
            </p>
          </div>
          <div className="p-2 space-y-1">
            <button
              onClick={() => router.push("/settings")}
              className="w-full text-right px-3 py-2 text-sm text-amber-900 hover:bg-amber-100 rounded transition font-medium"
              aria-label="עבור להגדרות פרופיל"
            >
              הגדרות פרופיל
            </button>
            <button
              onClick={handleSignOut}
              className="w-full text-right px-3 py-2 text-sm text-amber-900 hover:bg-amber-100 rounded transition font-medium"
              aria-label="התנתק מהמערכת"
            >
              התנתק
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
