import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CancelOrderButton } from "@/components/cancel-order-button";

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?returnTo=/orders");
  }

  // Fetch user's orders
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">ממתין</Badge>;
      case "completed":
        return (
          <Badge variant="default" className="bg-green-600">
            הושלם
          </Badge>
        );
      case "archived":
        return <Badge variant="outline">בארכיון</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("he-IL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency: "ILS",
    }).format(price);
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4 md:p-8"
      dir="rtl"
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-amber-900 mb-2">
            ההזמנות שלי
          </h1>
          <p className="text-lg text-amber-700">צפה בכל ההזמנות שביצעת</p>
        </div>

        {!orders || orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-xl text-muted-foreground">
                עדיין לא ביצעת הזמנות
              </p>
              <a
                href="/"
                className="text-amber-600 hover:underline mt-4 inline-block"
              >
                חזור לדף הבית להזמנה
              </a>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">
                        {order.customer_name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {formatDate(order.created_at)}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      {getStatusBadge(order.status)}
                      {(order.status === "pending" ||
                        order.status === "confirmed") && (
                        <CancelOrderButton orderId={order.id} />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">טלפון</p>
                        <p className="font-medium">{order.customer_phone}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">כתובת</p>
                        <p className="font-medium">
                          {order.customer_address}, {order.customer_city}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold mb-2">פריטים בהזמנה:</h4>
                      <div className="space-y-2">
                        {order.items &&
                          (() => {
                            // New format: { "Bread Name": quantity }
                            if (
                              typeof order.items === "object" &&
                              !Array.isArray(order.items)
                            ) {
                              return Object.entries(
                                order.items as Record<string, number>
                              ).map(([name, quantity]) => (
                                <div
                                  key={name}
                                  className="flex justify-between text-sm"
                                >
                                  <span>{name}</span>
                                  <span className="text-muted-foreground">
                                    x{quantity}
                                  </span>
                                </div>
                              ));
                            }
                            // Old format: [{ name, quantity, price, breadId }]
                            if (Array.isArray(order.items)) {
                              return (order.items as any[]).map(
                                (item: any, index: number) => (
                                  <div
                                    key={index}
                                    className="flex justify-between text-sm"
                                  >
                                    <span>{item.name}</span>
                                    <span className="text-muted-foreground">
                                      x{item.quantity}
                                    </span>
                                  </div>
                                )
                              );
                            }
                            return null;
                          })()}
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center font-semibold text-lg">
                      <span>סה"כ</span>
                      <span className="text-amber-700">
                        {formatPrice(order.total_price)}
                      </span>
                    </div>

                    {order.notes && (
                      <>
                        <Separator />
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            הערות
                          </p>
                          <p className="text-sm">{order.notes}</p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
