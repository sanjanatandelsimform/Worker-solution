# Implementation Plan: Finch Connect — Remove Get-More Page & Real API Integration

**Branch**: `005-finch-integration` | **Date**: 2026-04-01 | **Spec**: [spec-finch-api-integration.md](spec-finch-api-integration.md)
**Input**: Feature specification from `/specs/005-finch-integration/spec-finch-api-integration.md`

## Summary

Replace the two stub service functions in `finchApi.ts` with real HTTP calls using the shared `apiClient` (imported from `authApi.ts`). The first call hits `POST /api/v1/finch/connect-session` (no payload) to retrieve a live session ID; the second call hits `POST /api/v1/finch/callback` with `{ code }` to complete the connection. Update the hook's fixed fallback error strings to match the spec. Remove all Finch-related code from `GetMore.tsx` and delete the Finch-triggered test cases from `GetMore.test.tsx`. Function signatures, hook interface, and component structure are unchanged — this is a pure service-layer swap with targeted cleanup.

## Technical Context

**Language/Version**: TypeScript (strict mode) + React 19.2.0  
**Primary Dependencies**: axios 1.13.2 via shared `apiClient` (default export from `src/services/api/authApi.ts`); `@tryfinch/react-connect` (existing, unchanged); `sonner` (existing, unchanged); react-router-dom v7 (existing, unchanged)  
**Storage**: N/A — authorization code and session ID are in-flight only; no client-side persistence. Auth token conveyed via the existing `apiClient` request interceptor in `authApi.ts`.  
**Testing**: Vitest 4.0 + @testing-library/react 16.3 (existing setup — no new test tooling needed)  
**Target Platform**: Web SPA, all modern browsers (same as project-wide target)  
**Project Type**: Single web application (frontend-only; backend endpoints now real)  
**Performance Goals**: Both API calls covered by the existing 10-second timeout configured in `apiClient`  
**Constraints**: Function signatures of `getFinchSessionId()` and `exchangeFinchCode()` MUST NOT change (hook and tests mock by name). Hook interface (`connectWithFinch`, `isLoading`) MUST NOT change. Backend response `status` field MUST be validated — HTTP 2xx alone is insufficient for success.  
**Scale/Scope**: 1 modified service file (`finchApi.ts`), 1 modified hook (`useFinchConnect.ts`, error strings only), 1 modified page (`GetMore.tsx`, remove Finch code), 1 modified test file (`GetMore.test.tsx`, remove Finch test cases), 1 modified test file (`useFinchConnect.test.tsx`, update mock return shapes)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                           | Status  | Evidence                                                                                                                                                                                                                    |
| ----------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **I. Component-First Architecture** | ✅ PASS | `finchApi.ts` service functions remain standalone with clear TypeScript interfaces. Hook interface is unchanged — components stay thin consumers. The real API response shape is fully typed via new interface definitions. |
| **II. User-Centric Design**         | ✅ PASS | 2 prioritized user stories (both P1) with acceptance criteria and independent tests. Fixed fallback error strings ensure users always receive a clear, actionable message.                                                  |
| **III. Test-Driven Development**    | ✅ PASS | Tests are updated before/alongside implementation. Hook tests are updated to assert real endpoint calls. GetMore Finch tests are deleted per spec. Non-Finch GetMore coverage is retained.                                  |
| **IV. Type Safety & Code Quality**  | ✅ PASS | New response types (`FinchSessionApiResponse`, `FinchCallbackApiResponse`) are explicitly defined with all fields. No `any`. `status` field validation is typed as `boolean`.                                               |
| **V. Performance & Accessibility**  | ✅ PASS | No new bundle additions. Button disabled state (ARIA `disabled`) unchanged. Both endpoints covered by existing 10s timeout.                                                                                                 |
| **VI. State Management Discipline** | ✅ PASS | All state remains local to the hook. No global state introduced. API calls are side effects inside the existing trigger function.                                                                                           |
| **Technology Standards**            | ✅ PASS | Uses shared `apiClient` from `authApi.ts` — consistent with `dashboardApi.ts` pattern. No new packages. Vitest + RTL for tests. TypeScript strict mode.                                                                     |

**Post-Phase 1 Re-check**: All gates remain PASS. Real API calls follow the exact same pattern as `dashboardApi.ts`. No architectural changes required.

## Project Structure

### Documentation (this feature)

```text
specs/005-finch-integration/
├── plan-finch-api-integration.md          # This file
├── research-finch-api-integration.md      # Phase 0: decisions and rationale
├── data-model-finch-api-integration.md   # Phase 1: updated entity shapes
├── quickstart-finch-api-integration.md   # Phase 1: implementation guide
└── contracts/
    ├── finch-connect-session.md           # Phase 1: POST /api/v1/finch/connect-session
    └── finch-callback.md                  # Phase 1: POST /api/v1/finch/callback
```

### Source Code (affected files only)

```text
src/
├── services/api/
│   └── finchApi.ts                        # MODIFIED: replace stubs with real apiClient calls; update types
├── hooks/
│   └── useFinchConnect.ts                 # MODIFIED: update fallback error strings (FR-014)
└── pages/getMore/
    └── GetMore.tsx                        # MODIFIED: remove useFinchConnect import + Finch trigger code

tests/
├── hooks/
│   └── useFinchConnect.test.tsx           # MODIFIED: update mock return shapes to real response structure
├── pages/
│   └── GetMore.test.tsx                   # MODIFIED: delete T021 (Finch plan calls connectWithFinch) and T023 (loading state); keep T022 (Manual Entry)
└── services/
    └── finchApi.test.ts (if exists)       # MODIFIED: update to mock real HTTP calls and assert endpoints/payloads
```

**Structure Decision**: Single web application (frontend-only). All modifications follow the established src/services/api/ and src/hooks/ patterns already verified in dashboardApi.ts and useFinchConnect.ts.

## Complexity Tracking

> No constitution violations. No entries required.
