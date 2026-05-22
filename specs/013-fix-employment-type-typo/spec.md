# Feature Specification: Fix `employmentType` Typo in Workforce API

**Feature Branch**: `013-fix-employment-type-typo`  
**Created**: 2026-04-16  
**Status**: Draft  
**Input**: User description: "Under the workforce API, Whereever we have 'employementType' We need to update it and fix it to 'employmentType'"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Developer Sees Correct Field Name (Priority: P1)

As a developer working with the workforce data model, I want the `employmentType` field name to be spelled correctly so that the codebase is readable, maintainable, and free of misleading typos.

**Why this priority**: The misspelling is present in the TypeScript type definition, static data, hooks, selectors, and tests. Correcting it is the foundational step that must happen before any of the other files can be updated accurately.

**Independent Test**: Can be fully tested by reviewing `src/types/workforceTypes.ts` — the `WorkforceDemographics` interface must declare `employmentType` (not `employementType`), and the TypeScript compiler must report zero errors after the rename.

**Acceptance Scenarios**:

1. **Given** the `WorkforceDemographics` interface in `workforceTypes.ts`, **When** a developer reads the field name, **Then** it is `employmentType` with no extra `e`.
2. **Given** the corrected type, **When** `tsc --noEmit` is run, **Then** it exits with code 0 and no type errors.
3. **Given** any source file that previously referenced `employementType`, **When** the developer searches the `src/` directory for the misspelled string, **Then** zero matches are found.

---

### User Story 2 - All Consuming Code Uses Corrected Name (Priority: P2)

As a developer, I want every hook, selector, static-data block, and test that previously used `employementType` to use `employmentType` instead, so the entire codebase is internally consistent.

**Why this priority**: After the type is fixed, all consumers (hooks, selectors, slice, tests) must be updated together. Leaving any consumer unpatched will produce TypeScript compilation errors or silent runtime mismatches.

**Independent Test**: Can be fully tested by running `pnpm run type-check` and `pnpm run test` after all file edits — both must pass with zero errors.

**Acceptance Scenarios**:

1. **Given** `src/store/slices/workforceSlice.ts` (which contains `STATIC_WORKFORCE_DATA`), **When** a developer inspects the `demographics` object, **Then** the field key is `employmentType`.
2. **Given** `src/hooks/useWorkforceDemographicsConfig.ts`, **When** all property accesses are reviewed, **Then** they reference `demographicsSection?.employmentType` (no extra `e`).
3. **Given** `src/store/selectors/workforceSelectors.ts`, **When** the JSDoc comment for the demographics selector is read, **Then** it states `employmentType` (corrected spelling) and the outdated note about the intentional typo is removed.
4. **Given** all test files under `tests/`, **When** the test suite is run, **Then** no test references `employementType` and all tests pass.

---

### Edge Cases

- What happens when the live API endpoint is connected and the backend still returns `employementType`? The frontend type will no longer match the backend field name, causing runtime data mapping failures for the demographics section. (See Assumptions — this fix assumes the backend is correcting the same typo simultaneously.)
- What if a developer has a local branch that still uses `employementType`? A merge conflict will be raised at the exact locations changed by this fix, making the discrepancy visible and intentional.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The `WorkforceDemographics` TypeScript interface in `src/types/workforceTypes.ts` MUST rename the `employementType` field to `employmentType`.
- **FR-002**: The JSDoc `@note` comment above the field (which stated the typo was intentional) MUST be removed or updated to reflect the corrected spelling.
- **FR-003**: The `STATIC_WORKFORCE_DATA` constant in `src/store/slices/workforceSlice.ts` MUST use `employmentType` as the key in the `demographics` object.
- **FR-004**: `src/hooks/useWorkforceDemographicsConfig.ts` MUST access `demographicsSection?.employmentType` in all three property-access locations.
- **FR-005**: The JSDoc comment in `src/store/selectors/workforceSelectors.ts` that references `employementType` MUST be updated to `employmentType`.
- **FR-006**: All test fixtures in `tests/store/workforceSlice.test.ts`, `tests/services/workforceApi.test.ts`, and `tests/store/workforceSelectors.test.ts` MUST use `employmentType` as the object key.
- **FR-007**: After all changes, `pnpm run type-check` MUST exit with code 0 and report zero TypeScript errors.
- **FR-008**: After all changes, the full test suite MUST pass with no new test failures.

### Key Entities

- **`WorkforceDemographics`**: TypeScript interface representing the demographics section of a workforce API response. Contains the corrected `employmentType` array alongside `gender` and `employmentBreakdownByAge`.
- **`EmploymentTypeEntry`**: TypeScript interface representing a single employment-type record keyed by `department`. Remains unchanged by this feature.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Zero occurrences of the string `employementType` exist anywhere under `src/` after the fix is merged.
- **SC-002**: Zero occurrences of the string `employementType` exist anywhere under `tests/` after the fix is merged.
- **SC-003**: `pnpm run type-check` passes with exit code 0 and no errors after all changes are applied.
- **SC-004**: The existing test suite passes with no regressions (same number of passing tests before and after the rename).

## Assumptions

- The backend API will correct the same typo (`employementType` → `employmentType`) concurrently or prior to the live endpoint being activated. The current frontend still uses static data (`STATIC_WORKFORCE_DATA`), so there is no immediate runtime risk. When the static data block is removed and the live API is enabled, the backend field name must match `employmentType`.
- Spec and documentation files under `specs/009-workforce-tab-api/` that describe the original intentional misspelling are out of scope for this fix; they serve as historical record of the original decision.

