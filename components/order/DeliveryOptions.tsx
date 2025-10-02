"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface DeliveryOption {
  value: string;
  label: string;
  date: Date;
  dateString: string;
  deadline: string;
  daysLeft: number;
}

interface DeliveryOptionsProps {
  options: DeliveryOption[];
  selectedValue: string;
  deliveryDateError: string;
  onChange: (value: string, date: Date) => void;
}

export function DeliveryOptions({
  options,
  selectedValue,
  deliveryDateError,
  onChange,
}: DeliveryOptionsProps) {
  return (
    <div className="space-y-4">
      <Label>בחר יום משלוח *</Label>

      <RadioGroup
        value={selectedValue}
        onValueChange={(value) => {
          const option = options.find((opt) => opt.value === value);
          if (option) {
            onChange(value, option.date);
          }
        }}
        className="grid grid-cols-1 md:grid-cols-2 gap-3"
        aria-label="בחר יום משלוח"
      >
        {options.map((option) => (
          <Label
            key={option.value}
            htmlFor={option.value}
            className={`grid grid-cols-[1fr_auto] gap-3 items-center border rounded-lg p-4 transition-all cursor-pointer ${
              selectedValue === option.value
                ? "border-amber-600 bg-amber-50"
                : "border-gray-200 hover:border-amber-300"
            } ${option.daysLeft <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="space-y-1">
              <div className="font-semibold text-lg">{option.label}</div>
              <div className="text-sm text-gray-600">{option.dateString}</div>
              <div className="text-xs text-gray-500">{option.deadline}</div>
              <div
                className={`text-xs font-medium ${
                  option.daysLeft > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {option.daysLeft > 0
                  ? `נותרו ${option.daysLeft} ימים`
                  : "תאריך חלף"}
              </div>
            </div>
            <RadioGroupItem
              value={option.value}
              id={option.value}
              disabled={option.daysLeft <= 0}
            />
          </Label>
        ))}
      </RadioGroup>

      {deliveryDateError && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{deliveryDateError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
