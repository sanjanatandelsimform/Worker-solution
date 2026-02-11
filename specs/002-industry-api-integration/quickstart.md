# Quickstart: Dynamic Industry Lookup Integration

**Date**: 2026-02-10  
**Feature**: [spec.md](./spec.md) | [plan.md](./plan.md)

This guide walks you through implementing dynamic industry loading in the registration form.

---

## Prerequisites

- ✅ Existing project setup with Vite + React 19 + TypeScript
- ✅ Registration form at `src/components/auth/RegistrationForm.tsx`
- ✅ API client configured in `src/services/api/authApi.ts`
- ✅ Backend `/industry/lookup` endpoint operational

---

## Implementation Steps

### Step 1: Add API Function (5 minutes)

**File**: `src/services/api/authApi.ts`

Add the new `getIndustries` function after existing auth functions:

```typescript
/**
 * Fetch list of available industries for registration form
 */
export const getIndustries = async (): Promise<Industry[]> => {
  try {
    const response = await apiClient.get<Industry[]>('/industry/lookup');
    
    // Validate non-empty response
    if (!response.data || response.data.length === 0) {
      throw new Error('No industries available. Please try again later.');
    }
    
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
```

**Verification**:
```bash
# No TypeScript errors
npm run build
```

---

### Step 2: Update Type Definitions (3 minutes)

**File**: `src/types/auth.ts`

Verify the `Industry` interface matches the API response:

```typescript
export interface Industry {
  id: number;
  name: string;
}
```

If the current interface has different fields (e.g., `id: string`, `label: string`), update it to match the API contract.

**Verification**:
- Check that imports in `authApi.ts` and `RegistrationForm.tsx` resolve correctly
- No TypeScript errors on build

---

### Step 3: Add Component State (5 minutes)

**File**: `src/components/auth/RegistrationForm.tsx`

Add three new state variables at the top of the component:

```typescript
export const RegistrationForm = () => {
  // ... existing state ...
  
  // NEW: Industry fetching state
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [isLoadingIndustries, setIsLoadingIndustries] = useState(true);
  const [industryError, setIndustryError] = useState<string | null>(null);
  
  // ... rest of component ...
};
```

Add import:
```typescript
import { getIndustries } from '@/services/api/authApi';
```

**Verification**:
- Component compiles without errors
- State variables accessible in component body

---

### Step 4: Fetch Industries on Mount (10 minutes)

**File**: `src/components/auth/RegistrationForm.tsx`

Add `useEffect` hook after state declarations:

```typescript
useEffect(() => {
  const fetchIndustries = async () => {
    setIsLoadingIndustries(true);
    setIndustryError(null);
    
    try {
      const data = await getIndustries();
      setIndustries(data);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to load industries. Please try again.';
      setIndustryError(errorMessage);
    } finally {
      setIsLoadingIndustries(false);
    }
  };
  
  fetchIndustries();
}, []); // Empty dependency array = run once on mount
```

**Verification**:
```bash
# Start dev server
npm run dev

# Open registration form in browser
# Check console for API request
# Verify no errors
```

---

### Step 5: Update Dropdown to Use API Data (15 minutes)

**File**: `src/components/auth/RegistrationForm.tsx`

Find the industry dropdown component (likely `NativeSelect` or `Select`) and update it:

**Before** (using hardcoded constant):
```tsx
<NativeSelect
  options={INDUSTRIES}
  // ... other props ...
/>
```

**After** (using API data):
```tsx
<NativeSelect
  disabled={isLoadingIndustries}
  options={industries.map(industry => ({
    id: industry.id.toString(),
    label: industry.name,
  }))}
  // ... other props ...
/>
```

**Verification**:
- Dropdown shows "Loading industries..." state initially
- After ~1-2 seconds, dropdown populates with API data
- Dropdown becomes enabled and interactive

---

### Step 6: Add Loading Indicator (5 minutes)

**File**: `src/components/auth/RegistrationForm.tsx`

Add loading text below the dropdown:

```tsx
<div className="space-y-1.5">
  <NativeSelect
    disabled={isLoadingIndustries}
    options={industries.map(industry => ({
      id: industry.id.toString(),
      label: industry.name,
    }))}
    // ... other props ...
  />
  
  {/* NEW: Loading indicator */}
  {isLoadingIndustries && (
    <p className="text-sm text-gray-600">
      Loading industries...
    </p>
  )}
</div>
```

**Verification**:
- Text appears during initial load
- Text disappears after industries load
- Visual feedback matches existing form styling

---

### Step 7: Add Error Handling (5 minutes)

**File**: `src/components/auth/RegistrationForm.tsx`

Add error message display:

```tsx
<div className="space-y-1.5">
  <NativeSelect
    disabled={isLoadingIndustries || !!industryError}
    options={industries.map(industry => ({
      id: industry.id.toString(),
      label: industry.name,
    }))}
    // ... other props ...
  />
  
  {isLoadingIndustries && (
    <p className="text-sm text-gray-600">
      Loading industries...
    </p>
  )}
  
  {/* NEW: Error message */}
  {industryError && (
    <p className="text-sm text-error-600">
      {industryError}
    </p>
  )}
</div>
```

