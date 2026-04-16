# Quickstart: Dynamic Participation Breakdown Items

**Branch**: `012-participation-dynamic-items`  
**Date**: 2026-04-16  
**Difficulty**: Low — 6 files, type change + mapping update + 4 test fixtures

---

## Prerequisites

- You are on branch `012-participation-dynamic-items`
- Feature 010 (WorkforcePage refactor) is fully implemented — `WorkforceParticipation.tsx` and `useWorkforceParticipationConfig.tsx` already exist
- Run `pnpm install` from repo root (should already be done)

---

## Step 1: Update TypeScript Interfaces (`workforceTypes.ts`)

**File**: `src/types/workforceTypes.ts`

**What to do**:

1. Add the new `EnrollmentItem` interface **before** the `Participation` interface
2. Update `Participation.benefits`, `.retirement`, `.insurance` field types to `EnrollmentItem[]`
3. Delete the three old interfaces: `BenefitsEnrollment`, `RetirementEnrollment`, `InsuranceEnrollment`

**New `EnrollmentItem` interface** (add before `Participation`):

```typescript
/** A single dynamic participation line item from the backend */
export interface EnrollmentItem {
  /** Display label, e.g. "FSA", "401k", "Health" */
  name: string;
  /** Enrollment percentage string, e.g. "64%" or "N/A" */
  enrollment: string;
}
```

**Updated `Participation` interface**:

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

**Remove** these three interfaces entirely:

- `BenefitsEnrollment`
- `RetirementEnrollment`
- `InsuranceEnrollment`

---

## Step 2: Update the Hook (`useWorkforceParticipationConfig.tsx`)

**File**: `src/hooks/useWorkforceParticipationConfig.tsx`

**What to do**: Replace the three `useMemo` blocks that build `benefitsItems`, `retirementItems`, `insuranceItems` with array `.map()` calls.

**New `benefitsItems` memo**:

```typescript
const benefitsItems = useMemo(
  () =>
    (participationSection?.benefits ?? []).map(item => ({
      label: item.name,
      percentage: parsePercentage(item.enrollment),
      progressColor: "bg-ws-navy-300",
    })),
  [participationSection]
);
```

**New `retirementItems` memo**:

```typescript
const retirementItems = useMemo(
  () =>
    (participationSection?.retirement ?? []).map(item => ({
      label: item.name,
      percentage: parsePercentage(item.enrollment),
      progressColor: "bg-ws-light-teal-400",
    })),
  [participationSection]
);
```

**New `insuranceItems` memo**:

```typescript
const insuranceItems = useMemo(
  () =>
    (participationSection?.insurance ?? []).map(item => ({
      label: item.name,
      percentage: parsePercentage(item.enrollment),
      progressColor: "bg-ws-light-teal-300",
    })),
  [participationSection]
);
```

**Note on EAP tooltip**: Remove the `tooltip: "Employee Assistance Program"` that was on the old hardcoded EAP item. Item ordering and names are now dynamic — the tooltip cannot be safely associated.

---

## Step 3: Update Static Mock Data (`workforceSlice.ts`)

**File**: `src/store/slices/workforceSlice.ts`

**What to do**: In `STATIC_WORKFORCE_DATA`, replace the `participation.benefits`, `participation.retirement`, and `participation.insurance` fields with the new array format.

**Replace**:

```typescript
benefits: {
  FSA: "31%",
  wellness: "10%",
  EAP: "90%",
},
retirement: {
  "401k": "64%",
},
insurance: {
  health: "78%",
  dental: "65%",
  vision: "60%",
  life: "45%",
},
```

**With**:

```typescript
benefits: [
  { name: "FSA",      enrollment: "31%" },
  { name: "Wellness", enrollment: "10%" },
  { name: "EAP",      enrollment: "90%" },
],
retirement: [
  { name: "401k",     enrollment: "64%" },
],
insurance: [
  { name: "Health",   enrollment: "78%" },
  { name: "Dental",   enrollment: "65%" },
  { name: "Vision",   enrollment: "60%" },
  { name: "Life",     enrollment: "45%" },
],
```

---

## Step 4: Update Test Fixtures

Update the four mock `participation` objects in the three test files. In each case, apply the same pattern: replace `benefits: { ... }`, `retirement: { ... }`, `insurance: { ... }` with the array format.

### 4a. `tests/store/workforceSlice.test.ts` — TWO mock objects to update

