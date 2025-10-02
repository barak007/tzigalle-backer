"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { SUPPORTED_CITIES } from "@/lib/constants/cities";

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login?returnTo=/settings");
      return;
    }

    setUser(user);

    // Fetch profile data from profiles table
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error loading profile:", error);
      setError("שגיאה בטעינת הפרופיל");
    } else if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setAddress(profile.address || "");
      setCity(profile.city || "");
    }

    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const supabase = createClient();

    // Update profile in profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone: phone || null,
        address: address || null,
        city: city || null,
      })
      .eq("id", user.id);

    if (profileError) {
      console.error("Error updating profile:", profileError);
      setError("שגיאה בעדכון הפרופיל");
      toast({
        title: "שגיאה",
        description: "לא ניתן לעדכן את הפרופיל",
        variant: "destructive",
      });
    } else {
      toast({
        title: "הפרופיל עודכן",
        description: "הפרטים שלך נשמרו בהצלחה",
      });
      router.refresh();
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div
        className="min-h-screen bg-amber-50 relative bg-cover bg-center bg-fixed flex items-center justify-center"
        style={{ backgroundImage: "url(/bakery-2.jpg)" }}
        dir="rtl"
      >
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">טוען...</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-amber-50 relative bg-cover bg-center bg-fixed p-4"
      style={{ backgroundImage: "url(/bakery-2.jpg)" }}
      dir="rtl"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-amber-50/90 to-orange-100/80 backdrop-blur-sm" />
      <div className="relative max-w-2xl mx-auto py-8">
        <Link href="/">
          <Button
            variant="ghost"
            className="mb-4 text-amber-900 hover:bg-amber-100"
          >
            <ArrowRight className="ml-2 h-4 w-4" />
            חזרה לדף הבית
          </Button>
        </Link>

        <Card className="bg-white/90 backdrop-blur-sm border-2 border-amber-200">
          <CardHeader>
            <CardTitle className="text-2xl text-amber-900">
              הגדרות פרופיל
            </CardTitle>
            <CardDescription>
              עדכן את הפרטים האישיים שלך - הם ימולאו אוטומטית בהזמנות חדשות
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">אימייל</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-xs text-muted-foreground">
                  לא ניתן לשנות את כתובת האימייל
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">שם מלא *</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="הכנס את שמך המלא"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">טלפון</Label>
                <Input
                  id="phone"
                  type="tel"
                  dir="rtl"
                  placeholder="050-1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={saving}
                />
                <p className="text-xs text-muted-foreground">
                  ימולא אוטומטית בהזמנות חדשות
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">כתובת</Label>
                <Input
                  id="address"
                  placeholder="רחוב ומספר בית"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={saving}
                />
                <p className="text-xs text-muted-foreground">
                  ימולא אוטומטית בהזמנות חדשות
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">עיר</Label>
                <Select
                  value={city}
                  onValueChange={setCity}
                  disabled={saving}
                  dir="rtl"
                >
                  <SelectTrigger id="city">
                    <SelectValue placeholder="בחר עיר" />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    {SUPPORTED_CITIES.map((supportedCity) => (
                      <SelectItem key={supportedCity} value={supportedCity}>
                        {supportedCity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  ימולא אוטומטית בהזמנות חדשות
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-amber-700 hover:bg-amber-800"
                  disabled={saving}
                >
                  {saving ? "שומר..." : "שמור שינויים"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/")}
                  disabled={saving}
                >
                  ביטול
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
