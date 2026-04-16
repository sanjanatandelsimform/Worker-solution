# Data Model: Dynamic Participation Breakdown Items

**Branch**: `012-participation-dynamic-items`  
**Date**: 2026-04-16  
**Spec**: [spec.md](./spec.md) | **Research**: [research.md](./research.md)

## Overview

This change replaces three static enrollment interfaces (`BenefitsEnrollment`, `RetirementEnrollment`, `InsuranceEnrollment`) with a single generic `EnrollmentItem` interface. The `benefits`, `retirement`, and `insurance` fields on the `Participation` root interface change from fixed-key objects to arrays of `EnrollmentItem`.

---

## Interfaces

### New: `EnrollmentItem`

```typescript
/** A single participation line item with a dynamic name and enrollment percentage */
export interface EnrollmentItem {
  /** Display name, e.g. "FSA", "401k", "Health" — controlled fully by backend */
  name: string;
  /** Enrollment percentage string, e.g. "64%" or "N/A" */
  enrollment: string;
}
```

**Replaces**: `BenefitsEnrollment`, `RetirementEnrollment`, `InsuranceEnrollment`

---

### Updated: `Participation`

```typescript
export interface Participation {
  totalWorkforce: number;
  enrolledBenefits: number;
  /** e.g. "64%" */
  retirementEnrollment: string;
  /** e.g. "78%" */
  healthcareEnrollment: string;
  benefits: EnrollmentItem[];
  retirement: EnrollmentItem[];
  insurance: EnrollmentItem[];
}
```

**Changed fields**: `benefits`, `retirement`, `insurance` — type changed from fixed-key objects to `EnrollmentItem[]`.  
**Unchanged fields**: `totalWorkforce`, `enrolledBenefits`, `retirementEnrollment`, `healthcareEnrollment` — untouched.

---

### Removed Interfaces

| Interface              | Was                                                                | Replaced By        |
| ---------------------- | ------------------------------------------------------------------ | ------------------ |
| `BenefitsEnrollment`   | `{ FSA: string; wellness: string; EAP: string }`                   | `EnrollmentItem[]` |
| `RetirementEnrollment` | `{ "401k": string }`                                               | `EnrollmentItem[]` |
| `InsuranceEnrollment`  | `{ health: string; dental: string; vision: string; life: string }` | `EnrollmentItem[]` |

---

## State Shape: Redux Slice (`WorkforceState`)

No structural change to `WorkforceState`. The `data` field holds `WorkforceResponse` which contains `participation: Participation` — the type update propagates automatically.

---

## Hook Output Contract: `useWorkforceParticipationConfig`

The hook's **return type is unchanged** — it continues to produce three `ProgressItem[]` arrays. The internal computation changes from property-key access to `Array.map()`.

```typescript
// Before (per-item hardcoded):
const benefitsItems: ProgressItem[] = [
  {
    label: "FSA",
    percentage: parsePercentage(participation.benefits.FSA),
    progressColor: "bg-ws-navy-300",
  },
  {
    label: "Wellness",
    percentage: parsePercentage(participation.benefits.wellness),
    progressColor: "bg-ws-navy-300",
  },
  {
    label: "EAP",
    percentage: parsePercentage(participation.benefits.EAP),
    progressColor: "bg-ws-navy-300",
    tooltip: "Employee Assistance Program",
  },
];

// After (dynamic map):
const benefitsItems: ProgressItem[] = (participation.benefits ?? []).map(item => ({
  label: item.name,
  percentage: parsePercentage(item.enrollment),
  progressColor: "bg-ws-navy-300",
}));
```

**Progress color mapping** (UI-only, stays in hook):

| Category   | `progressColor`          |
| ---------- | ------------------------ |
| benefits   | `"bg-ws-navy-300"`       |
| retirement | `"bg-ws-light-teal-400"` |
| insurance  | `"bg-ws-light-teal-300"` |

---

## Mock Data Shape (Static Mode + Tests)

The `STATIC_WORKFORCE_DATA` in `workforceSlice.ts` and all test fixtures must use the new array format:

```json
"participation": {
  "totalWorkforce": 5345,
  "enrolledBenefits": 2450,
  "retirementEnrollment": "64%",
  "healthcareEnrollment": "78%",
  "benefits": [
    { "name": "FSA",     "enrollment": "31%" },
    { "name": "Wellness","enrollment": "10%" },
    { "name": "EAP",     "enrollment": "90%" }
  ],
  "retirement": [
    { "name": "401k",    "enrollment": "64%" }
  ],
  "insurance": [
    { "name": "Health",  "enrollment": "78%" },
    { "name": "Dental",  "enrollment": "65%" },
    { "name": "Vision",  "enrollment": "60%" },
    { "name": "Life",    "enrollment": "45%" }
  ]
}
```

---

## File-Level Impact Summary

| File                                            | Change Type   | Detail                                                                |
| ----------------------------------------------- | ------------- | --------------------------------------------------------------------- |
| `src/types/workforceTypes.ts`                   | Type change   | Add `EnrollmentItem`; remove 3 old interfaces; update `Participation` |
| `src/hooks/useWorkforceParticipationConfig.tsx` | Logic change  | Replace property-key access with `.map()` in 3 `useMemo` blocks       |
| `src/store/slices/workforceSlice.ts`            | Mock data     | Update `STATIC_WORKFORCE_DATA.participation` to array format          |
| `tests/store/workforceSlice.test.ts`            | Test fixtures | 2 mock objects → array format                                         |
| `tests/store/workforceSelectors.test.ts`        | Test fixture  | 1 mock object → array format                                          |
| `tests/services/workforceApi.test.ts`           | Test fixture  | 1 mock object → array format                                          |

**Not changed** (confirmed): `workforceSelectors.ts`, `WorkforceParticipation.tsx`, `WorkforcePage.tsx`, `workforceApi.ts`, `WorkforceSkeletons.tsx`, all demographics/compensation files.

---

## Validation Rules

- `name`: `string` — any non-empty string from backend; defensive render handles empty string as blank label
- `enrollment`: `string` — passed through `parsePercentage()` which returns `0` for `"N/A"` or invalid input
- Empty array `[]`: fully supported — renders zero items for that category without error
