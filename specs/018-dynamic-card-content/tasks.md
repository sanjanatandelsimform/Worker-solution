# Tasks: Dynamic Proven Strategy Card Content

**Branch**: `018-dynamic-card-content`  
**Input**: Design documents from `/specs/018-dynamic-card-content/`  
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ quickstart.md ✅

**Organization**: Two independently deliverable user stories preceded by shared foundational tasks (test selector setup). TDD required — tests must be written and confirmed FAILING before implementation.

---

## Format: `[ID] [P?] [Story?] Description with file path`

- **[P]**: Parallelizable (independent files, no dependency on incomplete tasks)
- **[US1]**: Flag-Driven Icon Per Card (P1)
- **[US2]**: Flag-Driven Description for Healthcare Affordability (P2)

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Add `data-testid` attributes to both icon components so test assertions have stable selectors. Both icons currently render only `<span className="custom-icon">` with no distinguishing test attribute. These tasks MUST complete before the test file can be written.

**⚠️ CRITICAL**: The test file (T003) cannot be correctly written without these selectors.

- [x] T001 [P] Add `data-testid="like-icon"` to the root `<span>` in `src/assets/icons/likeIcon.tsx`
- [x] T002 [P] Add `data-testid="user-group-icon"` to the root `<span>` in `src/assets/icons/UserGroupIcon.tsx`

**Checkpoint**: Both icon components have stable `data-testid` selectors — test file authoring can begin.

---

## Phase 2: User Story 1 - Flag-Driven Icon Per Card (Priority: P1) 🎯 MVP

**Goal**: Each proven-strategy card's title icon reflects its individual `provenStrategyFlags` value — `LikeIcon` when `true`, `UserGroupIcon` when `false` or absent.

**Independent Test**: Render `CoreBenefitsEnhancement` with all-false, all-true, and mixed flag combinations; assert correct `data-testid` icon counts.

### Tests for User Story 1 ⚠️ Write FIRST — verify they FAIL before implementation

- [x] T003 [US1] Create `tests/pages/CoreBenefitsEnhancement.test.tsx` — add `describe("icon per flag")` block with 3 tests: (a) all-false → 3×user-group-icon, 0×like-icon; (b) all-true → 3×like-icon, 0×user-group-icon; (c) mixed (nonElectiveMatch=true, others=false) → 1×like-icon, 2×user-group-icon. Confirm all 3 tests FAIL before proceeding.

### Implementation for User Story 1

- [x] T004 [US1] In `src/pages/recommendations/CoreBenefitsEnhancement.tsx`: remove `import type { ComponentType } from "react"`; remove `titleIcon` field from `ProvenCardConfig` interface; remove `titleIcon` entries from all three objects in `provenStrategiesCardsConfig`
- [x] T005 [US1] In `src/pages/recommendations/CoreBenefitsEnhancement.tsx`: update the `.map()` render to derive `titleIcon` from flag — `flag ? <LikeIcon /> : <UserGroupIcon />`; extract `flag` into a local const for readability. Verify T003 tests now PASS.

**Checkpoint**: All 3 icon tests pass. Background color and description text are visually unchanged. US1 fully functional and independently testable.

---

## Phase 3: User Story 2 - Flag-Driven Description for Healthcare Affordability (Priority: P2)

**Goal**: The `healthcareAffordability` card shows a positive confirmation description when its flag is `true`, and an actionable recommendation when `false`. The other two cards always show their original descriptions.

**Independent Test**: Render with `healthcareAffordability` flag true and false; assert each expected description string appears. Also confirm `nonElectiveMatch` and `autoEnroll` show their static descriptions in both flag states.

### Tests for User Story 2 ⚠️ Write FIRST — verify they FAIL before implementation

- [x] T006 [US2] Add `describe("description per flag")` block to `tests/pages/CoreBenefitsEnhancement.test.tsx` with 4 tests: (a) nonElectiveMatch static desc (rerender with flag=true, assert same text); (b) autoEnroll static desc (rerender with flag=true, assert same text); (c) healthcareAffordability flag=false shows "Consider adjusting…"; (d) healthcareAffordability flag=true shows "Your employee-only premium…". Confirm all 4 new tests FAIL before proceeding.

### Implementation for User Story 2

