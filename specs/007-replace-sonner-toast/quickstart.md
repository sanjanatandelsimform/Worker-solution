# Quickstart: Replace Sonner Toast with ErrorMessage Component

**Feature**: `007-replace-sonner-toast` | **Phase**: 1 — TDD Implementation Guide  
**Date**: 2026-04-07

---

## Overview

This is a pure frontend refactor. The change touches 2 source files, deletes 1 file, cleans up 1 file, and updates the package manifest. **Follow TDD order strictly**: update tests first, watch them fail, then implement.

**Quality gate before starting**:

```
pnpm run type-check   # must pass on current main
pnpm test             # must pass — establishes baseline
```

---

## Step 1 — Update Hook Tests First (TDD Red Phase)

File: `tests/hooks/useFinchConnect.test.tsx`

**Remove** the Sonner mock entirely:

```typescript
// DELETE these lines:
const mockToastError = vi.fn();
vi.mock("sonner", () => ({
  toast: {
    error: (msg: string) => mockToastError(msg),
    success: vi.fn(),
  },
}));
```

**Update** `beforeEach` — remove `mockToastError` from the reset:

```typescript
// REMOVE from beforeEach:
// (no explicit reset needed; mockToastError vi.fn() no longer exists)
```

**Replace** every `expect(mockToastError).toHaveBeenCalledWith(...)` assertion with an `error` state assertion. Pattern for each affected test:

```typescript
// BEFORE (T011 — session ID fetch failure):
await waitFor(() => {
  expect(mockToastError).toHaveBeenCalledWith("Network error");
  expect(result.current.isLoading).toBe(false);
});

// AFTER:
await waitFor(() => {
  expect(result.current.error).toBe("Network error");
  expect(result.current.isLoading).toBe(false);
});
```

**Add** one new test — error clears on retry:

```typescript
// T0XX — error is cleared when connectWithFinch is called again
it("error is cleared when a new connectWithFinch call begins", async () => {
  mockGetFinchSessionId.mockRejectedValueOnce(new Error("First failure"));
  const { result } = renderHook(() => useFinchConnect(), { wrapper });

  // First attempt — sets error
  await act(async () => {
    await result.current.connectWithFinch();
  });
  await waitFor(() => expect(result.current.error).toBe("First failure"));

  // Second attempt — error clears immediately on call start
  mockGetFinchSessionId.mockReturnValue(new Promise(() => {})); // hold open
  act(() => {
    void result.current.connectWithFinch();
  });
  expect(result.current.error).toBeNull();
});
```

**Add** one new test — `clearError` callback:

```typescript
// T0XX — clearError resets error to null
it("clearError() resets error to null", async () => {
  mockGetFinchSessionId.mockRejectedValue(new Error("Some error"));
  const { result } = renderHook(() => useFinchConnect(), { wrapper });

  await act(async () => {
    await result.current.connectWithFinch();
  });
  await waitFor(() => expect(result.current.error).not.toBeNull());

  act(() => {
    result.current.clearError();
  });
  expect(result.current.error).toBeNull();
});
```

