# Quickstart: Finch Integration

**Feature**: 005-finch-integration  
**Date**: 2026-03-31

This guide walks a developer through implementing the Finch integration from scratch following the TDD workflow required by the constitution.

---

## Prerequisites

- Branch `005-finch-integration` checked out
- `pnpm install` up to date

---

## Step 1 — Install Dependencies

```bash
# Install the Finch Connect React SDK
pnpm add @tryfinch/react-connect

# Add sonner toast via shadcn/ui (installs sonner npm package + creates src/components/ui/sonner.tsx)
pnpm dlx shadcn@latest add sonner
```

**Verify**:

- `package.json` contains `"@tryfinch/react-connect"` and `"sonner"` in dependencies
- `src/components/ui/sonner.tsx` exists

---

## Step 2 — Mount the Toast Provider

In `App.tsx` (or the root private layout), add `<Toaster />` once at the top level:

```tsx
import { Toaster } from "@/components/ui/sonner";

// Inside the JSX tree:
<Toaster />;
```

This is the only application-level change needed to enable toasts globally.

---

## Step 3 — Create Stub Service File

Create `src/services/api/finchApi.ts`:

```typescript
/**
 * Finch API Service — STUBS
 *
 * These functions are stubs pending real backend endpoints.
 * Replace the function bodies (not signatures) when:
 * - POST /api/finch/sessions is available  → getFinchSessionId()
 * - POST /api/finch/connect   is available  → exchangeFinchCode()
 *
 * See contracts/finch-session.md and contracts/finch-connect.md for full API specs.
 */

export interface FinchSessionResponse {
  sessionId: string;
}

export interface FinchConnectResponse {
  success: boolean;
}

export const getFinchSessionId = async (): Promise<FinchSessionResponse> => {
  // TODO: replace with real API call
  return Promise.resolve({ sessionId: "stub-session-id-001" });
};

export const exchangeFinchCode = async (code: string): Promise<FinchConnectResponse> => {
  // TODO: replace with real API call → apiClient.post('/finch/connect', { code })
  void code;
  return Promise.resolve({ success: true });
};
```

**Write tests first** (`tests/services/finchApi.test.ts`) before implementing.

---

## Step 4 — Create the Custom Hook

Create `src/hooks/useFinchConnect.ts`.

**Write tests first** (`tests/hooks/useFinchConnect.test.ts`) before implementing.

Key implementation points:

- Use `useFinchConnect` from `@tryfinch/react-connect` (SDK hook) inside our hook
- Wrap `onSuccess`, `onError`, `onClose` in `useCallback` with stable deps (prevents StrictMode re-render loop — Research Decision 8)
- Fetch session ID lazily inside `connectWithFinch()`, not on mount (Research Decision 3)
- Derive `isLoading` from `status !== 'idle'`
- Guard against concurrent calls: `if (isLoading) return;` at the top of `connectWithFinch`
- Fire `toast.error(...)` from `sonner` on error paths; `toast.success(...)` is optional
- Call `navigate('/additional-questions')` after successful code exchange

Example skeleton:

```typescript
import { useCallback, useState } from "react";
import { useFinchConnect as useFinchSDK } from "@tryfinch/react-connect";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getFinchSessionId, exchangeFinchCode } from "@/services/api/finchApi";

type FinchConnectStatus = "idle" | "fetching-session" | "connecting" | "exchanging-code";

export interface UseFinchConnectReturn {
  connectWithFinch: () => Promise<void>;
  isLoading: boolean;
}

export function useFinchConnect(): UseFinchConnectReturn {
  const navigate = useNavigate();
  const [status, setStatus] = useState<FinchConnectStatus>("idle");
  const isLoading = status !== "idle";

  const onSuccess = useCallback(
    async ({ code }: { code: string }) => {
      if (!code) {
        toast.error("Connection failed. Please try again.");
        setStatus("idle");
        return;
      }
      setStatus("exchanging-code");
      try {
        await exchangeFinchCode(code);
        navigate("/additional-questions");
      } catch {
        toast.error("Failed to connect with Finch. Please try again.");
        setStatus("idle");
      }
    },
    [navigate]
  );

  const onError = useCallback(({ errorMessage }: { errorMessage: string }) => {
    toast.error(errorMessage || "Finch connection error. Please try again.");
    setStatus("idle");
  }, []);

  const onClose = useCallback(() => {
    setStatus("idle");
  }, []);

  const { open } = useFinchSDK({ onSuccess, onError, onClose });

  const connectWithFinch = useCallback(async () => {
    if (isLoading) return;
    setStatus("fetching-session");
    try {
      const { sessionId } = await getFinchSessionId();
      setStatus("connecting");
      open({ sessionId });
    } catch {
      toast.error("Connection failed. Please try again.");
      setStatus("idle");
    }
  }, [isLoading, open]);

  return { connectWithFinch, isLoading };
}
```

