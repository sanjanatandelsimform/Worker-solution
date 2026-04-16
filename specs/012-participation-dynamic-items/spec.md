# Feature Specification: Dynamic Participation Breakdown Items

**Feature Branch**: `012-participation-dynamic-items`  
**Created**: 2026-04-16  
**Status**: Draft  
**Input**: User description: "Under the Participation Breakdown section, the Items under the Benefits, Retirements, Insurance are static as of now, only the value we are fetching from the backend. But Now from the BE any Items can come, we'll fetch the Title and the value both from BE"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Dynamically Populated Participation Items (Priority: P1)

A dashboard user viewing the Participation Breakdown section currently sees fixed labels (FSA, Wellness, EAP, 401k, Health, Dental, Vision, Life) with values from the backend. After this change, both the label names and their enrollment values are driven by whatever the backend returns — if the backend adds a new benefit item or removes one, the UI reflects that automatically without a code change.

**Why this priority**: This is the core business requirement. The static item list is the primary blocker — any new benefit category added on the backend is invisible to users until a frontend release happens.

**Independent Test**: Can be fully tested by examining the rendered Participation Breakdown section and verifying that the displayed item names and their enrollment percentages match the `benefits`, `retirement`, and `insurance` arrays returned by the API, regardless of their content or count.

**Acceptance Scenarios**:

1. **Given** the backend returns a `benefits` array with 3 items (e.g., FSA, Wellness, EAP), **When** the Participation Breakdown section renders, **Then** exactly 3 benefit items appear with the correct names and enrollment values from the response.
2. **Given** the backend returns a `retirement` array with 1 item (e.g., 401k), **When** the section renders, **Then** exactly 1 retirement item appears with the correct name and enrollment value.
3. **Given** the backend returns an `insurance` array with 4 items (Health, Dental, Vision, Life), **When** the section renders, **Then** exactly 4 insurance items appear with names and values matching the response.
4. **Given** the backend returns a `benefits` array with 5 items (an expanded list), **When** the section renders, **Then** all 5 items appear — no hardcoded maximum enforced by the frontend.
5. **Given** the backend returns an empty array for any category, **When** the section renders, **Then** that category displays an empty state or is gracefully omitted rather than throwing an error.

---

### User Story 2 - Consistent Loading and Error States (Priority: P2)

A user who visits the Participation Breakdown section while data is still loading sees the same skeleton placeholders as before. If the API call fails, the same error state is shown.

**Why this priority**: The dynamic data change must not regress the loading UX which users already rely on.

**Independent Test**: The loading skeleton and error state can be verified independently by simulating a slow or failed API response and observing that the Participation section behaves identically to before this change.

**Acceptance Scenarios**:

1. **Given** the workforce data is still loading, **When** the Participation Breakdown section is visible, **Then** the skeleton placeholders render for each participation sub-group — identical to the pre-change behavior.
2. **Given** the API call returns an error, **When** the Participation Breakdown section is visible, **Then** the error state renders correctly — no uncaught exceptions from iterating over null/undefined arrays.

---

### Edge Cases

