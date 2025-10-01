"use client";

import type React from "react";

import { useState, useEffect } from "react";
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
import { Minus, Plus, ShoppingCart } from "lucide-react";
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

const breadCategories = [
  {
    title: "לחם חיטה מלאה",
    price: 24,
    breads: [
      { id: 1, name: "בציפוי צ'יה" },
      { id: 2, name: "בציפוי שומשום" },
      { id: 3, name: "עם עגבניות מיובשות" },
      { id: 4, name: "עם זיתים" },
    ],
  },
  {
    title: "לחם זרעים",
    price: 28,
    breads: [
      { id: 5, name: "עם שומשום" },
      { id: 6, name: "עם גרעיני דלעת" },
      { id: 7, name: "עם צ'יה" },
      { id: 8, name: "עם פשתן" },
      { id: 9, name: "עם פרג" },
    ],
  },
  {
    title: "לחם כוסמין",
    price: 28,
    breads: [
      { id: 10, name: "בציפוי שומשום" },
      { id: 11, name: "בציפוי צ'יה" },
      { id: 12, name: "עם פרג ואגוזים" },
    ],
  },
  {
    title: "לחם ארבעה קמחים",
    price: 28,
    breads: [
      { id: 13, name: "בציפוי שומשום" },
      { id: 14, name: "בציפוי זרעים" },
    ],
  },
];

export default function HomePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [cart, setCart] = useState<Record<number, number>>({});
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerCity, setCustomerCity] = useState("כפר יהושוע");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasSavedOrder, setHasSavedOrder] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showClearDialog, setShowClearDialog] = useState(false);

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

    // Check if there's any meaningful data to save
    const hasData =
      Object.keys(cart).length > 0 ||
      customerName.trim() !== "" ||
      customerPhone.trim() !== "" ||
      customerAddress.trim() !== "" ||
      deliveryDate !== "" ||
      notes.trim() !== "";

    if (hasData) {
      localStorage.setItem("currentOrder", JSON.stringify(orderData));
      setHasSavedOrder(true);
    } else {
      localStorage.removeItem("currentOrder");
      setHasSavedOrder(false);
    }
  }, [
    cart,
    customerName,
    customerPhone,
    customerAddress,
    customerCity,
    deliveryDate,
    notes,
    isInitialLoad,
  ]);

  // Check authentication and load saved order
  useEffect(() => {
    const supabase = createClient();

    // Check if there's saved order data immediately
    const currentOrder = localStorage.getItem("currentOrder");
    if (currentOrder) {
      setHasSavedOrder(true);
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);

      // Pre-fill user data if logged in
      if (user) {
        setCustomerName(user.user_metadata?.full_name || user.email || "");
      }

      // Load pending order from localStorage (from login redirect)
      const pendingOrder = localStorage.getItem("pendingOrder");
      if (pendingOrder) {
        try {
          const orderData = JSON.parse(pendingOrder);
          setCart(orderData.cart || {});
          setCustomerName(orderData.customerName || "");
          setCustomerPhone(orderData.customerPhone || "");
          setCustomerAddress(orderData.customerAddress || "");
          setCustomerCity(orderData.customerCity || "כפר יהושוע");
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
            if (!user) {
              // Only load form data if not logged in (don't override user data)
              setCustomerName(orderData.customerName || "");
            }
            setCustomerPhone(orderData.customerPhone || "");
            setCustomerAddress(orderData.customerAddress || "");
            setCustomerCity(orderData.customerCity || "כפר יהושוע");
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
  }, []);

  // Calculate next Tuesday and Friday dates
  const getNextDeliveryDate = (targetDay: number) => {
    const today = new Date();
    const currentDay = today.getDay();
    let daysUntilTarget = targetDay - currentDay;

    if (daysUntilTarget <= 0) {
      daysUntilTarget += 7;
    }

    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntilTarget);

    return {
      dateString: targetDate.toLocaleDateString("he-IL", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      }),
      date: targetDate,
    };
  };

  const tuesdayData = getNextDeliveryDate(2); // 2 = Tuesday
  const fridayData = getNextDeliveryDate(5); // 5 = Friday

  // Order delivery options by date
  const deliveryOptions = [
    {
      value: "tuesday",
      label: "יום שלישי",
      date: tuesdayData.date,
      dateString: tuesdayData.dateString,
    },
    {
      value: "friday",
      label: "יום שישי",
      date: fridayData.date,
      dateString: fridayData.dateString,
    },
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

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
    for (const category of breadCategories) {
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
      toast({
        title: "שגיאה",
        description: "יש לבחור תאריך משלוח",
        variant: "destructive",
      });
      return;
    }

    if (customerPhone.length < 10) {
      toast({
        title: "שגיאה",
        description: "מספר טלפון לא תקין",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Convert cart to items format
    const orderItems = Object.entries(cart).reduce((acc, [id, quantity]) => {
      const bread = findBreadById(Number(id));
      if (bread) {
        // Format: "Category - Option"
        const fullName = `${bread.categoryTitle} - ${bread.name}`;
        acc[fullName] = quantity;
      }
      return acc;
    }, {} as Record<string, number>);

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
      setCustomerCity("כפר יהושוע");
      setDeliveryDate("");
      setNotes("");

      // Clear saved order from localStorage
      localStorage.removeItem("currentOrder");
      setHasSavedOrder(false);
    } catch (error) {
      console.error("Error submitting order:", error);
      toast({
        title: "שגיאה",
        description: "שגיאה בלתי צפויה. אנא נסה שוב",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearOrder = () => {
    setCart({});
    setCustomerName(user?.user_metadata?.full_name || user?.email || "");
    setCustomerPhone("");
    setCustomerAddress("");
    setCustomerCity("כפר יהושוע");
    setDeliveryDate("");
    setNotes("");
    localStorage.removeItem("currentOrder");
    setHasSavedOrder(false);
    setShowClearDialog(false);

    toast({
      title: "ההזמנה נוקתה",
      description: "כל פרטי ההזמנה נמחקו",
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
            {breadCategories.map((category, categoryIndex) => (
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
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <ShoppingCart className="h-5 w-5" />
                  פרטי הזמנה
                </CardTitle>
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

                  <div className="space-y-2">
                    <Label htmlFor="phone">טלפון *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      dir="rtl"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="050-1234567"
                    />
                  </div>

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

                  <div className="space-y-2">
                    <Label>תאריך משלוח *</Label>
                    <RadioGroup
                      dir="rtl"
                      value={deliveryDate}
                      onValueChange={setDeliveryDate}
                      required
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
                            className="cursor-pointer"
                          >
                            {option.label} ({option.dateString})
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
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

                  {/* Clear Order Button - show only when there's saved data */}
                  {hasSavedOrder && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowClearDialog(true)}
                      className="w-full border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800"
                      disabled={isSubmitting}
                    >
                      נקה הזמנה
                    </Button>
                  )}
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
                  כל הלחמים מגיעים פרוסים, ארוזים וטריים – ישר עד דלת הבית
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
