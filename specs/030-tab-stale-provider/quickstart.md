# Quickstart Implementation Guide: 030-tab-stale-provider

**Branch**: `030-tab-stale-provider`  
**Generated**: 2026-05-01  
**Spec**: [spec.md](./spec.md) | **Data Model**: [data-model.md](./data-model.md) | **Research**: [research.md](./research.md)

---

## Overview

Two independent changes:

**Change 1** — Gate the `isStale` prop so the "Preparing your dashboard" screen only appears for Finch-connected users.

**Change 2** — Make `PreparingDashboard` accept a custom `description` prop; expose `isAutomatedProvider` from the polling hook; select the correct message per provider type in each tab; store both message strings in a shared constants file.

Total files changed: **8 source files** (1 new), **3-4 test files updated**.

---

## Step 1 — Create the constants file

**File**: `src/constants/preparingDashboardMessages.ts` _(new)_

```ts
export const PREPARING_MSG_AUTOMATED =
  "Finch is working hard with your payroll provider to create your custom dashboard. This may take 24-36 hours. We'll send an email once your setup is complete.";

export const PREPARING_MSG_NON_AUTOMATED =
  "Finch is working hard with your payroll provider to create your custom dashboard. This may take up to 2 weeks. We'll send an email once your setup is complete.";
```

---

## Step 2 — Update `PreparingDashboard` to accept a `description` prop

**File**: `src/pages/recommendations/PreparingDashboard.tsx`

```tsx
import preparingData from "@/assets/preparingData.svg";
import { PREPARING_MSG_NON_AUTOMATED } from "@/constants/preparingDashboardMessages";

export default function PreparingDashboard({
  description = PREPARING_MSG_NON_AUTOMATED,
}: {
  readonly description?: string;
}) {
  return (
    <div className="flex items-center gap-18 min-h-88 flex-col xl:flex-row justify-center">
      <img src={preparingData} alt="Preparing Dashboard" className="w-24" />
      <div className="w-full xl:max-w-lg">
        <h2 className="text-3xl font-medium text-ws-text-primary mb-1">Preparing your dashboard</h2>
        <p className="text-lg/7 text-ws-text-tertiary">{description}</p>
      </div>
    </div>
  );
}
```

**Key points**:

- Default falls back to the non-automated message — safe for any unintentional un-passed usage.
- Existing call sites that pass no props continue to work.

---

## Step 3 — Add `isAutomatedProvider` to the type

**File**: `src/types/dashboardStatusTypes.ts`

Add to `UseDashboardStatusPollingReturn`:

```ts
isAutomatedProvider: boolean;
```

---

## Step 4 — Compute `isAutomatedProvider` in the polling hook

**File**: `src/hooks/useDashboardStatusPolling.ts`

After the existing `isIndustryTabStale` memo, add:

```ts
const isAutomatedProvider = useMemo(() => status?.providerType === "automated", [status]);
```

Then include it in the return object:

```ts
return {
  // ... existing fields ...
  isAutomatedProvider,
};
```

---

## Step 5 — Update `DashboardPage.tsx`

**File**: `src/pages/dashboard/DashboardPage.tsx`

### 5a — Destructure `isAutomatedProvider` from the polling hook

```ts
const {
  isRecommendationTabReady,
  isWorkforceTabReady,
  isIndustryTabReady,
  hasExceededProcessingWindow,
  isRecommendationTabStale,
  isWorkforceTabStale,
  isIndustryTabStale,
  isAutomatedProvider, // +++ new
} = useDashboardStatusPolling({ enabled: shouldPollDashboardStatus });
```

### 5b — Gate `isStale` with `isConnected` on each tab

Before (Recommendations tab):

```tsx
<RecommendationsFinchPage
  isReady={isRecommendationTabReady}
  isStale={isRecommendationTabStale}
  ...
/>
```

After:

```tsx
<RecommendationsFinchPage
  isReady={isRecommendationTabReady}
  isStale={isRecommendationTabStale && isConnected}
  isAutomatedProvider={isAutomatedProvider}
  ...
/>
```

Apply the same pattern to `BenchmarkFinchPage`:

```tsx
<BenchmarkFinchPage
  isReady={isIndustryTabReady}
  isStale={isIndustryTabStale && isConnected}
  isAutomatedProvider={isAutomatedProvider}
/>
```

And `WorkforcePage`:

```tsx
<WorkforcePage
  isReady={isWorkforceTabReady}
  isStale={isWorkforceTabStale && isConnected}
  isAutomatedProvider={isAutomatedProvider}
/>
```

---

## Step 6 — Update `RecommendationsFinchPage`

**File**: `src/pages/recommendations/RecommendationsFinchPage.tsx`

