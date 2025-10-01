"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface OrderData {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  deliveryDate: string;
  items: Record<string, number>; // { "Bread Name": quantity }
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

    if (authError || !user) {
      return {
        success: false,
        error: "יש להתחבר כדי להזמין",
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

    if (Object.keys(orderData.items).length === 0) {
      return {
        success: false,
        error: "העגלה ריקה",
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
        items: orderData.items, // Simple format: { "Bread Name": quantity }
        total_price: orderData.totalPrice,
        status: "pending",
        notes: orderData.notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating order:", error);
      return {
        success: false,
        error: "שגיאה בשליחת ההזמנה. אנא נסה שוב",
      };
    }

    // Revalidate orders page
    revalidatePath("/orders");

    return {
      success: true,
      orderId: data.id,
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: "שגיאה בלתי צפויה",
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
      console.error("Error cancelling order:", updateError);
      return {
        success: false,
        error: "שגיאה בביטול ההזמנה",
      };
    }

    // Revalidate orders page
    revalidatePath("/orders");

    return {
      success: true,
      orderId,
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: "שגיאה בלתי צפויה",
    };
  }
}
