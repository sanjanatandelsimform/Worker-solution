<!--
  SYNC IMPACT REPORT
  ==================
  Version Change: INITIAL → 1.0.0
  Ratification Date: 2026-01-15
  
  Principles Defined:
  - I. Component-First Architecture (NEW)
  - II. User-Centric Design (NEW)
  - III. Test-Driven Development (NEW)
  - IV. Type Safety & Code Quality (NEW)
  - V. Performance & Accessibility (NEW)
  - VI. State Management Discipline (NEW)
  
  Sections Added:
  - Technology Standards (NEW)
  - Development Workflow (NEW)
  - Governance (NEW)
  
  Template Consistency Status:
  ✅ plan-template.md - Compatible (constitution check gates align)
  ✅ spec-template.md - Compatible (requirements structure aligns)
  ✅ tasks-template.md - Compatible (task organization supports principles)
  
  Follow-up Actions:
  - None required for initial ratification
-->

# WorkQuality Platform Constitution

## Core Principles

### I. Component-First Architecture

All UI features MUST be built as reusable, composable components following these non-negotiable rules:

- Every component MUST be self-contained with clear props interface and TypeScript types
- Components MUST follow single responsibility principle - one component, one purpose
- Shared components MUST reside in `src/components/` with clear categorization (base, foundations, features)
- Component composition MUST be preferred over prop drilling or complex inheritance
- Each component MUST include JSDoc comments documenting purpose, props, and usage examples

**Rationale**: Component-first architecture ensures scalability, reusability, and maintainability as the platform grows. It enables parallel development by multiple team members and facilitates testing at the component level.

### II. User-Centric Design

All features MUST prioritize user experience and business value delivery:

- Every feature MUST start with documented user stories with clear acceptance criteria
- User stories MUST be prioritized (P1, P2, P3) and independently testable
- Each story MUST deliver standalone value - implementable as an MVP increment
- Design MUST follow Untitled UI design system for consistency and professional appearance
- Responsive design MUST support mobile, tablet, and desktop viewports

**Rationale**: SMB users need intuitive, accessible tools to improve job quality metrics. User-centric design ensures the platform solves real problems and delivers measurable business value from day one.

### III. Test-Driven Development (NON-NEGOTIABLE)

Testing MUST follow strict TDD discipline:

- Tests MUST be written BEFORE implementation for all new features
- Test coverage MUST include unit tests (Jest) and component tests (React Testing Library)
- Tests MUST fail initially, then pass after correct implementation (Red-Green-Refactor)
- Critical user journeys MUST have integration tests covering end-to-end flows
- All tests MUST pass before code review and merge
- Test files MUST colocate with implementation files or reside in parallel test directories

**Rationale**: TDD ensures code correctness, reduces regression bugs, and provides living documentation. For a SaaS platform handling business-critical workforce data, quality and reliability are non-negotiable.

### IV. Type Safety & Code Quality

Code MUST maintain strict type safety and quality standards:

- TypeScript strict mode MUST be enabled with no `any` types except where explicitly justified
- All functions MUST have explicit return type annotations
- ESLint and Prettier MUST be configured and enforced via pre-commit hooks
- Code reviews MUST verify adherence to established patterns and conventions
- Import organization MUST follow consistent patterns (React → third-party → local)
- Prop types MUST use TypeScript interfaces or types, never inline definitions

**Rationale**: Strong typing catches errors at compile time, improves IDE support, and serves as inline documentation. Consistent code quality reduces cognitive load and accelerates onboarding.

### V. Performance & Accessibility

All features MUST meet performance and accessibility standards:

- WCAG 2.1 Level AA accessibility compliance MUST be maintained for all UI components
- Semantic HTML MUST be used; ARIA attributes required only when semantic HTML insufficient
- Core Web Vitals MUST meet Google's "Good" thresholds (LCP <2.5s, FID <100ms, CLS <0.1)
- Code splitting and lazy loading MUST be implemented for route-level components
- Images MUST be optimized; icons MUST use Untitled UI icon library
- Performance budgets: Initial bundle <200KB gzipped, route chunks <100KB gzipped

**Rationale**: SMBs operate in diverse environments with varying device capabilities and connectivity. Accessible, performant applications ensure maximum reach and user satisfaction.

### VI. State Management Discipline

State management MUST follow clear patterns and best practices:

