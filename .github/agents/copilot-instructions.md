# untitledui-project Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-07

## Active Technologies

- TypeScript 5.x + React 19 + React Router v7, Redux Toolkit (createAsyncThunk, createSlice), Axios (via `apiClient`), Tailwind CSS v4 (009-industry-status-api)
- Redux store (session-scoped, not persisted to localStorage) (009-industry-status-api)

- TypeScript (strict mode) + React 19.2.0 + Redux Toolkit 2.11.2, axios 1.13.2 via shared apiClient (finchApi.ts) — polling hook (useFinchStatus) with setInterval/clearInterval lifecycle (006-finch-status)
- TypeScript (strict mode) + React 19.2.0 + @tryfinch/react-connect (Finch Connect SDK), axios 1.13.2 via shared apiClient (from authApi.ts), react-router-dom 7 — **sonner removed in 007-replace-sonner-toast** (005-finch-integration, 007-replace-sonner-toast)
- N/A — authorization code and session ID are in-flight only; no client-side persistence. Auth token via existing apiClient interceptor in authApi.ts. (005-finch-integration)
- TypeScript 5.x with React 19.2.0 + React Hook Form 7.71+, Axios 1.13+, Zod 4.3+, Redux Toolkit 2.11+ (002-industry-api-integration)
- N/A (API-driven dropdown, no local persistence) (002-industry-api-integration)
- TypeScript 5.9.3, React 19.2.0 + React Router v7, Redux Toolkit 2.11.2, Axios 1.13.2, React Hook Form 7.71.1, Zod 4.3.5, Tailwind CSS 4.1.18 (004-assessment-api-persistence)
- Server-side storage via REST API (GET /assessment, POST /assessment/{section}), NO client-side storage (localStorage/sessionStorage explicitly prohibited for assessment data) (004-assessment-api-persistence)
- TypeScript 5.9.3, React 19.2 + @reduxjs/toolkit 2.11.2, axios 1.13.2, react-router-dom 7.12.0 (001-dashboard-api-integration)
- Redux Toolkit for client state management (existing dashboardSlice pattern) (001-dashboard-api-integration)
- TypeScript 5.x, React 19.2 + Axios 1.13 (HTTP), React Router 7.12, Redux Toolkit, React Aria Components, Tailwind CSS 4.1 (001-zipcode-api-integration)
- N/A (no persistence — transient local component state only) (001-zipcode-api-integration)
- TypeScript ~5.9.3, React 19.2, JSX transform `react-jsx` + Vite (rolldown-vite 7.2.5), Axios 1.13.2, Redux Toolkit 2.11.2, react-hook-form 7.71.1, Zod 4.3.5, React Router 7.12.0 (001-zipcode-api-integration)
- N/A — form state managed in-memory by component state + Redux store (001-zipcode-api-integration)
- TypeScript 5.9.3, React 19.2.0 + React Router v7, Redux Toolkit 2.11.2, Axios (via `profileApi.ts` apiClient), @untitledui/icons (002-profile-settings)
- N/A (no client-side storage changes — assessment reset is server-side) (002-profile-settings)
- TypeScript 5.x / React 19 + React Router v7, Redux Toolkit, Tailwind CSS v4, Vite, shadcn/ui primitives (006-signup-flow-enhancements)
- localStorage (key: `"userDetail"`) — existing persistence via `persistAuth()` helper and `store.subscribe()` (006-signup-flow-enhancements)

- TypeScript (strict mode) + React 19.2 + axios 1.13.2, react-hook-form 7.71, zod 4.3, Redux Toolkit 2.11 (not used for assessment state) (001-states-api-integration)
- N/A — assessment state is local React state in `useAssessment` hook; no localStorage or Redux for assessment (001-states-api-integration)
- TypeScript (strict mode) + React 19.2.0 + axios 1.13.2 (HTTP), Vite/rolldown-vite (build), Tailwind CSS 4 (styling) (001-states-api-integration)
- N/A (no client-side persistence for state options) (001-states-api-integration)

- TypeScript with React 19+, strict mode enabled + React Hook Form (form management), Zod (validation), Axios (HTTP client), React Router v6 (navigation), Untitled UI components, Tailwind CSS 4+ (001-auth-business-onboarding)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript with React 19+, strict mode enabled: Follow standard conventions

## Recent Changes

- 009-industry-status-api: Added TypeScript 5.x + React 19 + React Router v7, Redux Toolkit (createAsyncThunk, createSlice), Axios (via `apiClient`), Tailwind CSS v4

