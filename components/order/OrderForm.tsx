"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { SUPPORTED_CITIES } from "@/lib/constants/cities";

interface OrderFormProps {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  notes: string;
  phoneError: string;
  isSubmitting: boolean;
  loading: boolean;
  totalItems: number;
  totalPrice: number;
  showEditFields: boolean;
  onCustomerNameChange: (value: string) => void;
  onCustomerPhoneChange: (value: string) => void;
  onCustomerAddressChange: (value: string) => void;
  onCustomerCityChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onToggleEditFields: () => void;
  hasUser: boolean;
  hasUserName: boolean;
  hasUserPhone: boolean;
  hasUserAddress: boolean;
  hasUserCity: boolean;
}

export function OrderForm({
  customerName,
  customerPhone,
  customerAddress,
  customerCity,
  notes,
  phoneError,
  isSubmitting,
  loading,
  totalItems,
  totalPrice,
  showEditFields,
  onCustomerNameChange,
  onCustomerPhoneChange,
  onCustomerAddressChange,
  onCustomerCityChange,
  onNotesChange,
  onSubmit,
  onToggleEditFields,
  hasUser,
  hasUserName,
  hasUserPhone,
  hasUserAddress,
  hasUserCity,
}: OrderFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Customer Name */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="customerName">שם מלא *</Label>
            {hasUserName && !showEditFields && (
              <span className="text-xs text-muted-foreground bg-green-50 dark:bg-green-950 px-2 py-1 rounded">
                ✓ מולא אוטומטית
              </span>
            )}
          </div>
          <Input
            id="customerName"
            value={customerName}
            onChange={(e) => onCustomerNameChange(e.target.value)}
            required
            placeholder="הזן את שמך המלא"
            dir="rtl"
            disabled={hasUserName && !showEditFields}
            aria-label="שם מלא"
            className={cn(
              customerName.trim().length >= 2 &&
                "bg-green-50 dark:bg-green-950/20 border-green-300 dark:border-green-800",
              customerName.trim().length > 0 &&
                customerName.trim().length < 2 &&
                "bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-800"
            )}
          />
        </div>
        {/* Customer Phone */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="customerPhone">מספר טלפון *</Label>
            {hasUserPhone && !showEditFields && (
              <span className="text-xs text-muted-foreground bg-green-50 dark:bg-green-950 px-2 py-1 rounded">
                ✓ מולא אוטומטית
              </span>
            )}
          </div>
          <Input
            id="customerPhone"
            type="tel"
            value={customerPhone}
            onChange={(e) => onCustomerPhoneChange(e.target.value)}
            required
            placeholder="05X-XXXXXXX"
            dir="ltr"
            disabled={hasUserPhone && !showEditFields}
            className={cn(
              phoneError &&
                "bg-red-50 dark:bg-red-950/20 border-red-500 dark:border-red-800",
              !phoneError &&
                customerPhone.trim().length >= 9 &&
                "bg-green-50 dark:bg-green-950/20 border-green-300 dark:border-green-800"
            )}
            aria-label="מספר טלפון"
            aria-invalid={!!phoneError}
            aria-describedby={phoneError ? "phone-error" : undefined}
          />
          {phoneError && (
            <p id="phone-error" className="text-sm text-red-500" role="alert">
              {phoneError}
            </p>
          )}
        </div>
        {/* Customer Address */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="customerAddress">כתובת *</Label>
            {hasUserAddress && !showEditFields && (
              <span className="text-xs text-muted-foreground bg-green-50 dark:bg-green-950 px-2 py-1 rounded">
                ✓ מולא אוטומטית
              </span>
            )}
          </div>
          <Input
            id="customerAddress"
            value={customerAddress}
            onChange={(e) => onCustomerAddressChange(e.target.value)}
            required
            placeholder="רחוב ומספר בית"
            dir="rtl"
            disabled={hasUserAddress && !showEditFields}
            aria-label="כתובת"
            className={cn(
              customerAddress.trim().length >= 3 &&
                "bg-green-50 dark:bg-green-950/20 border-green-300 dark:border-green-800",
              customerAddress.trim().length > 0 &&
                customerAddress.trim().length < 3 &&
                "bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-800"
            )}
          />
        </div>
        {/* Customer City */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="customerCity">יישוב *</Label>
            {hasUserCity && !showEditFields && (
              <span className="text-xs text-muted-foreground bg-green-50 dark:bg-green-950 px-2 py-1 rounded">
                ✓ מולא אוטומטית
              </span>
            )}
          </div>
          <Select
            value={customerCity}
            onValueChange={onCustomerCityChange}
            disabled={hasUserCity && !showEditFields}
            dir="rtl"
          >
            <SelectTrigger
              id="customerCity"
              className={cn(
                customerCity &&
                  "bg-green-50 dark:bg-green-950/20 border-green-300 dark:border-green-800"
              )}
            >
              <SelectValue placeholder="בחר יישוב" />
            </SelectTrigger>
            <SelectContent dir="rtl">
              {SUPPORTED_CITIES.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Edit Button for logged-in users */}
        {hasUser &&
          (hasUserName || hasUserPhone || hasUserAddress || hasUserCity) && (
            <Button
              type="button"
              variant="outline"
              onClick={onToggleEditFields}
              className="w-full"
            >
              {showEditFields ? "💾 שמור שינויים" : "✏️ ערוך פרטים אישיים"}
            </Button>
          )}{" "}
        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">הערות (אופציונלי)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="הערות או בקשות מיוחדות"
            dir="rtl"
            rows={3}
            aria-label="הערות"
          />
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full bg-amber-700 hover:bg-amber-800 text-lg py-6"
        disabled={totalItems === 0 || isSubmitting || loading}
        aria-label={
          isSubmitting
            ? "שולח הזמנה..."
            : !hasUser
            ? `המשך להזמנה (${totalPrice} ₪)`
            : `שלח הזמנה (${totalPrice} ₪)`
        }
      >
        {isSubmitting
          ? "שולח הזמנה..."
          : !hasUser
          ? `המשך להזמנה (${totalPrice} ₪)`
          : `שלח הזמנה (${totalPrice} ₪)`}
      </Button>
    </form>
  );
}
