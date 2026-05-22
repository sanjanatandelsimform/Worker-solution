# Quickstart: Finch Connect Loading Spinner

**Branch**: `021-finch-connect-loading`
**Date**: 2026-04-24
**Effort**: ~5 minutes — one file, one insertion.

---

## What to implement

Show a full-screen `<LoadingSpinner>` while the Finch connection flow is in progress. The spinner must appear immediately on button click and disappear on success, error, or user cancel.

**Single file change**: `src/pages/dashboard/DashboardPage.tsx`

---

## Step 1 — Locate the insertion point

Open `src/pages/dashboard/DashboardPage.tsx` and find the existing `isLoadingAssessment` guard (around line 239–243):

```tsx
if (isLoadingAssessment) {
  return <LoadingSpinner height={80} width={80} bgClass="bg-secondary" ariaLabel="oval-loading" />;
}
```

---

## Step 2 — Insert the Finch loading guard

Immediately **after** the `isLoadingAssessment` block, add:

```tsx
if (isFinchLoading) {
  return <LoadingSpinner height={80} width={80} bgClass="bg-secondary" ariaLabel="oval-loading" />;
}
```

The result should look like:

```tsx
if (isLoadingAssessment) {
  return <LoadingSpinner height={80} width={80} bgClass="bg-secondary" ariaLabel="oval-loading" />;
}

if (isFinchLoading) {
  return <LoadingSpinner height={80} width={80} bgClass="bg-secondary" ariaLabel="oval-loading" />;
}

const handleGetStarted = () => {
  navigate("/assessment");
};
```

---

## Step 3 — Verify no imports are needed

`LoadingSpinner` is already imported on line 25:

```tsx
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
```

`isFinchLoading` is already destructured from `useFinchConnect()` on line ~50:

```tsx
const {
  connectWithFinch,
  isLoading: isFinchLoading,
  error: finchError,
  clearError: clearFinchError,
} = useFinchConnect();
```

No new imports. No new dependencies.

---

## Step 4 — Quality gate

```bash
pnpm run type-check    # must pass with 0 errors
pnpm lint:fix          # must pass
pnpm dev               # smoke-test: click "Start with Finch" on /dashboard
```

**Smoke test**: Click "Start with Finch". The full-screen spinner should appear immediately and remain until the Finch modal either completes the flow (redirect) or is dismissed (spinner disappears, dashboard restored).

---

## What does NOT need to change

| File                           | Reason                                                                       |
| ------------------------------ | ---------------------------------------------------------------------------- |
| `src/hooks/useFinchConnect.ts` | Hook already exposes correct `isLoading` state for all lifecycle phases      |
| Any test file                  | `useFinchConnect` is mocked in tests returning `isLoading: false` by default |
| Any other component            | `LoadingSpinner` is a full-page replacement, no layout changes needed        |
