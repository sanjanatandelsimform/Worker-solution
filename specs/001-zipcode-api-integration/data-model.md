# Data Model: Zip Code API Autocomplete Integration

**Branch**: `001-zipcode-api-integration` | **Date**: 2026-03-10 | **Updated**: 2026-03-11

## Entities

### ZipCodeSuggestion

Represents a single zip code result from the lookup API.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zip | string (5 digits) | Yes | US zip code |
| stateName | string | Yes | Full state name (e.g., "Mississippi") |
| stateAbbreviation | string (2 chars) | Yes | State abbreviation (e.g., "MS") |
| stateFips | string | Yes | State FIPS code (e.g., "28") |

**Source**: API response at `data.zipCodes[]`

### ZipCodeLookupResponse

Top-level API response envelope.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| success | boolean | Yes | Whether the request succeeded |
| data | object | Yes | Contains `zipCodes` array and `pagination` |
| data.zipCodes | ZipCodeSuggestion[] | Yes | Matching zip code results |
| data.pagination | Pagination | Yes | Pagination metadata |
| message | string | Yes | Human-readable status message |

### Pagination

Pagination metadata (informational only — not used for UI).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| page | number | Yes | Current page number |
| limit | number | Yes | Results per page |
| totalRecords | number | Yes | Total matching records |
| totalPages | number | Yes | Total pages available |

## Relationships

```
ZipCodeLookupResponse
  └── data
       ├── zipCodes: ZipCodeSuggestion[]  (0..N)
       └── pagination: Pagination          (1)
```

## State Transitions

No persistent state transitions. The autocomplete component manages transient local state:

```
IDLE → TYPING → DEBOUNCING → LOADING → RESULTS / EMPTY / ERROR → IDLE
                                          ↑
                                          └── User selects → IDLE
```

| State | Trigger | Next State | Notes |
|-------|---------|------------|-------|
| IDLE | User types character | TYPING | |
| TYPING | Character count < 2 | IDLE | |
| TYPING | Character count >= 2 | DEBOUNCING | `setIsOpen(true)` here (typing-driven) |
| DEBOUNCING | 300ms elapses | LOADING | |
| DEBOUNCING | User types again | DEBOUNCING (timer resets) | |
| LOADING | API returns results | RESULTS | |
| LOADING | API returns empty | EMPTY | |
| LOADING | API fails | ERROR | |
| RESULTS | User selects suggestion | IDLE | `lastSelectedValueRef` set; `setIsOpen(false)` |
| RESULTS | User clicks outside | IDLE | |
| RESULTS | User deletes to < 2 chars | IDLE | |
| EMPTY | User types more | DEBOUNCING | |
| ERROR | User types more | DEBOUNCING | |
| IDLE (post-selection) | Debounce emits selected value | IDLE (stays) | Suppressed by `lastSelectedValueRef` guard — no fetch, no reopen (FR-016) |
| IDLE (post-selection) | User types new characters | TYPING | `lastSelectedValueRef` cleared in `handleInputChange` — normal flow resumes |

## Validation Rules

No new validation rules introduced. Existing zip code validation remains:

- Input: digits only (`/^\d{0,5}$/`)
- Max length: 5 characters
- Pattern (on `employeeLivingZipCodes` field): `^\\d{5}$`

The autocomplete is an **input aid** — it does not bypass or replace validation.

## Notes

- `stateFips` is returned by the API but not displayed in the dropdown (display is zip code only per FR-003). It may be useful for future features.
- `stateName` and `stateAbbreviation` are returned but not displayed. They are captured in the data model for completeness and potential future use (e.g., auto-filling the state dropdown).
- Pagination is returned but not consumed — the first page (up to 20 results) is sufficient.
