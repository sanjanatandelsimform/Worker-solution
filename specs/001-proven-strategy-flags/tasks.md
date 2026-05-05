# Tasks: Dynamic Proven Strategy Flags

**Input**: Design documents from `/specs/001-proven-strategy-flags/`  
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅ | quickstart.md ✅

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create new shared files that all user stories depend on. Must complete before any story work begins.

- [ ] T001 Create `src/types/strategyFlagTypes.ts` — export `StrategyFlagStatus = "green" | "yellow" | "hidden"`
- [ ] T002 Create `src/utils/strategyFlagUtils.ts` — export `normaliseFlag(raw: unknown): StrategyFlagStatus` (unknown/boolean/null → `"hidden"`)
- [ ] T003 [P] Create `tests/utils/strategyFlagUtils.test.ts` — unit tests for `normaliseFlag`: valid values pass through, boolean `true`/`false` → `"hidden"`, `null`/`undefined` → `"hidden"`, unknown string → `"hidden"`

**Checkpoint**: Shared type and utility exist — all downstream type changes can now compile

---

## Phase 2: Foundational (Blocking Type Updates)

**Purpose**: Update type interfaces across the codebase so TypeScript is consistent before selector and component work begins. Both tasks are independent and can run in parallel.

**⚠️ CRITICAL**: No user story implementation can begin until this phase is complete — type errors will cascade otherwise.

- [ ] T004 [P] Update `src/types/recommendationsTypes.ts` — change `autoEnroll`, `nonElectiveMatch`, `healthcareAffordability` from `boolean` to `StrategyFlagStatus` (import from `./strategyFlagTypes`)
- [ ] T005 [P] Update `src/types/workforceTypes.ts` — add `healthcareAffordability?: StrategyFlagStatus` to `WorkforceEnvelope` (import from `./strategyFlagTypes`)

**Checkpoint**: `pnpm run type-check` — expect errors in selectors and components (intentional — they reference the old `boolean` shape); fix those in subsequent phases

---

## Phase 3: User Story 1 — Finch Flow: Split API Sources for Strategy Flags (Priority: P1) 🎯 MVP

**Goal**: Wire `healthcareAffordability` to the Workforce API in the Finch flow and Recommendations API in the manual flow. Compose the final `ProvenStrategyFlags` object in `RecommendationsFinchPage` based on `isConnected`.

**Independent Test**: With Finch connected, mock the Workforce API to return `"green"` for `healthcareAffordability` and the Recommendations API to return `"yellow"`. Verify `provenStrategyFlags.healthcareAffordability` is `"green"` on screen. With manual flow, verify it reads `"yellow"` from Recommendations API instead.

### Implementation for User Story 1

- [x] T006 [US1] Update `src/store/selectors/recommendationsSelectors.ts` — change `selectProvenStrategiesFlags` to return `StrategyFlagStatus` values using `normaliseFlag`; add `normaliseFlag` import from `@/utils/strategyFlagUtils`; update return type annotation from `{ nonElectiveMatch: boolean; autoEnroll: boolean; healthcareAffordability: boolean }` to `{ nonElectiveMatch: StrategyFlagStatus; autoEnroll: StrategyFlagStatus; healthcareAffordability: StrategyFlagStatus }`
- [x] T007 [P] [US1] Add `selectWorkforceHealthcareAffordabilityFlag` selector to `src/store/selectors/workforceSelectors.ts` — reads `state.workforce.data?.workforce.healthcareAffordability` and passes through `normaliseFlag`; import `normaliseFlag` from `@/utils/strategyFlagUtils` and `StrategyFlagStatus` from `@/types/strategyFlagTypes`
- [x] T008 [US1] Update `src/pages/recommendations/RecommendationsFinchPage.tsx` — destructure `isConnected` from `useAssessmentStatus()`; import `selectWorkforceHealthcareAffordabilityFlag` from workforce selectors; rename existing `provenStrategyFlags` selector call to `recommProvenFlags`; add `workforceHealthcareFlag` from new selector; compose final `provenStrategyFlags: ProvenStrategyFlags` object (`autoEnroll` + `nonElectiveMatch` always from `recommProvenFlags`; `healthcareAffordability` = `isConnected ? workforceHealthcareFlag : recommProvenFlags.healthcareAffordability`)
- [x] T009 [US1] Update `tests/store/selectors/recommendationsSelectors.test.ts` — change all `boolean` assertions to `StrategyFlagStatus` string values (`false` → `"hidden"`, `true` → `"green"`); add test: "normalises unrecognised value to hidden" (pass `true` as legacy boolean, expect `"hidden"`)