# Feature Specification: Fix `employmentType` Typo in Workforce API Contract

**Feature Branch**: `013-fix-employment-type-typo`  
**Created**: 2026-04-16  
**Status**: Draft  
**Input**: User description: "Under the workforce API, wherever we have employementType we need to update it and fix it to employmentType"

## Background

The `demographics` object in the workforce API response contains a field originally named `employementType` — a misspelling of `employmentType`. At the time feature 009 was implemented, this misspelling was intentionally mirrored in the frontend type definitions to match the backend schema exactly.

The backend API contract has now been corrected to use the properly spelled `employmentType`. This feature aligns the frontend to the corrected spelling across all affected files: the data type definition, the Redux slice (static data stub), hooks that read the field, and any selectors or comments referencing it.

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Demographics section renders correctly (Priority: P1)

A developer viewing the Workforce page in a browser expects the Demographics section — including the department dropdown, employment-type donut charts, and age breakdown — to load and display data without errors after the spelling correction is applied.

**Why this priority**: The `employmentType` field is the direct data source for the employment-type donut charts and the department dropdown. If the field name is wrong, the Demographics section silently renders empty or crashes. This is the core risk of a typo-renaming change.

**Independent Test**: Can be fully tested by loading the `/dashboard` → Workforce tab in the browser and confirming that the department dropdown is populated, the employment-type donut charts display percentages, and no console errors referencing `employmentType` or `employementType` appear.

**Acceptance Scenarios**:

1. **Given** the Workforce page is loaded, **When** the Demographics section renders, **Then** the department dropdown shows selectable entries (e.g. "All", "Engineering", "Sales") derived from the corrected `employmentType` array
2. **Given** a department is selected in the dropdown, **When** the selection changes, **Then** the employment-type donut charts update to reflect the matching row in `employmentType` without errors
3. **Given** the corrected field name is in place, **When** a developer inspects the data model and type definitions, **Then** no reference to `employementType` (the misspelling) exists anywhere in the `src/` directory

---

### User Story 2 - Type-safe codebase with no misspelled references (Priority: P2)

A developer working on the workforce feature runs the TypeScript type checker and linter. After this fix, no type errors or warnings related to the renamed field should appear, and no residual `employementType` references should exist in source code.

**Why this priority**: Leaving orphaned misspelled references creates confusion for future contributors and risks silent data mismatch when the live API is connected.

**Independent Test**: Can be fully tested by running the type checker (`pnpm run type-check`) and a codebase grep for `employementType` in `src/` — both must return zero errors / zero matches.

**Acceptance Scenarios**:

1. **Given** the rename is applied, **When** the type checker runs, **Then** it exits with no errors related to the `employmentType` / `employementType` field
2. **Given** the rename is applied, **When** searching `src/` for the string `employementType`, **Then** zero matches are found

---

### Edge Cases

- What if a future live API call still returns `employementType` (backend not yet updated on a particular environment)? The field will be `undefined` at runtime, and the department dropdown and donut charts will fall back to their empty/placeholder states — no crash, but data will be absent until the backend is consistent.
- The static data stub in the Redux slice uses the corrected spelling after this change. If the backend is connected before it is updated, the mismatch will surface silently as missing data (not a crash), which is acceptable and visible during testing.

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The field name `employementType` within the workforce `Demographics` data contract MUST be renamed to `employmentType` in the TypeScript type definition.
- **FR-002**: All source code locations that read or write `employementType` (hooks, selectors, Redux slice static data) MUST be updated to reference `employmentType`.
- **FR-003**: All inline comments that mention `employementType` as an intentional misspelling (created to mirror the backend typo) MUST be updated to reflect that the spelling is now correct and intentional misspelling notes removed.
- **FR-004**: The change MUST be purely a field rename — zero behavioral or visual changes to the Workforce page are permitted.
- **FR-005**: After the change, the TypeScript type checker MUST pass with no new errors introduced by this rename.

### Key Entities

- **WorkforceDemographics** (TypeScript type): Represents the `demographics` section of the workforce API response. Contains the `employmentType` array (corrected spelling), `gender`, and `employmentBreakdownByAge`.
- **EmploymentTypeEntry** (TypeScript type): Represents a single row in the `employmentType` array — keyed by `department`, with `fullTime`, `partTime`, and `seasonal` percentage fields.

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Zero occurrences of `employementType` (the misspelling) remain in the `src/` directory after the change is applied.
- **SC-002**: The TypeScript type checker completes with zero errors after the rename.
- **SC-003**: The Workforce page Demographics section renders identically before and after the change — no visual regression.
- **SC-004**: The department dropdown and employment-type donut charts continue to display the correct data when the page is loaded.

---

## Assumptions

- The backend API has corrected or will correct `employementType` → `employmentType` in its response schema. This frontend change is in anticipation of / alignment with that backend correction.
- While the static data stub is active (live API not yet connected), the corrected spelling in the stub is sufficient to validate that all frontend code paths work correctly.
- Spec and documentation files under `specs/009-workforce-tab-api/` that reference the old typo are treated as historical record and are **not** updated as part of this feature — only `src/` files are in scope.