- What happens when a participation category array (benefits, retirement, or insurance) is empty (`[]`)? → The section renders gracefully with no items for that category; no errors thrown.
- What happens when a category array contains items with a missing or empty `name`? → The item still renders; the name displays as blank or a safe fallback value rather than crashing.
- What happens when a category array contains items with a missing or empty `enrollment` value? → The enrollment field renders as a safe fallback (e.g., `"N/A"`) rather than crashing.
- What happens when the API returns the old object-shaped response (pre-migration)? → Out of scope for this feature; the TypeScript contract is updated to match the new array-based shape only.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The `BenefitsEnrollment`, `RetirementEnrollment`, and `InsuranceEnrollment` TypeScript interfaces in `workforceTypes.ts` MUST be replaced by a single shared interface representing a dynamic enrollment item: `{ name: string; enrollment: string }`.
- **FR-002**: The `benefits`, `retirement`, and `insurance` fields on the `Participation` interface MUST change from fixed-key objects (`{ FSA: string; wellness: string; EAP: string }` etc.) to arrays of the new enrollment item interface (`Array<{ name: string; enrollment: string }>`).
- **FR-003**: The Participation Breakdown UI MUST render each item in the `benefits`, `retirement`, and `insurance` arrays by iterating over them — using the `name` field as the label and the `enrollment` field as the value.
- **FR-004**: The Participation Breakdown UI MUST NOT hardcode any item labels (FSA, Wellness, EAP, 401k, Health, Dental, Vision, Life) — all labels MUST come from the `name` field of each array item.
- **FR-005**: Any parts of the codebase that previously accessed participation items via fixed property keys (e.g., `participation.benefits.FSA`, `participation.retirement["401k"]`, `participation.insurance.health`) MUST be updated to work with the new array structure.
- **FR-006**: The Redux slice (`workforceSlice.ts`), selectors (`workforceSelectors.ts`), and any normalisation or mapping logic that reference the old fixed-key participation fields MUST be updated to reflect the new array-based shape.
- **FR-007**: All TypeScript compilation errors introduced by the type change MUST be resolved — `pnpm run type-check` MUST pass with zero errors.
- **FR-008**: All existing unit tests and integration tests that reference participation items by old fixed property keys (e.g., `benefits.FSA`, `insurance.health`) MUST be updated to use the new array structure.
- **FR-009**: The loading state and error state behavior in the Participation Breakdown section MUST remain unchanged — same skeletons, same error display.
- **FR-010**: The section MUST handle an empty array for any participation category gracefully (no rendering errors, no uncaught exceptions).
- **FR-011**: Mock data used in tests or storybooks MUST be updated to use the new array format so tests remain passing and representative.

### Key Entities

- **EnrollmentItem**: New shared interface representing a single dynamic participation line item — `{ name: string; enrollment: string }`. Replaces `BenefitsEnrollment`, `RetirementEnrollment`, and `InsuranceEnrollment`.
- **Participation**: Updated interface — `benefits`, `retirement`, and `insurance` fields now typed as `EnrollmentItem[]`.
- **WorkforceParticipation / Participation UI component**: Renders benefits, retirement, and insurance rows by iterating over `EnrollmentItem[]` arrays instead of accessing fixed object keys.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: The Participation Breakdown section renders all items returned by the backend for each category (Benefits, Retirement, Insurance) with no hardcoded labels — verified by changing the API mock data and confirming the UI reflects the change without any frontend code modification.
- **SC-002**: `pnpm run type-check` passes with zero TypeScript errors after all interface and call-site changes are applied.
- **SC-003**: All existing tests pass after mock data is updated to the new array format — zero test failures introduced by this change.
- **SC-004**: Adding a new item to any participation category in the mock API (e.g., a 4th benefit called "Pet Insurance") results in that item appearing automatically in the UI without any frontend code change.
- **SC-005**: The Participation Breakdown section loading skeleton and error state are visually identical to the pre-change behavior — confirmed by visual comparison during a slow/failing API scenario.

## Assumptions

- The rest of the `WorkforceResponse` shape (workforce, demographics, compensation) is unchanged by this feature.
- The `retirementEnrollment` and `healthcareEnrollment` string fields on the `Participation` interface (top-level summary percentages) are NOT affected — only the `benefits`, `retirement`, and `insurance` sub-fields are changing.
- The backend is already updated (or will be updated in sync with this frontend change) to return the new array-based response. The frontend TypeScript types will match the new contract shown in the sample response.
- The `WorkforceParticipation.tsx` component (from feature 010) is the primary UI consumer of these types. If that component does not yet exist (010 in progress), changes are applied to whatever component currently renders participation items.
- There is no requirement to preserve backward compatibility with the old object-based shape in the TypeScript interfaces; the types move fully to the new array shape.
- The `name` and `enrollment` fields are always present in each array item per the API contract; the frontend applies defensive rendering but does not need to handle deeply malformed responses.
