# Quickstart: Fix Finch Modal Loading State

**Feature**: 022-fix-finch-modal-loader  
**Branch**: `022-fix-finch-modal-loader`  
**Date**: 2026-04-24

This guide gives an implementing agent or developer everything needed to complete this feature without reading any other document first.

---

## What to change (summary)

| File                                           | Change type | Description                                                     |
|------------------------------------------------|-------------|-----------------------------------------------------------------|
| `src/hooks/useFinchConnect.ts`                 | Edit        | Add `isPageLoading` derived boolean to hook return              |
| `src/pages/dashboard/DashboardPage.tsx`        | Edit        | Destructure and use `isPageLoading` for the spinner guard only  |
| `tests/hooks/useFinchConnect.test.tsx`         | Edit        | Add 4 new `isPageLoading` test cases (T017a–T017d)              |
| `tests/pages/DashboardPage.test.tsx`           | Edit        | Add `isPageLoading: false` to mock default; add 1 new test (T018)|

---

## Step 1 — Update `useFinchConnect.ts`

**File**: `src/hooks/useFinchConnect.ts`

### 1a — Update the interface

Add `isPageLoading: boolean` to `UseFinchConnectReturn`:

```ts
export interface UseFinchConnectReturn {
  connectWithFinch: () => Promise<void>;
  isLoading: boolean;
  isPageLoading: boolean;   // ← ADD THIS
  error: string | null;
  clearError: () => void;
}
```

### 1b — Derive the value inside the function body

After the existing `const isLoading = status !== "idle";` line, add:

```ts
const isPageLoading = status === "fetching-session" || status === "exchanging-code";
```

### 1c — Include in the return object

```ts
return { connectWithFinch, isLoading, isPageLoading, error, clearError };
```

---

## Step 2 — Update `DashboardPage.tsx`

**File**: `src/pages/dashboard/DashboardPage.tsx`

### 2a — Destructure `isPageLoading` from the hook

Find the existing destructuring block:

```tsx
const {
  connectWithFinch,
  isLoading: isFinchLoading,
  error: finchError,
  clearError: clearFinchError,
} = useFinchConnect();
```

Change to:

```tsx
const {
  connectWithFinch,
  isLoading: isFinchLoading,
  isPageLoading: isFinchPageLoading,
  error: finchError,
  clearError: clearFinchError,
} = useFinchConnect();
```

### 2b — Update the spinner guard

Find:

```tsx
if (isLoadingAssessment || isFinchLoading) {
  return (
    <LoadingSpinner height={80} width={80} bgClass="bg-secondary" ariaLabel="oval-loading" />
  );
}
```

Change to:

```tsx
if (isLoadingAssessment || isFinchPageLoading) {
  return (
    <LoadingSpinner height={80} width={80} bgClass="bg-secondary" ariaLabel="oval-loading" />
  );
}
```

> **Do NOT change** the `isDisabled={isFinchLoading}` prop on the "Start with Finch" button — that remains using `isFinchLoading` so the button is disabled for the entire flow.

---

## Step 3 — Add hook tests

**File**: `tests/hooks/useFinchConnect.test.tsx`

Add the following test block inside the existing `describe("useFinchConnect", ...)` suite, after the existing `isLoading` tests:

```tsx
// T017a — isPageLoading starts false
it("isPageLoading is false on initial render", () => {
  const { result } = renderHook(() => useFinchConnect(), { wrapper });
  expect(result.current.isPageLoading).toBe(false);
});

// T017b — isPageLoading is true during fetching-session
it("isPageLoading is true immediately after connectWithFinch is called (fetching-session)", async () => {
  mockGetFinchSessionId.mockReturnValue(new Promise(() => {})); // never resolves
  const { result } = renderHook(() => useFinchConnect(), { wrapper });

  act(() => {
    void result.current.connectWithFinch();
  });

  expect(result.current.isPageLoading).toBe(true);
});

// T017c — isPageLoading is false during connecting (modal open)
it("isPageLoading is false while Finch modal is open (connecting phase)", async () => {
  // getFinchSessionId resolves, so hook transitions to "connecting" and opens modal
  const { result } = renderHook(() => useFinchConnect(), { wrapper });

  await act(async () => {
    await result.current.connectWithFinch();
  });

  // Hook called open() — status is now "connecting"; modal is open
  expect(result.current.isPageLoading).toBe(false);
  // But isLoading remains true (button should stay disabled)
  expect(result.current.isLoading).toBe(true);
});

// T017d — isPageLoading is true during exchanging-code
it("isPageLoading is true during exchanging-code phase", async () => {
  // Hold exchangeFinchCode open to capture the mid-exchange state
  let resolveExchange!: () => void;
  mockExchangeFinchCode.mockReturnValue(
    new Promise<void>(res => {
      resolveExchange = res;
    })
  );

  const { result } = renderHook(() => useFinchConnect(), { wrapper });

  await act(async () => {
    await result.current.connectWithFinch();
  });

  // Trigger onSuccess to start exchanging-code phase
  act(() => {
    capturedOnSuccess!({ code: "auth-code-xyz" });
  });

  // Mid-exchange: isPageLoading should be true
  await waitFor(() => {
    expect(result.current.isPageLoading).toBe(true);
  });

  // Resolve and clean up
  act(() => resolveExchange());
});
```

---

## Step 4 — Update Dashboard page test

**File**: `tests/pages/DashboardPage.test.tsx`

### 4a — Add `isPageLoading: false` to the default mock

Find the default mock factory:

```ts
const mockUseFinchConnect = vi.fn(() => ({
  connectWithFinch: mockConnectWithFinch,
  isLoading: false,
  error: null,
  clearError: mockClearFinchError,
}));
```

Change to:

```ts
const mockUseFinchConnect = vi.fn(() => ({
  connectWithFinch: mockConnectWithFinch,
  isLoading: false,
  isPageLoading: false,
  error: null,
  clearError: mockClearFinchError,
}));
```

### 4b — Add new test T018

Add this test in the section covering the spinner/loading states (after the existing `isLoadingAssessment` spinner test):

```tsx
// T018 — Spinner NOT shown when isPageLoading is false but isLoading is true (modal open)
it("does not show full-screen spinner when isPageLoading is false (Finch modal open phase)", async () => {
  mockUseFinchConnect.mockReturnValue({
    connectWithFinch: mockConnectWithFinch,
    isLoading: true,       // flow is active (button stays disabled)
    isPageLoading: false,  // but modal is open — no page spinner
    error: null,
    clearError: mockClearFinchError,
  });

  renderDashboardPage(createTestStore({ auth: { user: { ...mockUser, emailVerify: true } } }));

  // The page should render normally — no full-screen spinner
  await waitFor(() => {
    expect(screen.queryByRole("img", { name: /oval-loading/i })).not.toBeInTheDocument();
  });
  // Dashboard content is visible
  expect(screen.getByText(/Welcome|Hi,/i)).toBeInTheDocument();
});
```

> Note: The `ariaLabel="oval-loading"` prop on `<LoadingSpinner>` becomes the accessible label queried in the test.

---

## Quality Gate

Before opening a PR, run:

```sh
pnpm run type-check      # must pass with zero errors
pnpm lint:fix            # auto-fix then no remaining lint errors
pnpm test                # all existing tests pass + 5 new tests pass
pnpm dev                 # smoke-test /dashboard: click "Start with Finch", verify no spinner behind modal
```
