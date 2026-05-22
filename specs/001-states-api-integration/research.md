# Research: States Lookup API Integration

**Feature**: 001-states-api-integration  
**Date**: 11 March 2026

## 1. Option Shape Transformation

**Decision**: Transform at the service/hook layer — `{ stateAbbreviation, stateName }` → `{ id, label }`.

**Rationale**: The existing `QuestionField.options` type (`Array<{ id: string; label: string }>`) and the `DynamicQuestionRenderer` component both consume `{ id, label }`. Transforming at the boundary keeps all downstream components unchanged.

**Alternatives considered**:
- Updating `QuestionField.options` type and all renderers to accept `{ stateAbbreviation, stateName }` — rejected because it would violate FR-006 (no changes to other questions) and touch many components.
- Storing both shapes — rejected as unnecessary complexity.

## 2. Fetch Strategy (No React Query)

**Decision**: Use `useEffect` + `useState` in a dedicated `useStatesLookup` custom hook, following the existing codebase pattern.

**Rationale**: React Query / TanStack Query is **not installed** in the project (confirmed via `package.json`). All existing API fetches (`useAssessment.loadProgress()`, `getIndustries()` in `RegistrationForm`) use raw axios + `useEffect` + local `useState`. Introducing React Query for a single feature would add a new dependency and an unfamiliar pattern.

**Alternatives considered**:
- Adding React Query — rejected as disproportionate to the feature scope; not a dependency already in the project.
- Fetching inline in `WorkforceTab` without a hook — rejected for reusability and testability.

## 3. API Service Location

**Decision**: Add `getStates()` to the existing `src/services/api/assessmentApi.ts`, which already contains all assessment-related API functions and has a configured axios instance with auth interceptors.

**Rationale**: The states lookup is consumed exclusively within the assessment flow (`WorkforceTab`). Adding it to `assessmentApi.ts` avoids creating a new file for a single function and reuses the existing axios instance with auth interceptors already configured. This follows the same pattern as `getIndustries()` living in `authApi.ts` (consumed within the auth/registration flow).

**Alternatives considered**:
- Creating a new `lookupApi.ts` — rejected as unnecessary file proliferation for a single function consumed only by the assessment flow.
- Adding to `authApi.ts` alongside `getIndustries()` — rejected because state lookup is not auth-related.

## 4. Question Option Injection Point

**Decision**: Clone the questions array in `WorkforceTab.tsx` and replace `validationRules.fields[0].options` for the two target questions before passing to `DynamicTab`.

**Rationale**: `DynamicQuestionRenderer` reads options directly from `question.validationRules.fields[].options` and has **no prop for overriding options**. The simplest integration is to produce a modified questions array upstream. `WorkforceTab` is the owning component that already extracts question data from JSON and passes it to `DynamicTab`.

**Paths to override**:
- `topWorkLocations`: `question.validationRules.fields[0].options` (where `fields[0].name === "state"`)
- `employeeLivingZipCodes`: `question.conditionalQuestion.question.validationRules.fields[0].options` (nested conditional)

**Alternatives considered**:
- Adding an `optionOverrides` prop to `DynamicQuestionRenderer` — rejected because it would require changes to the renderer contract and all callers.
- Using React Context to provide state options — rejected as overengineered for two questions.

## 5. Empty Array & Error Handling

**Decision**: Treat empty `states` array the same as an API error — display "state options unavailable" on the two affected dropdowns.

**Rationale**: An empty valid response leaves the user with zero selectable options, which is operationally indistinguishable from an error. Consistent handling simplifies the logic.

**Alternatives considered**:
- Showing an empty dropdown — rejected as confusing UX.
- Falling back to hardcoded options — rejected because it defeats the purpose of live API integration and could show stale data.

## 6. Malformed Entry Handling

**Decision**: Silently skip individual entries missing `stateAbbreviation` or `stateName`. If all entries are filtered out, apply the empty-array rule (treat as error).

**Rationale**: Partial data should not break the entire feature. Filtering is a common resilience pattern.

**Alternatives considered**:
- Failing the whole response if any entry is malformed — rejected as too brittle.
- Logging warnings — considered but not required by spec; implementer may add as a best practice.

## 7. Loading State UX

**Decision**: Disable the state select dropdown with a "Loading states..." placeholder while the fetch is in-flight. The zip code field remains usable.

**Rationale**: Lightweight, non-blocking, and consistent with typical form UX. Avoids blocking the entire question while a single field's options are loading.

**Alternatives considered**:
- Full-question spinner — rejected because it would block the zip code field unnecessarily.
- Deferring until after assessment data loads — rejected because the states fetch is independent and can happen in parallel.

## 8. Existing Prior Art: Industry Lookup

**Decision**: Follow the `getIndustries()` pattern from `src/services/api/authApi.ts` and the industry fetch pattern from `RegistrationForm.tsx`.

**Key pattern**:
```
// Service function
export const getStates = async () => { ... }

// Component/hook usage
const [states, setStates] = useState([]);
const [isLoadingStates, setIsLoadingStates] = useState(true);
const [statesError, setStatesError] = useState(null);

useEffect(() => {
  const fetchStates = async () => { ... };
  fetchStates();
}, []);
```

**Rationale**: Proven pattern already in the codebase. No new abstractions needed.

## 9. Axios Instance & Base URL

**Decision**: Reuse the existing axios instance already configured in `assessmentApi.ts`.

**Pattern**: 
```
baseURL: import.meta.env.VITE_API_BASE_URL || "https://dev-api.benestats.com/api/v1"
```

**Rationale**: `assessmentApi.ts` already has an axios instance with auth interceptors, base URL, and timeout configured. Adding `getStates()` to this file reuses all of that infrastructure with zero duplication.

## 10. Technology Stack Confirmation

| Concern | Confirmed Value |
|---------|----------------|
| React | 19.2.0 |
| TypeScript | strict mode |
| HTTP client | axios 1.13.2 |
| State management | Redux Toolkit (not used for assessment) |
| Form validation | zod + react-hook-form |
| Testing | vitest + @testing-library/react |
| Build | Vite (rolldown-vite) |
| CSS | Tailwind CSS 4 |
| API base URL | `VITE_API_BASE_URL` env var |
