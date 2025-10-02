export interface DeliveryDateInfo {
  dateString: string;
  date: Date;
  deadlineDate: Date;
  deadlineString: string;
  daysLeft: number;
}

/**
 * Calculate next delivery date based on delivery day and deadline day
 * @param _deliveryDay - Target delivery day (0-6, Sunday-Saturday) - not used but kept for clarity
 * @param deadlineDay - Last day to order for this delivery (0-6)
 * @returns Delivery date information
 */
export function calculateNextDeliveryDate(
  _deliveryDay: number,
  deadlineDay: number
): DeliveryDateInfo {
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
    dateString: deliveryDate.toLocaleDateString("he-IL", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    }),
    date: deliveryDate,
    deadlineDate: deadlineDate,
    deadlineString: deadlineDate.toLocaleDateString("he-IL", {
      day: "numeric",
      month: "numeric",
    }),
    daysLeft: daysLeft,
  };
}

export interface DeliveryOptionData {
  value: string;
  label: string;
  date: Date;
  dateString: string;
  deadline: string;
  daysLeft: number;
}

/**
 * Get delivery options for Tuesday and Friday
 * @returns Array of delivery options
 */
export function getDeliveryOptions(): DeliveryOptionData[] {
  const tuesdayData = calculateNextDeliveryDate(2, 0); // Tuesday delivery, Sunday deadline
  const fridayData = calculateNextDeliveryDate(5, 3); // Friday delivery, Wednesday deadline

  return [
    {
      value: "tuesday",
      label: "יום שלישי",
      date: tuesdayData.date,
      dateString: tuesdayData.dateString,
      deadline: `הזמנה עד יום ראשון (${tuesdayData.deadlineString})`,
      daysLeft: tuesdayData.daysLeft,
    },
    {
      value: "friday",
      label: "יום שישי",
      date: fridayData.date,
      dateString: fridayData.dateString,
      deadline: `הזמנה עד יום רביעי (${fridayData.deadlineString})`,
      daysLeft: fridayData.daysLeft,
    },
  ];
}
