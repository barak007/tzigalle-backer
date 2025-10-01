export const ORDER_STATUSES = {
  pending: {
    label: "ממתין",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    badge: "secondary",
  },
  confirmed: {
    label: "אושר",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    badge: "default",
  },
  preparing: {
    label: "בהכנה",
    color: "bg-purple-100 text-purple-800 border-purple-300",
    badge: "default",
  },
  ready: {
    label: "מוכן למשלוח",
    color: "bg-green-100 text-green-800 border-green-300",
    badge: "default",
  },
  delivered: {
    label: "נמסר",
    color: "bg-gray-100 text-gray-800 border-gray-300",
    badge: "outline",
  },
  cancelled: {
    label: "בוטל",
    color: "bg-red-100 text-red-800 border-red-300",
    badge: "destructive",
  },
  completed: {
    label: "הושלם",
    color: "bg-green-100 text-green-800 border-green-300",
    badge: "default",
  },
  archived: {
    label: "בארכיון",
    color: "bg-gray-100 text-gray-800 border-gray-300",
    badge: "outline",
  },
} as const;

export type OrderStatus = keyof typeof ORDER_STATUSES;