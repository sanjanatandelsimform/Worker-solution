# Feature Specification: Refactor WorkforcePage into Smaller Modules

**Feature Branch**: `009-workforce-tab-api`  
**Created**: 2026-04-15  
**Status**: Draft  
**Input**: User description: "WorkforcePage.tsx is very long. Break it down into smaller parts. Move each section into a separate module. Code, functionality, logic and behavior must not change."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Develop and Maintain Workforce Page Sections (Priority: P1)

A developer who navigates to the `WorkforcePage` codebase currently faces a 1,100+ line file that mixes skeleton loaders, config arrays, section JSX, and the main component into one file. After this refactoring, each logical section of the page lives in its own file, making it straightforward to locate, read, and modify any specific area without scrolling through unrelated code.

**Why this priority**: The page is actively being developed under branch `009-workforce-tab-api`. Large monolithic files slow down code review, increase merge conflicts, and make individual section changes harder to isolate. This is the foundational improvement that all future development on the workforce page depends on.

**Independent Test**: The developer can navigate to `src/pages/workforce/` and immediately identify which file corresponds to which visible section of the Workforce page (Overview, Participation, Demographics, Compensation). Each file can be opened and understood without reading the entire page.

**Acceptance Scenarios**:

1. **Given** the workforce page renders correctly before refactoring, **When** the same page is loaded after refactoring, **Then** the page renders identically — same layout, same data, same interactive behavior.
2. **Given** a developer wants to change the Demographics section, **When** they look in `src/pages/workforce/`, **Then** they find a file named `WorkforceDemographics.tsx` containing only demographics-related JSX and config.
3. **Given** the page is in a loading state, **When** each section loads, **Then** the same skeleton placeholders appear as before — no visual regressions.

---

### User Story 2 - Skeleton Loaders Consolidated (Priority: P2)

Skeleton loading components for the workforce page are currently defined inline at the top of `WorkforcePage.tsx`. After refactoring they are grouped in a single dedicated file.

**Why this priority**: Skeleton components are shared across multiple section modules and must be moved before the sections themselves can be split out.

**Independent Test**: All skeleton components (`OverviewCardSkeleton`, `WagesCardSkeleton`, `ProgressCardSkeleton`, etc.) can be imported from a single file and render identically to before.

**Acceptance Scenarios**:

1. **Given** any section is in loading state, **When** the skeleton file is imported by the section module, **Then** the same animated placeholder UI renders without changes.
2. **Given** a developer searches for `ProgressCardSkeleton`, **When** they look in `src/pages/workforce/`, **Then** they find it in `WorkforceSkeletons.tsx`.

---

### User Story 3 - No Behavioral or Visual Regressions (Priority: P1)

Every interactive element — department dropdowns, employment type selector, table filtering, modal trigger — works exactly as before after the refactoring.

**Why this priority**: This is a structural refactor only. Any behavioral change is a defect.

**Independent Test**: All existing acceptance scenarios for the Workforce page pass without modification.

**Acceptance Scenarios**:

1. **Given** a user selects a department in the Demographics section, **When** the dropdown value changes, **Then** the donut charts and the employment type breakdown update to reflect the selected department — same as before.
2. **Given** a user selects a specific department in the Compensation / Workforce Breakdown dropdown, **When** the selection changes, **Then** the table columns and rows switch from department view to job-title view — same as before.
3. **Given** a user selects an employment type filter (Full Time / Part Time / Seasonal), **When** the selection changes, **Then** the age breakdown bar chart updates — same as before.

---

### Edge Cases

