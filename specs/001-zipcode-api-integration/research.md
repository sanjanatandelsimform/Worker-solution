# Research: Zip Code API Autocomplete Integration

**Branch**: `001-zipcode-api-integration` | **Date**: 2026-03-10 | **Updated**: 2026-03-11

## 1. Debounce Strategy

**Decision**: Implement a custom `useDebounce` hook (or inline `setTimeout`/`clearTimeout` pattern) within the `ZipCodeAutocomplete` component.

**Rationale**: The project has no debounce library installed (`lodash`, `use-debounce`, etc.). Adding a new dependency for a single 10-line utility is unnecessary overhead. A custom hook using `useEffect` + `setTimeout`/`clearTimeout` is idiomatic React, zero-dependency, and easily testable.

**Alternatives considered**:
- `lodash.debounce` — adds external dependency for trivial utility; rejected
- `use-debounce` npm package — clean API but adds a dependency for one use case; rejected
- Inline debounce in the component — acceptable but a reusable hook is cleaner; rejected in favor of hook

**Implementation pattern**:
```ts
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}
```

## 2. API Integration Pattern

**Decision**: Add a `lookupZipCodes()` function to the existing `src/services/api/assessmentApi.ts` file, using the same axios instance already configured in that file.

**Rationale**: The zip code lookup is consumed exclusively by the assessment form (WorkforceTab). Placing it in `assessmentApi.ts` co-locates it with the other assessment-related API functions (`getAssessment`, `submitWorkforce`, etc.), keeping the service boundaries clean and avoiding a new file for a single function. The axios instance in `assessmentApi.ts` already handles base URL, timeout, credentials, and auth token.

**Alternatives considered**:
- Create a new `lookupApi.ts` file — adds a new file for a single function; the lookup is assessment-scoped so co-location in `assessmentApi.ts` is more cohesive; rejected
- Inline `fetch()` call in the component — breaks separation of concerns and the established axios pattern; rejected
- Add to `authApi.ts` — that file is already large and zip lookup is unrelated to auth; rejected

**Endpoint**: `GET /api/v1/lookup/zip-codes?search={input}&limit=5` — this is a query-parameter-based GET, matching the existing `getIndustries()` pattern in `authApi.ts`.

## 3. Component Architecture

**Decision**: Create `src/components/common/ZipCodeAutocomplete.tsx` as a self-contained, reusable component.

**Rationale**: The `src/components/common/` directory already contains reusable UI components (`ErrorMessage.tsx`, `MultiSelect.tsx`, `RankList.tsx`). A zip code autocomplete is a reusable input primitive, not feature-specific. It manages its own dropdown state, API calls, and debounce internally.

**Alternatives considered**:
- Put in `src/components/assessment/` — too tightly coupled to assessment; the component is reusable; rejected
- Use existing `MultiSelect.tsx` — it has no search/API integration capability; rejected
- Use React Aria `ComboBox` — the project has `react-aria-components` installed, but the existing codebase doesn't use ComboBox anywhere; introducing it would add complexity and diverge from the custom component pattern used throughout; rejected

**Props interface**:
- `value: string` — current zip code value
- `onChange: (value: string) => void` — callback when value changes (typing or selection)
- `placeholder?: string` — input placeholder text
- `isInvalid?: boolean` — error styling flag (matches existing Input component pattern)

## 4. Integration Point in DynamicQuestionRenderer

**Decision**: In `renderStructuredArrayField()`, detect zip code fields via `field.name === "zipCode"` (already used for special handling) and conditionally render `<ZipCodeAutocomplete>` instead of `<Input>`.

**Rationale**: The renderer already has a `field.name === "zipCode"` check that applies numeric inputMode, maxLength, and digit-only filtering. This is the minimal, non-disruptive insertion point. No changes to the field type branching logic (`select` vs other) are needed — just a nested condition within the `else` (non-select) branch for zip code fields.

**Alternatives considered**:
- Add `"inputType": "zipcode"` flag to `questionData.json` — adds metadata but the code already identifies zip code fields by `field.name`; unnecessary indirection; rejected
- Create a new `field.type` value — would require changes to the type system and all STRUCTURED_ARRAY handling; too invasive; rejected
- Higher-order component wrapping `Input` — over-engineering for this use case; rejected

## 5. Click-Outside Dismissal

**Decision**: Use a `useRef` + `useEffect` pattern with a `mousedown` event listener on `document` inside the `ZipCodeAutocomplete` component.

**Rationale**: The existing `MultiSelect.tsx` component uses exactly this pattern (`useRef` for the container, `addEventListener("mousedown", handler)` on `document`, cleanup in `useEffect` return). This is the established pattern in the codebase.

**Alternatives considered**:
- React Aria's `useOverlayTrigger` / `FocusScope` — the project has react-aria but the existing custom components don't use overlay patterns; would be inconsistent; rejected
- Third-party library (`react-click-outside`) — unnecessary dependency; rejected

## 6. State Management Approach

**Decision**: Local component state only (no Redux slice, no global state).