- Global state MUST be minimized - prefer local state and prop passing
- Server state MUST be managed via React Query (or similar) with proper caching strategies
- Client state MUST use Zustand or Redux Toolkit with typed actions and selectors
- State updates MUST be immutable; direct mutations MUST NOT occur
- Side effects MUST be handled in designated locations (useEffect hooks, middleware, mutations)
- State shape MUST be normalized to avoid duplication and ensure data consistency

**Rationale**: Clear state management prevents bugs from stale data, race conditions, and unpredictable renders. Proper patterns make the application easier to reason about and debug.

## Technology Standards

The following technology stack is mandated and MUST be used consistently:

**Frontend Framework**:
- React 19+ with TypeScript
- Vite as build tool and dev server
- React Router for routing

**UI & Styling**:
- Untitled UI component library as foundation
- Tailwind CSS 4+ for styling (@tailwindcss/vite)
- React Aria Components for accessible UI primitives
- tailwind-merge for conditional class name merging
- tailwindcss-animate for animations

**State Management** (choose based on feature complexity):
- React Query for server state
- Zustand or Redux Toolkit for complex client state
- React Context + hooks for theme and simple shared state

**Testing**:
- Jest for unit testing
- React Testing Library for component testing
- Integration testing framework TBD based on backend architecture

**Code Quality**:
- TypeScript with strict mode enabled
- ESLint with TypeScript, React, and Prettier plugins
- Prettier for code formatting
- Husky + lint-staged for pre-commit validation

**Version Control**:
- Git with feature branch workflow
- Branch naming: `###-feature-name` format
- Conventional commits for semantic versioning

## Development Workflow

All development MUST follow this standardized workflow:

**Feature Development Lifecycle**:

1. **Specification Phase**:
   - Create feature spec using `/speckit.spec` command
   - Document user stories with priorities and acceptance criteria
   - Obtain stakeholder approval before proceeding

2. **Planning Phase**:
   - Generate implementation plan using `/speckit.plan` command
   - Define technical approach, data models, and API contracts
   - Review plan with team for technical feasibility

3. **Task Breakdown Phase**:
   - Generate task list using `/speckit.tasks` command
   - Organize tasks by user story for independent delivery
   - Estimate effort and assign priorities

4. **Implementation Phase**:
   - Create feature branch following naming convention like A2TM-T18/spec-driven-setup
   - Write tests FIRST for each task (TDD)
   - Implement features ensuring all tests pass
   - Conduct self-review against constitution principles

5. **Review & Merge Phase**:
   - Submit pull request with reference to spec and plan
   - Code review MUST verify constitution compliance
   - All automated checks (tests, linting, type checking) MUST pass
   - Minimum one approval required before merge

**Constitution Compliance Gates**:

All pull requests MUST pass these gates:

- ✅ Component architecture follows principle I
- ✅ User stories referenced and acceptance criteria met (principle II)
- ✅ Tests written first and all tests passing (principle III)
- ✅ No TypeScript errors or warnings (principle IV)
- ✅ Accessibility checks pass, performance budgets met (principle V)
- ✅ State management patterns followed (principle VI)
- ✅ Technology standards adhered to

**Complexity Justification**:

Any violation of constitution principles MUST be documented with:
- Specific principle violated
- Technical justification for violation
- Plan to remediate or refactor in future
- Approval from technical lead

## Governance

This constitution is the supreme governing document for the WorkQuality Platform and supersedes all other development practices, guidelines, or conventions.

**Amendment Process**:

1. Amendments MUST be proposed via pull request to this file
2. Amendment MUST include:
   - Rationale for change (technical, business, or compliance driven)
   - Impact analysis on existing code and templates
   - Migration plan if existing code affected
   - Updated sync impact report
3. Amendment requires approval from technical lead and product owner
4. Version MUST be incremented following semantic versioning:
   - **MAJOR**: Breaking changes to principles, removed principles, fundamental governance changes
   - **MINOR**: New principles added, expanded guidance, new sections
   - **PATCH**: Clarifications, wording improvements, typo fixes
5. Last Amended date MUST be updated to amendment merge date

**Compliance Review**:

- All feature specifications MUST reference this constitution
- All implementation plans MUST include "Constitution Check" section
- Code reviews MUST verify adherence to core principles
- Quarterly reviews MUST assess constitution effectiveness and identify needed updates

**Authoritative Guidance**:

For runtime development guidance and agent-specific instructions, refer to:
- `.specify/templates/` for spec-kit command templates
- `.github/prompts/` for agent mode instructions
- This constitution for project-wide non-negotiable rules

**Version**: 1.0.0 | **Ratified**: 2026-01-15 | **Last Amended**: 2026-01-15