- What happens when a section module receives `undefined` or `null` data (Redux selectors return `undefined` during initial load)? → Same defensive `?? "--"` and `?? []` fallbacks already in place must be preserved in the extracted modules.
- What happens if the shared `parsePercentage` helper is needed by multiple modules? → It must be extracted to a shared location accessible to all section modules without duplication.
- How does state that spans sections (e.g., `isGetInTouchModalOpen`) get managed? → State that is only used within a single section module can be lifted into that module; state shared across sections remains in the parent `WorkforcePage`.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The `WorkforcePage.tsx` file MUST be reduced in size by extracting at minimum 4 distinct section components into separate `.tsx` files in `src/pages/workforce/`.
- **FR-002**: All 8 skeleton components currently defined at the top of `WorkforcePage.tsx` MUST be moved to a single file named `WorkforceSkeletons.tsx` in the same directory.
- **FR-003**: The `parsePercentage` helper function defined inside `WorkforcePage` MUST be extracted to `src/pages/workforce/workforceUtils.ts`, co-located with the workforce section modules. It MUST NOT be duplicated across any section file.
- **FR-004**: The Overview section (workforce summary cards + "Did you know?" banner) MUST be extracted into `WorkforceOverview.tsx`.
- **FR-005**: The Participation Breakdown section (participation cards + ProgressCard rows) MUST be extracted into `WorkforceParticipation.tsx`.
- **FR-006**: The Demographics section (gender cards, employment type donut charts, age breakdown) MUST be extracted into `WorkforceDemographics.tsx`, receiving `selectedDepartment`, `setSelectedDepartment`, `selectedEmploymentType`, and `setSelectedEmploymentType` as props.
- **FR-007**: The Compensation section (salary cards, workforce breakdown table, benefits cost breakdown, salary chart, benefits cost table) MUST be extracted into `WorkforceCompensation.tsx`, receiving `selectedWorkforceDept` and `setSelectedWorkforceDept` as props.
- **FR-008**: The refactored `WorkforcePage.tsx` MUST remain the top-level orchestrating component, managing all shared state and Redux selector calls, computing all config arrays from Redux data, and passing the computed config arrays plus callbacks down to section components as typed props. Section components MUST be purely presentational (no direct Redux selector imports).
- **FR-009**: Every section component MUST accept an `isLoading` (or equivalent) prop to control whether it renders its skeleton or live data — behaviour matching the existing `isLoadingCards` logic.
- **FR-010**: All TypeScript interface definitions that are local to a section (e.g., `StaticCardOverviewConfig`, `ParticipationCardConfig`, `DonutChartConfig`) MUST be defined inline in the section `.tsx` file that owns and uses them. `workforceUtils.ts` MUST contain only `parsePercentage` and no interface definitions.
- **FR-011**: Config arrays that are computed from Redux data (e.g., `overviewCardsConfig`, `participationCardsConfig`) MUST be computed in the parent (`WorkforcePage`) and passed to each section component as typed props. Section components MUST NOT import Redux selectors directly; they consume all data exclusively through props.
- **FR-012**: No new Redux selectors, new API calls, or new state management patterns MUST be introduced as part of this refactoring.
- **FR-013**: All imports in every extracted file MUST use the `@/` path alias (not relative `../../..` paths), consistent with the project's import conventions.
- **FR-014**: Each extracted section component MUST have a default export (to keep lazy-loading compatibility if needed in the future).
- **FR-015**: The footer disclaimer text and `GetInTouchModal` component anchored at the bottom of the page MUST remain in `WorkforcePage.tsx`.

### Key Entities

- **WorkforcePage**: Parent orchestrator. Holds shared state (`selectedDepartment`, `selectedWorkforceDept`, `selectedEmploymentType`, `isGetInTouchModalOpen`), all Redux selector calls, and renders section modules.
- **WorkforceSkeletons**: Stateless file exporting all skeleton loading components for the workforce page.
- **WorkforceOverview**: Section component rendering the 4 overview stat cards and the "Did you know?" banner. Receives loading state and workforce/employee config data.
- **WorkforceParticipation**: Section component rendering participation count cards and the three ProgressCard rows (Benefits, Retirement, Insurance).
- **WorkforceDemographics**: Section component rendering gender cards, employment type donut charts, and the age breakdown chart. Receives department and employment-type filter state.
- **WorkforceCompensation**: Section component rendering compensation stat cards, workforce breakdown table, benefits cost cards, salary chart and benefits cost table. Receives workforce department filter state.
- **parsePercentage**: Shared utility function — strips `%` from a string and returns a number, returning `0` for `"N/A"` or invalid input.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: `WorkforcePage.tsx` is reduced from ~1,100 lines to under 150 lines after extraction.
- **SC-002**: Each of the 4 section files (`WorkforceOverview`, `WorkforceParticipation`, `WorkforceDemographics`, `WorkforceCompensation`) is independently readable and contains only the code relevant to its section.
- **SC-003**: The Workforce page in the running application is visually and functionally identical to the pre-refactoring state — verified by loading the page, exercising all dropdowns, and confirming zero visual or interactive regressions.
- **SC-004**: TypeScript type-check (`pnpm run type-check`) passes with zero errors after the refactoring.
- **SC-005**: All existing tests that reference `WorkforcePage` continue to pass after the refactoring without modification (or are updated purely to reflect the new import paths, not new logic).
- **SC-006**: No code is duplicated — each helper function and config type exists in exactly one location.

## Clarifications

### Session 2026-04-15

- Q: Should config arrays computed from Redux data stay in the parent and be passed as props, or move into each section component? → A: Parent (`WorkforcePage`) computes all config arrays from Redux data and passes them as typed props; section components are purely presentational with no direct Redux selector imports.
- Q: Where should the `parsePercentage` helper be placed after extraction? → A: Co-located in `src/pages/workforce/workforceUtils.ts`, scoped to the workforce feature area.
- Q: Should local TypeScript interfaces be defined in each section file or exported from a shared workforce types file? → A: Each interface is defined inline in the section `.tsx` file that owns it; `workforceUtils.ts` contains only `parsePercentage`.

## Assumptions

- The refactoring is a pure structural change. No new features, new data fields, or visual design changes are in scope.
- The existing Redux store, selectors (`workforceSelectors.ts`), and slice (`workforceSlice.ts`) are untouched.
- `SalaryChart.tsx` and `EmployTypeChart.tsx` (DonutChart) already exist as separate files and are not moved.
- `StaticCard`, `ProgressCard`, `Table`, `ProgressBar`, `Select`, and other shared UI components remain in their current locations.
- Section component files live in `src/pages/workforce/` alongside the existing `WorkforcePage.tsx`.
- The `GetInTouchModal` state (`isGetInTouchModalOpen`) is not used in the current JSX (the button that triggers it appears to have been removed) but the modal render call at the bottom must be preserved as-is.
