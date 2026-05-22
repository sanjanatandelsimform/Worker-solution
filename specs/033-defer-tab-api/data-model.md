# Data Model: Defer Tab API Calls Until Tab Is Ready

**Feature**: 033-defer-tab-api  
**Date**: 2026-05-05

---

## Note: No New Data Models

This feature introduces no new entities, no new API shapes, and no schema changes. It is a **behavioural change** to when existing Redux thunks are dispatched, controlled by existing boolean flags already returned by useDashboardStatusPolling.

---

## Affected State Flows

### Current Flow

`
DashboardPage mounts
  └─ useEffect (isConnected, assessmentData.status)
       ├─ isConnected → dispatch(fetchWorkforce())    [immediate]
       └─ isConnected || status="completed" → dispatch(fetchRecommendations())  [immediate]

BenchmarkFinchPage mounts
  └─ useIndustry()
       └─ !isLoaded && !isLoading → dispatch(fetchIndustry())  [immediate]
`

### Target Flow

`
DashboardPage mounts
  └─ useDashboardStatusPolling({ enabled: shouldPollDashboardStatus })
       ├─ isWorkforceTabReady
       ├─ isRecommendationTabReady
       └─ (other flags unchanged)

  └─ useEffect (isConnected, assessmentData.status, isWorkforceTabReady, isRecommendationTabReady, shouldPollDashboardStatus)
       ├─ workforceReady   = !shouldPollDashboardStatus || isWorkforceTabReady
       ├─ recommendReady   = !shouldPollDashboardStatus || isRecommendationTabReady
       ├─ isConnected && workforceReady  → dispatch(fetchWorkforce())   [deferred until ready]
       └─ (isConnected || status="completed") && recommendReady → dispatch(fetchRecommendations())  [deferred until ready]

BenchmarkFinchPage({ isReady })
  └─ useIndustry({ enabled: isReady })
       └─ enabled && !isLoaded && !isLoading → dispatch(fetchIndustry())  [deferred until isReady=true]
`

---

## Guard Logic Summary

| Tab | Hook/Component | Guard condition |
|-----|---------------|-----------------|
| Workforce | DashboardPage dispatch effect | isConnected && (!shouldPollDashboardStatus \|\| isWorkforceTabReady) |
| Recommendations | DashboardPage dispatch effect | (isConnected \|\| assessmentCompleted) && (!shouldPollDashboardStatus \|\| isRecommendationTabReady) |
| Industry | useIndustry hook | enabled prop (set to isReady by BenchmarkFinchPage) |

---

## Idempotency

- **Workforce / Recommendations**: The dispatch useEffect runs when any dependency changes. If isWorkforceTabReady flips from alse → true, the effect runs and dispatches etchWorkforce. If the Redux store already has data (or if the thunk is in flight), the slice's existing pending/loading guard prevents a duplicate network call.
- **Industry**: useIndustry already guards if (isLoaded || isLoading) return. When enabled flips from alse → true (i.e., isReady becomes 	rue), the effect runs. If already loaded, the guard prevents a second fetch.
