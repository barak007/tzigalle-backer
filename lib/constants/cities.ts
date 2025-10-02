export const SUPPORTED_CITIES = ["כפר יהושע"] as const;

export type SupportedCity = (typeof SUPPORTED_CITIES)[number];

export const DEFAULT_CITY = "כפר יהושע";
