"use client";

import { Card, CardContent } from "@/components/ui/card";

export function FooterInfo() {
  return (
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
              לקבלת לחם ביום <span className="font-semibold">שישי</span> – הזמנה
              עד יום רביעי
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
  );
}
