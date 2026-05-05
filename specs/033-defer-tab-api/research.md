# Research: Defer Tab API Calls Until Tab Is Ready

**Feature**: 033-defer-tab-api  
**Date**: 2026-05-05  
**Status**: Complete — all NEEDS CLARIFICATION resolved

---

## Decision 1: Where to gate etchWorkforce and etchRecommendations

**Decision**: Gate in the existing useEffect inside DashboardPage.tsx that already dispatches both calls. Add isWorkforceTabReady and isRecommendationTabReady to the condition and the dependency array.

**Rationale**: The dispatch effect is already the correct single location for this logic. Adding a condition there is surgical and does not require new abstractions or new hooks.

**Alternatives considered**:
- Move gating into individual page components (RecommendationsFinchPage, WorkforcePage): Rejected — those components only receive isReady for display skeleton gating; mixing data-fetch gating into them would couple display and fetch concerns.
- Create a new useDeferredFetch hook: Rejected — over-engineering; the change is two extra boolean conditions in one effect.

**Key pattern**:
`	ypescript
const workforceReady   = !shouldPollDashboardStatus || isWorkforceTabReady;
const recommendReady   = !shouldPollDashboardStatus || isRecommendationTabReady;
`
When polling is disabled (shouldPollDashboardStatus = false), !shouldPollDashboardStatus = true, so the gate is always open — preserving original behaviour exactly.

---

## Decision 2: How to gate etchIndustry (Industry tab)

**Decision**: Add an enabled parameter (default 	rue) to useIndustry. BenchmarkFinchPage threads its isReady prop through as useIndustry({ enabled: isReady }).

**Rationale**:
- useIndustry is the single place that dispatches etchIndustry; gating it there is consistent with the "gate at the source" principle used for the other two tabs.
- BenchmarkFinchPage already receives isReady from DashboardPage where it equals isIndustryTabReady. Threading it into useIndustry requires zero new state or props.
- Default enabled = true preserves backward compat for all other callers (none exist currently, but future-proofing).

**Alternatives considered**:
- Gate in DashboardPage via isConnected && isIndustryTabReady as a condition to render BenchmarkFinchPage at all: Rejected — BenchmarkFinchPage is already rendered unconditionally when isConnected; conditional rendering would cause unmount/remount on tab switch.
- Gate in DashboardPage by conditionally calling dispatch(fetchIndustry()) alongside the other two: Rejected — etchIndustry is not called in DashboardPage; it lives in useIndustry and dispatches autonomously. Threading it through DashboardPage would require a new dispatch call and duplicate logic.

---

## Decision 3: Hook call order in DashboardPage.tsx

**Decision**: Move the dispatch useEffect (currently at line ~194) to AFTER the useDashboardStatusPolling call (currently at line ~264). The polling-hook call and modal-config hooks stay in their current positions.

**Rationale**:
- const declarations for readiness flags are unavailable before useDashboardStatusPolling is called. The dispatch effect references them, so it must come after.
- Moving one useEffect downward past 4 useModalConfig hooks changes the React hook index order. This is a valid code change for a full deploy (not a hot-reload concern).
- The alternative (moving useDashboardStatusPolling before useModalConfig hooks) would shift more hooks and produce a larger diff.

---

## Decision 4: Non-polling scenario compatibility

**Decision**: Use !shouldPollDashboardStatus || isTabReady as the guard. This ensures that when the dashboard status API is not needed (assessment not started, not connected), fetches happen immediately as before.

**Rationale**: shouldPollDashboardStatus = isConnected || assessmentData?.data?.status === "completed". When both are false, polling is off and the guard opens automatically. No separate code path needed.

---

## Decision 5: Test strategy

**Decision**:
1. Add i.mock("@/hooks/useDashboardStatusPolling", ...) to DashboardPage.test.tsx and DashboardPage.branches.test.tsx. Default mock returns all ready flags as 	rue to preserve existing tests.
2. Add a new describe("deferred fetch gating") block to DashboardPage.test.tsx (or a new DashboardPage.deferredFetch.test.tsx) that spies on etchWorkforce / etchRecommendations dispatch and asserts they are/aren't called based on readiness flags.
3. Add enabled tests to 	ests/hooks/useIndustry.test.ts.
4. Add an isReady → enabled forwarding test to 	ests/pages/BenchmarkFinchPage.test.tsx.

**Rationale**: Centralising deferred-fetch tests in DashboardPage.test.tsx keeps the test file aligned with the component it covers. DashboardPage.userFetch.test.tsx already demonstrates the spy pattern for dispatch assertions — we follow the same pattern.

---

## Resolved: All NEEDS CLARIFICATION items

| Item | Resolution |
|------|-----------|
| Where to put the fetch gate for workforce/recommendations | DashboardPage dispatch useEffect |
| Where to put the fetch gate for industry | useIndustry enabled param + BenchmarkFinchPage prop thread |
| Non-polling scenario compatibility | !shouldPollDashboardStatus bypass |
| Hook order conflict | Move dispatch useEffect after useDashboardStatusPolling |
| Existing test impact | Add polling mock with all-ready defaults; no existing tests broken |
