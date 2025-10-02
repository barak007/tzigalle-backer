"use client";

import type React from "react";

import { useState, useEffect, useMemo, useCallback } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createClient } from "@/lib/supabase/client";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { createOrder } from "@/app/actions/orders";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { BREAD_CATEGORIES } from "@/lib/constants/bread-categories";
import { User, UserProfile } from "@/lib/types/user";
import { validateIsraeliPhone } from "@/lib/utils/phone-validator";

export default function HomePage() {
  const router = useRouter();
  const { toast } = useToast();

  // Memoize Supabase client to prevent recreation on every render
  const supabase = useMemo(() => createClient(), []);
  const [cart, setCart] = useState<Record<number, number>>({});
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerCity, setCustomerCity] = useState("כפר יהושע");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSavedOrder, setHasSavedOrder] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showEditFields, setShowEditFields] = useState(false);

  // Validation error states
  const [phoneError, setPhoneError] = useState("");
  const [deliveryDateError, setDeliveryDateError] = useState("");

  // Debounced localStorage save function to improve performance
  const saveToLocalStorage = useCallback((orderData: any) => {
    // Check if there's any meaningful data to save
    const hasData =
      Object.keys(orderData.cart).length > 0 ||
      orderData.customerName.trim() !== "" ||
      orderData.customerPhone.trim() !== "" ||
      orderData.customerAddress.trim() !== "" ||
      orderData.deliveryDate !== "" ||
      orderData.notes.trim() !== "";

    if (hasData) {
      localStorage.setItem("currentOrder", JSON.stringify(orderData));
    } else {
      localStorage.removeItem("currentOrder");
    }
  }, []);

  const debouncedSaveToLocalStorage = useDebounce(saveToLocalStorage, 500);

  // Save current order data to localStorage whenever form changes (after initial load)
  useEffect(() => {
    // Skip saving on initial load to allow data to be loaded first
    if (isInitialLoad) {
      return;
    }

    const orderData = {
      cart,
      customerName,
      customerPhone,
      customerAddress,
      customerCity,
      deliveryDate,
      notes,
    };

    // Use debounced save for better performance
    debouncedSaveToLocalStorage(orderData);

    // Determine if "Clear Order" button should be visible
    // Only show if there are changes beyond user profile details
    const hasCart = Object.keys(cart).length > 0;
    const hasDeliveryDate = deliveryDate !== "";
    const hasNotes = notes.trim() !== "";

    // Check if contact details differ from user profile
    const profileName =
      userProfile?.full_name ||
      user?.user_metadata?.full_name ||
      user?.email ||
      "";
    const profilePhone = userProfile?.phone || "";
    const profileAddress = userProfile?.address || "";
    const profileCity = userProfile?.city || "כפר יהושע";

    const hasChangedName = customerName !== profileName;
    const hasChangedPhone = customerPhone !== profilePhone;
    const hasChangedAddress = customerAddress !== profileAddress;
    const hasChangedCity = customerCity !== profileCity;

    // Show button if there's a cart, delivery date, notes, or changed contact details
    const shouldShowClearButton =
      hasCart ||
      hasDeliveryDate ||
      hasNotes ||
      hasChangedName ||
      hasChangedPhone ||
      hasChangedAddress ||
      hasChangedCity;

    setHasSavedOrder(shouldShowClearButton);
  }, [
    cart,
    customerName,
    customerPhone,
    customerAddress,
    customerCity,
    deliveryDate,
    notes,
    isInitialLoad,
    userProfile,
    user,
    debouncedSaveToLocalStorage,
  ]);

  // Helper function to determine if a field should be shown
  const shouldShowField = (fieldName: keyof UserProfile) => {
    if (showEditFields) return true;
    if (!user || !userProfile) return true;
    return !userProfile[fieldName];
  };

  // Check authentication and load saved order
  useEffect(() => {
    // Check if there's saved order data immediately
    const currentOrder = localStorage.getItem("currentOrder");
    if (currentOrder) {
      setHasSavedOrder(true);
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);

      // Load user profile from profiles table
      if (user) {
        supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) {
              setUserProfile(profile);
              // Pre-fill user data from profile
              setCustomerName(profile.full_name || user.email || "");
              if (profile.phone) setCustomerPhone(profile.phone);
              if (profile.address) setCustomerAddress(profile.address);
              if (profile.city) setCustomerCity(profile.city);
            } else {
              setCustomerName(
                user.user_metadata?.full_name || user.email || ""
              );
            }
          });
      }

      setLoading(false);

      // Load pending order from localStorage (from login redirect)
      const pendingOrder = localStorage.getItem("pendingOrder");
      if (pendingOrder) {
        try {
          const orderData = JSON.parse(pendingOrder);
          setCart(orderData.cart || {});
          setCustomerName(orderData.customerName || "");
          setCustomerPhone(orderData.customerPhone || "");
          setCustomerAddress(orderData.customerAddress || "");
          setCustomerCity(orderData.customerCity || "כפר יהושע");
          setDeliveryDate(orderData.deliveryDate || "");
          setNotes(orderData.notes || "");
          localStorage.removeItem("pendingOrder");

          toast({
            title: "ההזמנה שלך נטענה",
            description: "המשך להזמין מהמקום שבו עצרת",
          });
        } catch (e) {
          console.error("Error loading pending order:", e);
        }
      } else {
        // Load current order from localStorage
        const currentOrder = localStorage.getItem("currentOrder");
        if (currentOrder) {
          try {
            const orderData = JSON.parse(currentOrder);
            setCart(orderData.cart || {});
            // Only load saved form data if not logged in (don't override profile data)
            if (!user) {
              setCustomerName(orderData.customerName || "");
              setCustomerPhone(orderData.customerPhone || "");
              setCustomerAddress(orderData.customerAddress || "");
              setCustomerCity(orderData.customerCity || "כפר יהושע");
            }
            setDeliveryDate(orderData.deliveryDate || "");
            setNotes(orderData.notes || "");
          } catch (e) {
            console.error("Error loading current order:", e);
          }
        }
      }

      // Mark initial load as complete
      setIsInitialLoad(false);
    });
  }, [supabase, toast]);

  // Calculate next delivery dates based on deadlines
  const getNextDeliveryDate = (_deliveryDay: number, deadlineDay: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentDay = today.getDay();

    // Find the next deadline date (or today if it's the deadline day and we haven't passed it yet)
    let daysUntilDeadline = deadlineDay - currentDay;
    if (daysUntilDeadline < 0) {
      daysUntilDeadline += 7; // Next week's deadline
    }

    const deadlineDate = new Date(today);
    deadlineDate.setDate(today.getDate() + daysUntilDeadline);

    // Calculate delivery date (2 days after the deadline)
    const deliveryDate = new Date(deadlineDate);
    deliveryDate.setDate(deadlineDate.getDate() + 2);

    // Calculate days left until deadline
    const daysLeft = Math.ceil(
      (deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      dateString: deliveryDate.toLocaleDateString("he-IL", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      }),
      date: deliveryDate,
      deadlineDate: deadlineDate,
      deadlineString: deadlineDate.toLocaleDateString("he-IL", {
        day: "numeric",
        month: "numeric",
      }),
      daysLeft: daysLeft,
    };
  };

  // Tuesday delivery - order deadline is Sunday (day 0)
  // Friday delivery - order deadline is Wednesday (day 3)
  const deliveryOptions = useMemo(() => {
    const tuesdayData = getNextDeliveryDate(2, 0); // Tuesday delivery, Sunday deadline
    const fridayData = getNextDeliveryDate(5, 3); // Friday delivery, Wednesday deadline

    return [
      {
        value: "tuesday",
        label: "יום שלישי",
        date: tuesdayData.date,
        dateString: tuesdayData.dateString,
        deadline: `הזמנה עד יום ראשון (${tuesdayData.deadlineString})`,
        daysLeft: tuesdayData.daysLeft,
      },
      {
        value: "friday",
        label: "יום שישי",
        date: fridayData.date,
        dateString: fridayData.dateString,
        deadline: `הזמנה עד יום רביעי (${fridayData.deadlineString})`,
        daysLeft: fridayData.daysLeft,
      },
    ].sort((a, b) => a.date.getTime() - b.date.getTime());
  }, []); // Empty dependency array since these dates don't change based on state

  // Phone validation function
  const validatePhone = (phone: string) => {
    if (!phone.trim()) {
      setPhoneError("");
      return false;
    }

    const validation = validateIsraeliPhone(phone);

    if (!validation.isValid) {
      setPhoneError(validation.error || "מספר טלפון לא תקין");
    } else {
      setPhoneError("");
    }
    return validation.isValid;
  };

  // Handle phone input change with validation
  const handlePhoneChange = (value: string) => {
    setCustomerPhone(value);
    if (value.trim()) {
      validatePhone(value);
    } else {
      setPhoneError("");
    }
  };

  const updateQuantity = (breadId: number, change: number) => {
    setCart((prev) => {
      const newQuantity = (prev[breadId] || 0) + change;
      if (newQuantity <= 0) {
        const { [breadId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [breadId]: newQuantity };
    });
  };

  // Helper to find bread by ID across all categories
  const findBreadById = (id: number) => {
    for (const category of BREAD_CATEGORIES) {
      const bread = category.breads.find((b) => b.id === id);
      if (bread) {
        return {
          ...bread,
          price: category.price,
          categoryTitle: category.title,
        };
      }
    }
    return null;
  };

  const totalPrice = Object.entries(cart).reduce((sum, [id, quantity]) => {
    const bread = findBreadById(Number(id));
    return sum + (bread?.price || 0) * quantity;
  }, 0);

  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalItems === 0) return;

    // Check if user is logged in - redirect immediately
    if (!user) {
      // Save form data to localStorage
      const orderData = {
        cart,
        customerName,
        customerPhone,
        customerAddress,
        customerCity,
        deliveryDate,
        notes,
      };
      localStorage.setItem("pendingOrder", JSON.stringify(orderData));

      // Redirect to login page
      router.push("/login?returnTo=/");
      return;
    }

    // Validation
    if (!deliveryDate) {
      setDeliveryDateError("יש לבחור תאריך משלוח");
      toast({
        title: "שגיאה",
        description: "יש לבחור תאריך משלוח",
        variant: "destructive",
      });
      return;
    }
    setDeliveryDateError("");

    // Validate phone
    if (!validatePhone(customerPhone)) {
      toast({
        title: "שגיאה",
        description: phoneError || "מספר טלפון לא תקין",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Convert cart to old items format with fixed prices
    const orderItems = Object.entries(cart).reduce((acc, [id, quantity]) => {
      const bread = findBreadById(Number(id));
      if (bread) {
        acc.push({
          breadId: Number(id),
          name: `${bread.categoryTitle} - ${bread.name}`,
          quantity,
          price: bread.price,
        });
      }
      return acc;
    }, [] as Array<{ breadId: number; name: string; quantity: number; price: number }>);

    try {
      const result = await createOrder({
        customerName,
        customerPhone,
        customerAddress,
        customerCity,
        deliveryDate,
        items: orderItems,
        totalPrice,
        notes,
      });

      if (!result.success) {
        toast({
          title: "שגיאה",
          description: result.error || "שגיאה בשליחת ההזמנה",
          variant: "destructive",
        });
        return;
      }

      // Success!
      toast({
        title: "ההזמנה התקבלה בהצלחה! 🎉",
        description: "נחזור אליך בהקדם לאישור ההזמנה",
      });

      setOrderSuccess(true);
      setCart({});
      setCustomerName(user.user_metadata?.full_name || user.email || "");
      setCustomerPhone("");
      setCustomerAddress("");
      setCustomerCity("כפר יהושע");
      setDeliveryDate("");
      setNotes("");

      // Clear validation errors
      setPhoneError("");
      setDeliveryDateError("");

      // Clear saved order from localStorage
      localStorage.removeItem("currentOrder");
      setHasSavedOrder(false);
    } catch (error) {
      console.error("Unexpected error during order submission:", error);
      toast({
        title: "שגיאה בלתי צפויה",
        description: "אירעה שגיאת רשת או שרת. אנא נסה שוב מאוחר יותר",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearOrder = () => {
    // Clear cart and order-specific details
    setCart({});
    setDeliveryDate("");
    setNotes("");

    // Clear validation errors
    setPhoneError("");
    setDeliveryDateError("");

    // Reset to user's saved profile info (if available)
    if (userProfile) {
      setCustomerName(userProfile.full_name || user?.email || "");
      setCustomerPhone(userProfile.phone || "");
      setCustomerAddress(userProfile.address || "");
      setCustomerCity(userProfile.city || "כפר יהושע");
    } else {
      // If no profile, reset to basic user info
      setCustomerName(user?.user_metadata?.full_name || user?.email || "");
      setCustomerPhone("");
      setCustomerAddress("");
      setCustomerCity("כפר יהושע");
    }

    localStorage.removeItem("currentOrder");
    setHasSavedOrder(false);
    setShowClearDialog(false);
    setShowEditFields(false); // Reset edit mode

    toast({
      title: "ההזמנה נוקתה",
      description: "העגלה והפרטים האישיים אופסו לברירת המחדל",
    });
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <CardTitle className="text-2xl text-amber-900">
              ההזמנה התקבלה בהצלחה!
            </CardTitle>
            <CardDescription className="text-lg">
              תודה שהזמנת מציגלה
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              נחזור אליך בהקדם לאישור ההזמנה
            </p>
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => setOrderSuccess(false)}
                className="w-full bg-amber-700 hover:bg-amber-800"
              >
                חזרה לדף הראשי
              </Button>
              <Button
                onClick={() => router.push("/orders")}
                variant="outline"
                className="w-full"
              >
                צפה בהזמנות שלי
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-amber-50 relative bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url(/bakery-2.jpg)" }}
      dir="rtl"
    >
      <div className="absolute inset-0 bg-amber-50/90"></div>
      {/* Header */}
      <header
        className="bg-amber-900 text-amber-50 py-8 px-4 relative bg-cover bg-center"
        style={{ backgroundImage: "url(/bakery-1.jpg)" }}
      >
        <div className="absolute inset-0 bg-amber-900/70"></div>
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 font-serif">
            ציגלה
          </h1>
          <p className="text-lg md:text-xl text-amber-100 leading-relaxed max-w-3xl mx-auto text-balance">
            הלחמים שלנו נאפים באהבה מקמחים איכותיים ומחמצת טבעית <br /> כדי שכל
            פרוסה תרגיש כמו בבית
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 md:p-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Products Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-amber-900 mb-4">
              מגוון הלחמים שלנו
            </h2>
            {BREAD_CATEGORIES.map((category, categoryIndex) => (
              <div key={categoryIndex} className="space-y-3">
                {/* Category Title */}
                <div className="bg-amber-800 text-white px-4 py-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold">{category.title}</h3>
                    <span className="text-amber-100 font-semibold">
                      {category.price} ₪
                    </span>
                  </div>
                </div>

                {/* Category Options */}
                <div className="space-y-2 pr-2">
                  {category.breads.map((bread) => (
                    <Card
                      key={bread.id}
                      className="bg-white/80 backdrop-blur-sm p-0"
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="text-amber-900 leading-relaxed">
                              {bread.name}
                            </h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => updateQuantity(bread.id, -1)}
                              disabled={!cart[bread.id]}
                              className="h-8 w-8"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-semibold">
                              {cart[bread.id] || 0}
                            </span>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => updateQuantity(bread.id, 1)}
                              className="h-8 w-8 bg-amber-700 text-white hover:bg-amber-800"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Order Form */}
          <div className="sticky top-24">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between min-h-[2rem]">
                  <CardTitle className="flex items-center gap-2 text-amber-900">
                    <ShoppingCart className="h-5 w-5" />
                    פרטי הזמנה
                  </CardTitle>
                  {/* Clear Order Button in header */}
                  {hasSavedOrder && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowClearDialog(true)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8"
                      disabled={isSubmitting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Auth Notice */}
                  {!loading && !user && totalItems > 0 && (
                    <Alert className="bg-amber-50 border-amber-300">
                      <AlertDescription className="text-amber-900">
                        💡 תתבקש להתחבר או להירשם לפני השלמת ההזמנה
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Order Summary */}
                  {totalItems > 0 && (
                    <div className="space-y-2 p-3 bg-amber-50/50 rounded-lg border border-amber-200">
                      <h3 className="font-semibold text-amber-900 text-sm">
                        סיכום הזמנה:
                      </h3>
                      {Object.entries(cart).map(([id, quantity]) => {
                        const bread = findBreadById(Number(id));
                        if (!bread) return null;
                        return (
                          <div
                            key={id}
                            className="flex justify-between items-center text-sm"
                          >
                            <span className="text-amber-900">
                              {bread.categoryTitle} - {bread.name}
                            </span>
                            <span className="font-semibold text-amber-700">
                              {quantity} × {bread.price}₪ ={" "}
                              {quantity * bread.price}₪
                            </span>
                          </div>
                        );
                      })}
                      <div className="pt-2 border-t border-amber-300 flex justify-between font-bold text-amber-900">
                        <span>סה"כ:</span>
                        <span>
                          {totalItems} פריטים - {totalPrice}₪
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Show saved info summary if user has profile data and fields are hidden */}
                  {user &&
                    userProfile &&
                    (userProfile.phone ||
                      userProfile.address ||
                      userProfile.city) &&
                    !showEditFields && (
                      <div className="space-y-2 p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-green-900 text-sm mb-2">
                              ✓ הפרטים שלך ימולאו אוטומטית:
                            </h3>
                            <div className="space-y-1 text-sm text-green-800">
                              <p>📧 {customerName}</p>
                              {userProfile.phone && (
                                <p>📞 {userProfile.phone}</p>
                              )}
                              {userProfile.address && (
                                <p>
                                  📍 {userProfile.address}
                                  {userProfile.city && `, ${userProfile.city}`}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowEditFields(true)}
                            className="border-green-300 text-green-700 hover:bg-green-100"
                          >
                            ערוך
                          </Button>
                        </div>
                        <p className="text-xs text-green-700 mt-2">
                          רוצה לשנות את הפרטים להזמנה זו? לחץ על "ערוך"
                        </p>
                      </div>
                    )}

                  {/* Conditionally show name field */}
                  {shouldShowField("full_name") && (
                    <div className="space-y-2">
                      <Label htmlFor="name">שם מלא *</Label>
                      <Input
                        id="name"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="הכנס שם מלא"
                      />
                    </div>
                  )}

                  {/* Conditionally show phone, address, city fields */}
                  {shouldShowField("phone") && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="phone"
                        className={phoneError ? "text-red-600" : ""}
                      >
                        טלפון *
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        dir="rtl"
                        required
                        value={customerPhone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        onBlur={() => validatePhone(customerPhone)}
                        placeholder="050-1234567"
                        className={
                          phoneError
                            ? "border-red-500 focus-visible:ring-red-500"
                            : ""
                        }
                      />
                      {phoneError && (
                        <p className="text-sm text-red-600">{phoneError}</p>
                      )}
                    </div>
                  )}

                  {shouldShowField("address") && (
                    <div className="space-y-2">
                      <Label htmlFor="address">כתובת *</Label>
                      <Input
                        id="address"
                        required
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        placeholder="רחוב ומספר בית"
                      />
                    </div>
                  )}

                  {shouldShowField("city") && (
                    <div className="space-y-2">
                      <Label htmlFor="city">עיר *</Label>
                      <Input
                        id="city"
                        required
                        value={customerCity}
                        onChange={(e) => setCustomerCity(e.target.value)}
                        placeholder="שם העיר"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className={deliveryDateError ? "text-red-600" : ""}>
                      תאריך משלוח *
                    </Label>
                    <RadioGroup
                      dir="rtl"
                      value={deliveryDate}
                      onValueChange={(value) => {
                        setDeliveryDate(value);
                        setDeliveryDateError("");
                      }}
                      required
                      className={
                        deliveryDateError
                          ? "border border-red-500 rounded-lg p-2"
                          : ""
                      }
                    >
                      {deliveryOptions.map((option) => (
                        <div
                          key={option.value}
                          className="flex items-center space-x-2 gap-2 space-x-reverse"
                        >
                          <RadioGroupItem
                            value={option.value}
                            id={option.value}
                          />
                          <Label
                            htmlFor={option.value}
                            className="cursor-pointer flex flex-col items-start"
                          >
                            <span className="font-semibold">
                              {option.label} ({option.dateString})
                            </span>
                            <span className="text-xs text-amber-600">
                              {option.deadline}
                              {option.daysLeft >= 0 && (
                                <span
                                  className={`mr-1 font-semibold ${
                                    option.daysLeft === 0
                                      ? "text-red-600"
                                      : option.daysLeft === 1
                                      ? "text-orange-600"
                                      : "text-green-600"
                                  }`}
                                >
                                  •{" "}
                                  {option.daysLeft === 0
                                    ? "יום אחרון!"
                                    : `נשארו ${option.daysLeft} ימים`}
                                </span>
                              )}
                            </span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                    {deliveryDateError && (
                      <p className="text-sm text-red-600">
                        {deliveryDateError}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">הערות (אופציונלי)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="הערות נוספות להזמנה"
                      rows={3}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-amber-700 hover:bg-amber-800 text-lg py-6"
                    disabled={totalItems === 0 || isSubmitting || loading}
                  >
                    {isSubmitting
                      ? "שולח הזמנה..."
                      : !user
                      ? `המשך להזמנה (${totalPrice} ₪)`
                      : `שלח הזמנה (${totalPrice} ₪)`}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Info Card */}
        <Card className="bg-gradient-to-br from-amber-100/90 to-amber-200/90 backdrop-blur-sm border-2 border-amber-300 shadow-lg mt-8">
          <CardContent className="p-6 md:p-8">
            <div className="grid md:grid-cols-3 gap-6 text-center md:text-right">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-amber-900 mb-3">
                  🍞 איכות מובטחת
                </h3>
                <p className="text-amber-800 leading-relaxed">
                  כל הלחמים מגיעים פרוסים, ארוזים וטריים <br /> ישר עד דלת הבית
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-amber-900 mb-3">
                  📅 זמני הזמנה
                </h3>
                <p className="text-amber-800">
                  לקבלת לחם ביום <span className="font-semibold">שלישי</span> –
                  הזמנה עד יום ראשון
                </p>
                <p className="text-amber-800">
                  לקבלת לחם ביום <span className="font-semibold">שישי</span> –
                  הזמנה עד יום רביעי
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-amber-900 mb-3">
                  📞 צור קשר
                </h3>
                <p className="text-amber-900 font-bold text-xl">052-5757744</p>
                <p className="text-amber-800 font-semibold">יורם</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clear Order Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>נקה הזמנה?</AlertDialogTitle>
            <AlertDialogDescription>
              האם אתה בטוח שברצונך לנקות את כל ההזמנה? פעולה זו תמחק את כל
              הפריטים והפרטים שהזנת ולא ניתן לבטלה.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearOrder}
              className="bg-red-600 hover:bg-red-700"
            >
              נקה הזמנה
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
