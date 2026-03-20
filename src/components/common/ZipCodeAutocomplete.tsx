import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { lookupZipCodes } from "@/services/api/assessmentApi";
import type { ZipCodeSuggestion } from "@/types/lookupTypes";

export type ZipValidityState = "valid" | "invalid_zip" | "state_mismatch" | "pending" | "empty";

export interface ZipCodeAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isInvalid?: boolean;
  className?: string;
  onSuggestionSelect?: (suggestion: ZipCodeSuggestion) => void;
  selectedStateAbbreviation?: string;
  onValidityChange?: (isValid: boolean, validityState: ZipValidityState) => void;
}

const ZIP_REGEX = /^\d{0,5}$/;
const EXACT_ZIP_REGEX = /^\d{5}$/;
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

  const [validityState, setValidityState] = useState<ZipValidityState>(() =>
    value ? "valid" : "empty"
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const hasMountedRef = useRef(false);
  const abortRef = useRef(false);

  // Tracks whether the first value-sync effect has run
  const isInitialValueRef = useRef(true);
  const lastSelectedValueRef = useRef<string | null>(null);
  const lastSelectedSuggestionRef = useRef<ZipCodeSuggestion | null>(null);
  const lastReportedStateRef = useRef<ZipValidityState | null>(null);
  const isSelectionRef = useRef(false);

  const onValidityChangeRef = useRef(onValidityChange);
  useEffect(() => {
    onValidityChangeRef.current = onValidityChange;
  }, [onValidityChange]);

  const onSuggestionSelectRef = useRef(onSuggestionSelect);
  useEffect(() => {
    onSuggestionSelectRef.current = onSuggestionSelect;
  }, [onSuggestionSelect]);

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useLayoutEffect(() => {
    if (value) lastSelectedValueRef.current = value;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const debouncedInput = useDebounce(inputValue, DEBOUNCE_MS);

  const emitValidity = useCallback((state: ZipValidityState) => {
    setValidityState(state);
    if (lastReportedStateRef.current === state) return;
    lastReportedStateRef.current = state;
    onValidityChangeRef.current?.(state === "valid", state);
  }, []);

  // Sync parent-controlled value resets
  useEffect(() => {
    if (isInitialValueRef.current) {
      // Skip the first run — initial value already handled via useState(() => !!value)
      // and the useLayoutEffect above
      isInitialValueRef.current = false;
      return;
    }
    setTimeout(() => {
      setInputValue(value);
      if (!value) emitValidity("empty");
    }, 0);
  }, [value, emitValidity]);

  // Re-evaluate state mismatch when selectedStateAbbreviation changes
  useEffect(() => {
    if (!lastSelectedSuggestionRef.current) return;
    if (!selectedStateAbbreviation) {
      if (validityState === "state_mismatch") setTimeout(() => emitValidity("valid"), 0);
      return;
    }
    if (inputValue !== lastSelectedSuggestionRef.current.zip) return;
    const apiState = lastSelectedSuggestionRef.current.stateAbbreviation;
    const mismatch = apiState.toUpperCase() !== selectedStateAbbreviation.toUpperCase();
    setTimeout(() => emitValidity(mismatch ? "state_mismatch" : "valid"), 0);
  }, [selectedStateAbbreviation, inputValue, validityState, emitValidity]);

  // Fetch suggestions on debounced input change
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    if (isSelectionRef.current) {
      isSelectionRef.current = false;
      return;
    }

    if (debouncedInput.length < MIN_QUERY_LENGTH) {
      setTimeout(() => {
        setSuggestions([]);
        setIsOpen(false);
        setHasSearched(false);
        emitValidity(debouncedInput.length === 0 ? "empty" : "pending");
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

      try {
        const response = await lookupZipCodes(debouncedInput);
        if (cancelled || abortRef.current) return;

        const zips = response.data.zipCodes;
        setSuggestions(zips);
        setIsLoading(false);

        if (zips.length === 0) {
          setIsOpen(false);
          emitValidity("invalid_zip");
          return;
        }

        const currentInput = debouncedInput.trim();
        const exactMatch = EXACT_ZIP_REGEX.test(currentInput)
          ? (zips.find(z => z.zip === currentInput) ?? null)
          : null;

        if (exactMatch) {
          lastSelectedValueRef.current = exactMatch.zip;
          lastSelectedSuggestionRef.current = exactMatch;
          abortRef.current = true;
          setIsOpen(false);
          // For exact manual 5-digit match, onSuggestionSelect handles the write
          onSuggestionSelectRef.current?.(exactMatch);
          if (selectedStateAbbreviation) {
            const mismatch =
              exactMatch.stateAbbreviation.toUpperCase() !==
              selectedStateAbbreviation.toUpperCase();
            emitValidity(mismatch ? "state_mismatch" : "valid");
          } else {
            emitValidity("valid");
          }
        } else {
          emitValidity("pending");
        }
      } catch {
        if (!cancelled && !abortRef.current) {
          setSuggestions([]);
          setIsLoading(false);
          setIsOpen(false);
          emitValidity("invalid_zip");
        }
      }
    };

    fetchSuggestions();
    return () => {
      cancelled = true;
    };
  }, [debouncedInput, selectedStateAbbreviation, emitValidity]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const raw = e.target.value;
      if (!ZIP_REGEX.test(raw)) return;
      isSelectionRef.current = false;
      lastSelectedValueRef.current = null;
      lastSelectedSuggestionRef.current = null;
      setInputValue(raw);
      onChange(raw);
      emitValidity(raw.length === 0 ? "empty" : "pending");
      if (raw.length >= MIN_QUERY_LENGTH) setIsOpen(true);
    },
    [onChange, emitValidity]
  );

  const handleSelect = useCallback(
    (suggestion: ZipCodeSuggestion): void => {
      lastSelectedValueRef.current = suggestion.zip;
      lastSelectedSuggestionRef.current = suggestion;

      // Set flag BEFORE setInputValue so when the debounce effect fires for
      // the new inputValue it skips the fetch entirely.
      isSelectionRef.current = true;
      abortRef.current = true;

      // Update display input to show the full selected zip
      setInputValue(suggestion.zip);
      setSuggestions([]);
      setIsOpen(false);
      setTimeout(() => {
        onSuggestionSelectRef.current?.(suggestion);
      }, 0);

      if (selectedStateAbbreviation) {
        const mismatch =
          suggestion.stateAbbreviation.toUpperCase() !== selectedStateAbbreviation.toUpperCase();
        emitValidity(mismatch ? "state_mismatch" : "valid");
      } else {
        emitValidity("valid");
      }
    },
    [selectedStateAbbreviation, emitValidity]
  );

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Escape") setIsOpen(false);
  }, []);

  const hasZipError =
    isInvalid || validityState === "invalid_zip" || validityState === "state_mismatch";

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
          hasZipError
            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:border-brand-600 focus:ring-brand-600"
        } bg-background text-foreground placeholder:text-muted-foreground ${className ?? ""}`}
      />

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
