# untitledui-project Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-16

## Active Technologies
- TypeScript 5.x with React 19.2.0 + React Hook Form 7.71+, Axios 1.13+, Zod 4.3+, Redux Toolkit 2.11+ (002-industry-api-integration)
- N/A (API-driven dropdown, no local persistence) (002-industry-api-integration)
- TypeScript 5.9.3, React 19.2.0 + React Router v7, Redux Toolkit 2.11.2, Axios 1.13.2, React Hook Form 7.71.1, Zod 4.3.5, Tailwind CSS 4.1.18 (004-assessment-api-persistence)
- Server-side storage via REST API (GET /assessment, POST /assessment/{section}), NO client-side storage (localStorage/sessionStorage explicitly prohibited for assessment data) (004-assessment-api-persistence)
- TypeScript 5.9.3, React 19.2 + @reduxjs/toolkit 2.11.2, axios 1.13.2, react-router-dom 7.12.0 (001-dashboard-api-integration)
- Redux Toolkit for client state management (existing dashboardSlice pattern) (001-dashboard-api-integration)

- TypeScript with React 19+, strict mode enabled + React Hook Form (form management), Zod (validation), Axios (HTTP client), React Router v6 (navigation), Untitled UI components, Tailwind CSS 4+ (001-auth-business-onboarding)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript with React 19+, strict mode enabled: Follow standard conventions

## Recent Changes
- 001-dashboard-api-integration: Added TypeScript 5.9.3, React 19.2 + @reduxjs/toolkit 2.11.2, axios 1.13.2, react-router-dom 7.12.0
- 004-assessment-api-persistence: Added TypeScript 5.9.3, React 19.2.0 + React Router v7, Redux Toolkit 2.11.2, Axios 1.13.2, React Hook Form 7.71.1, Zod 4.3.5, Tailwind CSS 4.1.18
- 002-industry-api-integration: Added TypeScript 5.x with React 19.2.0 + React Hook Form 7.71+, Axios 1.13+, Zod 4.3+, Redux Toolkit 2.11+


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
