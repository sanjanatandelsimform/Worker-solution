# Feature Specification: Replace Hardcoded State Options with Live API Integration

**Feature Branch**: `001-states-api-integration`  
**Created**: 11 March 2026  
**Status**: Draft  
**Input**: User description: "Replace Hardcoded State Options with Live API Integration"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - States Load Dynamically on Form Mount (Priority: P1)

When a user reaches the assessment form, the state options presented for the
`topWorkLocations` and `employeeLivingZipCodes` questions are sourced from a
live lookup service rather than a bundled static list. Any change to the
available states on the server side is reflected automatically without requiring
a new application release.

**Why this priority**: This is the core deliverable. Without it, the remaining
stories have no value.

**Independent Test**: Open the assessment form, navigate to either the
`topWorkLocations` or `employeeLivingZipCodes` question, and confirm that the
displayed state list matches the values returned by the states lookup service.

**Acceptance Scenarios**:

1. **Given** the assessment form is loading, **When** the page finishes
   mounting, **Then** the system requests the state list from the lookup
   service exactly once.
2. **Given** the lookup service returns a list of states, **When** the user
   opens the `topWorkLocations` question, **Then** every option shows
   `stateName` as the display label and stores `stateAbbreviation` as the
   selected value.
3. **Given** the lookup service returns a list of states, **When** the user
   opens the `employeeLivingZipCodes` question, **Then** every option shows
   `stateName` as the display label and stores `stateAbbreviation` as the
   selected value.
4. **Given** the user has selected state options and submits the form,
   **Then** `stateAbbreviation` values (alongside `stateName`) are persisted
   exactly as they were before this change, with no difference in submission
   payload shape.

---

### User Story 2 - Single Fetch, No Redundant Calls (Priority: P2)

The states list is fetched once when the form mounts. Navigating between
questions, scrolling, or re-rendering individual question components does not
trigger additional network requests.

**Why this priority**: Redundant calls waste bandwidth and can cause
rate-limiting issues; this constraint is explicitly required by the feature
description.

**Independent Test**: Open the assessment form and interact with multiple
questions (including switching between `topWorkLocations` and
`employeeLivingZipCodes`); inspect network activity and confirm that the
states lookup endpoint is called exactly once per form session.

**Acceptance Scenarios**:

1. **Given** the assessment form is already mounted, **When** the user
   navigates away from one question and back to `topWorkLocations` or
   `employeeLivingZipCodes`, **Then** no new request to the states lookup
   endpoint is made.
2. **Given** the form re-renders due to user interaction on any other
   question, **When** the re-render completes, **Then** the states request
   count remains at one.

---

### User Story 3 - Graceful Degradation When API Is Unavailable (Priority: P3)

If the states lookup service cannot be reached or returns an error, the rest of
the assessment form remains fully functional. The two affected questions display
a clear, user-friendly indication that state options are temporarily unavailable,
and the user can continue with all other questions.

**Why this priority**: The failure path is important for resilience but does
not block the primary value delivery.

**Independent Test**: Simulate a states API failure (e.g., via network
blocking), open the assessment form, and confirm other questions are unaffected
while the state-selection questions show an appropriate unavailable/error state.

**Acceptance Scenarios**:

1. **Given** the states lookup service returns an error, **When** the
   assessment form finishes loading, **Then** the `topWorkLocations` and
   `employeeLivingZipCodes` questions display a message indicating that state
   options are temporarily unavailable.
2. **Given** the states lookup service is unavailable, **When** the user
   interacts with any other question, **Then** all other questions function
   normally with no degraded behavior.

---

### Edge Cases

- What happens when the API returns an empty `states` array? → **Resolved**: treated the same as an API error; "state options unavailable" message shown.
- What happens when the API response is delayed (slow network)? → **Resolved**: state select is disabled with a "Loading states..." placeholder; the zip code field remains usable during the wait.
- What happens if the API returns a state that was previously stored in the user's session from the hardcoded list but is no longer in the live list?
- How does the system handle a partial API response (malformed JSON or missing fields on individual state entries)? → **Resolved**: malformed entries are silently skipped; only entries with both `stateAbbreviation` and `stateName` are included. If all entries are malformed (resulting in an empty valid list), the empty-array rule applies (treated as error).

## Clarifications

### Session 2026-03-11

