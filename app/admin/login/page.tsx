"use client";

import { useState } from "react";
import { adminLogin } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Call server action for secure authentication
    const result = await adminLogin(email, password);

    if (!result.success) {
      setError(result.error || "שגיאה בהתחברות");
      setIsLoading(false);
      return;
    }

    // Redirect to admin dashboard on success
    router.push("/admin");
    router.refresh();
  };

  return (
    <div
      className="min-h-screen bg-amber-50 flex items-center justify-center p-4"
      dir="rtl"
    >
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-amber-100 p-3 rounded-full">
              <Lock className="h-8 w-8 text-amber-700" />
            </div>
          </div>
          <CardTitle className="text-2xl text-amber-900">
            כניסה למערכת הניהול
          </CardTitle>
          <CardDescription>ציגלה - פאנל ניהול הזמנות</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">אימייל</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">סיסמה</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>
            {error && (
              <div className="bg-red-50 text-red-800 p-3 rounded-md text-sm text-center">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-amber-700 hover:bg-amber-800"
              disabled={isLoading}
            >
              {isLoading ? "מתחבר..." : "התחבר"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
