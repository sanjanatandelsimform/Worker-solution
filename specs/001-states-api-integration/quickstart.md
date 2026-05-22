# Quickstart: States Lookup API Integration

**Feature**: 001-states-api-integration  
**Date**: 11 March 2026

## Overview

Replace the hardcoded 50-state options in `topWorkLocations` and
`employeeLivingZipCodes` assessment questions with a live call to
`GET /api/v1/lookup/states`, fetched once on `WorkforceTab` mount.

## Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useStatesLookup.ts` | Custom hook wrapping fetch + loading/error state |

## Files to Modify

| File | Change |
|------|--------|
| `src/services/api/assessmentApi.ts` | Add `getStates()` function using existing axios instance |
| `src/pages/assessmentWorkforce/WorkforceTab.tsx` | Call `useStatesLookup()`, clone questions, inject API-sourced options, pass modified questions to `DynamicTab` |

## Files Unchanged

- `src/data/assessment/questionData.json` — structure preserved (FR-009)
- `src/components/assessment/DynamicTab.tsx` — no changes
- `src/components/assessment/DynamicQuestionRenderer.tsx` — no changes
- `src/hooks/useAssessment.ts` — no changes
- `src/types/questionTypes.ts` — no changes
- `src/services/validation/assessmentSchemas.ts` — no changes

## Architecture Flow

```
WorkforceTab mounts
  ├── useStatesLookup() fires → assessmentApi.getStates()
  │     ├── Success: transform → { id, label }[] → set stateOptions
  │     ├── Empty/Error: set error flag
  │     └── Loading: isLoadingStates = true
  │
  ├── Clone questions from JSON
  │     ├── topWorkLocations.validationRules.fields[0].options = stateOptions
  │     └── employeeLivingZipCodes (conditional).validationRules.fields[0].options = stateOptions
  │
  └── <DynamicTab questions={modifiedQuestions} ... />
        └── <DynamicQuestionRenderer> reads options from question object (unchanged)
```

## Key Patterns to Follow

### API Service — add to existing `assessmentApi.ts`

```typescript
// src/services/api/assessmentApi.ts (add to existing file)
// Reuses the existing `api` axios instance already configured with auth interceptors

export const getStates = async (): Promise<StatesLookupResponse> => {
  const response = await api.get("/lookup/states");
  return response.data;
};
```

### Custom Hook — follow industry fetch pattern in `RegistrationForm.tsx`

```typescript
// src/hooks/useStatesLookup.ts
export function useStatesLookup() {
  const [stateOptions, setStateOptions] = useState<StateOptionComponent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { /* fetch once */ }, []);

  return { stateOptions, isLoading, error };
}
```

### Question Cloning — in WorkforceTab

Deep-clone the relevant questions and replace `fields[0].options` for
questions with keys `topWorkLocations` and `employeeLivingZipCodes`
(including the conditional nesting path).

## Verification Checklist

- [x] `GET /api/v1/lookup/states` called exactly once per WorkforceTab mount
- [x] State select shows "Loading states..." while fetch is in-flight
- [x] State select populated with API data on success
- [x] State select shows "state options unavailable" on error/empty
- [x] Zip code field usable during loading
- [x] All other questions unaffected
- [x] Form submission payload identical to pre-change
- [x] No changes to `questionData.json` structure
