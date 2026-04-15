/**
 * Parses a percentage string from the workforce API.
 * Strips "%" and returns a number. Returns 0 for "N/A" or any invalid input.
 *
 * @example parsePercentage("45%") // 45
 * @example parsePercentage("N/A") // 0
 */
export const parsePercentage = (value: string): number => {
  const num = parseFloat(value.replace("%", ""));
  return isNaN(num) ? 0 : num;
};

export const AGE_COLORS = [
  "bg-ws-light-teal-400",
  "bg-ws-light-teal-700",
  "bg-ws-light-teal-100",
  "bg-ws-light-teal-300",
  "bg-ws-light-teal-950",
] as const;
