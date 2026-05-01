# Quickstart: 028-dashboard-tab-readiness

**Branch**: `028-dashboard-tab-readiness`

## What this feature does

Adds per-tab skeleton loading states to the Finch dashboard, a shared "Did you know?" content source, and a 5-minute auto-dismiss behavior for the loading modal.

## Files to create

### `src/constants/didYouKnowSlides.tsx`

New file. Move the `didYouKnowSlides` array from `Carousel.tsx` here. Export both the type and the data:

```tsx
import type { ReactNode } from "react";
import { SmileFace } from "@/assets/icons/SmileFace";
import { KeyIcon } from "@/assets/icons/KeyIcon";
import { ChartIcon } from "@/assets/icons/ChartIcon";

export interface DidYouKnowSlide {
  id: number;
  icon: ReactNode;
  title: string;
  content: string;
  source: string;
}

export const didYouKnowSlides: DidYouKnowSlide[] = [
  {
    id: 1,
    icon: <SmileFace className="text-ws-gray-700" />,
    title: "Did you know?",
    content:
      "Lower-income earners with access to retirement benefits are 37% less likely to participate than higher-income earners.",
    source: "U.S. Bureau of Labor Statistics",
  },
  // ... remaining 5 entries from the existing Carousel.tsx array
];
```

---

## Files to modify

### 1. `src/pages/recommendations/Carousel.tsx`

- Remove the inline `didYouKnowSlides` array and icon imports (`SmileFace`, `KeyIcon`, `ChartIcon`).
- Add: `import { didYouKnowSlides } from "@/constants/didYouKnowSlides";`
- The rest of the component remains unchanged.

### 2. `src/components/dashboard/DynamicLoadingModal.tsx`

- Remove the internal `labels` array.
- Add: `import { didYouKnowSlides } from "@/constants/didYouKnowSlides";`
- Replace `labels[currentIndex]` with mapping from the shared array:
  ```tsx
  const slide = didYouKnowSlides[currentIndex % didYouKnowSlides.length];
  // Use slide.content as desc, `Source: ${slide.source}` as note
  ```
- Update `setInterval` modulo to use `didYouKnowSlides.length`.

### 3. `src/types/dashboardStatusTypes.ts`

Extend `UseDashboardStatusPollingReturn`:

```typescript
export interface UseDashboardStatusPollingReturn {
  // ... existing fields ...
  isRecommendationTabReady: boolean;
  isWorkforceTabReady: boolean;
  isIndustryTabReady: boolean;
  hasExceededProcessingWindow: boolean;
}
```

### 4. `src/hooks/useDashboardStatusPolling.ts`

Add after the existing state declarations:

```typescript
const PROCESSING_WINDOW_MS = 300_000;
const WINDOW_CHECK_INTERVAL_MS = 10_000;

// Readiness flags
const isRecommendationTabReady = useMemo(
  () =>
    status?.recommendation?.status === "completed" ||
    status?.recommendation?.status === "not_applicable",
  [status]
);
const isWorkforceTabReady = useMemo(
  () => status?.workforce?.status === "completed" || status?.workforce?.status === "not_applicable",
  [status]
);
const isIndustryTabReady = useMemo(
  () => status?.industry?.status === "completed" || status?.industry?.status === "not_applicable",
  [status]
);

// 5-minute window flag
const createdAtMs = useMemo(() => {
  if (!status?.createdAt) return null;
  const parsed = Date.parse(status.createdAt);
  return Number.isNaN(parsed) ? null : parsed;
}, [status?.createdAt]);

const [hasExceededProcessingWindow, setHasExceededProcessingWindow] = useState(true);

useEffect(() => {
  if (createdAtMs === null) {
    setHasExceededProcessingWindow(true);
    return;
  }
  const check = () => Date.now() - createdAtMs >= PROCESSING_WINDOW_MS;
  if (check()) {
    setHasExceededProcessingWindow(true);
    return;
  }
  setHasExceededProcessingWindow(false);
  const id = setInterval(() => {
    if (check()) {
      setHasExceededProcessingWindow(true);
      clearInterval(id);
    }
  }, WINDOW_CHECK_INTERVAL_MS);
  return () => clearInterval(id);
}, [createdAtMs]);
```

Return the four new flags from the hook.

### 5. `src/pages/dashboard/DashboardPage.tsx`

- Destructure new flags from `useDashboardStatusPolling`:
  ```tsx
  const {
    isRecommendationTabReady,
    isWorkforceTabReady,
    isIndustryTabReady,
    hasExceededProcessingWindow,
  } = useDashboardStatusPolling({ enabled: shouldPollDashboardStatus });
  ```
- Compute modal visibility:
  ```tsx
  const allTabsReady = isRecommendationTabReady && isWorkforceTabReady && isIndustryTabReady;
  const showLoadingModal = isDashboardVisible && !allTabsReady && !hasExceededProcessingWindow;
  ```
- Import and render `DynamicLoadingModal`:
  ```tsx
  import DynamicLoadingModal from "@/components/dashboard/DynamicLoadingModal";
  // After the Tabs section:
  <DynamicLoadingModal shouldShow={showLoadingModal} />;
  ```
- Pass `isReady` to each tab:
  ```tsx
  <RecommendationsFinchPage isReady={isRecommendationTabReady} ... />
  <BenchmarkFinchPage isReady={isIndustryTabReady} />
  <WorkforcePage isReady={isWorkforceTabReady} />
  ```

### 6. `src/pages/recommendations/RecommendationsFinchPage.tsx`

- Add `isReady?: boolean` to props (default `true`).
- Merge into existing loading guard: `const isLoading = !isReady || workforceIsLoading || recommendationsIsLoading || isIndustryLoading;`
- The child components already render skeletons when `isLoading` is true.

### 7. `src/pages/benchmark/BenchmarkFinchPage.tsx`

- Add `isReady?: boolean` to props (default `true`).
- At the top of the component, merge: `const effectiveLoading = !isReady || isLoadingCards;`
- Replace all `isLoadingCards` references with `effectiveLoading`.

### 8. `src/pages/workforce/WorkforcePage.tsx`

- Add `isReady?: boolean` to props (default `true`).
- Merge: `const effectiveLoading = !isReady || isLoadingCards;`
- Pass `effectiveLoading` where `isLoadingCards` was passed to child components.

---

## Key constants

| Name                       | Value             | Location                       |
| -------------------------- | ----------------- | ------------------------------ |
| `PROCESSING_WINDOW_MS`     | `300_000` (5 min) | `useDashboardStatusPolling.ts` |
| `WINDOW_CHECK_INTERVAL_MS` | `10_000` (10 sec) | `useDashboardStatusPolling.ts` |

## No new imports needed

All icon components (`SmileFace`, `KeyIcon`, `ChartIcon`) move to the constants file. No new npm packages.

## Testing checklist

1. Unit test `useDashboardStatusPolling` — mock `getDashboardStatus` returning different section statuses; assert flag values.
2. Unit test the 5-minute timer — use `vi.useFakeTimers()` to advance past 5 minutes; assert flag flips.
3. Component test `DynamicLoadingModal` — verify it cycles through `didYouKnowSlides` content.
4. Component test each tab page — pass `isReady={false}` and assert skeleton renders; pass `isReady={true}` and assert real content.
5. Integration test `DashboardPage` — mock polling hook to return mixed readiness; verify modal visibility and tab props.