**Checkpoint**: User Story 1 is complete when the selector returns `StrategyFlagStatus` values and the page correctly composes flags per flow. `pnpm run type-check` must pass for these files.

---

## Phase 4: User Story 2 — Tri-State Flag Visual Rendering (Priority: P1)

**Goal**: `CoreBenefitsEnhancement` renders green cards with green icon for `"green"` flags, yellow cards with yellow icon for `"yellow"` flags, and completely omits cards for `"hidden"` flags.

**Independent Test**: Render `<CoreBenefitsEnhancement>` with `provenStrategyFlags={{ nonElectiveMatch: "hidden", autoEnroll: "green", healthcareAffordability: "yellow" }}`. Assert: "Non-elective match" card is absent from DOM; "Auto Enrollment" card has `bg-ws-success-25` class; "Healthcare affordability" card has `bg-ws-warning-50` class.

### Implementation for User Story 2

- [x] T010 [US2] Update `src/pages/recommendations/CoreBenefitsEnhancement.tsx` — export `ProvenStrategyFlags` interface with `StrategyFlagStatus` fields (replacing the `boolean` interface); import `StrategyFlagStatus` from `@/types/strategyFlagTypes`; update `CoreBenefitsEnhancementProps` to add `visibleFlagsTotal: number`
- [x] T011 [US2] Update card rendering loop in `src/pages/recommendations/CoreBenefitsEnhancement.tsx` — add `if (flag === "hidden") return null;` guard before rendering; replace boolean-based `flag ? <LikeIcon /> : <UserGroupIcon />` with tri-state: `isGreen ? <span className="text-ws-success-600"><LikeIcon /></span> : <span className="text-ws-warning-500"><UserGroupIcon /></span>`; replace `flag ? "bg-ws-success-25" : "bg-ws-warning-50"` with `isGreen ? "bg-ws-success-25" : "bg-ws-warning-50"` (where `isGreen = flag === "green"`)
- [x] T012 [US2] Update `tests/pages/CoreBenefitsEnhancement.test.tsx` — update all `provenStrategyFlags` fixtures from `boolean` to `StrategyFlagStatus` (`true` → `"green"`, `false` → `"yellow"`); add `visibleFlagsTotal` prop to all `render` calls; update icon assertions (all-`"yellow"` → UserGroupIcon × 3, all-`"green"` → LikeIcon × 3, mixed → correct counts)
- [x] T013 [P] [US2] Add hidden-card tests to `tests/pages/CoreBenefitsEnhancement.test.tsx` — new describe block: `"hidden flag hides card"`: (a) `healthcareAffordability: "hidden"` → "Healthcare affordability" absent from DOM; (b) all three `"hidden"` → no card titles in DOM; (c) `nonElectiveMatch: "hidden"` → "Non-elective match" absent

**Checkpoint**: User Story 2 is complete when `CoreBenefitsEnhancement` correctly hides, colours green, or colours yellow each card based on its `StrategyFlagStatus`. All existing and new tests pass.

---

## Phase 5: User Story 3 — Dynamic Total Strategies Count (Priority: P2)

**Goal**: The "Strategies Implemented" counter denominator and progress bar percentage use `visibleFlagsTotal` (count of non-hidden flags) instead of the hardcoded `3`. Division-by-zero is guarded when all flags are `"hidden"`.

**Independent Test**: Render `<CoreBenefitsEnhancement>` with `provenStrategiesCount={1}`, `visibleFlagsTotal={2}`, one flag `"hidden"`. Assert the counter text reads `"1/2"` and the other two cards are visible. Render with `visibleFlagsTotal={0}` and assert no `NaN` appears and the progress bar renders with `value={0}`.

### Implementation for User Story 3

- [x] T014 [US3] Update `src/pages/recommendations/RecommendationsFinchPage.tsx` — replace hardcoded count computation with: `const flagValues = Object.values(provenStrategyFlags); const provenStrategiesCount = flagValues.filter(f => f === "green").length; const visibleFlagsTotal = flagValues.filter(f => f !== "hidden").length; const provenStrategiesPercent = visibleFlagsTotal > 0 ? Math.round((provenStrategiesCount / visibleFlagsTotal) * 100) : 0;`; pass `visibleFlagsTotal` as new prop to `<CoreBenefitsEnhancement>`
- [x] T015 [US3] Update counter text in `src/pages/recommendations/CoreBenefitsEnhancement.tsx` — change `{provenStrategiesCount}/3` → `{provenStrategiesCount}/{visibleFlagsTotal}` in the `<h4>` and the description paragraph `"of 3 benefits"` → `"of {visibleFlagsTotal} benefits"`
- [x] T016 [P] [US3] Update skeleton rendering in `src/pages/recommendations/CoreBenefitsEnhancement.tsx` — replace three hardcoded `<ProvenStrategiesCardsSkeleton />` with `Array.from({ length: visibleFlagsTotal || 3 }).map((_, i) => <ProvenStrategiesCardsSkeleton key={i} />)`
- [x] T017 [P] [US3] Add dynamic-count tests to `tests/pages/CoreBenefitsEnhancement.test.tsx` — new describe block `"dynamic denominator"`: (a) `visibleFlagsTotal={3}` → counter reads `"0/3"`; (b) `visibleFlagsTotal={2}` → counter reads `"1/2"` with `provenStrategiesCount={1}`; (c) `visibleFlagsTotal={0}` → no NaN in rendered output; (d) progress bar receives `value={0}` when `visibleFlagsTotal={0}`

