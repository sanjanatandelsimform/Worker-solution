# Data Model: Finch Connect Loading Spinner

**Branch**: `021-finch-connect-loading`
**Date**: 2026-04-24

> This is a UI-only change. There are no new entities, no new types, no API contracts, and no state shape changes.

---

## Existing State Flow (unchanged)

`useFinchConnect` in `src/hooks/useFinchConnect.ts` manages the full Finch connection lifecycle:

```
FinchConnectStatus = "idle" | "fetching-session" | "connecting" | "exchanging-code"

isLoading = status !== "idle"   // true during any active step
```

### State transition diagram

```
[idle] ──click──► [fetching-session] ──session obtained──► [connecting]
                         │                                       │
                      catch error                         onError / catch
                         │                                       │
                         ▼                                       ▼
                       [idle] ◄──────────────────────────────[idle]
                                                                 ▲
                                                        onClose (user cancel)
                                                                 │
                                                          [connecting] ──code received──► [exchanging-code]
                                                                                                │
                                                                                      navigate("/additional-questions")
                                                                                         (component unmounts)
```

### Prop contract for `DashboardPage` (unchanged)

The hook return value is already used in `DashboardPage.tsx`:

```typescript
const {
  connectWithFinch, // () => Promise<void>
  isLoading: isFinchLoading, // boolean — true during any Finch operation
  error: finchError, // string | null
  clearError: clearFinchError, // () => void
} = useFinchConnect();
```

---

## UI Render Guard (the only change)

The single change is adding a conditional render guard in `DashboardPage.tsx`, matching the existing `isLoadingAssessment` pattern:

```tsx
// EXISTING — assessment loading guard (around line 239)
if (isLoadingAssessment) {
  return <LoadingSpinner height={80} width={80} bgClass="bg-secondary" ariaLabel="oval-loading" />;
}

// NEW — Finch loading guard (inserted immediately after)
if (isFinchLoading) {
  return <LoadingSpinner height={80} width={80} bgClass="bg-secondary" ariaLabel="oval-loading" />;
}
```

### `LoadingSpinner` props used

| Prop        | Value            | Purpose                                  |
| ----------- | ---------------- | ---------------------------------------- |
| `height`    | `80`             | Spinner size (pixels)                    |
| `width`     | `80`             | Spinner size (pixels)                    |
| `bgClass`   | `"bg-secondary"` | Background color matching existing usage |
| `ariaLabel` | `"oval-loading"` | Screen-reader label                      |

---

## No contracts generated

This feature makes no API calls, introduces no new endpoints, and modifies no data schemas. The `/contracts/` directory is not needed.
