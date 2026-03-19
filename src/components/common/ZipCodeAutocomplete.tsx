import React, { useState, useEffect, useRef, useCallback } from "react";
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
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<ZipCodeSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [stateMismatchError, setStateMismatchError] = useState<string | null>(null);
  const [noResultsError, setNoResultsError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const hasMountedRef = useRef(false);
  const abortRef = useRef(false);
  const isInitialValueRef = useRef(true);

  const lastSelectedValueRef = useRef<string | null>(null);
  const lastSelectedSuggestionRef = useRef<ZipCodeSuggestion | null>(null);

  const debouncedInput = useDebounce(inputValue, DEBOUNCE_MS);

  // Sync controlled value → internal value when the parent changes it
  useEffect(() => {
    setTimeout(() => setInputValue(value), 0);
    if (isInitialValueRef.current) {
      isInitialValueRef.current = false;
      if (value) {
        lastSelectedValueRef.current = value;
      }
    }
  }, [value]);
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

    // Skip fetch when the debounced value came from a programmatic selection
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
            setNoResultsError("No zip codes found. Please enter a valid zip code.");
            setIsOpen(false);
          }
        }
      } catch {
        if (!cancelled && !abortRef.current) {
          setSuggestions([]);
          setIsLoading(false);
          setNoResultsError("No zip codes found. Please enter a valid zip code.");
          setIsOpen(false);
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

  // Handlers
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const raw = e.target.value;
      if (!ZIP_REGEX.test(raw)) return;
      lastSelectedValueRef.current = null;
      lastSelectedSuggestionRef.current = null;
      setStateMismatchError(null);
      setNoResultsError(null);
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
      onSuggestionSelect?.(suggestion);
      if (selectedStateAbbreviation) {
        const mismatch =
          suggestion.stateAbbreviation.toUpperCase() !== selectedStateAbbreviation.toUpperCase();
        setStateMismatchError(mismatch ? "Zip code does not match the selected state." : null);
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
  const errorMessage = stateMismatchError ?? noResultsError ?? null;

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