**Checkpoint**: User Story 3 is complete when the counter denominator always equals `visibleFlagsTotal` and no division-by-zero can occur.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Type-check the full graph, fix any callsite regressions, run quality gates.

- [x] T018 Run `pnpm run type-check` across the workspace and fix any remaining TypeScript errors caused by the `boolean` → `StrategyFlagStatus` type change (e.g. any test fixture or mock that still passes a `boolean` to a flag field)
- [x] T019 [P] Run `pnpm lint:fix` then `pnpm format` on all modified files
- [x] T020 [P] Run full test suite `pnpm test` — all tests must pass with 0 failures
- [ ] T021 Smoke-test in dev: `pnpm dev` → navigate to `/dashboard` → Recommendations tab → verify cards show correct colours, hidden card is absent, counter denominator is accurate in both Finch-connected and manual-flow states

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (T001–T003): No dependencies — start immediately
     │
     ▼
Phase 2 (T004–T005): Depends on Phase 1 (T001 must exist for import)
     │
     ▼ (both P1 stories unblock simultaneously)
Phase 3 (T006–T009) ─────────────────────── Phase 4 (T010–T013)
     │                                             │
     │                    Phase 5 (T014–T017): depends on Phase 3 (T008) + Phase 4 (T010/T011)
     │                                             │
     └─────────────────────────────────────────────┘
                          │
                          ▼
                   Phase 6 (T018–T021)
```

### User Story Dependencies

- **US1 (Phase 3)**: Depends only on Phases 1–2. Independent of US2/US3.
- **US2 (Phase 4)**: Depends only on Phases 1–2. Independent of US1 (uses mock props, not selectors).
- **US3 (Phase 5)**: Depends on US1 (T008 for `visibleFlagsTotal` computation) and US2 (T010/T011 for the prop and component).

### Parallel Opportunities Per Phase

**Phase 1**: T001 → T002 (sequential, `strategyFlagUtils` imports from `strategyFlagTypes`); T003 can run after T002

**Phase 2**: T004 and T005 fully parallel (different files)

**Phase 3**: T006 → T007 can run in parallel (different files); T008 depends on T006+T007; T009 can run alongside T008

**Phase 4**: T010 → T011 sequential (same file, T011 builds on T010); T012 can start after T010; T013 can run alongside T012

**Phase 5**: T014 → T015+T016 (T014 adds `visibleFlagsTotal` prop, T015+T016 consume it); T017 alongside T015/T016

---

## Implementation Strategy

**MVP = Phase 1 + Phase 2 + Phase 3 only**

Completing Phases 1–3 delivers a correctly-sourced `ProvenStrategyFlags` object with `StrategyFlagStatus` values flowing through to `CoreBenefitsEnhancement`. The component still renders with the old boolean logic at this point — but the types are correct and the data split is working. This is independently verifiable via the selector tests.

**Full delivery = Phases 1–6**

All three user stories complete, all tests pass, type-check clean.

---

## Format Validation

All tasks follow the required checklist format:

- ✅ Every task starts with `- [ ]`
- ✅ Every task has a sequential `T###` ID
- ✅ `[P]` present only on tasks that touch different files with no outstanding dependencies
- ✅ `[US1]`/`[US2]`/`[US3]` labels on all user-story-phase tasks
- ✅ Every task includes an explicit file path

**Total tasks**: 21  
**By user story**: US1 = 4 tasks (T006–T009) | US2 = 4 tasks (T010–T013) | US3 = 4 tasks (T014–T017)  
**Setup/Foundational**: 5 tasks (T001–T005)  
**Polish**: 4 tasks (T018–T021)  
**Parallel opportunities**: T003, T004, T005, T007, T009, T013, T016, T017, T019, T020
