export type AnalyticsDates =
  | "Today"
  | "This Week"
  | "Last Week"
  | "This Month"
  | "Last Month"
  | "All Time";

export const getAnalyticsDates = (): AnalyticsDates[] => [
  "Today",
  "This Week",
  "Last Week",
  "This Month",
  "Last Month",
  "All Time",
];