- [x] T007 [US2] In `src/pages/recommendations/CoreBenefitsEnhancement.tsx`: update `ProvenCardConfig` interface — make `descriptionText` required (remove `?`), add optional `descriptionTextFlagTrue?: string`; add `descriptionTextFlagTrue` to the `healthcareAffordability` config entry with the flag=true string; update the `.map()` render to resolve `descriptionText` as `flag && card.descriptionTextFlagTrue ? card.descriptionTextFlagTrue : card.descriptionText`. Verify all 7 tests now PASS.

**Checkpoint**: All 7 tests pass (3 icon + 4 description). Background color, card count, and layout unchanged. Both user stories fully functional.

---

## Phase 4: Polish & Quality Gate

**Purpose**: Type-check, lint, format, full test suite — confirm zero regressions.

- [x] T008 Run full quality gate: `pnpm run type-check` (must exit 0); `pnpm lint:fix`; `pnpm format`; `npx vitest run tests/pages/CoreBenefitsEnhancement.test.tsx tests/store tests/services tests/hooks tests/utils` (all must pass)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — start immediately; T001 and T002 are fully parallel
- **US1 Tests (T003)**: Depends on T001 + T002 (needs `data-testid` selectors)
- **US1 Implementation (T004, T005)**: T003 must exist and FAIL first (TDD); T004 before T005 (same file)
- **US2 Tests (T006)**: Depends on T005 (component file exists with updated interface for accurate failure messages)
- **US2 Implementation (T007)**: T006 must exist and FAIL first (TDD)
- **Polish (T008)**: Depends on T007 (all implementation complete)

### Dependency Graph

```
T001 ──┐
       ├──▶ T003 (RED) ──▶ T004 ──▶ T005 (GREEN) ──▶ T006 (RED) ──▶ T007 (GREEN) ──▶ T008
T002 ──┘
```

### User Story Dependencies

- **US1 (P1)**: Can be delivered independently — no dependency on US2
- **US2 (P2)**: Best implemented after US1 (T005) since both stories touch the same file; T006 tests are easier to write once the interface change from T004 is in place

### Parallel Opportunities

- **T001 + T002**: Fully parallel (different files, identical change pattern)
- All other tasks are sequential within each story to maintain TDD discipline

---

## Parallel Example: Foundational Phase

```bash
# T001 and T002 can be done simultaneously:

# Edit src/assets/icons/likeIcon.tsx
# <span className={...}>  →  <span data-testid="like-icon" className={...}>

# Edit src/assets/icons/UserGroupIcon.tsx
# <span className={...}>  →  <span data-testid="user-group-icon" className={...}>
```

---

## Implementation Notes (from quickstart.md + data-model.md)

### T004 + T005 combined render (`.map()` callback after both tasks)

```tsx
{
  provenStrategiesCardsConfig.map(card => {
    const flag = provenStrategyFlags[card.id as keyof typeof provenStrategyFlags];
    return (
      <ProvenStrategiesCard
        key={card.id}
        title={card.title}
        titleIcon={flag ? <LikeIcon /> : <UserGroupIcon />}
        descriptionText={
          flag && card.descriptionTextFlagTrue ? card.descriptionTextFlagTrue : card.descriptionText
        }
        className={flag ? "bg-ws-success-25" : "bg-ws-warning-50"}
      />
    );
  });
}
```

### T007 config addition for `healthcareAffordability`

```typescript
{
  id: "healthcareAffordability",
  title: "Healthcare affordability",
  descriptionText:
    "Consider adjusting employee premiums to income level. QSEHRA and ICHRA plans can offer more flexibility and savings for employers and employees.",
  descriptionTextFlagTrue:
    "Your employee-only premium contribution to earnings average is below 11%, which is a positive indicator of healthcare affordability. (IRS affordability is 9.96%)",
},
```

---

## Suggested MVP Scope

**US1 alone (T001–T005 + T008)** is a complete, independently deployable MVP delivering the icon change. US2 (T006–T007) adds the description enhancement and can be delivered in the same PR or a follow-up.

| Metric                 | Value                      |
| ---------------------- | -------------------------- |
| Total tasks            | 8                          |
| Foundational tasks     | 2 (T001–T002)              |
| US1 tasks              | 3 (T003–T005)              |
| US2 tasks              | 2 (T006–T007)              |
| Polish tasks           | 1 (T008)                   |
| Total TDD tests        | 7 (3 icon + 4 description) |
| Parallel opportunities | 1 (T001 ∥ T002)            |
