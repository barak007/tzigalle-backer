"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { BREAD_CATEGORIES } from "@/lib/constants/bread-categories";
import { createOrder } from "@/app/actions/orders";
import { validateIsraeliPhone } from "@/lib/utils/phone-validator";
import { getDeliveryOptions } from "@/lib/utils/order-delivery";
import { useOrderState } from "@/hooks/use-order-state";

// Components
import { ProductList } from "@/components/order/ProductList";
import { OrderSummary } from "@/components/order/OrderSummary";
import { DeliveryOptions } from "@/components/order/DeliveryOptions";
import { OrderForm } from "@/components/order/OrderForm";
import { SuccessMessage } from "@/components/order/SuccessMessage";
import { FooterInfo } from "@/components/order/FooterInfo";
import { ClearOrderDialog } from "@/components/order/ClearOrderDialog";

export default function HomePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showClearDialog, setShowClearDialog] = useState(false);

  // Get all order state from custom hook
  const {
    user,
    loading,
    cart,
    customerName,
    customerPhone,
    customerAddress,
    customerCity,
    deliveryDate,
    notes,
    isSubmitting,
    orderSuccess,
    hasSavedOrder,
    showEditFields,
    phoneError,
    deliveryDateError,
    totalPrice,
    totalItems,
    hasUserName,
    hasUserPhone,
    hasUserAddress,
    hasUserCity,
    setCustomerName,
    setCustomerPhone,
    setCustomerAddress,
    setCustomerCity,
    setDeliveryDate,
    setNotes,
    setIsSubmitting,
    setPhoneError,
    setDeliveryDateError,
    setShowEditFields,
    addToCart,
    removeFromCart,
    clearOrder,
    resetAfterSuccess,
    findBreadById,
  } = useOrderState();

  // Calculate delivery options
  const deliveryOptions = useMemo(() => getDeliveryOptions(), []);

  // Validate phone number
  const validatePhone = (phone: string): boolean => {
    const result = validateIsraeliPhone(phone);
    if (!result.isValid) {
      setPhoneError(result.error || "מספר טלפון לא תקין");
      return false;
    }
    setPhoneError("");
    return true;
  };

  // Handle delivery date change
  const handleDeliveryDateChange = (_value: string, date: Date) => {
    setDeliveryDate(date.toISOString());

    // Validate that the selected delivery date hasn't passed
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) {
      setDeliveryDateError("תאריך האספקה חלף, אנא בחר תאריך עתידי");
    } else {
      setDeliveryDateError("");
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If no user, store order and redirect to login
    if (!user) {
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
      router.push("/login?returnTo=/");
      return;
    }

    // Validate delivery date
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

    // Convert cart to order items format
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

      resetAfterSuccess();
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

  // Handle clear order
  const handleClearOrder = () => {
    clearOrder();
    setShowClearDialog(false);
    toast({
      title: "ההזמנה נוקתה",
      description: "העגלה והפרטים האישיים אופסו לברירת המחדל",
    });
  };

  // Handle new order after success
  const handleNewOrder = () => {
    resetAfterSuccess();
  };

  // Show success message
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
        <SuccessMessage onNewOrder={handleNewOrder} />
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
            <ProductList
              categories={BREAD_CATEGORIES}
              cart={cart}
              onAddToCart={addToCart}
              onRemoveFromCart={removeFromCart}
            />
          </div>

          {/* Order Section */}
          <div className="space-y-6">
            {/* Order Summary */}
            <OrderSummary
              cart={cart}
              totalPrice={totalPrice}
              totalItems={totalItems}
              categories={BREAD_CATEGORIES}
              onClearClick={() => setShowClearDialog(true)}
            />

            {/* Order Form */}
            <Card className="bg-white/90 backdrop-blur-sm border-2 border-amber-200 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-amber-900">
                  פרטי הזמנה
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Delivery Date Selection */}
                <DeliveryOptions
                  options={deliveryOptions}
                  selectedValue={
                    deliveryDate
                      ? deliveryOptions.find((opt) =>
                          opt.date
                            .toISOString()
                            .startsWith(deliveryDate.split("T")[0])
                        )?.value || ""
                      : ""
                  }
                  deliveryDateError={deliveryDateError}
                  onChange={handleDeliveryDateChange}
                />

                {/* Customer Details Form */}
                <OrderForm
                  customerName={customerName}
                  customerPhone={customerPhone}
                  customerAddress={customerAddress}
                  customerCity={customerCity}
                  notes={notes}
                  phoneError={phoneError}
                  isSubmitting={isSubmitting}
                  loading={loading}
                  totalItems={totalItems}
                  totalPrice={totalPrice}
                  showEditFields={showEditFields}
                  onCustomerNameChange={setCustomerName}
                  onCustomerPhoneChange={(value) => {
                    setCustomerPhone(value);
                    if (phoneError) validatePhone(value);
                  }}
                  onCustomerAddressChange={setCustomerAddress}
                  onCustomerCityChange={setCustomerCity}
                  onNotesChange={setNotes}
                  onSubmit={handleSubmit}
                  onToggleEditFields={() => setShowEditFields(!showEditFields)}
                  hasUser={!!user}
                  hasUserName={hasUserName}
                  hasUserPhone={hasUserPhone}
                  hasUserAddress={hasUserAddress}
                  hasUserCity={hasUserCity}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Info */}
        <FooterInfo />
      </div>

      {/* Clear Order Dialog */}
      <ClearOrderDialog
        open={showClearDialog}
        onOpenChange={setShowClearDialog}
        onConfirm={handleClearOrder}
      />
    </div>
  );
}
