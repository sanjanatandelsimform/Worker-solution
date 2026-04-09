import { useState, useEffect } from "react";
import { getStates, type StateOptionApi } from "@/services/api/assessmentApi";

/** Shape expected by DynamicQuestionRenderer field options */
export interface StateOption {
  id: string;
  label: string;
  stateFips?: string;
}

/**
 * Transforms raw API entries into the `{ id, label, stateFips }` shape consumed by
 * `DynamicQuestionRenderer.renderStructuredArrayField()`.
 *
 * Entries missing `stateAbbreviation` or `stateName` are silently skipped
 * to guard against malformed API responses (FR-004, FR-011).
 */
export function transformStates(raw: StateOptionApi[]): StateOption[] {
  return raw
    .filter(s => s.stateAbbreviation && s.stateName)
    .map(s => ({
      id: s.stateAbbreviation,
      label: s.stateName,
      stateFips: s.stateFips ?? "",
    }));
}

/**
 * Custom hook that fetches state options from the lookup API on mount.
 *
 * Follows the `useState + useEffect + async IIFE` pattern from
 * `RegistrationForm.tsx`.  The empty dependency array ensures the API is
 * called **exactly once** per mount (FR-005, SC-002).
 *
 * An empty transformed result is treated as an error (FR-008).
 *
 * @returns `{ stateOptions, isLoading, error }`
 */
export function useStatesLookup() {
  const [stateOptions, setStateOptions] = useState<StateOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await getStates();
        const transformed = transformStates(response.data.states);

        if (transformed.length === 0) {
          setError("Failed to load state options");
          setStateOptions([]);
        } else {
          setStateOptions(transformed);
          setError(null);
        }
      } catch {
        setError("Failed to load state options");
        setStateOptions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStates();
  }, []);

  return { stateOptions, isLoading, error };
}
