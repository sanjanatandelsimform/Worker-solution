# Implementation Plan: Authentication Module - Business Onboarding & Sign-In

**Branch**: `001-auth-business-onboarding` | **Date**: 2026-01-16 | **Spec**: [auth.spec.md](auth.spec.md)

## Summary

**Frontend Implementation** - Build a complete authentication UI module with business onboarding and sign-in flows. Features include: registration form with 10 fields (business details, credentials), sign-in with "Remember me" option, Google SSO authentication with account linking, real-time validation using React Hook Form + Zod, WCAG 2.1 Level AA accessibility, and responsive design across mobile/tablet/desktop. Uses React 19 + Vite + TypeScript with Untitled UI components and Tailwind CSS.

**Backend APIs**: Already implemented and available. Frontend consumes REST API endpoints.

## Technical Context

**Language/Version**: TypeScript with React 19+, strict mode enabled  
**Primary Dependencies**: React Hook Form (form management), Zod (validation), Axios (HTTP client), React Router v6 (navigation), Untitled UI components, Tailwind CSS 4+  
**Storage**: N/A (Frontend only - backend handles all persistence)  
**Testing**: Jest (unit tests), React Testing Library (component tests), Integration tests TBD  
**Target Platform**: Web application (mobile, tablet, desktop browsers - Chrome, Firefox, Safari, Edge)  
**Project Type**: Single-page web application (frontend only, consumes backend REST API)  
**Performance Goals**: Initial page load <2s, form validation <200ms response, API calls complete in <10s, Core Web Vitals meet Google "Good" thresholds (LCP <2.5s, FID <100ms, CLS <0.1)  
**Constraints**: WCAG 2.1 Level AA accessibility compliance mandatory, responsive design 320px-2560px, password security requirements (8+ chars, uppercase, lowercase, number, symbol), 10-second API timeout  
**Scale/Scope**: 5 pages (registration, sign-in, business info form, email verification, password reset), 3 authentication flows (email/password, Google SSO, account linking), ~10-15 React components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Initial Check (Before Phase 0)

**Status**: ✅ PASS - All principles satisfied

| Principle | Compliance | Evidence |
|-----------|------------|----------|
| I. Component-First Architecture | ✅ PASS | Feature spec specifies using Untitled UI components (Input, Button, Form, Card, Checkbox, Select). Components will be organized in `src/components/` with clear categorization (auth forms, business info form, SSO buttons). Each component will have TypeScript interfaces for props. |
| II. User-Centric Design | ✅ PASS | Feature spec includes 4 detailed user stories with P1/P2 priorities, acceptance scenarios, and measurable outcomes. Stories are independently testable and deliver standalone value. Uses Untitled UI design system for consistency. Responsive design explicitly required (mobile-first, 320px-2560px). |
| III. Test-Driven Development | ✅ PASS | Feature spec defines independent test criteria for each user story. Constitution requires TDD with tests written before implementation. Testing strategy includes Jest + React Testing Library. All acceptance scenarios provide clear test cases. |
| IV. Type Safety & Code Quality | ✅ PASS | TypeScript strict mode required explicitly. React Hook Form with Zod provides typed form validation. Constitution standards (ESLint, Prettier, no `any` types) will be enforced. Prop interfaces required for all components. |
| V. Performance & Accessibility | ✅ PASS | WCAG 2.1 Level AA compliance is mandatory requirement (FR-051, FR-052, SC-004, SC-005). Core Web Vitals thresholds specified (LCP <2.5s, FID <100ms, CLS <0.1). Success criteria SC-014 explicitly measures performance. |
| VI. State Management Discipline | ✅ PASS | Form state managed by React Hook Form (designated library). Session state managed via HttpOnly cookies (backend). No complex global state required for auth module. Side effects handled in designated hooks. |

**Gate Decision**: ✅ PROCEED TO PHASE 0 - No violations, no complexity justifications needed.

---

### Post-Design Check (After Phase 1)

**Status**: ✅ PASS - Design maintains compliance with all principles

