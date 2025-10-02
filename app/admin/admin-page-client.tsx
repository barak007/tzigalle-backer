"use client";

import type React from "react";
import { useState, useMemo } from "react";
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
  TruckIcon,
  Clock,
  Archive,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { ORDER_STATUSES } from "@/lib/constants/order-status";
import { formatDate, formatDeliveryDate } from "@/lib/utils/dates";

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
  archived: boolean;
};

type AdminPageClientProps = {
  initialOrders: Order[];
};

export default function AdminPageClient({
  initialOrders,
}: AdminPageClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDelivery, setFilterDelivery] = useState<string>("all");
  const [showArchived, setShowArchived] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Create a single Supabase client instance for the entire component
  const supabase = useMemo(() => createClient(), []);

  // Calculate next delivery dates
  const getNextDeliveryDate = (targetDay: number) => {
    const today = new Date();
    const currentDay = today.getDay();
    let daysUntilTarget = targetDay - currentDay;
    if (daysUntilTarget <= 0) {
      daysUntilTarget += 7;
    }
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntilTarget);
    return targetDate;
  };

  const nextTuesday = getNextDeliveryDate(2); // 2 = Tuesday
  const nextFriday = getNextDeliveryDate(5); // 5 = Friday

  // Determine the next delivery day
  const nextDeliveryDay = nextTuesday < nextFriday ? "tuesday" : "friday";
  const nextDeliveryDate = nextTuesday < nextFriday ? nextTuesday : nextFriday;

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "שגיאה",
        description: "שגיאה בטעינת ההזמנות",
        variant: "destructive",
      });
    } else {
      setOrders(data || []);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", orderId);

    if (error) {
      console.error("Error updating order:", error);
      toast({
        title: "שגיאה",
        description: "שגיאה בעדכון ההזמנה",
        variant: "destructive",
      });
    } else {
      toast({
        title: "עודכן בהצלחה",
        description: `הסטטוס עודכן ל${
          ORDER_STATUSES[newStatus as keyof typeof ORDER_STATUSES]?.label ||
          newStatus
        }`,
      });
      fetchOrders();
    }
  };

  const toggleArchiveOrder = async (
    orderId: string,
    currentArchived: boolean
  ) => {
    const { error } = await supabase
      .from("orders")
      .update({
        archived: !currentArchived,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (error) {
      console.error("Error archiving order:", error);
      toast({
        title: "שגיאה",
        description: "שגיאה בעדכון ההזמנה",
        variant: "destructive",
      });
    } else {
      toast({
        title: !currentArchived ? "הועבר לארכיון" : "שוחזר מהארכיון",
        description: "ההזמנה עודכנה בהצלחה",
      });
      fetchOrders();
    }
  };

  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Filter archived/non-archived
    if (showArchived) {
      filtered = filtered.filter((order) => order.archived === true);
    } else {
      filtered = filtered.filter((order) => order.archived !== true);
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((order) => order.status === filterStatus);
    }

    // Filter by delivery date
    if (filterDelivery !== "all") {
      filtered = filtered.filter(
        (order) => order.delivery_date === filterDelivery
      );
    }

    return filtered;
  }, [orders, filterStatus, filterDelivery, showArchived]);

  // Calculate statistics
  const orderStats = useMemo(() => {
    const activeOrders = orders.filter((o) => !o.archived);
    const nextDeliveryOrders = activeOrders.filter(
      (o) => o.delivery_date === nextDeliveryDay
    );

    // Calculate total income (excluding cancelled and archived orders)
    const totalIncome = activeOrders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, order) => sum + order.total_price, 0);

    // Calculate next delivery income (excluding cancelled orders)
    const nextDeliveryIncome = nextDeliveryOrders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, order) => sum + order.total_price, 0);

    // Calculate pending income for next delivery
    const nextDeliveryPendingIncome = nextDeliveryOrders
      .filter((o) => o.status === "pending")
      .reduce((sum, order) => sum + order.total_price, 0);

    return {
      total: activeOrders.length,
      pending: activeOrders.filter((o) => o.status === "pending").length,
      confirmed: activeOrders.filter((o) => o.status === "confirmed").length,
      delivered: activeOrders.filter((o) => o.status === "delivered").length,
      archived: orders.filter((o) => o.archived).length,
      nextDelivery: nextDeliveryOrders.length,
      nextDeliveryPending: nextDeliveryOrders.filter(
        (o) => o.status === "pending"
      ).length,
      nextDeliveryCancelled: nextDeliveryOrders.filter(
        (o) => o.status === "cancelled"
      ).length,
      tuesdayOrders: activeOrders.filter((o) => o.delivery_date === "tuesday")
        .length,
      fridayOrders: activeOrders.filter((o) => o.delivery_date === "friday")
        .length,
      totalIncome,
      nextDeliveryIncome,
      nextDeliveryPendingIncome,
    };
  }, [orders, nextDeliveryDay]);

  return (
    <div
      className="min-h-screen bg-amber-50 relative bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url(/bakery-2.jpg)" }}
      dir="rtl"
    >
      <div className="absolute inset-0 bg-amber-50/90"></div>
      {/* Header */}
      <header
        className="bg-amber-900 text-amber-50 py-6 px-4 relative bg-cover bg-center"
        style={{ backgroundImage: "url(/bakery-1.jpg)" }}
      >
        <div className="absolute inset-0 bg-amber-900/70"></div>
        <div className="max-w-7xl mx-auto flex items-center justify-between relative z-10">
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

      <div className="max-w-7xl mx-auto p-4 md:p-8 relative z-10">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-amber-900">
                {orderStats.total}
              </p>
              <p className="text-sm text-muted-foreground">סה"כ הזמנות</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-700">
                {orderStats.pending}
              </p>
              <p className="text-sm text-muted-foreground">ממתינות</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-700">
                {orderStats.confirmed}
              </p>
              <p className="text-sm text-muted-foreground">מאושרות</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-700">
                {orderStats.delivered}
              </p>
              <p className="text-sm text-muted-foreground">נמסרו</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-50/90 to-green-100/90 border-emerald-300 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-emerald-700">
                ₪{orderStats.totalIncome.toLocaleString()}
              </p>
              <p className="text-sm text-emerald-800 font-semibold">
                סה"כ הכנסות
              </p>
            </CardContent>
          </Card>
          <Card
            className="bg-gradient-to-br from-slate-50/90 to-slate-100/90 border-slate-300 cursor-pointer hover:from-slate-100 hover:to-slate-200 transition-colors backdrop-blur-sm"
            onClick={() => setShowArchived(!showArchived)}
          >
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-slate-700">
                {orderStats.archived}
              </p>
              <p className="text-sm text-slate-600 font-semibold flex items-center justify-center gap-1">
                <Archive className="h-3 w-3" />
                ארכיון
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Next Delivery Highlight */}
        <Card className="mb-6 bg-gradient-to-r from-amber-100/90 to-orange-100/90 border-amber-300 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <TruckIcon className="h-5 w-5" />
              משלוח הבא:{" "}
              {nextDeliveryDay === "tuesday" ? "יום שלישי" : "יום שישי"}
            </CardTitle>
            <CardDescription className="text-amber-800">
              {formatDeliveryDate(nextDeliveryDate)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-900">
                  {orderStats.nextDelivery}
                </p>
                <p className="text-sm text-amber-700">סך הזמנות</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-700">
                  {orderStats.nextDeliveryPending}
                </p>
                <p className="text-sm text-amber-700">ממתינות לאישור</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">
                  {orderStats.nextDeliveryCancelled}
                </p>
                <p className="text-sm text-red-700">בוטלו</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-700">
                  ₪{orderStats.nextDeliveryIncome.toLocaleString()}
                </p>
                <p className="text-sm text-emerald-800 font-semibold">
                  צפי הכנסות
                </p>
              </div>
              <div className="text-center flex items-center justify-center">
                <Button
                  onClick={() => setFilterDelivery(nextDeliveryDay)}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <Clock className="ml-2 h-4 w-4" />
                  הצג הזמנות
                </Button>
              </div>
            </div>
            {orderStats.nextDeliveryPendingIncome > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-900">
                  💰{" "}
                  <span className="font-semibold">
                    ₪{orderStats.nextDeliveryPendingIncome.toLocaleString()}
                  </span>{" "}
                  בהזמנות ממתינות לאישור
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Filters */}
        {!showArchived && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold mb-2 block">
                סינון לפי סטטוס:
              </Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="סנן לפי סטטוס" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל הסטטוסים</SelectItem>
                  <SelectItem value="pending">ממתינות</SelectItem>
                  <SelectItem value="confirmed">מאושרות</SelectItem>
                  <SelectItem value="preparing">בהכנה</SelectItem>
                  <SelectItem value="ready">מוכנות למשלוח</SelectItem>
                  <SelectItem value="delivered">נמסרו</SelectItem>
                  <SelectItem value="cancelled">בוטלו</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-semibold mb-2 block">
                סינון לפי יום משלוח:
              </Label>
              <Select value={filterDelivery} onValueChange={setFilterDelivery}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="סנן לפי יום משלוח" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל ימי המשלוח</SelectItem>
                  <SelectItem value="tuesday">
                    יום שלישי ({orderStats.tuesdayOrders} הזמנות)
                  </SelectItem>
                  <SelectItem value="friday">
                    יום שישי ({orderStats.fridayOrders} הזמנות)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Archive Header */}
        {showArchived && (
          <div className="mb-6">
            <Card className="bg-gradient-to-r from-slate-100/90 to-slate-200/90 border-slate-300 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Archive className="h-5 w-5 text-slate-700" />
                    <h2 className="text-xl font-bold text-slate-900">
                      הזמנות בארכיון
                    </h2>
                  </div>
                  <Button
                    onClick={() => setShowArchived(false)}
                    variant="outline"
                    className="bg-white"
                  >
                    חזרה להזמנות פעילות
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Active Filters Display */}
        {(filterStatus !== "all" || filterDelivery !== "all") && (
          <div className="mb-4 flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold">סינון פעיל:</span>
            {filterStatus !== "all" && (
              <Badge variant="secondary" className="gap-2">
                סטטוס:{" "}
                {filterStatus === "all"
                  ? "הכל"
                  : ORDER_STATUSES[filterStatus as keyof typeof ORDER_STATUSES]
                      ?.label || filterStatus}
                <button
                  onClick={() => setFilterStatus("all")}
                  className="hover:bg-gray-300 rounded-full px-1"
                >
                  ✕
                </button>
              </Badge>
            )}
            {filterDelivery !== "all" && (
              <Badge variant="secondary" className="gap-2">
                משלוח: {filterDelivery === "tuesday" ? "יום שלישי" : "יום שישי"}
                <button
                  onClick={() => setFilterDelivery("all")}
                  className="hover:bg-gray-300 rounded-full px-1"
                >
                  ✕
                </button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterStatus("all");
                setFilterDelivery("all");
              }}
            >
              נקה הכל
            </Button>
          </div>
        )}

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center text-muted-foreground">
                אין הזמנות להצגה
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="text-sm text-muted-foreground mb-2">
                מציג {filteredOrders.length} מתוך {orders.length} הזמנות
              </div>
              {filteredOrders.map((order) => (
                <Card key={order.id} className="bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-xl text-amber-900 mb-2">
                          {order.customer_name}
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                          הזמנה מתאריך: {formatDate(order.created_at, "short")}{" "}
                          בשעה {formatDate(order.created_at, "time")}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <Badge
                          className={`${
                            ORDER_STATUSES[
                              order.status as keyof typeof ORDER_STATUSES
                            ]?.color ||
                            "bg-gray-100 text-gray-800 border-gray-300"
                          } border`}
                        >
                          {ORDER_STATUSES[
                            order.status as keyof typeof ORDER_STATUSES
                          ]?.label || order.status}
                        </Badge>
                        {order.archived && (
                          <Badge className="bg-slate-100 text-slate-600 border-slate-300">
                            בארכיון
                          </Badge>
                        )}
                        {order.delivery_date === nextDeliveryDay &&
                          !order.archived && (
                            <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                              משלוח הבא
                            </Badge>
                          )}
                      </div>
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
                          {" - "}
                          {formatDeliveryDate(
                            order.delivery_date === "tuesday"
                              ? nextTuesday
                              : nextFriday
                          )}
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
                          <li
                            key={idx}
                            className="text-sm flex justify-between"
                          >
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
                      <Label className="text-sm font-semibold mb-3 block">
                        עדכן סטטוס:
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => updateOrderStatus(order.id, "pending")}
                          variant={
                            order.status === "pending" ? "default" : "outline"
                          }
                          size={order.status === "pending" ? "default" : "sm"}
                          className={
                            order.status === "pending"
                              ? "bg-yellow-600 hover:bg-yellow-700 text-white font-bold shadow-lg ring-2 ring-yellow-400 ring-offset-2 scale-105"
                              : "bg-yellow-50 hover:bg-yellow-100 text-yellow-800 border-yellow-300"
                          }
                        >
                          ממתין
                        </Button>

                        <Button
                          onClick={() =>
                            updateOrderStatus(order.id, "confirmed")
                          }
                          variant={
                            order.status === "confirmed" ? "default" : "outline"
                          }
                          size={order.status === "confirmed" ? "default" : "sm"}
                          className={
                            order.status === "confirmed"
                              ? "bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg ring-2 ring-blue-400 ring-offset-2 scale-105"
                              : "bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-300"
                          }
                        >
                          אושר
                        </Button>

                        <Button
                          onClick={() =>
                            updateOrderStatus(order.id, "preparing")
                          }
                          variant={
                            order.status === "preparing" ? "default" : "outline"
                          }
                          size={order.status === "preparing" ? "default" : "sm"}
                          className={
                            order.status === "preparing"
                              ? "bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-lg ring-2 ring-purple-400 ring-offset-2 scale-105"
                              : "bg-purple-50 hover:bg-purple-100 text-purple-800 border-purple-300"
                          }
                        >
                          בהכנה
                        </Button>

                        <Button
                          onClick={() => updateOrderStatus(order.id, "ready")}
                          variant={
                            order.status === "ready" ? "default" : "outline"
                          }
                          size={order.status === "ready" ? "default" : "sm"}
                          className={
                            order.status === "ready"
                              ? "bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg ring-2 ring-green-400 ring-offset-2 scale-105"
                              : "bg-green-50 hover:bg-green-100 text-green-800 border-green-300"
                          }
                        >
                          מוכן למשלוח
                        </Button>

                        <Button
                          onClick={() =>
                            updateOrderStatus(order.id, "delivered")
                          }
                          variant={
                            order.status === "delivered" ? "default" : "outline"
                          }
                          size={order.status === "delivered" ? "default" : "sm"}
                          className={
                            order.status === "delivered"
                              ? "bg-gray-600 hover:bg-gray-700 text-white font-bold shadow-lg ring-2 ring-gray-400 ring-offset-2 scale-105"
                              : "bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-300"
                          }
                        >
                          נמסר
                        </Button>

                        <Button
                          onClick={() =>
                            updateOrderStatus(order.id, "cancelled")
                          }
                          variant={
                            order.status === "cancelled" ? "default" : "outline"
                          }
                          size={order.status === "cancelled" ? "default" : "sm"}
                          className={
                            order.status === "cancelled"
                              ? "bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg ring-2 ring-red-400 ring-offset-2 scale-105"
                              : "bg-red-50 hover:bg-red-100 text-red-800 border-red-300"
                          }
                        >
                          בוטל
                        </Button>

                        <div className="w-full md:w-auto md:mr-auto">
                          {!order.archived ? (
                            <Button
                              onClick={() =>
                                toggleArchiveOrder(order.id, order.archived)
                              }
                              variant="outline"
                              size="sm"
                              className="bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300"
                            >
                              <Archive className="ml-2 h-4 w-4" />
                              העבר לארכיון
                            </Button>
                          ) : (
                            <Button
                              onClick={() =>
                                toggleArchiveOrder(order.id, order.archived)
                              }
                              variant="outline"
                              size="sm"
                              className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
                            >
                              שחזר מהארכיון
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
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
