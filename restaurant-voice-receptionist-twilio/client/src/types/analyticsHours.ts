export type AnalyticsHours =
  | "All"
  | "12AM - 6AM"
  | "6AM - 12PM"
  | "12PM - 6PM"
  | "6PM - 9PM"
  | "9PM - 12AM";

export const getAnalyticsHours = (): AnalyticsHours[] => [
  "All",
  "12AM - 6AM",
  "6AM - 12PM",
  "12PM - 6PM",
  "6PM - 9PM",
  "9PM - 12AM",
];
