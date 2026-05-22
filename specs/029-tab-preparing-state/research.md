# Research: 029-tab-preparing-state

**Purpose**: Resolve all NEEDS CLARIFICATION items from Technical Context before Phase 1 design.

No NEEDS CLARIFICATION items were raised — all relevant patterns already exist in the codebase from features 027 and 028. Findings below confirm all design decisions.

---

## R-001: Tab Staleness Logic — How to Compute It

**Question**: What's the exact predicate for a tab being "stale and pending"?

**Decision**:  
`isTabStale = tab.status === "pending" && tab.updatedAt !== null && (Date.now() - Date.parse(tab.updatedAt)) > PROCESSING_WINDOW_MS`

**Rationale**:

- `status === "pending"` ensures completed/not_applicable tabs never show `<PreparingDashboard />`
- The 5-minute threshold reuses the existing `PROCESSING_WINDOW_MS = 300_000` constant already defined at the top of `useDashboardStatusPolling.ts` — no new constant needed
- Null-guarding `updatedAt` matches how the existing `createdAt` parsing is handled in the hook (using `Date.parse` + `Number.isNaN` check)

**Alternatives considered**:

- Using `updatedAt` relative to `createdAt` (i.e., tab hasn't updated since it was created for 5 min): rejected — `Date.now()` comparison is simpler and semantically clearer (tab is stale relative to _now_, not to when it was created)
- Using a separate interval timer like `hasExceededProcessingWindow`: rejected — per-tab staleness is computed once per polling cycle from the `status` object, not on a timer, so a `useMemo` is sufficient (same pattern as `isRecommendationTabReady`)

---

## R-002: Where Do the Three Flags Live?

**Decision**: Compute inside `useDashboardStatusPolling` via `useMemo`, mirror the pattern used for `isRecommendationTabReady` / `isWorkforceTabReady` / `isIndustryTabReady`.

**Rationale**: The hook already owns all status state; keeping derived boolean flags colocated avoids prop-drilling the raw status object down to consumers. The `useMemo` pattern is already established and tested.

**New flag names**:

- `isRecommendationTabStale` — flag for Recommendations tab
- `isWorkforceTabStale` — flag for Workforce tab
- `isIndustryTabStale` — flag for Industry/Benchmark tab

---

## R-003: How Should Each Tab Page Receive and Use the Flag?

**Decision**: Add an `isStale` boolean prop (defaulting to `false`) to each tab page component. When `isStale === true`, return `<PreparingDashboard />` as the sole output at the top of the component.

**Rationale**:

- Mirrors the existing `isReady` prop pattern in all three tab pages — minimal diff, easy to review
- Placing the early-return at the top of the component ensures all hooks still run (React rules of hooks), only the JSX branch changes
- `DashboardPage` is the single orchestrator that destructures both `isReady` and `isStale` flags from the hook and passes them down

**Alternatives considered**:

- Wrapping each tab in a HOC: rejected — over-engineering for 3 files with a 2-line change each
- Putting the condition in `DashboardPage`'s `<Tabs.Panel>`: rejected — tab page components should own their own fallback UI for testability and separation of concerns

---

## R-004: TypeScript Type Update

**Decision**: Add `isRecommendationTabStale`, `isWorkforceTabStale`, `isIndustryTabStale` as `boolean` fields to the `UseDashboardStatusPollingReturn` interface in `src/types/dashboardStatusTypes.ts`.

**Rationale**: Same interface file already has the `isRecommendationTabReady` etc. fields — adding alongside them is consistent.

---

## R-005: Test Strategy

**Decision**:

1. **Hook tests** (`tests/hooks/useDashboardStatusPolling.test.ts`): Add a new `describe` block for the three stale flags. Cover: no-status (default `false`), pending + stale `updatedAt` → `true`, pending + fresh `updatedAt` → `false`, completed → `false`, null `updatedAt` → `false`.
2. **Tab page tests**: Add render tests for `isStale={true}` in the existing test files for each tab page (or create new simple test files where none exist).

**Key constraint**: The `makeStatus` helper in the existing hook test uses `updatedAt: null` on tab sections — these should remain `false` for the stale flags, confirming null-guard behavior.
