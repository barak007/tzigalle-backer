"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface SuccessMessageProps {
  onNewOrder: () => void;
}

export function SuccessMessage({ onNewOrder }: SuccessMessageProps) {
  const router = useRouter();

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <Alert className="bg-green-50 border-green-300">
        <AlertDescription className="text-center space-y-4">
          <div className="text-4xl">✅</div>
          <h2 className="text-2xl font-bold text-green-900">
            ההזמנה נשלחה בהצלחה!
          </h2>
          <p className="text-green-800">
            קיבלנו את הזמנתך ונחזור אליך בהקדם לאישור ותיאום המשלוח.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button
              onClick={onNewOrder}
              className="bg-amber-600 hover:bg-amber-700"
              aria-label="צור הזמנה חדשה"
            >
              הזמנה חדשה
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/orders")}
              aria-label="הצג את ההזמנות שלי"
            >
              הצג הזמנות שלי
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
