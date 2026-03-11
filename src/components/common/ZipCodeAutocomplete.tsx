import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { lookupZipCodes } from "@/services/api/assessmentApi";
import type { ZipCodeSuggestion } from "@/types/lookupTypes";

/**
 * Props for the ZipCodeAutocomplete component.
 */
export interface ZipCodeAutocompleteProps {
  /** Current zip code value (controlled) */
  value: string;
  /** Callback fired when the value changes (typing or selection) */
  onChange: (value: string) => void;
  /** Input placeholder text */
  placeholder?: string;
  /** Whether the field is in an error/invalid state */
  isInvalid?: boolean;
  /** Optional CSS class name override */
  className?: string;
  /**
   * Callback fired when a suggestion is selected from the dropdown.
   * Provides the full ZipCodeSuggestion so the parent can access stateAbbreviation.
   */
  onSuggestionSelect?: (suggestion: ZipCodeSuggestion) => void;
  /**
   * The currently selected state abbreviation (e.g. "MS") from the sibling
   * state dropdown. When provided, the component validates that the selected
   * ZIP code belongs to this state and exposes a mismatch error.
   */
  selectedStateAbbreviation?: string;
}

/** Characters that match a valid zip-code fragment (digits only, max 5). */
const ZIP_REGEX = /^\d{0,5}$/;

/** Minimum characters before triggering a lookup. */
const MIN_QUERY_LENGTH = 2;

/** Debounce delay in milliseconds. */
const DEBOUNCE_MS = 300;

/**
 * An autocomplete input for US zip codes.
 *
 * Displays a dropdown of matching zip codes fetched from the lookup API when
 * the user types 2 or more digits. Maintains digit-only filtering and a
 * 5-character maximum.
 *
 * @example
 * ```tsx
 * <ZipCodeAutocomplete
 *   value={zipValue}
 *   onChange={setZipValue}
 *   placeholder="Zip code"
 *   onSuggestionSelect={(s) => console.log(s.stateAbbreviation)}
 * />
 * ```
 */
export const ZipCodeAutocomplete: React.FC<ZipCodeAutocompleteProps> = ({
  value,
  onChange,
  placeholder,
  isInvalid = false,
  className,
  onSuggestionSelect,
  selectedStateAbbreviation,
}) => {
  // -----------------------------------------------------------------------
  // Local state
  // -----------------------------------------------------------------------
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<ZipCodeSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [stateMismatchError, setStateMismatchError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef(false);
  const lastSelectedValueRef = useRef<string | null>(null);
  /** Stores the stateAbbreviation of the last selected/matched suggestion */
  const lastSelectedSuggestionRef = useRef<ZipCodeSuggestion | null>(null);

  const debouncedInput = useDebounce(inputValue, DEBOUNCE_MS);

  // Sync controlled value → internal value when the parent changes it
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // -----------------------------------------------------------------------
  // Re-validate state match when selectedStateAbbreviation changes
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (
      selectedStateAbbreviation &&
      lastSelectedSuggestionRef.current &&
      inputValue === lastSelectedSuggestionRef.current.zip
    ) {
      const apiState = lastSelectedSuggestionRef.current.stateAbbreviation;
      if (apiState.toUpperCase() !== selectedStateAbbreviation.toUpperCase()) {
        setStateMismatchError("Zipcode does not match the selected state.");
      } else {
        setStateMismatchError(null);
      }
    } else if (!selectedStateAbbreviation) {
      setStateMismatchError(null);
    }
  }, [selectedStateAbbreviation, inputValue]);

  // -----------------------------------------------------------------------
  // Fetch suggestions when debounced input changes
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (debouncedInput.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setIsOpen(false);
      setHasSearched(false);
      return;
    }

    // Skip fetch when the debounced value came from a programmatic selection
    if (debouncedInput === lastSelectedValueRef.current) return;

    let cancelled = false;
    abortRef.current = false;

    const fetchSuggestions = async (): Promise<void> => {
      setIsLoading(true);
      setIsOpen(true);
      setHasSearched(true);

      try {
        const response = await lookupZipCodes(debouncedInput);
        if (!cancelled && !abortRef.current) {
          setSuggestions(response.data.zipCodes);
          setIsLoading(false);
        }
      } catch {
        if (!cancelled && !abortRef.current) {
          setSuggestions([]);
          setIsLoading(false);
        }
      }
    };

    fetchSuggestions();

    return () => {
      cancelled = true;
    };
  }, [debouncedInput]);

  // -----------------------------------------------------------------------
  // Click-outside dismissal (matches MultiSelect.tsx pattern)
  // -----------------------------------------------------------------------
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // -----------------------------------------------------------------------
  // Handlers
  // -----------------------------------------------------------------------

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const raw = e.target.value;
      if (!ZIP_REGEX.test(raw)) return; // reject non-digit / >5 chars
      lastSelectedValueRef.current = null;
      lastSelectedSuggestionRef.current = null;
      setStateMismatchError(null);
      setInputValue(raw);
      onChange(raw);
      if (raw.length >= MIN_QUERY_LENGTH) setIsOpen(true);
    },
    [onChange]
  );

  const handleSelect = useCallback(
    (suggestion: ZipCodeSuggestion): void => {
      lastSelectedValueRef.current = suggestion.zip;
      lastSelectedSuggestionRef.current = suggestion;
      setInputValue(suggestion.zip);
      onChange(suggestion.zip);
      setSuggestions([]);
      setIsOpen(false);
      abortRef.current = true;

      // Notify parent of selected suggestion (for cross-field validation)
      onSuggestionSelect?.(suggestion);

      // Validate state match immediately upon selection
      if (selectedStateAbbreviation) {
        if (
          suggestion.stateAbbreviation.toUpperCase() !== selectedStateAbbreviation.toUpperCase()
        ) {
          setStateMismatchError("Zipcode does not match the selected state.");
        } else {
          setStateMismatchError(null);
        }
      }
    },
    [onChange, onSuggestionSelect, selectedStateAbbreviation]
  );

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  }, []);

  // Determine if there's any error (external isInvalid OR state mismatch)
  const hasError = isInvalid || !!stateMismatchError;

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        type="text"
        inputMode="numeric"
        pattern="\\d{5}"
        maxLength={5}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`h-10 w-full rounded-lg border px-3.5 py-2.5 text-base shadow-xs outline-none transition-colors ${
          hasError
            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:border-brand-600 focus:ring-brand-600"
        } bg-background text-foreground placeholder:text-muted-foreground ${className ?? ""}`}
      />

      {/* State mismatch error message */}
      {stateMismatchError && <p className="mt-1 text-sm text-red-600">{stateMismatchError}</p>}

      {isOpen && (
        <ul className="bg-white absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-lg border border-ws-gray-50 shadow-sm">
          {isLoading && <li className="px-3.5 py-2.5 text-sm text-muted-foreground">Loading...</li>}

          {!isLoading && hasSearched && suggestions.length === 0 && (
            <li className="px-3.5 py-2.5 text-sm text-muted-foreground">No results found</li>
          )}

          {!isLoading &&
            suggestions.map(s => (
              <li
                key={s.zip}
                role="option"
                aria-selected={false}
                className="cursor-pointer px-3.5 py-2.5 text-sm hover:bg-muted"
                onMouseDown={() => handleSelect(s)}
              >
                {s.zip}
              </li>
            ))}
        </ul>
      )}
    </div>
  );
};
