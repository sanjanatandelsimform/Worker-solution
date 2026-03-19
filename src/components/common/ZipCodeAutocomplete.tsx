import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { lookupZipCodes } from "@/services/api/assessmentApi";
import type { ZipCodeSuggestion } from "@/types/lookupTypes";

export interface ZipCodeAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isInvalid?: boolean;
  className?: string;
  onSuggestionSelect?: (suggestion: ZipCodeSuggestion) => void;
  selectedStateAbbreviation?: string;
  onValidityChange?: (isValid: boolean) => void;
}

const ZIP_REGEX = /^\d{0,5}$/;
const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;

export const ZipCodeAutocomplete: React.FC<ZipCodeAutocompleteProps> = ({
  value,
  onChange,
  placeholder,
  isInvalid = false,
  className,
  onSuggestionSelect,
  selectedStateAbbreviation,
  onValidityChange,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<ZipCodeSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [stateMismatchError, setStateMismatchError] = useState<string | null>(null);
  const [noResultsError, setNoResultsError] = useState<string | null>(null);

  // Initialize directly from value prop — avoids calling setState inside an effect
  const [isValidSelection, setIsValidSelection] = useState(() => !!value);

  const containerRef = useRef<HTMLDivElement>(null);
  const hasMountedRef = useRef(false);
  const abortRef = useRef(false);

  // Tracks whether the first value-sync effect has run
  const isInitialValueRef = useRef(true);

  const lastSelectedValueRef = useRef<string | null>(null);
  const lastSelectedSuggestionRef = useRef<ZipCodeSuggestion | null>(null);
  const lastReportedValidityRef = useRef<boolean | null>(null);

  // Keep a stable ref to onValidityChange so validity effect doesn't re-run
  // when parent re-renders and passes a new function reference
  const onValidityChangeRef = useRef(onValidityChange);
  useEffect(() => {
    onValidityChangeRef.current = onValidityChange;
  }, [onValidityChange]);

  // Initialize lastSelectedValueRef from the initial value so the debounce
  // effect doesn't fire a lookup for the pre-populated value on mount.
  // useLayoutEffect runs once before paint — safe place to write refs.
  useLayoutEffect(() => {
    if (value) {
      lastSelectedValueRef.current = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — only runs once on mount

  const debouncedInput = useDebounce(inputValue, DEBOUNCE_MS);

  // Sync controlled value → internal value when parent changes it
  useEffect(() => {
    if (isInitialValueRef.current) {
      // Skip the first run — initial value already handled via useState(() => !!value)
      // and the useLayoutEffect above
      isInitialValueRef.current = false;
      return;
    }
    // Subsequent parent-driven changes (e.g. form reset)
    setTimeout(() => setInputValue(value), 0);
  }, [value]);

  // Notify parent of validity changes — only when validity actually changes
  useEffect(() => {
    if (!onValidityChangeRef.current) return;
    const valid = !stateMismatchError && !noResultsError && (!hasSearched || isValidSelection);
    // only fire if validity actually changed — prevents infinite update loop
    if (lastReportedValidityRef.current !== valid) {
      lastReportedValidityRef.current = valid;
      onValidityChangeRef.current(valid);
    }
  }, [stateMismatchError, noResultsError, hasSearched, isValidSelection]);

  useEffect(() => {
    if (
      selectedStateAbbreviation &&
      lastSelectedSuggestionRef.current &&
      inputValue === lastSelectedSuggestionRef.current.zip
    ) {
      const apiState = lastSelectedSuggestionRef.current.stateAbbreviation;
      setTimeout(() => {
        setStateMismatchError(
          apiState.toUpperCase() !== selectedStateAbbreviation.toUpperCase()
            ? "Zip code does not match the selected state."
            : null
        );
      }, 0);
    } else if (!selectedStateAbbreviation) {
      setTimeout(() => setStateMismatchError(null), 0);
    }
  }, [selectedStateAbbreviation, inputValue]);

  // Fetch suggestions when debounced input changes
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    if (debouncedInput.length < MIN_QUERY_LENGTH) {
      setTimeout(() => {
        setSuggestions([]);
        setIsOpen(false);
        setHasSearched(false);
        setNoResultsError(null);
      }, 0);
      return;
    }

    if (debouncedInput === lastSelectedValueRef.current) return;

    let cancelled = false;
    abortRef.current = false;

    const fetchSuggestions = async (): Promise<void> => {
      setIsLoading(true);
      setIsOpen(true);
      setHasSearched(true);
      setNoResultsError(null);

      try {
        const response = await lookupZipCodes(debouncedInput);
        if (!cancelled && !abortRef.current) {
          const zips = response.data.zipCodes;
          setSuggestions(zips);
          setIsLoading(false);
          if (zips.length === 0) {
            setNoResultsError("Invalid ZIP code. Please enter a valid ZIP code.");
            setIsOpen(false);
            setIsValidSelection(false);
          }
        }
      } catch {
        if (!cancelled && !abortRef.current) {
          setSuggestions([]);
          setIsLoading(false);
          setNoResultsError("Invalid ZIP code. Please enter a valid ZIP code.");
          setIsOpen(false);
          setIsValidSelection(false);
        }
      }
    };

    fetchSuggestions();

    return () => {
      cancelled = true;
    };
  }, [debouncedInput]);

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

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const raw = e.target.value;
      if (!ZIP_REGEX.test(raw)) return;
      lastSelectedValueRef.current = null;
      lastSelectedSuggestionRef.current = null;
      setStateMismatchError(null);
      setNoResultsError(null);
      setIsValidSelection(false);
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
      abortRef.current = true;
      setSuggestions([]);
      setIsOpen(false);
      setNoResultsError(null);
      setIsValidSelection(true);
      onSuggestionSelect?.(suggestion);
      if (selectedStateAbbreviation) {
        const mismatch =
          suggestion.stateAbbreviation.toUpperCase() !== selectedStateAbbreviation.toUpperCase();
        setStateMismatchError(mismatch ? "Zip code does not match the selected state." : null);
        if (mismatch) setIsValidSelection(false);
      }
    },
    [onSuggestionSelect, selectedStateAbbreviation]
  );

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  }, []);

  const hasError = isInvalid || !!stateMismatchError || !!noResultsError;
  const errorMessage: string | null = stateMismatchError ?? noResultsError ?? null;

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        type="text"
        inputMode="numeric"
        pattern="\d{5}"
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

      {errorMessage && <p className="mt-1 text-sm text-red-600">{errorMessage}</p>}

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
