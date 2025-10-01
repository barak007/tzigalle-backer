export const formatDate = (
  date: Date | string,
  format: "short" | "long" | "full" | "time" = "short"
) => {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  const formats = {
    short: {
      day: "numeric" as const,
      month: "numeric" as const,
      year: "numeric" as const,
    },
    long: {
      year: "numeric" as const,
      month: "long" as const,
      day: "numeric" as const,
    },
    full: {
      year: "numeric" as const,
      month: "long" as const,
      day: "numeric" as const,
      hour: "2-digit" as const,
      minute: "2-digit" as const,
    },
    time: {
      hour: "2-digit" as const,
      minute: "2-digit" as const,
    },
  };

  return new Intl.DateTimeFormat("he-IL", formats[format]).format(dateObj);
};

export const formatDeliveryDate = (dateOrDay: Date | string) => {
  if (dateOrDay instanceof Date) {
    return dateOrDay.toLocaleDateString("he-IL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  // If it's a string, assume it's a delivery day and we need to get the next date
  // This is a simplified version - in practice, you'd want to pass the actual dates
  return dateOrDay === "tuesday" ? "יום שלישי" : "יום שישי";
};
