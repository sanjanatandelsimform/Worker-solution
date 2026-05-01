# Research: Dashboard Tab Readiness

**Feature**: 028-dashboard-tab-readiness  
**Date**: 2026-05-01

## 1. Shared "Did You Know" Slides — Constant Extraction

### Decision

Create `src/constants/didYouKnowSlides.tsx` (`.tsx` because entries contain JSX icon elements). Export the array as a named export.

### Rationale

- Carousel.tsx currently declares `didYouKnowSlides` inline; DynamicLoadingModal.tsx has its own `labels` array with different copy.
- A single source of truth in `src/constants/` matches the existing `formOptions.ts` pattern in that folder.
- Using `.tsx` extension is mandatory per project rules since the array contains JSX (`<SmileFace />`, etc.).

### Alternatives Considered

1. **Put slides in a JSON file** — Rejected because entries contain JSX (React elements for icons).
2. **Export from Carousel.tsx** — Rejected; constants should not live inside component files per Constitution Principle I.
3. **Create a `data/` module** — The `src/data/` folder exists but is used for static JSON-like assessment data. Constants folder is the better semantic fit.

---

## 2. DynamicLoadingModal Refactor

### Decision

Replace the internal `labels` array with an import from `didYouKnowSlides`. Map each slide's fields to the `ProgressLoadingModal` props (`contentTitle`, `contentDescription`, `contentNote`).

### Rationale

- `ProgressLoadingModal` accepts `contentTitle`, `contentDescription`, `contentNote`. The shared slides have `title`, `content`, `source` which map directly.
- The rotation cadence (7 seconds interval) is already implemented and unchanged.
- Icons from the slides are unused in the modal (the modal uses `LandingProgress` in its header) — no regression.

### Alternatives Considered

1. **Show icons in the modal too** — Rejected; ProgressLoadingModal doesn't render per-content icons; would need redesign. Out of scope.

---

## 3. Per-Tab Readiness Flags

### Decision

Add three `useMemo`-derived booleans to `useDashboardStatusPolling`:

```ts
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
```

### Rationale

- `useMemo` keeps derivation cheap and re-renders only when `status` changes.
- Including `not_applicable` as "ready" matches spec FR-006 — no work is pending.
- Flags are returned from the hook and consumed by `DashboardPage` which passes them as props.

### Alternatives Considered

1. **Compute in DashboardPage** — Rejected; coupling business logic to the page component violates separation of concerns.
2. **Create a separate selector** — The hook already owns the status state; a selector would require lifting to Redux which adds unnecessary complexity.

---

## 4. 5-Minute Processing Window Flag

### Decision

Add a `hasExceededProcessingWindow` boolean to the hook return. Implemented as a combination of:

1. A `useMemo` that computes `createdAtMs` from the response.
2. A `useEffect` + `useState` timer that re-evaluates every 10 seconds (or on status change) whether `Date.now() - createdAtMs >= 300_000`.

### Rationale

- Must be reactive (flip from false → true while user sits on page) per FR-009.
- A `setInterval` checking every 10s is lightweight and precise enough (10s granularity on a 5-minute window).
- Missing/unparseable `createdAt` returns `true` immediately per FR-010.

### Alternatives Considered

1. **Only check on poll response** — Rejected; FR-009 explicitly requires time-based reactivity independent of poll arrival.
2. **Use `requestAnimationFrame`** — Overkill for a 5-minute boundary; 10-second interval is simpler and uses less CPU.
3. **Use a single `setTimeout` for the exact remaining ms** — Possible but fragile to system sleep/resume; interval is more robust.

### Implementation Detail

```ts
const PROCESSING_WINDOW_MS = 300_000; // 5 minutes
const WINDOW_CHECK_INTERVAL_MS = 10_000;

// Inside the hook:
const createdAtMs = useMemo(() => {
  if (!status?.createdAt) return null;
  const parsed = Date.parse(status.createdAt);
  return Number.isNaN(parsed) ? null : parsed;
}, [status?.createdAt]);

const [hasExceededProcessingWindow, setHasExceededProcessingWindow] = useState(() => {
  if (createdAtMs === null) return true; // treat as exceeded
  return Date.now() - createdAtMs >= PROCESSING_WINDOW_MS;
});

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
  const id = setInterval(() => {
    if (check()) {
      setHasExceededProcessingWindow(true);
      clearInterval(id);
    }
  }, WINDOW_CHECK_INTERVAL_MS);
  return () => clearInterval(id);
}, [createdAtMs]);
```

---

## 5. Tab Integration Pattern (isReady prop)

### Decision

Each tab page component receives an optional `isReady?: boolean` prop (defaults to `true` for backward compatibility). When `isReady` is `false`, the page renders its own full-page skeleton instead of fetching/rendering content.

### Rationale

- Each tab already has internal skeleton states (BenchmarkFinchPage has inline skeletons; WorkforcePage passes `isLoading` to children; RecommendationsFinchPage passes `isLoading` to children).
- Adding `isReady` as an additional guard at the top of each page is minimally invasive: `if (!isReady) return <FullPageSkeleton />;` or merge with existing `isLoading` to be `isLoading || !isReady`.
- This pattern means each tab owns its skeleton (consistent with Constitution I — self-contained components).

### Alternatives Considered

1. **Render a generic shared skeleton wrapper in DashboardPage** — Rejected; each tab has different skeleton shapes.
2. **Wrap tabs in Suspense with lazy import** — Would require async boundaries and doesn't map to poll-based readiness.

---

## 6. Loading Modal Visibility Logic

### Decision

In `DashboardPage.tsx`:

```tsx
const showLoadingModal = !allTabsReady && !hasExceededProcessingWindow;
// where:
const allTabsReady = isRecommendationTabReady && isWorkforceTabReady && isIndustryTabReady;
```

Pass `shouldShow={showLoadingModal}` to `<DynamicLoadingModal />`.

### Rationale

- Modal shows only during the first 5 minutes AND while at least one tab is pending — per FR-015/FR-016.
- Once all tabs are ready OR 5 minutes pass, the modal closes automatically. The user then sees tabs with either real content or skeletons.
- No new state needed in DashboardPage; it's entirely derived from hook returns.

### Alternatives Considered

1. **Auto-close via `useEffect` inside DynamicLoadingModal** — Rejected; the parent is responsible for visibility (props down, events up pattern).