**Run** — expect failures on `result.current.error` (field doesn't exist yet) and passes on `isLoading` tests.

---

## Step 2 — Update Dashboard Tests (TDD Red Phase)

File: `tests/pages/DashboardPage.test.tsx`

**Update** `mockUseFinchConnect` default return to include `error` and `clearError`:

```typescript
const mockClearFinchError = vi.fn();
const mockUseFinchConnect = vi.fn(() => ({
  connectWithFinch: mockConnectWithFinch,
  isLoading: false,
  error: null,
  clearError: mockClearFinchError,
}));
```

**Update** every `mockUseFinchConnect.mockReturnValue({...})` in `beforeEach` and individual tests to include `error: null, clearError: mockClearFinchError`.

**Add** new test cases for Finch error display:

```typescript
describe("DashboardPage — Finch error display", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseFinchConnect.mockReturnValue({
      connectWithFinch: mockConnectWithFinch,
      isLoading: false,
      error: null,
      clearError: mockClearFinchError,
    });
    // ... localStorage setup
  });

  // Test: error message shown in choice section when finchError is set
  it("shows inline error when finchError is set (pre-assessment, choice section)", async () => {
    mockUseFinchConnect.mockReturnValue({
      connectWithFinch: mockConnectWithFinch,
      isLoading: false,
      error: "Failed to start Finch Connect. Please try again.",
      clearError: mockClearFinchError,
    });
    renderDashboardPage(createTestStore({ auth: { user: { ...mockUser, emailVerify: true } } }));

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toBeInTheDocument();
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Failed to start Finch Connect. Please try again."
      );
    });
  });

  // Test: no error shown when finchError is null
  it("does not show inline error when finchError is null", async () => {
    renderDashboardPage(createTestStore({ auth: { user: { ...mockUser, emailVerify: true } } }));

    await waitFor(() => {
      expect(screen.queryByTestId("error-message")).not.toBeInTheDocument();
    });
  });
});
```

**Run** — expect failures (ErrorMessage not yet rendered from `finchError`).

---

## Step 3 — Implement Hook Changes (TDD Green Phase)

File: `src/hooks/useFinchConnect.ts`

**1. Remove** the Sonner import:

```typescript
// DELETE:
import { toast } from "sonner";
```

**2. Update** the return interface:

```typescript
export interface UseFinchConnectReturn {
  connectWithFinch: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}
```

**3. Add** error state inside the hook function body:

```typescript
const [error, setError] = useState<string | null>(null);
```

**4. Add** `clearError` callback:

```typescript
const clearError = useCallback(() => setError(null), []);
```

**5. Replace** every `toast.error(...)` call with `setError(...)`:

```typescript
// BEFORE:
toast.error("Failed to complete Finch connection. Please try again.");
// AFTER:
setError("Failed to complete Finch connection. Please try again.");

// BEFORE:
toast.error(msg || "Failed to complete Finch connection. Please try again.");
// AFTER:
setError(msg || "Failed to complete Finch connection. Please try again.");

// BEFORE (onError callback):
toast.error(errorMessage || "Failed to complete Finch connection. Please try again.");
// AFTER:
setError(errorMessage || "Failed to complete Finch connection. Please try again.");

// BEFORE:
toast.error(msg || "Failed to start Finch Connect. Please try again.");
// AFTER:
setError(msg || "Failed to start Finch Connect. Please try again.");
```

**6. Clear** error at the start of each `connectWithFinch()` call:

```typescript
const connectWithFinch = useCallback(async () => {
  if (isLoading) return;
  setError(null); // ← ADD THIS LINE
  setStatus("fetching-session");
  // ...rest unchanged
}, [isLoading, open]);
```

**7. Remove** the debug `console.log`:

```typescript
// DELETE:
console.log("Error in connectWithFinch:", e);
```

**8. Update** return value:

```typescript
return { connectWithFinch, isLoading, error, clearError };
```

**Run tests** — hook tests should go green.

---

## Step 4 — Implement Dashboard Changes (TDD Green Phase)

File: `src/pages/dashboard/DashboardPage.tsx`

**1. Update** the `useFinchConnect` destructure:

```typescript
// BEFORE:
const { connectWithFinch, isLoading: isFinchLoading } = useFinchConnect();

// AFTER:
const {
  connectWithFinch,
  isLoading: isFinchLoading,
  error: finchError,
  clearError: clearFinchError,
} = useFinchConnect();
```

**2. Add** `<ErrorMessage />` inside the two-column choice section (inside the right-hand "Connect with Finch" column, above the button):

Locate the `<Button>` with `onClick={connectWithFinch}` and `children="Start with Finch"`. Directly above it, add:

```tsx
{
  finchError && (
    <div className="mb-4">
      <ErrorMessage
        errorType="danger"
        textColor="text-red-700"
        alertIcon={AlertCircle}
        errorMessage={finchError}
        onClose={clearFinchError}
      />
    </div>
  );
}
```

**3. Add** `<ErrorMessage />` above the `<DashboardCard>` for "Connect to Finch" (post-completion section):

Locate the `DashboardCard` with `title="Connect to Finch"` and wrap the section:

```tsx
{emailVerify && assessmentData?.status === "completed" && !isConnected && (
  <>
    {finchError && (
      <div className="mt-6">
        <ErrorMessage
          errorType="danger"
          textColor="text-red-700"
          alertIcon={AlertCircle}
          errorMessage={finchError}
          onClose={clearFinchError}
        />
      </div>
    )}
    <DashboardCard
      {/* ... existing props unchanged ... */}
    />
  </>
)}
```

**Run tests** — all Dashboard tests should go green.

---

## Step 5 — Clean Up App.tsx

File: `src/App.tsx`

Remove the Sonner import:

```typescript
// DELETE:
import { Toaster } from "@/components/ui/sonner";
```

Remove the Toaster JSX mount:

```tsx
// DELETE (near end of return, just before </AuthErrorBoundary>):
<Toaster />
```

---

## Step 6 — Delete `sonner.tsx`

```
# Delete the file:
src/components/ui/sonner.tsx
```

> Use the VS Code file explorer or `Remove-Item` — do NOT use `git rm` as it creates a separate commit.

---

## Step 7 — Remove the `sonner` Package

```bash
pnpm remove sonner
```

Verify `package.json` no longer lists `sonner` under `dependencies`.

---

## Step 8 — Full Quality Gate

```bash
pnpm run type-check   # must report 0 errors
pnpm lint:fix         # must auto-fix cleanly
pnpm format           # Prettier pass
pnpm test             # ALL tests must pass
pnpm dev              # smoke-test: open /dashboard, trigger a Finch error
```

**Smoke-test checklist**:

- [ ] Navigate to Dashboard (`/dashboard`)
- [ ] Click "Start with Finch" with network mocked to fail → inline red error banner appears inside the Finch connect section, no floating toast
- [ ] Error auto-dismisses after 5 seconds
- [ ] Click X on error → dismisses immediately
- [ ] Click "Start with Finch" again → error clears before new attempt starts
- [ ] No Sonner mention in Dev Tools network or console