- Q: Where should the API response shape (`stateAbbreviation`/`stateName`) be transformed to the existing component option shape (`id`/`label`)? → A: At the service/hook layer — map `{ id: stateAbbreviation, label: stateName }` so existing question renderers and types remain unchanged.
- Q: How should the UI handle an empty `states` array from a successful API response? → A: Treat it the same as an API error — show "state options unavailable" on the two affected dropdowns.
- Q: How should the state-select dropdowns behave while the states API call is in-flight? → A: Disable the state select with a "Loading states..." placeholder; the zip code field remains usable.
- Q: How should the system handle individual malformed entries (missing `stateAbbreviation` or `stateName`) in an otherwise valid API response? → A: Skip malformed entries silently; include only entries that have both fields present.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST fetch state options from the states lookup
  service exactly once when the assessment form mounts.
- **FR-002**: The `topWorkLocations` question MUST populate its selectable
  options exclusively from the live states lookup response after this change.
- **FR-003**: The `employeeLivingZipCodes` question MUST populate its
  selectable options exclusively from the live states lookup response after
  this change.
- **FR-004**: The API response MUST be transformed at the service/hook layer
  to the existing `{ id, label }` option format (`id` = `stateAbbreviation`,
  `label` = `stateName`) so that question renderers consume the same shape
  they already expect. No component-level type changes are permitted.
- **FR-005**: The states lookup MUST NOT be called on a per-question-render
  basis; it MUST be called once and its result shared across both questions.
- **FR-006**: All questions other than `topWorkLocations` and
  `employeeLivingZipCodes` MUST continue to source their options from the
  existing static data without any modification to structure or content.
- **FR-007**: Existing form submission logic, field validation rules, and
  state management (store shape, actions, selectors) MUST remain unchanged.
- **FR-008**: When the states lookup service is unavailable, returns an
  error, or returns an empty `states` array, the two affected questions MUST
  display an appropriate "state options unavailable" indication while all
  other questions remain fully functional.
- **FR-009**: The static `questionData.json` file MUST NOT have any fields
  removed or restructured; only the runtime option source for the two
  specified questions changes.
- **FR-010**: While the states lookup call is in-flight, the state select
  dropdown MUST be disabled and display a "Loading states..." placeholder.
  Other fields within the same question (e.g., zip code) MUST remain
  usable during this time.
- **FR-011**: During transformation, individual state entries missing either
  `stateAbbreviation` or `stateName` MUST be silently skipped. Only entries
  containing both fields are included in the options list. If all entries
  are malformed (resulting in zero valid options), the empty-array rule
  (FR-008) applies.

### Key Entities

- **State Option (API shape)**: `{ stateAbbreviation: string, stateName: string }`
  — the raw shape returned by the lookup service.
- **State Option (component shape)**: `{ id: string, label: string }` — the
  transformed shape consumed by question renderers (id = stateAbbreviation,
  label = stateName). This is the existing format used in `questionData.json`.
- **States Lookup Response**: The payload returned by the lookup service;
  contains a collection of State Options (API shape) under `data.states`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: State options for `topWorkLocations` and
  `employeeLivingZipCodes` reflect the server-side list without requiring a
  code change or application redeployment when states are added or removed.
- **SC-002**: The states lookup service is called exactly once per form
  session regardless of how many times the user navigates between questions
  or how many re-renders occur.
- **SC-003**: All assessment questions outside of `topWorkLocations` and
  `employeeLivingZipCodes` behave identically to their pre-change behavior,
  with a 100% pass rate on existing acceptance scenarios for those questions.
- **SC-004**: When the states API is unavailable, the overall form
  functionality for questions unaffected by the change remains at 100% —
  no regressions for other questions due to the API failure.
- **SC-005**: Form submission payload shape and stored state values are
  identical before and after the change when state options are available,
  as verified by existing integration tests.

## Component References

- **Assessment Form / Workforce Tab**: `src/pages/assessmentWorkforce/WorkforceTab.tsx`
  — this is the component where `topWorkLocations` and `employeeLivingZipCodes`
  questions are rendered and where the states lookup API call should be
  initiated.

## Assumptions

- The states lookup endpoint is already available in all environments
  (development, staging, production) and requires no new authentication
  beyond the existing session/token used by the app.
- While the states fetch is in-flight, the state select dropdown is disabled
  with a "Loading states..." placeholder; the zip code field within the same
  question remains usable. No full-question spinner is needed.
- The term "assessment form" used throughout this spec refers specifically to
  the `WorkforceTab` component and its mounted lifecycle.
- "Once on mount" means once per lifetime of the mounted `WorkforceTab`
  component; if the user navigates away and fully unmounts/remounts the
  component, a fresh fetch is acceptable.
- Data retention and session-persistence behavior for previously selected
  state abbreviations (e.g., from an in-progress assessment saved with
  hardcoded values) is out of scope for this feature and will be addressed
  separately if needed.