**Verification**:
- Test error case: Stop backend or modify API URL
- Verify error message appears below dropdown
- Verify dropdown remains disabled
- Error styling matches validation errors

---

### Step 8: Remove Hardcoded Constant (2 minutes)

**File**: `src/constants/formOptions.ts`

Comment out or remove the `INDUSTRIES` constant:

```typescript
// DEPRECATED: Now fetched from API
// export const INDUSTRIES: IndustryOption[] = [
//   { id: "technology", label: "Technology" },
//   ...
// ];
```

**File**: `src/components/auth/RegistrationForm.tsx`

Remove import:
```typescript
// Remove this line:
import { INDUSTRIES, COUNTRY_CODES } from '@/constants/formOptions';

// Replace with:
import { COUNTRY_CODES } from '@/constants/formOptions';
```

**Verification**:
```bash
# Check for any lingering references to INDUSTRIES constant
grep -r "INDUSTRIES" src/

# Should only find the commented-out definition in formOptions.ts
```

---

## Testing Your Changes

### Manual Testing Checklist

- [ ] **Happy Path**: Form loads, industries appear within 2 seconds, dropdown is interactive
- [ ] **Loading State**: "Loading industries..." text visible during fetch
- [ ] **Error State**: Stop backend → error message appears, dropdown disabled
- [ ] **Empty Response**: Mock empty array → error message shown
- [ ] **Form Submission**: Select industry → submit form → verify correct data sent
- [ ] **Network Tab**: Verify single GET request to `/industry/lookup`
- [ ] **Console**: No errors or warnings

### Browser Testing

Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Automated Testing (if infrastructure available)

```typescript
// Example component test (once Jest + RTL configured)
import { render, screen, waitFor } from '@testing-library/react';
import { RegistrationForm } from './RegistrationForm';

test('loads and displays industries', async () => {
  render(<RegistrationForm />);
  
  // Initially shows loading
  expect(screen.getByText(/loading industries/i)).toBeInTheDocument();
  
  // After load, shows dropdown options
  await waitFor(() => {
    expect(screen.getByRole('combobox', { name: /industry/i })).toBeEnabled();
  });
  
  // No error message
  expect(screen.queryByText(/failed/i)).not.toBeInTheDocument();
});
```

---

## Troubleshooting

### Problem: "Cannot find module '@/services/api/authApi'"

**Solution**: Verify path alias in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Problem: Dropdown stays disabled forever

**Diagnosis**: API request not completing

**Solutions**:
1. Check Network tab for failed request
2. Verify backend is running and endpoint accessible
3. Check console for error messages
4. Verify `finally` block sets `isLoadingIndustries(false)`

### Problem: TypeScript error on Industry type

**Solution**: Ensure `Industry` interface in `types/auth.ts` matches:
```typescript
export interface Industry {
  id: number;  // NOT string
  name: string; // NOT label
}
```

### Problem: Error message not displaying

**Solutions**:
1. Verify error state variable defined: `const [industryError, setIndustryError] = useState<string | null>(null);`
2. Check error JSX is present in render
3. Verify error text color class exists: `text-error-600` (or adjust to match your theme)

---

## Rollback Plan

If issues arise in production:

1. **Quick Fix**: Restore `INDUSTRIES` constant import
   ```typescript
   import { INDUSTRIES, COUNTRY_CODES } from '@/constants/formOptions';
   
   // Comment out API fetch logic
   // Restore original dropdown:
   <NativeSelect options={INDUSTRIES} />
   ```

2. **Deploy**: Immediate rollback to working state

3. **Debug**: Investigate issue offline with full logging

---

## Performance Validation

After implementation, verify:

- [ ] **First Load**: Industries visible within 2 seconds
- [ ] **Network Payload**: Response size < 1KB
- [ ] **No Memory Leaks**: Component unmount cleans up properly
- [ ] **No Extra Renders**: React DevTools shows minimal re-renders

---

## Next Steps

1. ✅ Implementation complete
2. ⏭️ Create tasks: Run `/speckit.tasks` to generate task breakdown
3. ⏭️ Set up testing: Create spec for test infrastructure (Jest + RTL + Vitest)
4. ⏭️ Code review: Submit PR referencing this spec and plan

---

## Related Documentation

- [Feature Specification](./spec.md) - User stories and requirements
- [Implementation Plan](./plan.md) - Technical approach and decisions
- [Research](./research.md) - Technical research and decision rationale
- [Data Model](./data-model.md) - Entity definitions and state structure
- [API Contract](./contracts/industry-lookup.api.md) - Endpoint specification

---

## Estimated Time

| Step | Duration |
|------|----------|
| API function | 5 min |
| Type updates | 3 min |
| Component state | 5 min |
| Fetch logic | 10 min |
| Dropdown update | 15 min |
| Loading indicator | 5 min |
| Error handling | 5 min |
| Cleanup | 2 min |
| **Total** | **50 min** |

Plus testing: ~30 minutes  
**Grand Total**: ~80 minutes (1.5 hours)
