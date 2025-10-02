"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logError, getUserErrorMessage } from "@/lib/utils/error-handler";
import { validateIsraeliPhone } from "@/lib/utils/phone-validator";
import { checkRateLimit, RATE_LIMITS } from "@/lib/utils/rate-limit";

export interface OrderData {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  deliveryDate: string;
  items: Array<{
    breadId: number;
    name: string;
    quantity: number;
    price: number;
  }>; // Old format with fixed prices
  totalPrice: number;
  notes?: string;
}

export interface OrderResult {
  success: boolean;
  error?: string;
  orderId?: string;
}

export async function createOrder(orderData: OrderData): Promise<OrderResult> {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // This should not happen as we redirect on client side, but just in case
    if (authError || !user) {
      return {
        success: false,
        error: "אירעה שגיאה באימות. אנא התחבר מחדש",
      };
    }

    // Rate limiting: Check if user has exceeded order creation limit
    const rateLimitResult = checkRateLimit(user.id, RATE_LIMITS.ORDER_CREATION);

    if (!rateLimitResult.success) {
      const resetDate = new Date(rateLimitResult.resetTime);
      const resetTimeStr = resetDate.toLocaleTimeString("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
      });

      return {
        success: false,
        error: `חרגת ממספר ההזמנות המותר (${rateLimitResult.limit} הזמנות לשעה). אנא נסה שוב ב-${resetTimeStr}`,
      };
    }

    // Validate order data
    if (
      !orderData.customerName ||
      !orderData.customerPhone ||
      !orderData.deliveryDate
    ) {
      return {
        success: false,
        error: "יש למלא את כל השדות הנדרשים",
      };
    }

    // Validate phone format (Israeli phone number)
    const phoneValidation = validateIsraeliPhone(orderData.customerPhone);
    if (!phoneValidation.isValid) {
      return {
        success: false,
        error: phoneValidation.error || "מספר טלפון לא תקין",
      };
    }

    // Validate name length
    if (
      orderData.customerName.length < 2 ||
      orderData.customerName.length > 100
    ) {
      return {
        success: false,
        error: "שם לא תקין",
      };
    }

    // Validate delivery date is in the future
    const deliveryDate = new Date(orderData.deliveryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (deliveryDate < today) {
      return {
        success: false,
        error: "תאריך אספקה חייב להיות בעתיד",
      };
    }

    if (orderData.items.length === 0) {
      return {
        success: false,
        error: "העגלה ריקה",
      };
    }

    // Validate items
    for (const item of orderData.items) {
      if (!item.name || item.quantity <= 0 || item.price < 0) {
        return {
          success: false,
          error: "פרטי המוצר לא תקינים",
        };
      }
    }

    // Validate total price matches items
    const calculatedTotal = orderData.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    if (Math.abs(calculatedTotal - orderData.totalPrice) > 0.01) {
      return {
        success: false,
        error: "שגיאה בחישוב המחיר הכולל",
      };
    }

    // Rate limiting: Check if user already has a pending order
    const { data: existingPendingOrders, error: checkError } = await supabase
      .from("orders")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .limit(1);

    if (checkError) {
      logError(checkError, {
        action: "createOrder:checkExistingOrders",
        userId: user.id,
        data: { orderData: { deliveryDate: orderData.deliveryDate } },
      });

      return {
        success: false,
        error: getUserErrorMessage(
          checkError,
          "אירעה שגיאה בבדיקת הזמנות קיימות"
        ),
      };
    }

    if (existingPendingOrders && existingPendingOrders.length > 0) {
      return {
        success: false,
        error:
          "יש לך כבר הזמנה ממתינה. אנא המתן לאישור ההזמנה הקיימת או בטל אותה לפני ביצוע הזמנה חדשה. לצפייה בהזמנות שלך לחץ על 'ההזמנות שלי'",
      };
    }

    // Insert order with server-controlled user_id
    const { data, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id, // Server sets this - can't be tampered
        customer_name: orderData.customerName,
        customer_phone: orderData.customerPhone,
        customer_address: orderData.customerAddress,
        customer_city: orderData.customerCity,
        delivery_date: orderData.deliveryDate,
        items: orderData.items, // Array format: [{breadId, name, quantity, price}]
        total_price: orderData.totalPrice,
        status: "pending",
        notes: orderData.notes || null,
      })
      .select()
      .single();

    if (error) {
      logError(error, {
        action: "createOrder:insertOrder",
        userId: user.id,
        data: {
          totalPrice: orderData.totalPrice,
          deliveryDate: orderData.deliveryDate,
          itemsCount: orderData.items.length,
        },
      });

      return {
        success: false,
        error: getUserErrorMessage(error, "שגיאה בשליחת ההזמנה. אנא נסה שוב"),
      };
    }

    // Revalidate orders page
    revalidatePath("/orders");

    return {
      success: true,
      orderId: data.id,
    };
  } catch (error) {
    logError(error, {
      action: "createOrder:unexpected",
      data: {
        deliveryDate: orderData.deliveryDate,
        itemsCount: orderData.items.length,
      },
    });

    return {
      success: false,
      error: getUserErrorMessage(error, "שגיאה בלתי צפויה"),
    };
  }
}

export async function cancelOrder(orderId: string): Promise<OrderResult> {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "יש להתחבר כדי לבטל הזמנה",
      };
    }

    // Check if order belongs to user and is cancellable
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("user_id, status")
      .eq("id", orderId)
      .single();

    if (fetchError || !order) {
      return {
        success: false,
        error: "ההזמנה לא נמצאה",
      };
    }

    if (order.user_id !== user.id) {
      return {
        success: false,
        error: "אין לך הרשאה לבטל הזמנה זו",
      };
    }

    if (order.status !== "pending" && order.status !== "confirmed") {
      return {
        success: false,
        error: "לא ניתן לבטל הזמנה בסטטוס זה",
      };
    }

    // Cancel the order
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", orderId)
      .eq("user_id", user.id); // Double-check ownership

    if (updateError) {
      logError(updateError, {
        action: "cancelOrder:updateStatus",
        userId: user.id,
        data: { orderId, currentStatus: order.status },
      });

      return {
        success: false,
        error: getUserErrorMessage(updateError, "שגיאה בביטול ההזמנה"),
      };
    }

    // Revalidate orders page
    revalidatePath("/orders");

    return {
      success: true,
      orderId,
    };
  } catch (error) {
    logError(error, {
      action: "cancelOrder:unexpected",
      data: { orderId },
    });

    return {
      success: false,
      error: getUserErrorMessage(error, "שגיאה בלתי צפויה"),
    };
  }
}
