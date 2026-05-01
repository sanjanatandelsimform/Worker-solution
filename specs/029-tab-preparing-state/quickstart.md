# Quickstart: 029-tab-preparing-state

**Goal**: Show `<PreparingDashboard />` on a tab when that tab's `updatedAt` is older than 5 minutes **and** the tab status is still `pending`.

---

## Files to Modify (5 source + 2 test)

| File                                                     | Change                                                        |
| -------------------------------------------------------- | ------------------------------------------------------------- |
| `src/types/dashboardStatusTypes.ts`                      | Add 3 new boolean fields to `UseDashboardStatusPollingReturn` |
| `src/hooks/useDashboardStatusPolling.ts`                 | Compute & return 3 new stale flags via `useMemo`              |
| `src/pages/dashboard/DashboardPage.tsx`                  | Destructure 3 new flags; pass `isStale` prop to each tab      |
| `src/pages/recommendations/RecommendationsFinchPage.tsx` | Accept `isStale` prop; early-return `<PreparingDashboard />`  |
| `src/pages/workforce/WorkforcePage.tsx`                  | Accept `isStale` prop; early-return `<PreparingDashboard />`  |
| `src/pages/benchmark/BenchmarkFinchPage.tsx`             | Accept `isStale` prop; early-return `<PreparingDashboard />`  |
| `tests/hooks/useDashboardStatusPolling.test.ts`          | New `describe` block for stale flags                          |
| `tests/pages/*.test.tsx` (per tab)                       | Add `isStale={true}` render assertions                        |

---

## Step 1 — Extend the TypeScript Type

**File**: `src/types/dashboardStatusTypes.ts`

Add three fields to `UseDashboardStatusPollingReturn`, directly after `hasExceededProcessingWindow`:

```typescript
// AFTER hasExceededProcessingWindow: boolean;
isRecommendationTabStale: boolean;
isWorkforceTabStale: boolean;
isIndustryTabStale: boolean;
```

---

## Step 2 — Compute Stale Flags in the Hook

**File**: `src/hooks/useDashboardStatusPolling.ts`

After the existing `isIndustryTabReady` memo block (around line 245), add three new memos and include them in the return object:

```typescript
// Helper: is this tab stale (pending AND updatedAt > 5 min ago)?
const isTabStale = (updatedAt: string | null, status: StatusValue | undefined): boolean => {
  if (status !== "pending" || !updatedAt) return false;
  const parsed = Date.parse(updatedAt);
  if (Number.isNaN(parsed)) return false;
  return Date.now() - parsed > PROCESSING_WINDOW_MS;
};

const isRecommendationTabStale = useMemo(
  () => isTabStale(status?.recommendation?.updatedAt ?? null, status?.recommendation?.status),
  [status]
);
const isWorkforceTabStale = useMemo(
  () => isTabStale(status?.workforce?.updatedAt ?? null, status?.workforce?.status),
  [status]
);
const isIndustryTabStale = useMemo(
  () => isTabStale(status?.industry?.updatedAt ?? null, status?.industry?.status),
  [status]
);
```

Add to the return object:

```typescript
return {
  // ... existing fields ...
  isRecommendationTabStale,
  isWorkforceTabStale,
  isIndustryTabStale,
};
```

> **Note**: `isTabStale` is a **module-level helper** (not inside the hook body), to keep hook code clean and the helper directly unit-testable. If preferred, it can be a plain `useMemo` inline — both are acceptable.

---

## Step 3 — Pass `isStale` from DashboardPage

**File**: `src/pages/dashboard/DashboardPage.tsx`

Update the destructure of `useDashboardStatusPolling`:

```typescript
const {
  isRecommendationTabReady,
  isWorkforceTabReady,
  isIndustryTabReady,
  hasExceededProcessingWindow,
  isRecommendationTabStale, // NEW
  isWorkforceTabStale, // NEW
  isIndustryTabStale, // NEW
} = useDashboardStatusPolling({ enabled: shouldPollDashboardStatus });
```

Pass to each tab:

```tsx
<RecommendationsFinchPage
  isReady={isRecommendationTabReady}
  isStale={isRecommendationTabStale}   {/* NEW */}
  onNavigateToWorkforce={...}
/>

<BenchmarkFinchPage
  isReady={isIndustryTabReady}
  isStale={isIndustryTabStale}         {/* NEW */}
/>

<WorkforcePage
  isReady={isWorkforceTabReady}
  isStale={isWorkforceTabStale}        {/* NEW */}
/>
```

---

## Step 4 — Tab Pages: Accept `isStale` and Early-Return

Apply the same pattern to all three tab pages.

### RecommendationsFinchPage

```tsx
export default function RecommendationsFinchPage({
  onNavigateToWorkforce,
  isReady = true,
  isStale = false, // NEW
}: {
  readonly onNavigateToWorkforce?: () => void;
  readonly isReady?: boolean;
  readonly isStale?: boolean; // NEW
}) {
  // ... existing hooks ...

  // NEW: early return when data is stale and pending
  if (isStale) {
    return <PreparingDashboard />;
  }

  return (
    <div className="bg-ws-base-white space-y-6 py-10 px-6 shadow-xl rounded-b-xl">
      {/* existing content unchanged */}
    </div>
  );
}
```