**First mock** (inside `"should set data, isLoaded, and clear loading on fulfilled"` test):

```typescript
// Replace:
benefits: { FSA: "31%", wellness: "N/A", EAP: "N/A" },
retirement: { "401k": "64%" },
insurance: { health: "78%", dental: "65%", vision: "60%", life: "45%" },

// With:
benefits: [
  { name: "FSA",      enrollment: "31%" },
  { name: "Wellness", enrollment: "N/A" },
  { name: "EAP",      enrollment: "N/A" },
],
retirement: [{ name: "401k", enrollment: "64%" }],
insurance: [
  { name: "Health", enrollment: "78%" },
  { name: "Dental", enrollment: "65%" },
  { name: "Vision", enrollment: "60%" },
  { name: "Life",   enrollment: "45%" },
],
```

**Second mock** (inside `"should handle clearWorkforce"` test):

```typescript
// Replace:
benefits: { FSA: "0%", wellness: "N/A", EAP: "N/A" },
retirement: { "401k": "0%" },
insurance: { health: "0%", dental: "0%", vision: "0%", life: "0%" },

// With:
benefits: [
  { name: "FSA",      enrollment: "0%" },
  { name: "Wellness", enrollment: "N/A" },
  { name: "EAP",      enrollment: "N/A" },
],
retirement: [{ name: "401k", enrollment: "0%" }],
insurance: [
  { name: "Health", enrollment: "0%" },
  { name: "Dental", enrollment: "0%" },
  { name: "Vision", enrollment: "0%" },
  { name: "Life",   enrollment: "0%" },
],
```

### 4b. `tests/store/workforceSelectors.test.ts` — ONE mock object

In the `mockWorkforceData` constant:

```typescript
// Replace:
benefits: { FSA: "31%", wellness: "N/A", EAP: "N/A" },
retirement: { "401k": "64%" },
insurance: { health: "78%", dental: "65%", vision: "60%", life: "45%" },

// With:
benefits: [
  { name: "FSA",      enrollment: "31%" },
  { name: "Wellness", enrollment: "N/A" },
  { name: "EAP",      enrollment: "N/A" },
],
retirement: [{ name: "401k", enrollment: "64%" }],
insurance: [
  { name: "Health", enrollment: "78%" },
  { name: "Dental", enrollment: "65%" },
  { name: "Vision", enrollment: "60%" },
  { name: "Life",   enrollment: "45%" },
],
```

### 4c. `tests/services/workforceApi.test.ts` — ONE mock object

In the `mockWorkforceResponse` constant:

```typescript
// Replace:
benefits: { FSA: "31%", wellness: "N/A", EAP: "N/A" },
retirement: { "401k": "64%" },
insurance: { health: "78%", dental: "65%", vision: "60%", life: "45%" },

// With:
benefits: [
  { name: "FSA",      enrollment: "31%" },
  { name: "Wellness", enrollment: "N/A" },
  { name: "EAP",      enrollment: "N/A" },
],
retirement: [{ name: "401k", enrollment: "64%" }],
insurance: [
  { name: "Health", enrollment: "78%" },
  { name: "Dental", enrollment: "65%" },
  { name: "Vision", enrollment: "60%" },
  { name: "Life",   enrollment: "45%" },
],
```

---

## Step 5: Quality Gate

```bash
# 1. TypeScript — must pass with zero errors
pnpm run type-check

# 2. Lint and format
pnpm lint:fix
pnpm format

# 3. Tests — all must pass
pnpm test
```

**Expected**: All type errors from steps 1-4 gone. All tests pass. No new errors introduced.

---

## Checklist

- [ ] `src/types/workforceTypes.ts` — `EnrollmentItem` added, `Participation` updated, old 3 interfaces removed
- [ ] `src/hooks/useWorkforceParticipationConfig.tsx` — 3 `useMemo` blocks use `.map()`, EAP tooltip removed
- [ ] `src/store/slices/workforceSlice.ts` — `STATIC_WORKFORCE_DATA.participation` uses array format
- [ ] `tests/store/workforceSlice.test.ts` — both mock objects updated (2 changes)
- [ ] `tests/store/workforceSelectors.test.ts` — `mockWorkforceData` updated
- [ ] `tests/services/workforceApi.test.ts` — `mockWorkforceResponse` updated
- [ ] `pnpm run type-check` passes
- [ ] `pnpm test` passes
