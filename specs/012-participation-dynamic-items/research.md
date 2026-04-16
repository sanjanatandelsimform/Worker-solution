# Research: Dynamic Participation Breakdown Items

**Branch**: `012-participation-dynamic-items`  
**Date**: 2026-04-16  
**Spec**: [spec.md](./spec.md)

## Summary

All unknowns from the Technical Context have been resolved by inspecting the live codebase. No external research was needed — the change is self-contained within existing TypeScript types and a single hook.

---

## Decision Log

### 1. Where does participation data flow?

**Decision**: The data flows: `workforceSlice.ts (STATIC_WORKFORCE_DATA)` → Redux store → `selectParticipationSection` selector → `useWorkforceParticipationConfig.tsx` hook → `WorkforcePage.tsx` → `WorkforceParticipation.tsx`.

**Rationale**: Direct codebase inspection. The hook (`useWorkforceParticipationConfig.tsx`) is the only place that accesses `participation.benefits.*`, `participation.retirement["401k"]`, and `participation.insurance.*` by fixed property keys. All other files (`WorkforceParticipation.tsx`, `WorkforcePage.tsx`, `workforceSelectors.ts`) pass arrays through transparently.

**Alternatives considered**: Could the property access be spread across multiple files? Confirmed no — grep search found all fixed-key access exclusively in `useWorkforceParticipationConfig.tsx`.

---

### 2. What is the `ProgressItem` interface that `benefitsItems`, `retirementItems`, `insuranceItems` must satisfy?

**Decision**: `ProgressItem` is defined in `src/pages/benchmark/ProgressCard.tsx` as:

```typescript
interface ProgressItem {
  label: string;
  percentage: number;
  progressColor: string;
  tooltip?: string;
}
```

The new array mapping will produce exactly this shape: `label` from `item.name`, `percentage` from `parsePercentage(item.enrollment)`, `progressColor` stays hardcoded per category (colors are UI decisions, not data).

**Rationale**: `WorkforceParticipation.tsx` already imports and uses `ProgressItem` from `ProgressCard.tsx` with these exact field names. The hook produces this shape today; the only change is _how_ the array is built (mapped from API array vs. statically enumerated).

**Alternatives considered**: Should `progressColor` move to the API? No — it is a UI presentation concern unrelated to the business data from the backend.

---

### 3. Should the EAP tooltip remain?

**Decision**: Remove the hardcoded `tooltip: "Employee Assistance Program"` from the EAP item. The hook can no longer identify the EAP item by position or name since item order and names are now dynamic.

**Rationale**: There is no reliable way to identify "EAP" in a dynamic list — the backend controls names. Applying a tooltip only to a specific `name` value would re-introduce hardcoding. The `ProgressItem.tooltip` field remains available; if tooltips are needed they should come from the API (out of scope).

**Alternatives considered**: Match on `item.name === "EAP"` to preserve the tooltip. Rejected because it hardcodes a label that the backend is explicitly being made dynamic.

---

### 4. Which test files contain the old object-shaped mock data?

**Decision**: Three test files need mock data updates:

| File                                     | Lines with old shape                                             |
| ---------------------------------------- | ---------------------------------------------------------------- |
| `tests/store/workforceSlice.test.ts`     | Two mock participation objects (~lines 53–58 and ~lines 107–113) |
| `tests/store/workforceSelectors.test.ts` | One mock participation object (~lines 33–36)                     |
| `tests/services/workforceApi.test.ts`    | One mock participation object (~lines 47–51)                     |

`tests/pages/WorkforceTab.test.tsx` does NOT test the workforce dashboard page and does NOT use `WorkforceResponse` — it tests the assessment WorkforceTab with different Redux setup. No changes needed there.

**Rationale**: grep confirmed no additional files reference `benefits.FSA`, `insurance.health`, or the old interface names outside these three test files and the hook.

---

### 5. Does `workforceSelectors.ts` need changes?

**Decision**: No. Selectors simply return `state.workforce.data?.participation ?? null`. They return the raw API response object as-is; the shape change in TypeScript types causes the return type to update automatically when `Participation` is updated.

**Rationale**: The selectors have no hardcoded field access on the participation sub-fields.

---

### 6. Does `WorkforceParticipation.tsx` need changes?

**Decision**: No. `WorkforceParticipation.tsx` receives `benefitsItems`, `retirementItems`, and `insuranceItems` already typed as `ProgressItem[]`. It iterates them with `.map()` inside `ProgressCard`. The component is already dynamic — changing the source of the array is invisible to it.

**Rationale**: Confirmed by reading `WorkforceParticipation.tsx`. The section component accesses no property keys on participation data directly.

---

### 7. Does `workforceApi.ts` need changes?

**Decision**: No. The API service function returns `response.data` typed as `WorkforceResponse`. The TypeScript type will update automatically when the interface changes. The function itself has no field-level access on participation data.

---

### 8. Static data in `STATIC_WORKFORCE_DATA` (workforceSlice.ts)

**Decision**: Update the static mock object in `workforceSlice.ts` to use the new array format matching the sample API response provided in the spec. This ensures the app works correctly in static data mode (which is the current operation mode while backend is not live).

**New participation shape in static data**:

```typescript
benefits: [
  { name: "FSA", enrollment: "31%" },
  { name: "Wellness", enrollment: "10%" },
  { name: "EAP", enrollment: "90%" },
],
retirement: [
  { name: "401k", enrollment: "64%" },
],
insurance: [
  { name: "Health", enrollment: "78%" },
  { name: "Dental", enrollment: "65%" },
  { name: "Vision", enrollment: "60%" },
  { name: "Life", enrollment: "45%" },
],
```

**Rationale**: Mirrors exactly the sample response from the spec. Values preserved from existing STATIC_WORKFORCE_DATA where they existed.

---

## Resolved Unknowns

All items were marked NEEDS CLARIFICATION in the initial scan. All are now resolved:

| Unknown                           | Resolution                                                                                                     |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Exact files that need updating    | `workforceTypes.ts`, `useWorkforceParticipationConfig.tsx`, `workforceSlice.ts`, 3 test files. Total: 6 files. |
| ProgressItem interface shape      | `{ label, percentage, progressColor, tooltip? }` — existing shape is already compatible                        |
| EAP tooltip                       | Remove; labels are now dynamic, tooltip association cannot be hardcoded                                        |
| Test file impact                  | 3 test files, mock data only, no test logic changes                                                            |
| Selector impact                   | None — selectors pass data through transparently                                                               |
| WorkforceParticipation.tsx impact | None — already consumes `ProgressItem[]` arrays                                                                |
