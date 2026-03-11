import { useState, useEffect } from "react";

/**
 * Returns a debounced version of the given value.
 *
 * The returned value only updates after `delay` milliseconds of inactivity.
 * Useful for rate-limiting API calls triggered by user input (e.g. search
 * fields, autocomplete).
 *
 * @template T - Type of the value to debounce
 * @param value - The rapidly-changing source value
 * @param delay - Debounce delay in milliseconds
 * @returns The debounced value
 *
 * @example
 * ```tsx
 * const [query, setQuery] = useState("");
 * const debouncedQuery = useDebounce(query, 300);
 *
 * useEffect(() => {
 *   if (debouncedQuery.length >= 2) fetchResults(debouncedQuery);
 * }, [debouncedQuery]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