| Principle | Compliance | Evidence |
|-----------|------------|----------|
| I. Component-First Architecture | ✅ PASS | **Confirmed in design**: 5 auth components created (`RegistrationForm`, `SignInForm`, `BusinessInfoForm`, `GoogleSSOButton`, `PasswordStrengthIndicator`) with clear single responsibilities. All components have TypeScript interfaces defined in `src/types/auth.ts`. Structure documented in `quickstart.md` with proper categorization. |
| II. User-Centric Design | ✅ PASS | **Confirmed in design**: Data model and API contracts directly map to user stories. Validation schemas (Zod) implement all user-facing requirements. Error messages are user-friendly and actionable. Quickstart guide prioritizes developer experience. |
| III. Test-Driven Development | ✅ PASS | **Confirmed in design**: Quickstart guide includes TDD workflow with example tests. Test structure defined (unit, integration, component tests). Acceptance scenarios from spec translate directly to test cases. Red-Green-Refactor cycle documented. |
| IV. Type Safety & Code Quality | ✅ PASS | **Confirmed in design**: All types exported from centralized `src/types/auth.ts`. Zod schemas provide runtime validation with `z.infer<>` for type inference. No `any` types used in research patterns. Validation schemas enforce data integrity at compile and runtime. |
| V. Performance & Accessibility | ✅ PASS | **Confirmed in design**: Accessibility patterns documented in research (ARIA attributes, semantic HTML, keyboard navigation). React Hook Form uses `onBlur` mode to minimize re-renders. Axios timeout set to 10 seconds. Code splitting strategy included in quickstart. |
| VI. State Management Discipline | ✅ PASS | **Confirmed in design**: Auth state managed via `useAuth` hook (React Context pattern). Form state isolated to React Hook Form. Session tokens in HttpOnly cookies (no frontend state). Side effects handled in designated hooks (`useGoogleSSO`, `useAuth`). No global state mutations. |

**Additional Design Validations**:
- ✅ API contracts defined in OpenAPI format (`contracts/auth-api.yaml`)
- ✅ Data models fully typed with validation rules (`data-model.md`)
- ✅ Security best practices documented (HTTPS, CSRF protection, password clearing)
- ✅ Error handling patterns defined (API interceptors, user-friendly messages)
- ✅ Technology decisions align with constitution standards (React 19, TypeScript strict, Tailwind CSS)

**Final Gate Decision**: ✅ PROCEED TO PHASE 2 - Design maintains full compliance. Ready for task breakdown.

## Project Structure

### Documentation (this module)

```text
specs/001-auth-business-onboarding/
├── auth.spec.md              # Feature specification
├── auth.plan.md              # This file - implementation plan
├── auth.research.md          # Technical research & decisions
├── auth.data-model.md        # Frontend data models & types
├── auth.quickstart.md        # Developer implementation guide
├── auth.api-contract.yaml    # Backend API specification (reference)
├── auth.api-contract-summary.md  # API quick reference
└── auth.tasks.md             # Implementation tasks (created via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── auth/
│   │   ├── RegistrationForm.tsx
│   │   ├── SignInForm.tsx
│   │   ├── BusinessInfoForm.tsx
│   │   ├── GoogleSSOButton.tsx
│   │   └── PasswordStrengthIndicator.tsx
│   ├── base/                    # Existing Untitled UI base components
│   │   ├── buttons/
│   │   ├── checkbox/
│   │   ├── input/
│   │   └── tooltip/
│   └── foundations/             # Existing Untitled UI foundations
├── pages/
│   ├── auth/
│   │   ├── RegisterPage.tsx
│   │   ├── SignInPage.tsx
│   │   ├── BusinessInfoPage.tsx
│   │   ├── EmailVerificationPage.tsx
│   │   └── PasswordResetPage.tsx
├── services/
│   ├── api/
│   │   ├── authApi.ts           # Axios client + API calls
│   │   └── interceptors.ts      # Error handling, token refresh
│   └── validation/
│       └── authSchemas.ts       # Zod validation schemas
├── hooks/
│   ├── useAuth.ts               # Authentication state hook
│   └── useGoogleSSO.ts          # Google OAuth flow hook
├── types/
│   └── auth.ts                  # TypeScript interfaces
└── utils/
    ├── phoneFormatter.ts
    └── passwordValidator.ts

tests/
├── components/
│   └── auth/
│       ├── RegistrationForm.test.tsx
│       ├── SignInForm.test.tsx
│       └── BusinessInfoForm.test.tsx
├── integration/
│   ├── registration-flow.test.tsx
│   ├── signin-flow.test.tsx
│   └── google-sso-flow.test.tsx
└── unit/
    └── validation/
        └── authSchemas.test.ts
```

**Structure Decision**: Selected single web application structure. Frontend consumes backend REST API. Components organized by feature (`auth/`) and reuse existing Untitled UI base components. Pages represent routes managed by React Router. Services layer abstracts API calls and validation logic. Tests colocate with implementation following TDD principles.

## Complexity Tracking

> **No violations recorded** - All constitution principles satisfied without exceptions.
