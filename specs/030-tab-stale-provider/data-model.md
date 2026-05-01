# Data Model: 030-tab-stale-provider

**Generated**: 2026-05-01

---

## Entities

### `ProviderType` (existing, no change)

```ts
// src/types/dashboardStatusTypes.ts
type ProviderType = "assisted" | "automated" | null;
```

Values defined by the backend; this feature only reads them.

---

### `UseDashboardStatusPollingReturn` (extended)

```ts
// src/types/dashboardStatusTypes.ts
interface UseDashboardStatusPollingReturn {
  // --- existing fields (no change) ---
  status: DashboardStatusResponse | null;
  isLoading: boolean;
  error: string | null;
  isPolling: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
  isRecommendationTabReady: boolean;
  isWorkforceTabReady: boolean;
  isIndustryTabReady: boolean;
  hasExceededProcessingWindow: boolean;
  isRecommendationTabStale: boolean;
  isWorkforceTabStale: boolean;
  isIndustryTabStale: boolean;

  // +++ new field +++
  isAutomatedProvider: boolean;
  // true  → providerType === "automated"  (24-36 h message)
  // false → providerType !== "automated"  (up to 2 weeks message, or null/assisted)
}
```

---

### Preparing Dashboard Messages (new constant module)

```ts
// src/constants/preparingDashboardMessages.ts
export const PREPARING_MSG_AUTOMATED: string;
// "Finch is working hard with your payroll provider to create your custom
//  dashboard. This may take 24-36 hours. We'll send an email once your
//  setup is complete."

export const PREPARING_MSG_NON_AUTOMATED: string;
// "Finch is working hard with your payroll provider to create your custom
//  dashboard. This may take up to 2 weeks. We'll send an email once your
//  setup is complete."
```

---

### `PreparingDashboard` component props (extended)

```ts
// src/pages/recommendations/PreparingDashboard.tsx
interface PreparingDashboardProps {
  description?: string;
  // Optional. When omitted, falls back to PREPARING_MSG_NON_AUTOMATED.
  // Displayed in the <p> element beneath the heading.
}
```

---

### Tab page props (extended — same pattern for all three)

```ts
// RecommendationsFinchPage, BenchmarkFinchPage, WorkforcePage
{
  isReady?: boolean;          // existing — no change
  isStale?: boolean;          // existing — no change in type, changed at call site
  isAutomatedProvider?: boolean; // +++ new, default false +++
}
```

---

## State Transitions

```
providerType in DashboardStatusResponse
    │
    ├─ "automated"  →  isAutomatedProvider = true  →  PREPARING_MSG_AUTOMATED
    ├─ "assisted"   →  isAutomatedProvider = false →  PREPARING_MSG_NON_AUTOMATED
    └─ null         →  isAutomatedProvider = false →  PREPARING_MSG_NON_AUTOMATED (safe default)
```

```
isXxxTabStale (from hook)   isConnected (from useAssessmentStatus)
    │                           │
    ├─ true  AND  true   →  isStale={true}  → show PreparingDashboard with message
    ├─ true  AND  false  →  isStale={false} → show skeleton (standard loading)
    └─ false  (any)      →  isStale={false} → show skeleton (standard loading)
```

---

## Validation Rules

- `isAutomatedProvider` is derived (read-only); it cannot be set by a consumer.
- `description` prop is optional; the component must always render valid text (use non-automated default when undefined).
- No server-side validation needed — all logic is pure client-side derivation from existing API response fields.
