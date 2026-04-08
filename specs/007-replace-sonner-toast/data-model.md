# Data Model: Replace Sonner Toast with ErrorMessage Component

**Feature**: `007-replace-sonner-toast` | **Phase**: 1 — Design  
**Date**: 2026-04-07

---

## 1. Hook Interface Change — `UseFinchConnectReturn`

This is the only type-level change in the feature. The `UseFinchConnectReturn` interface gains a new `error` field.

### Before

```typescript
// src/hooks/useFinchConnect.ts
export interface UseFinchConnectReturn {
  connectWithFinch: () => Promise<void>;
  isLoading: boolean;
}
```

### After

```typescript
// src/hooks/useFinchConnect.ts
export interface UseFinchConnectReturn {
  connectWithFinch: () => Promise<void>;
  isLoading: boolean;
  error: string | null; // NEW — null when no error; string message when an error occurred
}
```

**Field semantics**:

| Field   | Type             | Initial value | Set to non-null when           | Cleared on                             |
| ------- | ---------------- | ------------- | ------------------------------ | -------------------------------------- |
| `error` | `string \| null` | `null`        | Any of the 4 error paths fires | A new `connectWithFinch()` call begins |

**The 4 error paths** (maps directly to FR-001 / SC-003):

| Path                      | Source                                     | Message value                                                                |
| ------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------- |
| Empty code in `onSuccess` | `onSuccess({ code: "" })`                  | `"Failed to complete Finch connection. Please try again."`                   |
| Code exchange failure     | `exchangeFinchCode()` rejects              | `e.message` or `"Failed to complete Finch connection. Please try again."`    |
| SDK `onError` callback    | Finch widget → `onError({ errorMessage })` | `errorMessage` or `"Failed to complete Finch connection. Please try again."` |
| Session fetch failure     | `getFinchSessionId()` rejects              | `e.message` or `"Failed to start Finch Connect. Please try again."`          |

---

## 2. Internal Hook State

No change to the `FinchConnectStatus` union type. A new `error` state variable is added alongside the existing `status`:

```typescript
type FinchConnectStatus = "idle" | "fetching-session" | "connecting" | "exchanging-code";
//                        unchanged ↑

const [status, setStatus] = useState<FinchConnectStatus>("idle");
const [error, setError] = useState<string | null>(null); // NEW
```

**State transition table**:

| Event                          | `status` →               | `error` →                           |
| ------------------------------ | ------------------------ | ----------------------------------- |
| `connectWithFinch()` called    | `"fetching-session"`     | `null` (cleared)                    |
| `getFinchSessionId()` resolves | `"connecting"`           | unchanged                           |
| Finch SDK opens                | (remains `"connecting"`) | unchanged                           |
| `onSuccess({ code })` called   | `"exchanging-code"`      | unchanged                           |
| `exchangeFinchCode()` resolves | (navigate away)          | unchanged                           |
| `exchangeFinchCode()` rejects  | `"idle"`                 | set to error message                |
| `getFinchSessionId()` rejects  | `"idle"`                 | set to error message                |
| `onError()` fires              | `"idle"`                 | set to error message                |
| `onClose()` fires              | `"idle"`                 | unchanged (no error—user dismissed) |
| Empty code in `onSuccess`      | `"idle"`                 | set to fallback message             |

---

## 3. `ErrorMessage` Component Interface (reference — unchanged)

No changes to the `ErrorMessage` component itself. The existing props interface is used as-is:

```typescript
// src/components/common/ErrorMessage.tsx — UNCHANGED
export interface CostCardProps {
  errorType?: "success" | "warning" | "danger" | "info" | "neutral";
  textColor?: string;
  alertIcon?: React.ComponentType<{ className?: string }>;
  errorMessage?: React.ReactNode;
  classess?: string;
  onClose?: () => void;
}
```

**Usage pattern** applied in DashboardPage (mirrors `SignInForm.tsx` / `DashboardPage.tsx` existing patterns):

```tsx
{
  finchError && (
    <div className="mt-4">
      <ErrorMessage
        errorType="danger"
        textColor="text-red-700"
        alertIcon={AlertCircle}
        errorMessage={finchError}
        onClose={() => clearFinchError()}
      />
    </div>
  );
}
```

> `clearFinchError` is a new callable exposed from the hook — see §4.

---

## 4. Optional Clear Callback — `clearFinchError`

To allow the dismiss button (`onClose`) to clear the hook's internal error state, the hook needs to expose a stable callback. Two implementation options:

| Option         | Approach                                            | Trade-off                                     |
| -------------- | --------------------------------------------------- | --------------------------------------------- |
| **A** (chosen) | Expose `clearError: () => void` from the hook       | Clean API — consumer has explicit control     |
| B              | Consumer calls `setError` via a separate setter ref | Leaks internal hook mutation outside the hook |

**Chosen**: Option A. The hook exposes:

```typescript
export interface UseFinchConnectReturn {
  connectWithFinch: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void; // NEW — stable callback, memoized with useCallback
}
```

The Dashboard destructures: `const { connectWithFinch, isLoading: isFinchLoading, error: finchError, clearError: clearFinchError } = useFinchConnect();`

---

## 5. Files Changed / Deleted

| File                                    | Action   | Reason                                                                                                |
| --------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------- |
| `src/hooks/useFinchConnect.ts`          | MODIFIED | Add `error`, `clearError`; remove all `toast.error()` calls and `sonner` import; remove `console.log` |
| `src/pages/dashboard/DashboardPage.tsx` | MODIFIED | Destructure `error` + `clearError` from hook; add `<ErrorMessage />` inside both Finch sections       |
| `src/App.tsx`                           | MODIFIED | Remove `import { Toaster } from "@/components/ui/sonner"` and `<Toaster />` JSX                       |
| `src/components/ui/sonner.tsx`          | DELETED  | No consumers remain after App.tsx is cleaned                                                          |
| `package.json` + `pnpm-lock.yaml`       | MODIFIED | `pnpm remove sonner`                                                                                  |
| `tests/hooks/useFinchConnect.test.tsx`  | MODIFIED | Remove Sonner mock + assertions; add `error` state assertions                                         |
| `tests/pages/DashboardPage.test.tsx`    | MODIFIED | Add `error: null` to mock default; add Finch error display test cases                                 |
