# Implementation Plan: Dashboard API Integration

**Branch**: `001-dashboard-api-integration` | **Date**: 2026-02-24 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-dashboard-api-integration/spec.md`

## Summary

Integrate the GET `/dashboard` API into the Dashboard flow using Spec Driven Development. The API will be called once after the Goals API call when the user clicks the "Go to Dashboard" button. The response will be stored in the application state and mapped to the RecommendationsPage (companyAtGlance, strategicRecommendations) and BenchmarkPage (industryOverview, turnoverVoluntaryVsInvoluntary, rateOfSeparation, areaMedianWage, housingCost). ZIP code-driven data binding will allow users to dynamically view area-specific wage and housing data without additional API calls.

## Technical Context

**Language/Version**: TypeScript 4.9, React 19
**Primary Dependencies**: Redux Toolkit, React Router, Tailwind CSS, shadcn/ui
**Storage**: Redux store for dashboard data
**Testing**: Jest, React Testing Library
**Target Platform**: Web (modern browsers)
**Project Type**: Web application
**Performance Goals**: API response mapped to UI within 3 seconds; ZIP code selection updates within 100ms
**Constraints**: No additional API calls on ZIP code change; maintain existing UI structure
**Scale/Scope**: 10k users, 2 main pages (Recommendations, Benchmark)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Component-First Architecture: ✅
- User-Centric Design: ✅
- Test-Driven Development: ✅
- Type Safety & Code Quality: ✅
- Performance & Accessibility: ✅
- State Management Discipline: ✅

## Project Structure

### Documentation (this feature)

```text
specs/001-dashboard-api-integration/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/
├── pages/
│   ├── recommendations/
│   └── benchmark/
├── store/
│   ├── slices/
│   └── selectors/
├── utils/
└── hooks/

tests/
├── components/
├── pages/
└── store/
```

**Structure Decision**: Web application with feature-based organization. Pages and components are grouped by domain (e.g., Recommendations, Benchmark). State management uses Redux Toolkit with typed selectors.

## Complexity Tracking

No constitution violations identified. All requirements align with project principles.

## Implementation Phases

### Phase 0: Research
- Clarify API response structure and edge cases (e.g., empty arrays, null values).
- Define fallback behavior for missing data (e.g., "Data not available" placeholders).
- Research best practices for ZIP code-driven data binding in React.

### Phase 1: Design & Contracts
- Update `dashboardTypes.ts` to match API response.
- Add selectors for nested fields (e.g., turnoverRate, areaMedianWage).
- Implement selector factories for ZIP code filtering.
- Define API contract for `/dashboard` endpoint.

### Phase 2: Implementation
- Call `/dashboard` API once and store response in Redux.
- Map API data to RecommendationsPage and BenchmarkPage.
- Bind ZIP code dropdown to `zipCodes` array in API response.
- Dynamically update Benchmark sections based on selected ZIP code.
- Ensure no additional API calls occur on ZIP code change.

### Phase 3: Testing
- Write unit tests for selectors and components.
- Add integration tests for ZIP code-driven data binding.
- Verify edge cases (e.g., empty arrays, null values).

### Phase 4: Validation
- Run type-checks and linting.
- Perform manual UI testing to ensure visual and functional correctness.
- Validate performance goals (e.g., ZIP updates within 100ms).

## Success Criteria

- API data mapped to UI within 3 seconds of clicking "Go to Dashboard."
- ZIP code selection updates all relevant sections instantly (<100ms).
- No additional API calls on ZIP code change.
- All tests pass (unit, integration, end-to-end).
- No TypeScript errors or ESLint warnings.
- UI remains fully functional with empty or null API fields.
- Existing functionality and layout remain unchanged.
