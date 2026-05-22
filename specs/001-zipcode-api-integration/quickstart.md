# Quickstart: Zip Code API Autocomplete Integration

**Branch**: `001-zipcode-api-integration` | **Date**: 2026-03-10 | **Updated**: 2026-03-11

## Prerequisites

- Node.js 18+
- pnpm installed
- Repository cloned and on branch `001-zipcode-api-integration`

## Setup

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

## Verify the Feature

1. Navigate to the assessment flow → Workforce tab
2. Reach the question: "List the top 5 work locations that employees are commuting to"
3. In any row's Zip Code field, type `394`
4. A dropdown should appear below the input showing matching zip codes (e.g., `39401`)
5. Click a suggestion — the field populates and the dropdown closes **immediately**
6. Wait 1–2 seconds — the dropdown **must NOT reopen** (verifies FR-016 bug fix)
7. Type a new character in the same field — the dropdown should reappear with new suggestions

**Conditional question test**:
1. Answer "No" to "Do your employees live in the same zip code areas as your work locations?"
2. In the revealed conditional question, type `100` in a Zip Code field
3. Verify the autocomplete dropdown appears and functions identically

## Run Tests

```bash
# Run all tests
pnpm test

# Run only the zip code autocomplete tests
pnpm vitest run tests/components/common/ZipCodeAutocomplete.test.tsx

# Run with UI
pnpm vitest --ui
```

## Quality Gate

```bash
# Type check (must pass)
pnpm run type-check

# Lint + format
pnpm lint:fix && pnpm format
```

## Key Files

| File | Purpose |
|------|---------|
| `src/components/common/ZipCodeAutocomplete.tsx` | Reusable autocomplete component |
| `src/services/api/assessmentApi.ts` | Assessment API service (lookup function added here) |
| `src/hooks/useDebounce.ts` | Debounce utility hook |
| `src/types/lookupTypes.ts` | TypeScript types for API response |
| `src/components/assessment/DynamicQuestionRenderer.tsx` | Integration point (renders `ZipCodeAutocomplete` for zip code fields) |
| `tests/components/common/ZipCodeAutocomplete.test.tsx` | Component tests |

## API Dependency

The feature depends on:
```
GET /api/v1/lookup/zip-codes?search={input}&limit=5
```

Ensure the backend API is running or that `VITE_API_BASE_URL` points to a working environment. The endpoint uses the same auth token as other API calls.
