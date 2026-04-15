# Contracts: Refactor WorkforcePage into Smaller Modules

**Feature**: `010-refactor-workforce-page`  
**Branch**: `009-workforce-tab-api`  
**Phase**: Phase 1 — Design  
**Date**: 2026-04-15

---

## Scope Note

This feature is a **pure structural refactoring** of the frontend. It introduces:

- No new API endpoints
- No new Redux actions, selectors, or state shapes
- No new HTTP requests

The existing API contract is defined by:

- `src/types/workforceTypes.ts` — workforce API response shapes
- `src/store/slices/workforceSlice.ts` — Redux slice and `fetchWorkforce` thunk
- `src/store/selectors/workforceSelectors.ts` — typed selectors

No changes to the above files are in scope for `010-refactor-workforce-page`.

---

## Internal Component Contracts

Rather than HTTP/GraphQL contracts, the relevant contracts here are the **TypeScript prop interfaces** between the parent orchestrator and each section component. These are the module boundary contracts.

All contracts are fully defined in [`data-model.md`](../data-model.md).

| Module                   | Contract (Props Interface)                                     |
| ------------------------ | -------------------------------------------------------------- |
| `WorkforceOverview`      | `WorkforceOverviewProps` in `data-model.md §3`                 |
| `WorkforceParticipation` | `WorkforceParticipationProps` in `data-model.md §4`            |
| `WorkforceDemographics`  | `WorkforceDemographicsProps` in `data-model.md §5`             |
| `WorkforceCompensation`  | `WorkforceCompensationProps` in `data-model.md §6`             |
| `workforceUtils.ts`      | `parsePercentage(value: string): number` in `data-model.md §1` |

---

## Stability Guarantee

The external contract of `WorkforcePage` (its default export and file path) does not change. Any code that imports `WorkforcePage` — including the router at `src/routes/index.tsx` — continues to work without modification.
