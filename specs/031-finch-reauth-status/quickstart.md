# Quickstart: Finch Reauth Status Flag

**Feature**: `031-finch-reauth-status` | **Branch**: `031-finch-reauth-status`  
**Date**: 2026-05-01 | **Estimated scope**: 4 source files + 2 test files

This guide walks through every change needed to implement this feature end-to-end.  
Follow the steps in order; each step's tests should fail first, then pass after implementation (TDD).

---

## Step 1 — Extend type definitions

**File**: `src/types/dashboardStatusTypes.ts`

### 1a. Add `FinchConnectionStatus` union type

Add after the existing `ProviderType` line:

```typescript
export type FinchConnectionStatus = "connected" | "reauth_required" | "disconnected" | "pending";
```

### 1b. Add `finchConnectionStatus` to `DashboardStatusResponse`

Add after the `providerType` field:

```typescript
finchConnectionStatus?: FinchConnectionStatus;
```

### 1c. Add `isReauthRequired` to `UseDashboardStatusPollingReturn`

Add after `isAutomatedProvider`:

```typescript
isReauthRequired: boolean;
```

### 1d. Add `reconnectWithFinch` to `UseFinchConnectReturn`

```typescript
export interface UseFinchConnectReturn {
  connectWithFinch: () => Promise<void>;
  reconnectWithFinch: () => Promise<void>; // ← add this line
  isLoading: boolean;
  isPageLoading: boolean;
  error: string | null;
  clearError: () => void;
}
```

---

## Step 2 — Implement `isReauthRequired` in `useDashboardStatusPolling`

**File**: `src/hooks/useDashboardStatusPolling.ts`

Add a `useMemo` immediately after the `isAutomatedProvider` memo (around line 270):

```typescript
const isReauthRequired = useMemo(
  () => status?.finchConnectionStatus === "reauth_required",
  [status]
);
```

Add `isReauthRequired` to the return object:

```typescript
return {
  // ...existing fields...
  isAutomatedProvider,
  isReauthRequired, // ← add
};
```

---

## Step 3 — Add `reconnectWithFinch` to `useFinchConnect`

**File**: `src/hooks/useFinchConnect.ts`

### 3a. Add `isReconnectRef`

Inside the hook function body, after the existing state declarations:

```typescript
const isReconnectRef = useRef(false);
```

### 3b. Update `onSuccess` to check and reset the ref

In the `onSuccess` callback, replace the unconditional `navigate("/additional-questions")` call:

```typescript
// Before:
await exchangeFinchCode(code);
navigate("/additional-questions");

// After:
await exchangeFinchCode(code);
if (!isReconnectRef.current) {
  navigate("/additional-questions");
}
isReconnectRef.current = false;
```

The reset (`= false`) must be inside the `try` block, after the navigate decision, so that a successful reconnect does not leave the ref set for a subsequent first-time connect.

Also reset the ref in the error path to avoid stale state on failure:

```typescript
} catch (e) {
  isReconnectRef.current = false;  // ← add at the top of catch
  const msg = e instanceof Error ? e.message : undefined;
  setError(msg || "Failed to complete Finch connection. Please try again.");
  setStatus("idle");
}
```

### 3c. Add `reconnectWithFinch`

After the `connectWithFinch` definition (still inside the hook):

```typescript
const reconnectWithFinch = useCallback(async () => {
  isReconnectRef.current = true;
  return connectWithFinch();
}, [connectWithFinch]);
```

### 3d. Add `reconnectWithFinch` to the return

```typescript
return { connectWithFinch, reconnectWithFinch, isLoading, isPageLoading, error, clearError };
```

---

## Step 4 — Update `DashboardPage`

**File**: `src/pages/dashboard/DashboardPage.tsx`

### 4a. Destructure `reconnectWithFinch` from `useFinchConnect`

```typescript
const {
  connectWithFinch,
  reconnectWithFinch, // ← add
  isLoading: isFinchLoading,
  isPageLoading: isFinchPageLoading,
  error: finchError,
  clearError: clearFinchError,
} = useFinchConnect();
```

### 4b. Destructure `isReauthRequired` from `useDashboardStatusPolling`

