# Implementation Plan: Dynamic Participation Breakdown Items

**Branch**: `012-participation-dynamic-items` | **Date**: 2026-04-16 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/012-participation-dynamic-items/spec.md`

## Summary

Replace three static enrollment interfaces (`BenefitsEnrollment`, `RetirementEnrollment`, `InsuranceEnrollment`) with a single `EnrollmentItem { name: string; enrollment: string }` interface. Update the `Participation` type so `benefits`, `retirement`, and `insurance` become arrays. Update the one hook that consumes these fields to map arrays instead of accessing property keys. Update static mock data and four test fixtures. **Zero UI or behavioral changes — only the data shape driving the existing UI changes.**

---

## Technical Context

**Language/Version**: TypeScript 5.9.3 + React 19.2.0  
**Primary Dependencies**: Redux Toolkit 2.11.2, Vitest, React Testing Library  
**Storage**: Redux in-memory state (no persistence layer changes)  
**Testing**: Vitest + React Testing Library  
**Target Platform**: Web SPA (Vite + React Router v7)  
**Project Type**: Web application — single `src/` root  
**Performance Goals**: N/A — iterating small arrays (≤10 items per category)  
**Constraints**: TypeScript strict mode; `pnpm run type-check` must pass with zero errors  
**Scale/Scope**: 6 files, type change + hook update + mock data fixtures

---

## Constitution Check

_GATE: All principles evaluated. Re-check post-design (see bottom)._

| Principle                       | Status  | Notes                                                                                       |
| ------------------------------- | ------- | ------------------------------------------------------------------------------------------- |
| I. Component-First Architecture | ✅ PASS | No component changes; `WorkforceParticipation.tsx` already consumes `ProgressItem[]` arrays |
| II. User-Centric Design         | ✅ PASS | Feature spec has user stories, acceptance criteria, priorities                              |
| III. Test-Driven Development    | ✅ PASS | Existing tests updated to new shape; hook logic testable; see Task 5 for hook test          |
| IV. Type Safety & Code Quality  | ✅ PASS | Interface change propagates through TypeScript; strict mode enforced                        |
| V. Performance & Accessibility  | ✅ PASS | No rendering changes; iterations over small arrays; no bundle impact                        |
| VI. State Management Discipline | ✅ PASS | Redux selectors unchanged; state shape updated cleanly via interface change                 |

**Result**: All gates pass. No violations requiring justification.

---

## Project Structure

### Documentation (this feature)

```text
specs/012-participation-dynamic-items/
├── plan.md              ← this file
├── spec.md              ← feature specification
├── research.md          ← Phase 0 findings
├── data-model.md        ← interface changes and file impact
├── quickstart.md        ← step-by-step implementation guide
├── contracts/
│   └── workforce-participation-update.md  ← API contract delta
└── checklists/
    └── requirements.md  ← spec quality checklist
```

### Source Code — files to change

```text
src/
├── types/
│   └── workforceTypes.ts           ← Add EnrollmentItem; update Participation; remove 3 old interfaces
├── hooks/
│   └── useWorkforceParticipationConfig.tsx  ← Replace property-key useMemos with .map() calls
└── store/
    └── slices/
        └── workforceSlice.ts       ← Update STATIC_WORKFORCE_DATA participation to array format

tests/
├── store/
│   ├── workforceSlice.test.ts      ← Update 2 mock participation objects
│   └── workforceSelectors.test.ts  ← Update 1 mock participation object
└── services/
    └── workforceApi.test.ts        ← Update 1 mock participation object
```

**Not changed**: `workforceSelectors.ts`, `WorkforceParticipation.tsx`, `WorkforcePage.tsx`, `workforceApi.ts`, all demographics/compensation/overview files.

---

## Phase 0: Research Summary

All unknowns resolved. See [research.md](./research.md) for full analysis.

| Question                                            | Resolution                                                                      |
| --------------------------------------------------- | ------------------------------------------------------------------------------- |
| Which files access participation sub-fields by key? | Only `useWorkforceParticipationConfig.tsx`. All others pass data transparently. |
| Does `WorkforceParticipation.tsx` need changes?     | No — already receives typed `ProgressItem[]` arrays as props.                   |
| Should EAP tooltip be preserved?                    | No — labels are now dynamic; hardcoded name-matching removed.                   |
| How many test files?                                | 3 files, 4 mock objects total. `WorkforceTab.test.tsx` is unrelated.            |

---

## Phase 1: Design

### Data Model

See [data-model.md](./data-model.md) for complete interface specifications.

**Core change**:

```typescript
// BEFORE
interface BenefitsEnrollment  { FSA: string; wellness: string; EAP: string }
interface RetirementEnrollment { "401k": string }
interface InsuranceEnrollment { health: string; dental: string; vision: string; life: string }