**Rationale**: The autocomplete's state (dropdown open/closed, loading, suggestions list, debounced query) is entirely local to each input instance. There is no need to share this state across components. The existing `getIndustries()` API call in the codebase also uses no Redux caching — direct API calls from service files are an accepted pattern. The constitution allows local state as the preferred approach (Principle VI: "prefer local state and prop passing").

**Alternatives considered**:
- Redux slice for caching zip code lookups — adds complexity; the debounce already limits requests; zip codes are typed briefly and the data is small; rejected
- React Query — the project doesn't use React Query yet; introducing it for one feature would be premature; rejected

## 7. Testing Strategy

**Decision**: Use Vitest + React Testing Library for component tests. Mock the API call via `vi.mock()` on the lookup service module.

**Rationale**: The project uses Vitest (not Jest) with React Testing Library. There is no MSW setup. Existing test files use `vi.mock()` for mocking. Component tests should cover: (a) dropdown appears on 2+ char input, (b) suggestion selection populates field, (c) loading state shown, (d) empty state shown, (e) click-outside dismissal, (f) debounce behavior.

**Alternatives considered**:
- MSW (Mock Service Worker) — not installed and would add setup overhead for one feature; rejected
- Integration tests only — insufficient; the autocomplete has meaningful unit-testable behavior; rejected

## 8. Dropdown Positioning & Styling

**Decision**: Use absolute positioning within a relative container, with Tailwind utility classes matching the existing design system tokens.

**Rationale**: The existing `MultiSelect.tsx` uses this exact pattern — a `relative` wrapper div with an `absolute` dropdown div. Styling uses Tailwind semantic classes (`bg-background`, `border-border`, `shadow-sm`, etc.) per the project's copilot instructions (no arbitrary values, no CSS modules).

**Alternatives considered**:
- Floating UI / Popper.js — the dropdown is always below the input within a form flow; no complex repositioning needed; rejected
- Portal-based rendering — the form layout doesn't have overflow issues that would clip the dropdown; rejected

## 9. Dropdown Bug Fix — Selection Re-Fetch Suppression (Revision 2026-03-11)

**Problem**: When a user selects a suggestion, `handleSelect` sets `inputValue` to the selected zip (e.g., "39401") and closes the dropdown. After 300ms, `useDebounce` emits the new value, causing the `useEffect([debouncedInput])` to fire a new lookup. The effect resets `abortRef.current = false` and calls `setIsOpen(true)` — reopening the dropdown. The existing `abortRef` mechanism is defeated because the effect synchronously resets it before the async call.

**Decision**: Use `lastSelectedValueRef` pattern (value comparison guard) combined with moving `setIsOpen(true)` out of the fetch effect.

**Rationale**: The `lastSelectedValueRef` stores the selected zip code in a ref. When the debounced input effect runs, it compares `debouncedInput === lastSelectedValueRef.current` — if they match, the value came from a programmatic selection, not user typing, so the fetch is skipped entirely. The ref is cleared in `handleInputChange` so subsequent user typing triggers lookups normally. Additionally, `setIsOpen(true)` is removed from the effect — visibility is driven by user interaction (typing) only, not by data-fetching side-effects.

This combination provides:
- **No wasted API call** — value check short-circuits before fetch
- **No accidental dropdown reopen** — `isOpen` only set from user interaction
- **Deterministic** — value comparison, no timing assumptions
- **Minimal surface area** — ~7 lines changed in one file, zero hook modifications
- **React-idiomatic** — refs for mutable non-rendering state, event handlers drive UI state

**Alternatives considered**:

| Approach | Verdict | Reason |
|----------|---------|--------|
| `isSelectingRef` boolean guard | Rejected | Semantically weaker — loses *which* value was selected; can produce subtle timing issues with rapid select-then-type |
| `userIsTyping` state | Rejected | Wrong tool (state for non-UI concern), extra renders, dep-array complications, poor React alignment |
| Modified `useDebounce` hook | Rejected | Violates SRP — pollutes generic hook with component-specific logic; changes public API for all consumers |
| Move `setIsOpen(true)` only (Approach 5 alone) | Rejected standalone | Prevents dropdown reopen but still fires a wasted API call for the selected value; combining with `lastSelectedValueRef` eliminates both problems |

**Implementation changes** (in `ZipCodeAutocomplete.tsx` only):
1. Add `const lastSelectedValueRef = useRef<string | null>(null)`
2. In `handleSelect`: set `lastSelectedValueRef.current = zip`
3. In `handleInputChange`: set `lastSelectedValueRef.current = null`
4. In the `debouncedInput` effect: add early return `if (debouncedInput === lastSelectedValueRef.current) return`
5. Remove `setIsOpen(true)` from the fetch effect
6. In `handleInputChange`: add `if (raw.length >= MIN_QUERY_LENGTH) setIsOpen(true)` (visibility driven by typing)

**Test addition**: New test in `ZipCodeAutocomplete.test.tsx` that selects a suggestion, advances timers past the debounce window, and asserts the dropdown remains closed and no additional API call was made.
