# Implementation Plan: Dynamic Proven Strategy Flags

**Branch**: `001-proven-strategy-flags` | **Date**: 2026-05-05 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-proven-strategy-flags/spec.md`

## Summary

Change how `provenStrategyFlags` are sourced and typed. All three flags (`autoEnroll`, `nonElectiveMatch`, `healthcareAffordability`) migrate from `boolean` to a tri-state `StrategyFlagStatus = "green" | "yellow" | "hidden"`. In the Finch flow, `healthcareAffordability` is sourced from the Workforce API (new field); in the manual flow all three come from the Recommendations API. Cards with `"hidden"` are absent from the DOM; `"green"` renders green styling; `"yellow"` renders yellow. The strategies count denominator becomes dynamic (count of non-hidden flags).

## Technical Context

**Language/Version**: TypeScript 5 / React 19  
**Primary Dependencies**: Redux Toolkit (RTK) + `createSelector`, React Testing Library, Vitest  
**Storage**: N/A (frontend only — reads from existing Redux slices)  
**Testing**: Vitest + React Testing Library  
**Target Platform**: Web (Vite SPA)  
**Project Type**: Web application (single frontend)  
**Performance Goals**: No new async operations — pure selector/component changes  
**Constraints**: No `any` types; all new code must pass `pnpm run type-check`; no CSS Modules  
**Scale/Scope**: ~10 files modified/created; 2 new utility files; ~4 test file updates

## Constitution Check

_GATE: Must pass before proceeding._

| Principle                       | Status  | Notes                                                                                                                     |
| ------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------- |
| I. Component-First Architecture | ✅ PASS | `CoreBenefitsEnhancement` remains presentational; new `ProvenStrategyFlags` type exported from it; no prop drilling added |
| II. User-Centric Design         | ✅ PASS | All three user stories have acceptance scenarios in spec                                                                  |
| III. Test-Driven Development    | ✅ PASS | Tests updated for new type shape and hidden-card behaviour; new selector has unit test                                    |
| IV. Type Safety & Code Quality  | ✅ PASS | New `StrategyFlagStatus` literal union; `normaliseFlag` eliminates `any`; no boolean coercion leaks                       |
| V. Performance & Accessibility  | ✅ PASS | `null` return for hidden cards is semantically correct; no layout shifts                                                  |
| VI. State Management Discipline | ✅ PASS | Selectors remain pure; no new slices; Finch/manual composition done in page component, not in selector                    |

**No violations. No complexity tracking required.**

## Project Structure

### Documentation (this feature)

```text
specs/001-proven-strategy-flags/
├── plan.md              ✅ This file
├── research.md          ✅ Phase 0
├── data-model.md        ✅ Phase 1
├── quickstart.md        ✅ Phase 1
├── contracts/
│   ├── recommendation-get.md   ✅ Phase 1
│   └── workforce-get.md        ✅ Phase 1
└── tasks.md             🔜 Phase 2 (/speckit.tasks)
```

### Source Code Changes

```text
src/
├── types/
│   ├── strategyFlagTypes.ts          NEW — StrategyFlagStatus type
│   ├── recommendationsTypes.ts       MODIFY — boolean → StrategyFlagStatus on 3 fields
│   └── workforceTypes.ts             MODIFY — add healthcareAffordability? to WorkforceEnvelope
├── utils/
│   └── strategyFlagUtils.ts          NEW — normaliseFlag() helper
├── store/selectors/
│   ├── recommendationsSelectors.ts   MODIFY — selectProvenStrategiesFlags return type + normalise
│   └── workforceSelectors.ts         MODIFY — add selectWorkforceHealthcareAffordabilityFlag
└── pages/recommendations/
    ├── RecommendationsFinchPage.tsx  MODIFY — isConnected, compose flags, update counts
    └── CoreBenefitsEnhancement.tsx   MODIFY — tri-state type, hidden card, dynamic denominator

tests/
├── pages/
│   └── CoreBenefitsEnhancement.test.tsx  MODIFY — fixtures + new hidden/colour tests
├── store/selectors/
│   └── recommendationsSelectors.test.ts  MODIFY — assert string values + normalisation
└── utils/
    └── strategyFlagUtils.test.ts          NEW — normaliseFlag unit tests
```

## Phase 0: Research Findings

See [research.md](./research.md) for full details. Key resolved decisions:

1. **`StrategyFlagStatus` type** — `"green" | "yellow" | "hidden"` string literal union in `src/types/strategyFlagTypes.ts`
2. **Workforce API field** — `healthcareAffordability?: StrategyFlagStatus` added to `WorkforceEnvelope`; backend populates for Finch flow only; absent value normalises to `"hidden"`
3. **Flag composition** — done in `RecommendationsFinchPage` using `isConnected` from existing `useAssessmentStatus()` call
4. **Dynamic count** — `provenStrategiesCount` = green count; `visibleFlagsTotal` = non-hidden count; percent = `visibleFlagsTotal > 0 ? Math.round(count/total * 100) : 0`
5. **Visual mapping** — `"green"` → `bg-ws-success-25` + LikeIcon (green); `"yellow"` → `bg-ws-warning-50` + UserGroupIcon (yellow); `"hidden"` → `null` (no DOM node)

## Phase 1: Design

### Data Model

See [data-model.md](./data-model.md).

Core changes:

- New: `StrategyFlagStatus = "green" | "yellow" | "hidden"`
- New: `normaliseFlag(raw: unknown): StrategyFlagStatus` utility
- Updated: `RecommendationData.autoEnroll/nonElectiveMatch/healthcareAffordability` → `StrategyFlagStatus`
- Updated: `WorkforceEnvelope.healthcareAffordability?` → `StrategyFlagStatus`
- Updated: `ProvenStrategyFlags` interface → three `StrategyFlagStatus` fields
- New: `selectWorkforceHealthcareAffordabilityFlag` selector
- Updated: `selectProvenStrategiesFlags` return type
- New prop: `visibleFlagsTotal: number` on `CoreBenefitsEnhancement`

### API Contracts

- [recommendation-get.md](./contracts/recommendation-get.md) — `autoEnroll`, `nonElectiveMatch`, `healthcareAffordability` now return `"green" | "yellow" | "hidden"` instead of `boolean`
- [workforce-get.md](./contracts/workforce-get.md) — new optional `workforce.healthcareAffordability` field of type `StrategyFlagStatus`

### Implementation Guide

See [quickstart.md](./quickstart.md) for step-by-step code with exact snippets (10 steps, dependency-ordered).

## Post-Design Constitution Check

| Principle                       | Status  | Notes                                                                                      |
| ------------------------------- | ------- | ------------------------------------------------------------------------------------------ |
| I. Component-First Architecture | ✅ PASS | `ProvenStrategyFlags` exported from `CoreBenefitsEnhancement` for reuse                    |
| III. Test-Driven Development    | ✅ PASS | `strategyFlagUtils.test.ts` and updated `CoreBenefitsEnhancement.test.tsx` cover new paths |
| IV. Type Safety                 | ✅ PASS | `normaliseFlag` eliminates all unknown→StrategyFlagStatus coercion points                  |
| VI. State Management Discipline | ✅ PASS | No new Redux slices; selector added per single-responsibility rule                         |

**All gates pass post-design.**