interface Participation {
  ...
  benefits: BenefitsEnrollment;
  retirement: RetirementEnrollment;
  insurance: InsuranceEnrollment;
}

// AFTER
interface EnrollmentItem { name: string; enrollment: string }

interface Participation {
  ...
  benefits: EnrollmentItem[];
  retirement: EnrollmentItem[];
  insurance: EnrollmentItem[];
}
```

### API Contract

See [contracts/workforce-participation-update.md](./contracts/workforce-participation-update.md).

Breaking change: `benefits`, `retirement`, `insurance` fields in the `participation` response object change from objects with fixed keys to arrays of `{ name, enrollment }`. The rest of the response is unchanged.

### Hook Change

`useWorkforceParticipationConfig.tsx` — only file with direct property-key access:

```typescript
// BEFORE: hardcoded property access (3 separate useMemo blocks with fixed items)
const benefitsItems = useMemo(
  () => [
    {
      label: "FSA",
      percentage: parsePercentage(p?.benefits.FSA ?? "0"),
      progressColor: "bg-ws-navy-300",
    },
    {
      label: "Wellness",
      percentage: parsePercentage(p?.benefits.wellness ?? "0"),
      progressColor: "bg-ws-navy-300",
    },
    {
      label: "EAP",
      percentage: parsePercentage(p?.benefits.EAP ?? "0"),
      progressColor: "bg-ws-navy-300",
      tooltip: "...",
    },
  ],
  [p]
);

// AFTER: dynamic map
const benefitsItems = useMemo(
  () =>
    (p?.benefits ?? []).map(item => ({
      label: item.name,
      percentage: parsePercentage(item.enrollment),
      progressColor: "bg-ws-navy-300",
    })),
  [p]
);
```

Same pattern applied to `retirementItems` (color: `bg-ws-light-teal-400`) and `insuranceItems` (color: `bg-ws-light-teal-300`).

---

## Implementation Tasks

> **Note**: Tasks are ordered by dependency. Steps 1–2 cause TypeScript errors; steps 3–6 resolve them. Always run `pnpm run type-check` after step 6 to confirm zero errors.

| #   | Task                                                                            | File                                            | Effort |
| --- | ------------------------------------------------------------------------------- | ----------------------------------------------- | ------ |
| 1   | Add `EnrollmentItem` interface; update `Participation`; remove old 3 interfaces | `src/types/workforceTypes.ts`                   | S      |
| 2   | Update 3 `useMemo` blocks to use `.map()` over arrays                           | `src/hooks/useWorkforceParticipationConfig.tsx` | S      |
| 3   | Update `STATIC_WORKFORCE_DATA.participation` to array format                    | `src/store/slices/workforceSlice.ts`            | S      |
| 4   | Update 2 mock participation objects in slice test                               | `tests/store/workforceSlice.test.ts`            | XS     |
| 5   | Update 1 mock participation object in selectors test                            | `tests/store/workforceSelectors.test.ts`        | XS     |
| 6   | Update 1 mock participation object in API service test                          | `tests/services/workforceApi.test.ts`           | XS     |
| ✓   | Run `pnpm run type-check` — must pass zero errors                               | —                                               | —      |
| ✓   | Run `pnpm test` — all tests must pass                                           | —                                               | —      |

For detailed code snippets for each step, see [quickstart.md](./quickstart.md).

---

## Post-Design Constitution Check

| Principle                       | Status  | Notes                                                                                                  |
| ------------------------------- | ------- | ------------------------------------------------------------------------------------------------------ |
| I. Component-First Architecture | ✅ PASS | Props interface of `WorkforceParticipation` unchanged; component remains purely presentational         |
| II. User-Centric Design         | ✅ PASS | New item names from backend render directly as labels in the existing progress bar UI                  |
| III. Test-Driven Development    | ✅ PASS | Test fixtures updated to new array shape; hook is fully covered by existing tests after fixture update |
| IV. Type Safety & Code Quality  | ✅ PASS | `EnrollmentItem` is a clean, typed replacement; no `any` introduced; type-check gate required          |
| V. Performance & Accessibility  | ✅ PASS | No bundle change; `.map()` on small arrays; no layout/ARIA changes                                     |
| VI. State Management Discipline | ✅ PASS | Selectors unchanged; Redux state shape propagates correctly through TypeScript type hierarchy          |

---

## Quality Gate Sequence

```bash
pnpm run type-check   # Zero TypeScript errors required
pnpm lint:fix         # ESLint auto-fix
pnpm format           # Prettier
pnpm test             # All tests pass
```
