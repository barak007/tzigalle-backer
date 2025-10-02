/**
 * Delivery date calculation utilities for the bakery order system
 */

/**
 * Delivery days constants
 */
export const DELIVERY_DAYS = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
} as const;

/**
 * Calculates the next occurrence of a specific day of the week
 *
 * @param targetDay - The target day of the week (0 = Sunday, 6 = Saturday)
 * @returns The date of the next occurrence of the target day
 *
 * @example
 * // Get next Tuesday
 * const nextTuesday = getNextDeliveryDate(2);
 */
export function getNextDeliveryDate(targetDay: number): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentDay = today.getDay();

  let daysUntilTarget = targetDay - currentDay;
  if (daysUntilTarget <= 0) {
    daysUntilTarget += 7; // Next week
  }

  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + daysUntilTarget);
  return targetDate;
}

/**
 * Calculates the next delivery date based on order deadline rules
 *
 * @param deliveryDay - Target delivery day (0-6, Sunday-Saturday) - used for reference
 * @param deadlineDay - Last day to order for this delivery
 * @returns Object with delivery date and days remaining until deadline
 *
 * @example
 * // For Tuesday delivery (deadline Sunday)
 * const result = getNextDeliveryDateWithDeadline(2, 0);
 * console.log(result.deliveryDate); // Next Tuesday's date
 * console.log(result.daysLeft); // Days until Sunday deadline
 */
export function getNextDeliveryDateWithDeadline(
  _deliveryDay: number,
  deadlineDay: number
): {
  deliveryDate: Date;
  deadlineDate: Date;
  daysLeft: number;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentDay = today.getDay();

  // Find the next deadline date
  let daysUntilDeadline = deadlineDay - currentDay;
  if (daysUntilDeadline < 0) {
    daysUntilDeadline += 7; // Next week's deadline
  }

  const deadlineDate = new Date(today);
  deadlineDate.setDate(today.getDate() + daysUntilDeadline);

  // Calculate delivery date (2 days after the deadline)
  const deliveryDate = new Date(deadlineDate);
  deliveryDate.setDate(deadlineDate.getDate() + 2);

  // Calculate days left until deadline
  const daysLeft = Math.ceil(
    (deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    deliveryDate,
    deadlineDate,
    daysLeft,
  };
}

/**
 * Formats a date for display in Hebrew locale
 *
 * @param date - The date to format
 * @param format - The format type: 'short', 'long', or 'time'
 * @returns Formatted date string
 */
export function formatDeliveryDate(
  date: Date | string,
  format: "short" | "long" | "time" = "short"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  switch (format) {
    case "short":
      return dateObj.toLocaleDateString("he-IL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    case "long":
      return dateObj.toLocaleDateString("he-IL", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    case "time":
      return dateObj.toLocaleTimeString("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
      });
    default:
      return dateObj.toLocaleDateString("he-IL");
  }
}

/**
 * Checks if a delivery date is in the past
 *
 * @param deliveryDate - The delivery date to check
 * @returns True if the date is in the past
 */
export function isDeliveryDatePast(deliveryDate: Date | string): boolean {
  const date =
    typeof deliveryDate === "string" ? new Date(deliveryDate) : deliveryDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  return date < today;
}

/**
 * Checks if today is past the deadline for a given delivery date
 *
 * @param deadlineDay - The deadline day (0-6, Sunday-Saturday)
 * @returns True if past the deadline
 */
export function isPastDeadline(deadlineDay: number): boolean {
  const today = new Date();
  const currentDay = today.getDay();

  // If we're past the deadline day this week, the deadline has passed
  return currentDay > deadlineDay;
}
