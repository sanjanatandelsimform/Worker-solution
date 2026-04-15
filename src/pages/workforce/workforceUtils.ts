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