Add import at top:

```tsx
import PreparingDashboard from "./PreparingDashboard";
```

### WorkforcePage

```tsx
export default function WorkforcePage({
  isReady = true,
  isStale = false, // NEW
}: { readonly isReady?: boolean; readonly isStale?: boolean } = {}) {
  // ... existing hooks ...

  if (isStale) {
    // NEW
    return <PreparingDashboard />;
  }

  return (
    <div className="bg-ws-base-white py-10 px-6 space-y-6 shadow-xl rounded-b-xl">
      {/* existing content unchanged */}
    </div>
  );
}
```

Add import:

```tsx
import PreparingDashboard from "@/pages/recommendations/PreparingDashboard";
```

### BenchmarkFinchPage

```tsx
export default function BenchmarkFinchPage({
  isReady = true,
  isStale = false,    // NEW
}: { readonly isReady?: boolean; readonly isStale?: boolean } = {}) {
  // ... existing hooks ...

  if (isStale) {        // NEW
    return <PreparingDashboard />;
  }

  return (
    // existing JSX unchanged
  );
}
```

Add import:

```tsx
import PreparingDashboard from "@/pages/recommendations/PreparingDashboard";
```

> **Rules of Hooks**: The `if (isStale) return` must come **after** all `useState`, `useSelector`, `useCallback`, and other hook calls — never before them. Review each file to ensure the early-return is placed after the last hook call.

---

## Step 5 — Tests

### Hook tests (`tests/hooks/useDashboardStatusPolling.test.ts`)

Add a new `describe` block after the `hasExceededProcessingWindow` block:

```typescript
describe("useDashboardStatusPolling — stale flags", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns false for all stale flags when not enabled", () => {
    const { result } = renderHook(() => useDashboardStatusPolling({ enabled: false }));
    expect(result.current.isRecommendationTabStale).toBe(false);
    expect(result.current.isWorkforceTabStale).toBe(false);
    expect(result.current.isIndustryTabStale).toBe(false);
  });

  it("returns false when tab updatedAt is null (even if pending)", async () => {
    // makeStatus defaults to updatedAt: null on all tabs
    mockGetDashboardStatus.mockResolvedValue(makeStatus());
    const { result } = renderHook(() => useDashboardStatusPolling({ enabled: true }));
    await waitFor(() => expect(result.current.status).not.toBeNull());
    expect(result.current.isRecommendationTabStale).toBe(false);
  });

  it("returns true when tab is pending and updatedAt is > 5 min ago", async () => {
    const staleTime = new Date(Date.now() - 400_000).toISOString(); // 400s > 300s
    mockGetDashboardStatus.mockResolvedValue(
      makeStatus({
        recommendation: { status: "pending", updatedAt: staleTime },
      })
    );
    const { result } = renderHook(() => useDashboardStatusPolling({ enabled: true }));
    await waitFor(() => expect(result.current.status).not.toBeNull());
    expect(result.current.isRecommendationTabStale).toBe(true);
    expect(result.current.isWorkforceTabStale).toBe(false); // null updatedAt
  });

  it("returns false when tab is pending but updatedAt is recent (< 5 min)", async () => {
    const freshTime = new Date(Date.now() - 60_000).toISOString(); // 60s < 300s
    mockGetDashboardStatus.mockResolvedValue(
      makeStatus({
        recommendation: { status: "pending", updatedAt: freshTime },
      })
    );
    const { result } = renderHook(() => useDashboardStatusPolling({ enabled: true }));
    await waitFor(() => expect(result.current.status).not.toBeNull());
    expect(result.current.isRecommendationTabStale).toBe(false);
  });

  it("returns false when tab is completed regardless of updatedAt age", async () => {
    const staleTime = new Date(Date.now() - 400_000).toISOString();
    mockGetDashboardStatus.mockResolvedValue(
      makeStatus({
        recommendation: { status: "completed", updatedAt: staleTime },
      })
    );
    const { result } = renderHook(() => useDashboardStatusPolling({ enabled: true }));
    await waitFor(() => expect(result.current.status).not.toBeNull());
    expect(result.current.isRecommendationTabStale).toBe(false);
  });
});
```

### Tab page tests

For each tab page, add tests that:

1. Render the component with `isStale={true}` → assert `PreparingDashboard` text is present
2. Render the component with `isStale={false}` (or no prop) → assert normal content renders

Example pattern (for each tab's existing test file):

```tsx
it("renders PreparingDashboard when isStale is true", () => {
  render(<RecommendationsFinchPage isStale={true} />, { wrapper: ... });
  expect(screen.getByText(/Preparing your dashboard/i)).toBeInTheDocument();
});

it("does not render PreparingDashboard when isStale is false (default)", () => {
  render(<RecommendationsFinchPage isStale={false} />, { wrapper: ... });
  expect(screen.queryByText(/Preparing your dashboard/i)).not.toBeInTheDocument();
});
```

---

## Quality Gates

```bash
pnpm run type-check   # Must pass with zero errors
pnpm lint:fix         # ESLint auto-fix
pnpm format           # Prettier
pnpm run build        # Must pass
pnpm run test         # All tests must pass (including new stale flag tests)
```