---

## Step 5 — Update Dashboard Page

In `src/pages/dashboard/DashboardPage.tsx`:

1. Import and call `useFinchConnect`:
   ```tsx
   const { connectWithFinch, isLoading: isFinchLoading } = useFinchConnect();
   ```
2. Replace `handleFinchStarted` usage with `connectWithFinch`
3. Add `disabled={isFinchLoading}` to the "Start with Finch" button

**Write/update tests** (`tests/pages/DashboardPage.test.tsx`) before modifying.

---

## Step 6 — Update Get More Page

In `src/pages/getMore/GetMore.tsx`:

1. Import and call `useFinchConnect`:
   ```tsx
   const { connectWithFinch, isLoading: isFinchLoading } = useFinchConnect();
   ```
2. In `handleGetStarted`, replace:
   ```tsx
   if (selectedPlan === "finch") {
     navigate("/additional-questions"); // ← remove this
   }
   ```
   with:
   ```tsx
   if (selectedPlan === "finch") {
     void connectWithFinch(); // ← add this
     return;
   }
   ```
3. Add `disabled={selectedPlan === 'finch' && isFinchLoading}` to the "Let's get started" button

**Write/update tests** (`tests/pages/GetMore.test.tsx`) before modifying.

---

## Step 7 — Run the Quality Gate

```bash
pnpm run type-check     # must pass (0 errors)
pnpm lint:fix           # auto-fix
pnpm format             # prettier
pnpm test               # all tests green
```

---

## Verification Checklist

After completing all steps, verify end-to-end in the browser (`pnpm dev`):

- [ ] Navigate to `/dashboard` — "Start with Finch" button is clickable
- [ ] Click "Start with Finch" — button disables and shows loading indicator
- [ ] Finch Connect overlay opens (or stub skips overlay and proceeds to code exchange)
- [ ] After overlay, user is redirected to `/additional-questions`
- [ ] Navigate to `/get-more` — select Finch plan (default) — click "Let's get started"
- [ ] Same Finch flow triggered; redirected to `/additional-questions`
- [ ] Navigate to `/get-more` — select Manual Entry — click "Let's get started"
- [ ] User navigated directly to `/assessment` (no Finch overlay)
- [ ] Simulate session ID failure (mock in dev) — toast error appears; button re-enables
- [ ] Simulate Finch `onError` — toast error appears; button re-enables

---

## Swapping Stubs for Real API

When the backend is ready:

1. Open `src/services/api/finchApi.ts`
2. Replace `getFinchSessionId` body:
   ```typescript
   export const getFinchSessionId = async (): Promise<FinchSessionResponse> => {
     const response = await apiClient.post<FinchSessionResponse>("/finch/sessions");
     return response.data;
   };
   ```
3. Replace `exchangeFinchCode` body:
   ```typescript
   export const exchangeFinchCode = async (code: string): Promise<FinchConnectResponse> => {
     const response = await apiClient.post<FinchConnectResponse>("/finch/connect", { code });
     return response.data;
   };
   ```
4. Run type-check and tests — **no other files should require changes**.
