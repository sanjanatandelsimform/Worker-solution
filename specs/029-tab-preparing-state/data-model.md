# Data Model: 029-tab-preparing-state

No new database entities or persisted state structures are introduced by this feature. All data is derived from the existing `DashboardStatusResponse` that the polling hook already fetches.

---

## Derived State Model

### New Derived Flags (computed in `useDashboardStatusPolling`)

```typescript
// Type additions to UseDashboardStatusPollingReturn (dashboardStatusTypes.ts)
isRecommendationTabStale: boolean;
isWorkforceTabStale: boolean;
isIndustryTabStale: boolean;
```

**Derivation rule** (same for each tab, illustrated for `recommendation`):

```
isRecommendationTabStale =
  status?.recommendation?.status === "pending"
  && status.recommendation.updatedAt !== null
  && (Date.now() - Date.parse(status.recommendation.updatedAt)) > PROCESSING_WINDOW_MS (300_000 ms)
```

| Input condition                                                  | `isTabStale` value |
| ---------------------------------------------------------------- | ------------------ |
| `status` is `null` (no API response yet)                         | `false`            |
| `tab.status` is `"completed"` or `"not_applicable"`              | `false`            |
| `tab.status` is `"pending"` and `updatedAt` is `null`            | `false`            |
| `tab.status` is `"pending"` and `updatedAt` is within last 5 min | `false`            |
| `tab.status` is `"pending"` and `updatedAt` is > 5 min ago       | `true`             |

---

## Existing Type: `DashboardStatusResponse` (unchanged)

```typescript
// src/types/dashboardStatusTypes.ts — no changes to this interface
export interface StatusSection {
  status: StatusValue; // "pending" | "completed" | "not_applicable"
  updatedAt: string | null; // ISO 8601 timestamp or null
}

export interface DashboardStatusResponse {
  recommendation: StatusSection;
  workforce: StatusSection;
  industry: StatusSection;
  allSettled: boolean;
  suggestPollMs: number;
  updatedAt: string;
  createdAt: string;
  source: string;
  providerType: ProviderType;
}
```

---

## Updated Type: `UseDashboardStatusPollingReturn` (extended)

```typescript
// src/types/dashboardStatusTypes.ts — ADD three new boolean fields
export interface UseDashboardStatusPollingReturn {
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
  // NEW ↓
  isRecommendationTabStale: boolean;
  isWorkforceTabStale: boolean;
  isIndustryTabStale: boolean;
}
```

---

## Component Prop Model

### Tab pages — new `isStale` prop

Each of the three tab page components receives an additional optional prop:

| Prop      | Type      | Default | Effect when `true`                                          |
| --------- | --------- | ------- | ----------------------------------------------------------- |
| `isStale` | `boolean` | `false` | Render only `<PreparingDashboard />`, suppress all children |

**`RecommendationsFinchPage` signature (updated)**:

```typescript
export default function RecommendationsFinchPage({
  onNavigateToWorkforce,
  isReady = true,
  isStale = false,
}: {
  readonly onNavigateToWorkforce?: () => void;
  readonly isReady?: boolean;
  readonly isStale?: boolean;
});
```

**`WorkforcePage` signature (updated)**:

```typescript
export default function WorkforcePage({
  isReady = true,
  isStale = false,
}: { readonly isReady?: boolean; readonly isStale?: boolean } = {});
```

**`BenchmarkFinchPage` signature (updated)**:

```typescript
export default function BenchmarkFinchPage({
  isReady = true,
  isStale = false,
}: { readonly isReady?: boolean; readonly isStale?: boolean } = {});
```

---

## No New Files

- No new components (reuses existing `PreparingDashboard`)
- No new hooks
- No new API contracts (all data comes from existing `GET /dashboard/status` endpoint)
