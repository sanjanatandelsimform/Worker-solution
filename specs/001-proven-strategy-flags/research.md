# Research: Dynamic Proven Strategy Flags

**Branch**: `001-proven-strategy-flags` | **Date**: 2026-05-05

## Resolved Unknowns

### 1. Tri-state flag type shape

**Decision**: Introduce a shared literal union type `StrategyFlagStatus = "green" | "yellow" | "hidden"`.

**Rationale**: All three flags (`autoEnroll`, `nonElectiveMatch`, `healthcareAffordability`) share the same three possible values. A named union type makes the intent explicit, enables exhaustive checks, and centralises the contract. It replaces the existing `boolean` fields on `RecommendationData` and the `ProvenStrategyFlags` interface in `CoreBenefitsEnhancement.tsx`.

**Alternatives considered**:

- Keep `boolean` and add a separate `isVisible` flag per card — rejected as it duplicates intent and requires two reads per card.
- Use numeric enum — rejected as string literals are self-documenting in React devtools and network payloads.

**Fallback**: Any unrecognised or `null`/`undefined` value MUST be normalised to `"hidden"` at the selector layer before it reaches components.

---

### 2. Where `healthcareAffordability` lives in the Workforce API

**Decision**: The backend adds a new top-level field `healthcareAffordability: StrategyFlagStatus` to `WorkforceEnvelope` (the body nested under the `workforce` key in `WorkforceApiResponse`).

**Rationale**: `WorkforceEnvelope` already carries `dataStatus` and all data sections; adding a peer flag field here is consistent with that pattern. The field is optional (`healthcareAffordability?: StrategyFlagStatus`) in the TypeScript type to remain backwards-compatible with existing API responses that may not yet include it — a missing field is treated as `"hidden"`.

**Alternatives considered**:

- Add to `Participation` section — rejected; `Participation` models enrollment percentages, not eligibility flags.
- Add to `WorkforceOverview` section — rejected; same mismatch of concern.
- Derive it client-side from `participation.healthcareEnrollment` — rejected; the business logic for green/yellow/hidden thresholds belongs in the backend, not the frontend.

---

### 3. How to split flag sources between Finch and manual flows

**Decision**: In `RecommendationsFinchPage`, read `isConnected` from the existing `useAssessmentStatus()` call. Compose the final `ProvenStrategyFlags` object inline:

- Always from Recommendations Redux selector: `autoEnroll`, `nonElectiveMatch`.
- Finch flow only: `healthcareAffordability` from new `selectWorkforceHealthcareAffordabilityFlag` selector; manual flow: from Recommendations selector.

**Rationale**: `isConnected` is already returned by `useAssessmentStatus` and consumed in the same component. No new hook or context is needed. The composition happens in the page component, keeping selectors single-purpose and pure.

**Alternatives considered**:

- Create a composite hook `useProvenStrategyFlags(isConnected)` — considered but rejected for this feature; the page already orchestrates several slices and a single hook would add indirection without removing complexity. Can be extracted later.
- Create a combined Redux selector that reads `isConnected` from the auth slice — rejected; auth slice doesn't hold Finch connection state (it uses `assessmentType` from assessment data, not Redux).

---

### 4. Dynamic count computation (numerator / denominator)

**Decision**:

- `provenStrategiesCount` = number of flags equal to `"green"` (numerator — "implemented" strategies).
- `visibleFlagsTotal` = number of flags NOT equal to `"hidden"` (denominator — strategies the user can see).
- Progress bar percentage = `visibleFlagsTotal > 0 ? Math.round((provenStrategiesCount / visibleFlagsTotal) * 100) : 0`.

**Rationale**: Matches the spec and avoids division-by-zero when all flags are `"hidden"`. The percentage is passed as a prop so `CoreBenefitsEnhancement` stays presentational.

**Alternatives considered**:

- Compute count/percent inside `CoreBenefitsEnhancement` — rejected; the component should remain dumb/presentational. Page-level orchestration keeps it testable independently.

---

### 5. Visual mapping (colour classes and icons)

**Decision**:

| `StrategyFlagStatus` | Card `className`      | Icon component                                 |
| -------------------- | --------------------- | ---------------------------------------------- |
| `"green"`            | `bg-ws-success-25`    | `<LikeIcon />` (with green colour class)       |
| `"yellow"`           | `bg-ws-warning-50`    | `<UserGroupIcon />` (with yellow colour class) |
| `"hidden"`           | — (card not rendered) | —                                              |

The existing `flag === true` → green and `flag === false` → yellow mapping translates directly to `"green"` and `"yellow"`. No new Tailwind tokens are required.

Icon colouring: The spec requires the _icon itself_ to be coloured. The icon components (`LikeIcon`, `UserGroupIcon`) accept SVG colour via CSS inheritance. Wrapping `<span>` on the icon can carry `text-ws-success-600` or `text-ws-warning-500` to colour the SVG. This needs to be verified against the current icon implementation during implementation.

---

### 6. Impact on existing tests

- `CoreBenefitsEnhancement.test.tsx` — all tests use `boolean` props; must be updated to use `StrategyFlagStatus` values and add hidden-card assertions.
- `recommendationsSelectors.test.ts` — `selectProvenStrategiesFlags` test must assert `StrategyFlagStatus` values, not booleans.
- No new API mocks needed for Workforce API changes; the existing workforce fixture can be extended with `healthcareAffordability`.

---

### 7. Manual recommendations page

The codebase has no `RecommendationsManualPage`. The manual flow uses the same `RecommendationsFinchPage` component with `isConnected === false`. No separate page change is needed.
