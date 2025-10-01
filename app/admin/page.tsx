"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRight,
  Package,
  Phone,
  MapPin,
  Calendar,
  FileText,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Order = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
  delivery_date: string;
  items: Array<{
    breadId: number;
    name: string;
    quantity: number;
    price: number;
  }>;
  total_price: number;
  status: string;
  notes: string | null;
  created_at: string;
};

const statusLabels: Record<string, string> = {
  pending: "ממתין",
  confirmed: "אושר",
  preparing: "בהכנה",
  ready: "מוכן למשלוח",
  delivered: "נמסר",
  cancelled: "בוטל",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  confirmed: "bg-blue-100 text-blue-800 border-blue-300",
  preparing: "bg-purple-100 text-purple-800 border-purple-300",
  ready: "bg-green-100 text-green-800 border-green-300",
  delivered: "bg-gray-100 text-gray-800 border-gray-300",
  cancelled: "bg-red-100 text-red-800 border-red-300",
};

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      // If error is due to RLS, might be authentication issue
      if (
        error.code === "42501" ||
        error.message.includes("row-level security")
      ) {
        alert("שגיאת הרשאות. אנא התחבר מחדש.");
        await supabase.auth.signOut();
        router.push("/admin/login");
      }
    } else {
      setOrders(data || []);
    }
    setIsLoading(false);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", orderId);

    if (error) {
      console.error("Error updating order:", error);
      alert("שגיאה בעדכון ההזמנה");
    } else {
      fetchOrders();
    }
  };

  const filteredOrders =
    filterStatus === "all"
      ? orders
      : orders.filter((order) => order.status === filterStatus);

  const orderStats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <p className="text-lg text-amber-900">טוען הזמנות...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50" dir="rtl">
      {/* Header */}
      <header className="bg-amber-900 text-amber-50 py-6 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">פאנל ניהול - ציגלה</h1>
            <p className="text-amber-100">ניהול הזמנות ומעקב משלוחים</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="bg-amber-50 text-amber-900 hover:bg-amber-100"
              onClick={handleLogout}
            >
              <LogOut className="ml-2 h-4 w-4" />
              התנתק
            </Button>
            <Link href="/">
              <Button
                variant="outline"
                className="bg-amber-50 text-amber-900 hover:bg-amber-100"
              >
                <ArrowRight className="ml-2 h-4 w-4" />
                חזרה לאתר
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-amber-900">
                {orderStats.total}
              </p>
              <p className="text-sm text-muted-foreground">סה"כ הזמנות</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-700">
                {orderStats.pending}
              </p>
              <p className="text-sm text-muted-foreground">ממתינות</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-700">
                {orderStats.confirmed}
              </p>
              <p className="text-sm text-muted-foreground">מאושרות</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-700">
                {orderStats.delivered}
              </p>
              <p className="text-sm text-muted-foreground">נמסרו</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full md:w-64 bg-white">
              <SelectValue placeholder="סנן לפי סטטוס" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל ההזמנות</SelectItem>
              <SelectItem value="pending">ממתינות</SelectItem>
              <SelectItem value="confirmed">מאושרות</SelectItem>
              <SelectItem value="preparing">בהכנה</SelectItem>
              <SelectItem value="ready">מוכנות למשלוח</SelectItem>
              <SelectItem value="delivered">נמסרו</SelectItem>
              <SelectItem value="cancelled">בוטלו</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                אין הזמנות להצגה
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order.id} className="bg-white">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-amber-900 mb-2">
                        {order.customer_name}
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        הזמנה מתאריך:{" "}
                        {new Date(order.created_at).toLocaleDateString("he-IL")}{" "}
                        בשעה{" "}
                        {new Date(order.created_at).toLocaleTimeString(
                          "he-IL",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </CardDescription>
                    </div>
                    <Badge className={`${statusColors[order.status]} border`}>
                      {statusLabels[order.status]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Customer Info */}
                  <div className="grid md:grid-cols-2 gap-4 p-4 bg-amber-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-amber-700" />
                      <span className="text-sm">{order.customer_phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-amber-700" />
                      <span className="text-sm">
                        {order.customer_address}, {order.customer_city}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-amber-700" />
                      <span className="text-sm">
                        משלוח:{" "}
                        {order.delivery_date === "tuesday"
                          ? "יום שלישי"
                          : "יום שישי"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-amber-700" />
                      <span className="text-sm font-semibold">
                        סה"כ: {order.total_price} ₪
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      פריטים בהזמנה:
                    </h4>
                    <ul className="space-y-1">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="text-sm flex justify-between">
                          <span>
                            {item.name} x{item.quantity}
                          </span>
                          <span className="font-semibold">
                            {item.price * item.quantity} ₪
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Notes */}
                  {order.notes && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-sm text-blue-900 mb-1 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        הערות:
                      </h4>
                      <p className="text-sm text-blue-800">{order.notes}</p>
                    </div>
                  )}

                  {/* Status Update */}
                  <div className="pt-4 border-t">
                    <Label className="text-sm font-semibold mb-2 block">
                      עדכן סטטוס:
                    </Label>
                    <Select
                      value={order.status}
                      onValueChange={(value) =>
                        updateOrderStatus(order.id, value)
                      }
                    >
                      <SelectTrigger className="w-full md:w-64">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">ממתין</SelectItem>
                        <SelectItem value="confirmed">אושר</SelectItem>
                        <SelectItem value="preparing">בהכנה</SelectItem>
                        <SelectItem value="ready">מוכן למשלוח</SelectItem>
                        <SelectItem value="delivered">נמסר</SelectItem>
                        <SelectItem value="cancelled">בוטל</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function Label({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <label className={className}>{children}</label>;
}
