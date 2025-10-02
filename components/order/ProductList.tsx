"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { BreadCategory } from "@/lib/constants/bread-categories";

interface BreadItemWithDetails {
  id: number;
  name: string;
  price: number;
  categoryTitle: string;
}

interface ProductListProps {
  categories: BreadCategory[];
  cart: Record<number, number>;
  onAddToCart: (id: number) => void;
  onRemoveFromCart: (id: number) => void;
}

export function ProductList({
  categories,
  cart,
  onAddToCart,
  onRemoveFromCart,
}: ProductListProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    categories[0]?.title || "",
  ]);

  const toggleCategory = (category: string) => {
    if (expandedCategories.includes(category)) {
      setExpandedCategories(expandedCategories.filter((c) => c !== category));
    } else {
      setExpandedCategories([...expandedCategories, category]);
    }
  };

  const getItemCount = (breadId: number): number => {
    return cart[breadId] || 0;
  };

  // Transform bread items to include price and category
  const getBreadItems = (category: BreadCategory): BreadItemWithDetails[] => {
    return category.breads.map((bread) => ({
      ...bread,
      price: category.price,
      categoryTitle: category.title,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <ShoppingCart className="h-8 w-8 text-amber-700" />
        <h2 className="text-2xl font-bold text-amber-900">תפריט הלחמים</h2>
      </div>

      {categories.map((category) => {
        const isExpanded = expandedCategories.includes(category.title);
        const items = getBreadItems(category);
        const categoryItemCount = items.reduce(
          (sum: number, item: BreadItemWithDetails) =>
            sum + getItemCount(item.id),
          0
        );

        return (
          <Card
            key={category.title}
            className="bg-white/90 p-0 backdrop-blur-sm border-2 border-amber-200 shadow-lg overflow-hidden gap-2"
          >
            <CardHeader
              className="cursor-pointer hover:bg-amber-50 transition-colors gap-0 p-4"
              onClick={() => toggleCategory(category.title)}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <CardTitle className="text-xl text-amber-900 flex items-center gap-2">
                    {category.title}
                    {categoryItemCount > 0 && (
                      <Badge className="bg-amber-600 hover:bg-amber-700">
                        {categoryItemCount}
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-sm text-amber-700 mt-1">
                    {category.price} ₪ ללחם
                  </p>
                </div>
                <div className="text-amber-700 text-2xl">
                  {isExpanded ? "▼" : "◀"}
                </div>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="space-y-2 p-4">
                {items.map((item) => {
                  const itemCount = getItemCount(item.id);

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 rounded-lg border-2 border-amber-100 bg-gradient-to-l from-amber-50/50 to-transparent hover:border-amber-300 transition-all"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-amber-900 text-lg">
                          {item.name}
                        </h3>
                        <p className="text-lg font-bold text-amber-800 mt-1">
                          {item.price} ₪
                        </p>
                      </div>

                      <div className="flex items-center gap-3 mr-4">
                        {itemCount === 0 ? (
                          <Button
                            onClick={() => onAddToCart(item.id)}
                            className="bg-amber-600 hover:bg-amber-700"
                            aria-label={`הוסף ${item.name} לסל`}
                          >
                            <Plus className="h-5 w-5 ml-2" />
                            הוסף
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2 bg-white rounded-lg border-2 border-amber-300 p-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => onRemoveFromCart(item.id)}
                              className="h-8 w-8 hover:bg-amber-100"
                              aria-label={`הסר ${item.name} מהסל`}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="font-bold text-amber-900 min-w-[2rem] text-center">
                              {itemCount}
                            </span>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => onAddToCart(item.id)}
                              className="h-8 w-8 hover:bg-amber-100"
                              aria-label={`הוסף עוד ${item.name}`}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
