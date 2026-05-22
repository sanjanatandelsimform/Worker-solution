# Data Model: Dashboard Tab Readiness

**Feature**: 028-dashboard-tab-readiness  
**Date**: 2026-05-01

## Entities

### 1. DidYouKnowSlide (shared constant)

| Field   | Type        | Description                             |
| ------- | ----------- | --------------------------------------- |
| id      | `number`    | Unique identifier for keying in lists   |
| icon    | `ReactNode` | JSX icon element (e.g. `<SmileFace />`) |
| title   | `string`    | Heading text — always "Did you know?"   |
| content | `string`    | Body fact text                          |
| source  | `string`    | Attribution text                        |

**Location**: `src/constants/didYouKnowSlides.tsx`  
**Export**: `export const didYouKnowSlides: DidYouKnowSlide[]`

```typescript
import type { ReactNode } from "react";

export interface DidYouKnowSlide {
  id: number;
  icon: ReactNode;
  title: string;
  content: string;
  source: string;
}
```

---

### 2. UseDashboardStatusPollingReturn (extended)

Existing fields preserved. New fields added:

| Field                       | Type      | Description                                                                             |
| --------------------------- | --------- | --------------------------------------------------------------------------------------- |
| isRecommendationTabReady    | `boolean` | `true` when `recommendation.status` is `"completed"` or `"not_applicable"`              |
| isWorkforceTabReady         | `boolean` | `true` when `workforce.status` is `"completed"` or `"not_applicable"`                   |
| isIndustryTabReady          | `boolean` | `true` when `industry.status` is `"completed"` or `"not_applicable"`                    |
| hasExceededProcessingWindow | `boolean` | `true` when `Date.now() - createdAt >= 5 minutes` or `createdAt` is missing/unparseable |

```typescript
export interface UseDashboardStatusPollingReturn {
  // Existing
  status: DashboardStatusResponse | null;
  isLoading: boolean;
  error: string | null;
  isPolling: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
  // New
  isRecommendationTabReady: boolean;
  isWorkforceTabReady: boolean;
  isIndustryTabReady: boolean;
  hasExceededProcessingWindow: boolean;
}
```

---

### 3. Tab Page Props (new optional prop for each)

Each of the three tab pages adds:

```typescript
interface Props {
  isReady?: boolean; // defaults to true when not provided
  // ...existing props
}
```

Pages: `RecommendationsFinchPage`, `BenchmarkFinchPage`, `WorkforcePage`

---

### 4. DynamicLoadingModal Props (unchanged interface, changed content source)

```typescript
interface DynamicLoadingModalProps {
  shouldShow: boolean; // existing
}
```

Internal change: replaces `labels` array with import from `didYouKnowSlides`.

---

## State Flow Diagram

```
getDashboardStatus API
        │
        ▼
useDashboardStatusPolling (hook)
        │
        ├── status (raw response)
        ├── isRecommendationTabReady  ─┐
        ├── isWorkforceTabReady       ─┼─► DashboardPage
        ├── isIndustryTabReady        ─┘      │
        └── hasExceededProcessingWindow ──────►│
                                               │
              ┌────────────────────────────────┘
              │
              ├── <RecommendationsFinchPage isReady={isRecommendationTabReady} />
              ├── <BenchmarkFinchPage isReady={isIndustryTabReady} />
              ├── <WorkforcePage isReady={isWorkforceTabReady} />
              └── <DynamicLoadingModal shouldShow={!allReady && !exceeded} />
```

## Validation Rules

- `createdAt` must be ISO 8601 parseable; if not, `hasExceededProcessingWindow = true`.
- Tab readiness defaults to `false` when `status` is `null` (initial load before first response).
- Processing window constant: `300_000 ms` (5 minutes).