```typescript
const {
  isRecommendationTabReady,
  isWorkforceTabReady,
  isIndustryTabReady,
  hasExceededProcessingWindow,
  isRecommendationTabStale,
  isWorkforceTabStale,
  isIndustryTabStale,
  isAutomatedProvider,
  isReauthRequired, // ← add
} = useDashboardStatusPolling({ enabled: shouldPollDashboardStatus });
```

### 4c. Gate the "Reconnect to Finch" card on `isReauthRequired`

Lines ~540–553. The card is currently rendered unconditionally. Wrap it:

```tsx
{
  isReauthRequired && (
    <DashboardCard
      classes="bg-ws-navy-100 border-ws-border-primary mt-10 shadow-none"
      toggleAvatar={true}
      title="Reconnect to Finch"
      titleClass="text-ws-text-primary"
      avatarIconSrc={<XhexagonIcon className="text-ws-warning-700" />}
      avatarClassName="bg-ws-warning-200"
      description="There was an issue connecting your payroll data. Please reconnect to Finch."
      descriptionClass="text-ws-text-tertiary"
      toggleButton={true}
      buttonLabel="Reconnect"
      buttonType={"secondary"}
      buttonClasses="h-9"
      onClick={reconnectWithFinch} // ← changed from connectWithFinch
    />
  );
}
```

---

## Step 5 — Add tests for `isReauthRequired` in `useDashboardStatusPolling`

**File**: `tests/hooks/useDashboardStatusPolling.test.ts`

Add a new `describe` block at the end of the file (after existing blocks):

```typescript
describe("useDashboardStatusPolling — isReauthRequired flag", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns false when finchConnectionStatus is absent", async () => {
    mockGetDashboardStatus.mockResolvedValue(makeStatus());

    const { result } = renderHook(() => useDashboardStatusPolling({ enabled: true }));
    await waitFor(() => expect(result.current.status).not.toBeNull());

    expect(result.current.isReauthRequired).toBe(false);
  });

  it("returns true when finchConnectionStatus is reauth_required", async () => {
    mockGetDashboardStatus.mockResolvedValue(
      makeStatus({ finchConnectionStatus: "reauth_required" })
    );

    const { result } = renderHook(() => useDashboardStatusPolling({ enabled: true }));
    await waitFor(() => expect(result.current.status).not.toBeNull());

    expect(result.current.isReauthRequired).toBe(true);
  });

  it("returns false when finchConnectionStatus is connected", async () => {
    mockGetDashboardStatus.mockResolvedValue(makeStatus({ finchConnectionStatus: "connected" }));

    const { result } = renderHook(() => useDashboardStatusPolling({ enabled: true }));
    await waitFor(() => expect(result.current.status).not.toBeNull());

    expect(result.current.isReauthRequired).toBe(false);
  });

  it("returns false when finchConnectionStatus is disconnected", async () => {
    mockGetDashboardStatus.mockResolvedValue(makeStatus({ finchConnectionStatus: "disconnected" }));

    const { result } = renderHook(() => useDashboardStatusPolling({ enabled: true }));
    await waitFor(() => expect(result.current.status).not.toBeNull());

    expect(result.current.isReauthRequired).toBe(false);
  });

  it("returns false when finchConnectionStatus is pending", async () => {
    mockGetDashboardStatus.mockResolvedValue(makeStatus({ finchConnectionStatus: "pending" }));

    const { result } = renderHook(() => useDashboardStatusPolling({ enabled: true }));
    await waitFor(() => expect(result.current.status).not.toBeNull());

    expect(result.current.isReauthRequired).toBe(false);
  });

  it("returns false when hook is disabled (no status)", () => {
    const { result } = renderHook(() => useDashboardStatusPolling({ enabled: false }));
    expect(result.current.isReauthRequired).toBe(false);
  });
});
```

Note: The `makeStatus` helper already accepts `Partial<DashboardStatusResponse>` overrides, so passing `{ finchConnectionStatus: "reauth_required" }` works without changes to the helper.

---

## Step 6 — Add tests for `reconnectWithFinch` in `useFinchConnect`

**File**: `tests/hooks/useFinchConnect.test.tsx`

Add a new `describe` block inside the outer `describe("useFinchConnect", ...)`:

```typescript
// T-reconnect-01 — reconnectWithFinch: skips navigation
it("reconnectWithFinch: exchanges code but does NOT navigate to /additional-questions", async () => {
  mockGetFinchSessionId.mockResolvedValue({ sessionId: "sess_reauth" });
  mockExchangeFinchCode.mockResolvedValue({});

  const { result } = renderHook(() => useFinchConnect(), { wrapper });

  await act(async () => {
    await result.current.reconnectWithFinch();
  });

  expect(mockOpen).toHaveBeenCalledWith({ sessionId: "sess_reauth" });

  await act(async () => {
    capturedOnSuccess!({ code: "reauth-code" });
  });

  await waitFor(() => {
    expect(mockExchangeFinchCode).toHaveBeenCalledWith("reauth-code");
    expect(mockNavigate).not.toHaveBeenCalled(); // ← key assertion
  });
});

// T-reconnect-02 — connectWithFinch still navigates (no regression)
it("connectWithFinch still navigates to /additional-questions after reconnectWithFinch is available", async () => {
  mockGetFinchSessionId.mockResolvedValue({ sessionId: "sess_new" });
  mockExchangeFinchCode.mockResolvedValue({});

  const { result } = renderHook(() => useFinchConnect(), { wrapper });

  await act(async () => {
    await result.current.connectWithFinch();
  });

  await act(async () => {
    capturedOnSuccess!({ code: "new-code" });
  });

  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith("/additional-questions");
  });
});

// T-reconnect-03 — subsequent connectWithFinch after reconnect still navigates
it("connectWithFinch navigates correctly after a previous reconnectWithFinch call", async () => {
  mockGetFinchSessionId.mockResolvedValue({ sessionId: "sess_seq" });
  mockExchangeFinchCode.mockResolvedValue({});

  const { result } = renderHook(() => useFinchConnect(), { wrapper });

  // First: reconnect (no navigate)
  await act(async () => {
    await result.current.reconnectWithFinch();
  });
  await act(async () => {
    capturedOnSuccess!({ code: "code-a" });
  });
  await waitFor(() => expect(mockExchangeFinchCode).toHaveBeenCalledWith("code-a"));
  expect(mockNavigate).not.toHaveBeenCalled();

  // Second: regular connect (should navigate)
  await act(async () => {
    await result.current.connectWithFinch();
  });
  await act(async () => {
    capturedOnSuccess!({ code: "code-b" });
  });
  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith("/additional-questions");
  });
});

// T-reconnect-04 — error during reconnect resets ref
it("reconnectWithFinch resets isReconnect ref on error so next connectWithFinch still navigates", async () => {
  mockGetFinchSessionId.mockResolvedValue({ sessionId: "sess_err" });
  mockExchangeFinchCode.mockRejectedValue(new Error("exchange failed"));

  const { result } = renderHook(() => useFinchConnect(), { wrapper });

  // First: reconnect fails
  await act(async () => {
    await result.current.reconnectWithFinch();
  });
  await act(async () => {
    capturedOnSuccess!({ code: "err-code" });
  });
  await waitFor(() => expect(result.current.error).toBeTruthy());

  // Reset error state
  act(() => result.current.clearError());

  // Second: regular connect succeeds and navigates
  mockExchangeFinchCode.mockResolvedValue({});
  await act(async () => {
    await result.current.connectWithFinch();
  });
  await act(async () => {
    capturedOnSuccess!({ code: "ok-code" });
  });
  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith("/additional-questions");
  });
});
```

---

## Verification Checklist

- [ ] `pnpm run type-check` — no TypeScript errors
- [ ] `pnpm test` — all existing + new tests pass
- [ ] `pnpm lint:fix` — no ESLint issues
- [ ] Smoke test on dev server (`pnpm dev`):
  - [ ] When `finchConnectionStatus === "reauth_required"` (mock API): "Reconnect to Finch" card appears
  - [ ] When `finchConnectionStatus === "connected"` or absent: card is hidden
  - [ ] Clicking "Reconnect" opens Finch SDK; after success user stays on dashboard
  - [ ] Clicking "Start with Finch" (initial connect) still redirects to `/additional-questions`
