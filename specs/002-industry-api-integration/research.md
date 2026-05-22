# Research: Dynamic Industry Lookup Integration

**Date**: 2026-02-10  
**Feature**: [spec.md](./spec.md) | [plan.md](./plan.md)

## Research Tasks

### 1. API Integration Pattern with React Hook Form

**Question**: What is the best practice for integrating async API calls to populate dropdown options in React Hook Form while maintaining loading and error states?

**Decision**: Use `useEffect` to fetch data on component mount combined with local `useState` for loading/error states

**Rationale**:
- React Hook Form manages form field values, not async data fetching lifecycle
- Component-level state (useState) is appropriate for UI concerns like loading indicators
- useEffect with empty dependency array ensures single fetch on mount, avoiding unnecessary re-renders
- Pattern already established in project (axios + hooks pattern)
- Separates concerns: RHF for validation, useState for async UI state

**Alternatives considered**:
- **React Query**: Would add new dependency (violates Out of Scope constraint "No addition of new third-party libraries")
- **Custom hook**: Over-engineering for single use case; increases complexity without clear benefit
- **Form state for loading**: RHF not designed for async data state management; would conflate concerns

**Implementation approach**:
```typescript
const [industries, setIndustries] = useState<Industry[]>([]);
const [isLoadingIndustries, setIsLoadingIndustries] = useState(true);
const [industryError, setIndustryError] = useState<string | null>(null);

useEffect(() => {
  const fetchIndustries = async () => {
    try {
      const data = await getIndustries();
      setIndustries(data);
    } catch (error) {
      setIndustryError(error.message);
    } finally {
      setIsLoadingIndustries(false);
    }
  };
  fetchIndustries();
}, []);
```

---

### 2. API Timeout Configuration

**Question**: How should the 5-10 second timeout be implemented given the existing axios instance has a 10-second global timeout?

**Decision**: Reuse existing axios instance timeout configuration (10 seconds)

**Rationale**:
- Existing authApi.ts already configures axios with 10-second timeout
- 10 seconds falls within the 5-10 second range specified in clarifications
- Consistent timeout across all API calls simplifies error handling and user experience
- No additional configuration needed; follows existing patterns

**Alternatives considered**:
- **Request-specific timeout override**: Would add complexity for minimal benefit; 10s already acceptable
- **Lower to 5 seconds**: Could cause premature failures on slower networks; 10s is industry standard

**Implementation approach**:
No changes needed. The existing axios instance configuration handles this:
```typescript
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  timeout: 10000, // Existing 10-second timeout
  withCredentials: true,
});
```

---

### 3. Error Message Display Pattern

**Question**: What is the established pattern in the codebase for displaying inline field-level errors?

**Decision**: Follow React Hook Form error display pattern with custom error state for API errors

**Rationale**:
- Existing RegistrationForm uses `{errors.fieldName && <p className="error-class">{errors.fieldName.message}</p>}`
- However, API fetch errors occur outside form validation lifecycle
- Need separate error state to display API-specific errors (network, empty response, timeout)
- Maintain visual consistency with validation errors using same styling classes

**Alternatives considered**:
- **Integrate with RHF errors object**: RHF errors are for validation, not async fetch failures; coupling would be inappropriate
- **Toast notification**: Violates clarification #3 requirement for inline error display

**Implementation approach**:
```tsx
{industryError && (
  <p className="text-sm text-error-600 mt-1.5">
    {industryError}
  </p>
)}
```

---

### 4. Loading Indicator Styling

**Question**: What visual pattern should the spinner/loading indicator follow to match the existing Untitled UI design system?

**Decision**: Use disabled state styling with adjacent loading text indicator

**Rationale**:
- Untitled UI components support disabled state with visual dimming
- Adding a spinner icon from @untitledui/icons would require identifying available spinner components
- Simple "Loading industries..." text with disabled dropdown provides clear feedback without additional dependencies
- Maintains consistency with form field disabled states already in use

**Alternatives considered**:
- **Spinner icon from Untitled UI**: May not have suitable spinner component; investigation would delay implementation
- **Custom CSS spinner**: Violates "No modifications to visual design" - would introduce new visual element
- **Skeleton loader**: Over-engineered for single dropdown; inconsistent with current patterns

**Implementation approach**:
```tsx
<NativeSelect
  disabled={isLoadingIndustries}
  // ... other props
/>
{isLoadingIndustries && (
  <p className="text-sm text-gray-600 mt-1.5">
    Loading industries...
  </p>
)}
```

---

### 5. Empty Array Handling

**Question**: How should the system validate and respond when API returns an empty array?

**Decision**: Treat empty array as error condition with specific error message

**Rationale**:
- Clarification #4 specifies: "Treat it as an error and display an inline error message below the dropdown"
- Empty industry list prevents user from completing registration (required field)
- User needs to know this is a system issue, not a form validation error
- Prevents confusion with unloaded dropdown vs. intentionally empty dropdown

**Alternatives considered**:
- **Allow empty dropdown**: Violates spec - industry is required field
- **Silent failure**: Poor UX; user wouldn't know why they can't proceed

**Implementation approach**:
```typescript
const data = await getIndustries();
if (data.length === 0) {
  throw new Error("No industries available. Please try again later.");
}
```

---

### 6. Testing Framework Configuration

**Question**: Project currently has no test files. What is the recommended Jest + React Testing Library setup for Vite + React 19?

**Decision**: Defer test infrastructure setup to separate task - outside scope of this feature

**Rationale**:
- Constitution Check marked TDD as "DEFERRED" - acknowledged project gap
- Setting up Jest + Vite requires configuration (vitest recommended for Vite projects)
- Test infrastructure affects entire codebase, not just this feature
- Feature can be implemented with manual testing, then tests added once infrastructure ready

**Alternatives considered**:
- **Include in this feature**: Would expand scope significantly; violates "Out of Scope: No addition of new third-party libraries" if done improperly
- **Skip testing**: Violates Constitution Principle III - tests are non-negotiable long-term

**Follow-up action**:
Create separate specification for test infrastructure setup including:
- Vitest configuration for Vite projects
- React Testing Library setup
- Example test patterns
- CI/CD integration

---

## Summary

All research tasks completed. Key decisions:
1. ✅ Use useEffect + useState for async data fetching (standard React pattern)
2. ✅ Reuse existing 10-second axios timeout (no changes needed)
3. ✅ Separate error state for API errors, styled consistently with validation errors
4. ✅ Use disabled state + text indicator for loading (simplest, most consistent)
5. ✅ Validate non-empty response and throw error for empty arrays
6. ✅ Defer test infrastructure to separate project-wide effort

**No NEEDS CLARIFICATION items remain.** All technical decisions documented with rationale. Ready to proceed to Phase 1 (Design & Contracts).
