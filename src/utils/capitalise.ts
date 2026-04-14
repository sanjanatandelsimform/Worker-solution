/**
 * Capitalises the first character of a string and lowercases the rest.
 * e.g. "january" → "January", "APRIL" → "April"
 */
export function capitalise(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}
