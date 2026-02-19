/**
 * Month mapping utilities for converting various month formats to API enum values
 */

export const MONTH_MAP: Record<string, string> = {
  january: "Jan",
  jan: "Jan",
  february: "Feb",
  feb: "Feb",
  march: "Mar",
  mar: "Mar",
  april: "Apr",
  apr: "Apr",
  may: "May",
  june: "Jun",
  jun: "Jun",
  july: "Jul",
  jul: "Jul",
  august: "Aug",
  aug: "Aug",
  september: "Sep",
  sept: "Sep",
  sep: "Sep",
  october: "Oct",
  oct: "Oct",
  november: "Nov",
  nov: "Nov",
  december: "Dec",
  dec: "Dec",
};

/**
 * Maps a month value to the API enum format
 * @param month - Month value in any format (e.g., "january", "Jan", "july")
 * @returns API enum value (e.g., "Jan", "Jul") or original value if not found
 */
export const mapMonthToApiValue = (month: string | null | undefined): string | null => {
  if (!month || month === "") return null;
  const key = String(month).trim().toLowerCase();
  return MONTH_MAP[key] || month;
};
