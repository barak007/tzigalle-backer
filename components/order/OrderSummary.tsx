"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { BreadCategory } from "@/lib/constants/bread-categories";

interface OrderSummaryProps {
  cart: Record<number, number>;
  totalPrice: number;
  totalItems: number;
  categories: BreadCategory[];
  onClearClick: () => void;
}

export function OrderSummary({
  cart,
  totalPrice,
  totalItems,
  categories,
  onClearClick,
}: OrderSummaryProps) {
  // Helper to find bread by ID across all categories
  const findBreadById = (id: number) => {
    for (const category of categories) {
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

  const cartItems = Object.entries(cart).map(([id, quantity]) => {
    const bread = findBreadById(Number(id));
    return {
      id: Number(id),
      quantity,
      bread,
    };
  });

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-300 shadow-xl">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl text-amber-900">
              סיכום הזמנה
            </CardTitle>
            <CardDescription className="text-amber-700">
              {totalItems > 0
                ? `${totalItems} פריטים בסל`
                : "הסל ריק - הוסף לחמים להזמנה"}
            </CardDescription>
          </div>
          {totalItems > 0 && (
            <Button
              variant="outline"
              size="icon"
              onClick={onClearClick}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              aria-label="נקה הזמנה"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {totalItems > 0 ? (
          <>
            <div className="space-y-3">
              {cartItems.map(({ id, quantity, bread }) => {
                if (!bread) return null;

                return (
                  <div
                    key={id}
                    className="flex justify-between items-center p-3 bg-white rounded-lg border border-amber-200"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-amber-900 text-sm">
                        {bread.categoryTitle} - {bread.name}
                      </div>
                      <div className="text-xs text-amber-700">
                        {quantity} x {bread.price} ₪
                      </div>
                    </div>
                    <div className="font-bold text-amber-900">
                      {quantity * bread.price} ₪
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t-2 border-amber-300 pt-4">
              <div className="flex justify-between items-center text-xl font-bold text-amber-900">
                <span>סה"כ:</span>
                <span>{totalPrice} ₪</span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-amber-700">
            <div className="text-4xl mb-2">🛒</div>
            <p>אין פריטים בסל</p>
            <p className="text-sm mt-1">בחר לחמים מהתפריט</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
