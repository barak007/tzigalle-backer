"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ClearOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function ClearOrderDialog({
  open,
  onOpenChange,
  onConfirm,
}: ClearOrderDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>נקה הזמנה?</AlertDialogTitle>
          <AlertDialogDescription>
            האם אתה בטוח שברצונך לנקות את כל ההזמנה? פעולה זו תמחק את כל הפריטים
            והפרטים שהזנת ולא ניתן לבטלה.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel aria-label="ביטול ניקוי הזמנה">
            ביטול
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
            aria-label="אשר ניקוי הזמנה"
          >
            נקה הזמנה
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
