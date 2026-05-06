/**
 * Number and Currency Formatters
 *
 * Locale-aware formatting utilities using Intl.NumberFormat API.
 * Handles null/undefined values gracefully with "N/A" fallbacks.
 *
 * Based on: specs/001-dashboard-api-integration/research.md
 */

/**
 * Format a number with thousand separators (e.g., 1250 → "1,250")
 *
 * @param value - Number to format, or null/undefined
 * @returns Formatted number string or "N/A" for null/undefined
 *
 * @example
 * ```typescript
 * formatNumber(1250) // "1,250"
 * formatNumber(null) // "N/A"
 * ```
 */
export const formatNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "N/A";

  return new Intl.NumberFormat("en-US").format(value);
};

/**
 * Format a number as currency without cents (e.g., 52000 → "$52,000")
 *
 * @param value - Number to format as currency, or null/undefined
 * @returns Formatted currency string or "N/A" for null/undefined
 *
 * @example
 * ```typescript
 * formatCurrency(52000) // "$52,000"
 * formatCurrency(null) // "N/A"
 * ```
 */
export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "N/A";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Format a number as currency with cents (e.g., 18.50 → "$18.50")
 *
 * @param value - Number to format as currency with cents, or null/undefined
 * @returns Formatted currency string with 2 decimal places or "N/A" for null/undefined
 *
 * @example
 * ```typescript
 * formatCurrencyWithCents(18.50) // "$18.50"
 * formatCurrencyWithCents(20) // "$20.00"
 * formatCurrencyWithCents(null) // "N/A"
 * ```
 */
export const formatCurrencyWithCents = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "N/A";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Format a number as percentage (e.g., 22.5 → "22.5%")
 *
 * @param value - Number to format as percentage, or null/undefined
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string or "N/A" for null/undefined
 *
 * @example
 * ```typescript
 * formatPercentage(22.5) // "22.5%"
 * formatPercentage(18.24567, 2) // "18.25%"
 * formatPercentage(null) // "N/A"
 * ```
 */
export const formatPercentage = (
  value: number | null | undefined,
  decimals: number = 1
): string => {
  if (value === null || value === undefined) return "N/A";

  return `${value.toFixed(decimals)}%`;
};

/**
 * Format a number with compact notation for large values (e.g., 1500000 → "1.5M")
 *
 * @param value - Number to format, or null/undefined
 * @returns Formatted compact string or "N/A" for null/undefined
 *
 * @example
 * ```typescript
 * formatCompactNumber(1500000) // "1.5M"
 * formatCompactNumber(2500) // "2.5K"
 * formatCompactNumber(null) // "N/A"
 * ```
 */
export const formatCompactNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "N/A";

  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
  }).format(value);
};

/**
 * Format a number as compact currency (e.g., 72000 → "$72K", 1500000 → "$1.5M")
 *
 * @param value - Number to format as compact currency, or null/undefined
 * @returns Formatted compact currency string or "N/A" for null/undefined
 *
 * @example
 * ```typescript
 * formatCompactCurrency(72000) // "$72K"
 * formatCompactCurrency(1500000) // "$1.5M"
 * formatCompactCurrency(null) // "N/A"
 * ```
 */
export const formatCompactCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "N/A";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
};

/**
 * Format an annual employer cost number as a dollar-per-year string.
 *
 * Returns "--" for null, undefined, or negative values (guard against bad API data).
 * Returns "$0/yr" for zero (valid data; distinct from missing).
 * Uses locale-aware thousands separators (e.g., 11240 → "$11,240/yr").
 *
 * @param value - Annual cost in whole dollars, or null/undefined
 * @returns Formatted string e.g. "$11,240/yr", or "--"
 *
 * @example
 * ```typescript
 * formatEmployerCostPerYear(11240)     // "$11,240/yr"
 * formatEmployerCostPerYear(0)         // "$0/yr"
 * formatEmployerCostPerYear(null)      // "--"
 * formatEmployerCostPerYear(undefined) // "--"
 * formatEmployerCostPerYear(-500)      // "--"
 * ```
 */
export const formatEmployerCostPerYear = (value: number | null | undefined): string => {
  if (value === null || value === undefined || value < 0) return "--";
  return `$${value.toLocaleString("en-US")}/yr`;
};

export const formatToTwoDecimalPlaces = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "N/A";
  return value.toFixed(2);
};

export const formatPercent = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "N/A";
  const rounded = Math.round(value * 10) / 10;
  return `${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}%`;
};