- 007-replace-sonner-toast (2026-04-07): Removed sonner toast library from Finch integration. useFinchConnect hook now exposes `error: string | null` and `clearError: () => void` instead of calling toast.error(). DashboardPage renders `<ErrorMessage />` co-located inside each Finch connect section. App.tsx Toaster mount removed. src/components/ui/sonner.tsx deleted. pnpm remove sonner. Tests updated to assert result.current.error instead of mockToastError.
- 006-finch-status (2026-04-02): Added GET /api/v1/finch/status polling (15s interval) to Dashboard. New files: finchStatusTypes.ts, finchStatusSlice.ts, finchStatusSelectors.ts (in src/store/selectors/), useFinchStatus.ts hook. Modified: finchApi.ts (getFinchStatus), store.ts (register finchStatus reducer), DashboardPage.tsx (isConnected hides onboarding cards + Connect button wired to connectWithFinch). Polling unconditional — no stop condition implemented (deferred optimisation). Selector convention: separate src/store/selectors/ file (NOT co-located in slice).

<!-- MANUAL ADDITIONS START -->

- 012-participation-dynamic-items (2026-04-16): `participation.benefits`, `participation.retirement`, `participation.insurance` in `WorkforceResponse` changed from fixed-key objects to `EnrollmentItem[]` arrays (`{ name: string; enrollment: string }`). Hook `useWorkforceParticipationConfig` now maps arrays instead of accessing property keys. Static mock data in `workforceSlice.ts` updated to array format. Test fixtures in 3 test files updated. No changes to selectors, `WorkforceParticipation.tsx`, or `WorkforcePage.tsx`.

## Active Feature: 001-proven-strategy-flags (2026-05-05)

<!-- specify:agent:start -->

**Branch**: `001-proven-strategy-flags` | **Spec**: `specs/001-proven-strategy-flags/spec.md` | **Plan**: `specs/001-proven-strategy-flags/plan.md`

### What this feature does

1. Introduces `StrategyFlagStatus = "green" | "yellow" | "hidden"` type (new file `src/types/strategyFlagTypes.ts`).
2. Changes `RecommendationData.autoEnroll`, `nonElectiveMatch`, `healthcareAffordability` from `boolean` → `StrategyFlagStatus`.
3. Adds `healthcareAffordability?: StrategyFlagStatus` to `WorkforceEnvelope` — Finch flow only field from backend.
4. In Finch flow (`isConnected === true`): `autoEnroll` + `nonElectiveMatch` from Recommendations API; `healthcareAffordability` from Workforce API. In manual flow: all three from Recommendations API.
5. Card rendering: `"green"` → green card + LikeIcon (green); `"yellow"` → yellow card + UserGroupIcon (yellow); `"hidden"` → card not rendered at all.
6. `provenStrategiesCount` = count of `"green"` flags; denominator (`visibleFlagsTotal`) = count of non-`"hidden"` flags (not hardcoded 3).

### Files to create

- `src/types/strategyFlagTypes.ts` — `StrategyFlagStatus` type
- `src/utils/strategyFlagUtils.ts` — `normaliseFlag(raw: unknown): StrategyFlagStatus` helper

### Files to modify

- `src/types/recommendationsTypes.ts` — `boolean` → `StrategyFlagStatus` on three flag fields
- `src/types/workforceTypes.ts` — add `healthcareAffordability?: StrategyFlagStatus` to `WorkforceEnvelope`
- `src/store/selectors/recommendationsSelectors.ts` — update `selectProvenStrategiesFlags` to return `StrategyFlagStatus` values + normalise
- `src/store/selectors/workforceSelectors.ts` — add `selectWorkforceHealthcareAffordabilityFlag`
- `src/pages/recommendations/RecommendationsFinchPage.tsx` — destructure `isConnected`, compose flags per flow, update count computation, pass `visibleFlagsTotal`
- `src/pages/recommendations/CoreBenefitsEnhancement.tsx` — update `ProvenStrategyFlags` type, tri-state card rendering, `visibleFlagsTotal` prop
- `tests/pages/CoreBenefitsEnhancement.test.tsx` — update fixtures; add hidden-card and colour tests
- `tests/store/selectors/recommendationsSelectors.test.ts` — assert string values; add normalisation test
- `tests/utils/strategyFlagUtils.test.ts` — NEW — unit tests for `normaliseFlag`

### Key facts

- `normaliseFlag` is the single coercion point: unknown/absent/boolean → `"hidden"`
- `ProvenStrategyFlags` interface is exported from `CoreBenefitsEnhancement.tsx`
- `isConnected` is already returned by the existing `useAssessmentStatus()` call in `RecommendationsFinchPage` — no new hook needed
- `visibleFlagsTotal > 0` guard prevents division-by-zero when all flags are `"hidden"`
- See full implementation guide: `specs/001-proven-strategy-flags/quickstart.md`

<!-- specify:agent:end -->
<!-- MANUAL ADDITIONS END -->