### 6a — Add `isAutomatedProvider` to props

```ts
export default function RecommendationsFinchPage({
  onNavigateToWorkforce,
  isReady = true,
  isStale = false,
  isAutomatedProvider = false, // +++ new
}: {
  readonly onNavigateToWorkforce?: () => void;
  readonly isReady?: boolean;
  readonly isStale?: boolean;
  readonly isAutomatedProvider?: boolean; // +++ new
});
```

### 6b — Import messages and select the right one

```ts
import {
  PREPARING_MSG_AUTOMATED,
  PREPARING_MSG_NON_AUTOMATED,
} from "@/constants/preparingDashboardMessages";
```

### 6c — Pass `description` to `PreparingDashboard`

```tsx
if (isStale) {
  const description = isAutomatedProvider ? PREPARING_MSG_AUTOMATED : PREPARING_MSG_NON_AUTOMATED;
  return (
    <>
      <PreparingDashboard description={description} />
      <CarouselSection />
    </>
  );
}
```

---

## Step 7 — Update `BenchmarkFinchPage`

**File**: `src/pages/benchmark/BenchmarkFinchPage.tsx`

Same pattern as Step 6. Extend props with `isAutomatedProvider?: boolean`, import messages, and pass `description` to `<PreparingDashboard>`.

```tsx
if (isStale) {
  const description = isAutomatedProvider
    ? PREPARING_MSG_AUTOMATED
    : PREPARING_MSG_NON_AUTOMATED;
  return (
    <>
      <PreparingDashboard description={description} />
      <DidYouKnowBanner ... />
    </>
  );
}
```

---

## Step 8 — Update `WorkforcePage`

**File**: `src/pages/workforce/WorkforcePage.tsx`

Same pattern as Steps 6 and 7.

```tsx
if (isStale) {
  const description = isAutomatedProvider
    ? PREPARING_MSG_AUTOMATED
    : PREPARING_MSG_NON_AUTOMATED;
  return (
    <>
      <PreparingDashboard description={description} />
      <DidYouKnowBanner ... />
    </>
  );
}
```

---

## Step 9 — Update tests

### `tests/hooks/useDashboardStatusPolling.test.ts`

Add a new `describe` block for `isAutomatedProvider`:

```ts
describe("useDashboardStatusPolling — isAutomatedProvider", () => {
  it("returns false when not enabled (no status)", () => { ... });
  it("returns false when providerType is null", async () => { ... });
  it("returns false when providerType is 'assisted'", async () => { ... });
  it("returns true when providerType is 'automated'", async () => { ... });
});
```

### `tests/pages/RecommendationsFinchPage.test.tsx`

In the existing `isStale` describe block, add:

```ts
it("shows automated message when isStale=true and isAutomatedProvider=true", () => { ... });
it("shows non-automated message when isStale=true and isAutomatedProvider=false", () => { ... });
it("shows non-automated message when isStale=true and isAutomatedProvider defaults", () => { ... });
```

### `tests/pages/BenchmarkFinchPage.test.tsx`

Same pattern — add message-selection tests to the existing `isStale` describe block.

### `tests/pages/WorkforcePage.test.tsx` _(create if missing)_

Add basic tests: renders without crash; shows PreparingDashboard when `isStale=true`; shows correct message per `isAutomatedProvider`.

### `tests/pages/DashboardPage.test.tsx` / `.branches.test.tsx`

If these tests check that `isStale` is passed through, verify the `&& isConnected` guard is reflected in mock setups (e.g., when `isConnected=false` the Preparing screen is not shown).

---

## Quality Gate

After all changes, run in order:

```bash
pnpm run type-check   # must produce zero errors
pnpm lint:fix         # auto-fix any lint issues
pnpm format           # normalize formatting
pnpm run test         # all tests must pass
pnpm run build        # final build smoke test
```

---

## Verification Checklist

- [ ] `src/constants/preparingDashboardMessages.ts` created with both exports
- [ ] `PreparingDashboard` accepts `description?: string` with non-automated default
- [ ] `isAutomatedProvider` computed in hook and returned
- [ ] `UseDashboardStatusPollingReturn` type extended
- [ ] `DashboardPage` destructures `isAutomatedProvider`, passes it + `isConnected`-gated `isStale` to all three tabs
- [ ] All three tab pages accept and use `isAutomatedProvider` to select the correct message
- [ ] Polling hook tests cover `isAutomatedProvider` (null, assisted, automated)
- [ ] Tab page tests cover message selection and stale-guard behavior
- [ ] `pnpm run type-check` passes
- [ ] `pnpm run test` passes
- [ ] `pnpm run build` passes
