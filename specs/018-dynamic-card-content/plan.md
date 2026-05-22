# Implementation Plan: Dynamic Proven Strategy Card Content

**Branch**: `018-dynamic-card-content` | **Date**: 2026-04-21 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/018-dynamic-card-content/spec.md`

## Summary

The three proven-strategy cards in `CoreBenefitsEnhancement.tsx` must display two flag-driven attributes in addition to the already-working background color: (1) a `titleIcon` — `LikeIcon` when the card's flag is `true`, `UserGroupIcon` when `false`; (2) a `descriptionText` — static for `nonElectiveMatch` and `autoEnroll`, flag-dependent for `healthcareAffordability`. Currently both `titleIcon` and `descriptionText` are hardcoded in the static `provenStrategiesCardsConfig` array and are not connected to `provenStrategyFlags`. The fix removes `titleIcon` from the config, adds an optional `descriptionTextFlagTrue` for the healthcare card, and resolves both attributes at render time in the `.map()` callback.

## Technical Context

**Language/Version**: TypeScript 5 / React 19  
**Primary Dependencies**: React, Tailwind CSS v4, Vitest, React Testing Library  
**Storage**: N/A  
**Testing**: Vitest + React Testing Library (`npx vitest run tests/pages/CoreBenefitsEnhancement.test.tsx`)  
**Target Platform**: Web SPA (Vite, client-side routing)  
**Project Type**: Web (single Vite project under `src/`)  
**Performance Goals**: Render-only change — no measurable perf impact  
**Constraints**: No new imports; no state changes; no API calls; no prop interface changes on `CoreBenefitsEnhancementProps`  
**Scale/Scope**: Single component, one source file modified, two icon files patched

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design._

| Principle                       | Status  | Notes                                                                            |
| ------------------------------- | ------- | -------------------------------------------------------------------------------- |
| I. Component-First Architecture | ✅ Pass | Change contained within one existing component; single responsibility maintained |
| II. User-Centric Design         | ✅ Pass | Two prioritized user stories (P1, P2) with acceptance criteria                   |
| III. Test-Driven Development    | ✅ Pass | 7 tests in new `CoreBenefitsEnhancement.test.tsx` written before implementation  |
| IV. Type Safety & Code Quality  | ✅ Pass | Interface simplified; `ComponentType` import removed; no `any` types             |
| V. Performance & Accessibility  | ✅ Pass | Pure render change; no perf regression                                           |
| VI. State Management Discipline | ✅ Pass | No new state; all data flows via existing `provenStrategyFlags` prop             |

**Post-design re-check**: All gates pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/018-dynamic-card-content/
├── plan.md                  ← this file
├── research.md              ← Phase 0 output (complete)
├── data-model.md            ← Phase 1 output (complete)
├── quickstart.md            ← Phase 1 output (complete)
└── tasks.md                 ← Phase 2 output (/speckit.tasks — not yet generated)
```

### Source Code (repository root)

```text
src/
├── assets/icons/
│   ├── likeIcon.tsx             ← PATCH: add data-testid="like-icon" to root <span>
│   └── UserGroupIcon.tsx        ← PATCH: add data-testid="user-group-icon" to root <span>
└── pages/recommendations/
    └── CoreBenefitsEnhancement.tsx  ← MODIFY: interface, config, render

tests/
└── pages/
    └── CoreBenefitsEnhancement.test.tsx  ← CREATE: 7 TDD tests (icons + descriptions)
```

**Structure Decision**: Web SPA — single Vite project. Three files modified, one created. No new directories needed.

## Complexity Tracking

No constitution violations. Minimal, self-contained render change across two user stories.
