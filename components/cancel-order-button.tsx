"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cancelOrder } from "@/app/actions/orders";
import { useToast } from "@/hooks/use-toast";
import { XCircle } from "lucide-react";

interface CancelOrderButtonProps {
  orderId: string;
}

export function CancelOrderButton({ orderId }: CancelOrderButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleCancel = async () => {
    setIsLoading(true);

    const result = await cancelOrder(orderId);

    if (result.success) {
      toast({
        title: "ההזמנה בוטלה",
        description: "ההזמנה בוטלה בהצלחה",
      });
      setOpen(false);
      router.refresh();
    } else {
      toast({
        title: "שגיאה",
        description: result.error || "שגיאה בביטול ההזמנה",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          aria-label="פתח דיאלוג ביטול הזמנה"
        >
          <XCircle className="h-4 w-4 mr-1" />
          ביטול הזמנה
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
          <AlertDialogDescription>
            פעולה זו תבטל את ההזמנה. לא ניתן לבטל פעולה זו.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel aria-label="חזור מביטול ההזמנה">
            חזור
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
            aria-label={isLoading ? "מבטל הזמנה..." : "אשר ביטול הזמנה"}
          >
            {isLoading ? "מבטל..." : "בטל הזמנה"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
