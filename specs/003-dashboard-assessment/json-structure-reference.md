# Assessment JSON Structure Reference

**File**: `/src/question.json`  
**Generated**: 06 February 2026  
**Purpose**: Technical reference for implementing dynamic form rendering from question.json

## JSON Structure Overview

```typescript
interface QuestionJSON {
  sections: Section[];
}

interface Section {
  name: "Workforce" | "Compensation" | "Benefits" | "Goals";
  displayOrder: number;
  description: string;
  questions: Question[];
}

interface Question {
  key: string;
  questionText: string;
  questionType: QuestionType;
  displayOrder: number;
  validationRules: ValidationRules;
  schemaVersion: number;
  isRequired: boolean;
  options?: Option[];
  optionGroups?: OptionGroup[];  // For grouped multi-select
  subFields?: SubField[];         // For PARTICIPATION_RATES
  dynamicOptions?: DynamicOptions; // For RANKING
}
```

## Question Types & Mapping to Components

| questionType | Component | Description | Example |
|--------------|-----------|-------------|---------|
| `SINGLE_SELECT` | Select/Dropdown | Single choice from options | headCountSize, medianAnnualEarnings |
| `MULTIPLE_CHOICE` | Checkbox Group | Multiple selections | benefitsUpdates, commuteTime |
| `MULTI_SELECT` | Checkbox Group (with groups) | Multiple selections with option groups | supplementalBenefits, healthPlanTypes |
| `YES_NO` | Radio Group (Yes/No) | Boolean field | desklessEmployees, offersRetirementBenefit |
| `STRUCTURED_ARRAY` | Dynamic Array Form | Array of objects with schema | commonJobTitles, topWorkLocations |
| `NUMERIC` | Number Input | Percentage input (0-100) | hourlyEmployeesPercentage, involuntaryTurnoverRate |
| `NUMBER_INPUT` | Number Input | General number input | retirementMatchPercentage, lowestHealthPlanPremium |
| `TEXT_INPUT` | Text Input | Free text input | payrollProviderOther, benefitsBrokerName |
| `PARTICIPATION_RATES` | Nested Select Group | Special nested object | healthPlanParticipationRates |
| `RANKING` | Drag-and-Drop List | Ordered list from selected items | workforceGoalsRanking |

## Validation Rules

### Standard Validation Properties

```typescript
interface ValidationRules {
  type: string;
  required: boolean;
  min?: number;              // For NUMERIC/NUMBER_INPUT
  max?: number;              // For NUMERIC/NUMBER_INPUT
  minItems?: number;         // For arrays
  maxItems?: number;         // For arrays
  minSelections?: number;    // For MULTIPLE_CHOICE
  maxLength?: number;        // For TEXT_INPUT
  pattern?: string;          // Regex pattern (e.g., zipCode: "^\\d{5}$")
  errorMessage: string;      // Display error message
}
```

### Conditional Validation

```typescript
interface ConditionalValidation {
  conditionalOn: string;         // Parent field key
  conditionalValue: any;         // Value that triggers condition
  conditionalRequired?: boolean; // If true, required when condition met
}
```

**Examples from question.json**:
1. `commuteTime`: Show only if `commuteMoreThan15Miles === true`
2. `annualRaiseMonth`: Show + required if `offersAnnualRaises === true`
3. `payrollProviderOther`: Show + required if `payrollProvider === "Other"`
4. `employeeLivingZipCodes`: Show if `employeesResideInSameZipCodes === false`
5. Retirement fields: Show if `offersRetirementBenefit === true`
6. Health insurance fields: Show if `offersHealthInsurance === true`

### Sum Validation

```typescript
interface SumValidation {
  sumValidation: {
    fields: string[];  // Array of field keys
    mustEqual: number; // Target sum (e.g., 100)
  };
  relatedField: string; // Related field for cross-validation
}
```

**Example**: `hourlyEmployeesPercentage` + `salaryEmployeesPercentage` must sum to 100%

### STRUCTURED_ARRAY Schema

```typescript
interface ItemSchema {
  [fieldName: string]: {
    type: "STRING" | "NUMERIC";
    required: boolean;
    min?: number;
    max?: number;
    maxLength?: number;
    pattern?: string;
    errorMessage?: string;
  };
}
```

**Examples**:
1. **commonJobTitles** (maxItems: 5):
   - `title`: STRING, maxLength: 10000, required
   - `percentage`: NUMERIC, min: 0, max: 100, required

2. **topWorkLocations** (maxItems: 5):
   - `state`: STRING, maxLength: 10000, required
   - `zipCode`: STRING, pattern: "^\\d{5}$", required, errorMessage: "Zip code must be exactly 5 digits"

3. **employeeLivingZipCodes** (maxItems: 5):
   - Same structure as topWorkLocations

## Special Field Types

### PARTICIPATION_RATES (healthPlanParticipationRates)

```typescript
{
  questionType: "PARTICIPATION_RATES",
  subFields: [
    {
      key: "doNotParticipate",
      label: "Do not participate",
      options: [
        { label: "Less than 25%", value: "<25%" },
        { label: "26% - 50%", value: "26-50%" },
        { label: "51% - 75%", value: "51-75%" },
        { label: "76%+", value: "76%+" }
      ]
    },
    // ... 4 more subFields (employeeOnly, employeeSpouse, employeeChildren, employeeFamily)
  ]
}
```

**UI Pattern**: 5 dropdowns, each selecting a percentage range. NO sum validation required.

### RANKING (workforceGoalsRanking)

```typescript
{
  questionType: "RANKING",
  validationRules: {
    minItems: 3,
    maxItems: 3,
    conditionalOn: "workforceGoals",
    conditionalRequired: true,
    customValidation: "Must contain exactly 3 goals selected from workforceGoals"
  },
  dynamicOptions: {
    sourceField: "workforceGoals",
    description: "Options are dynamically populated from selected workforceGoals"
  }
}
```

**UI Pattern**: 
1. User selects multiple goals in `workforceGoals` (min: 3, max: 14)
2. `workforceGoalsRanking` dynamically shows only selected goals
3. User drags to rank exactly 3 goals in priority order

## Option Groups (MULTI_SELECT)

Some MULTI_SELECT questions have `optionGroups` for visual grouping:

```typescript
{
  questionType: "MULTI_SELECT",
  optionGroups: [
    {
      groupName: "Financial Health",
      options: [
        { label: "...", value: "...", displayOrder: 1 },
        // ...
      ]
    },
    {
      groupName: "Healthcare",
      options: [ /* ... */ ]
    }
  ],
  options: [ /* Flat array with group property */ ]
}
```

**Examples**:
- `supplementalBenefits`: 3 groups (Retirement and Savings, Health and Wellness, Other Supplemental Benefits)
- `workforceGoals`: 4 groups (Financial Health, Healthcare, Performance, Education and Training)

## Field Count by Section

### Workforce (15 questions)
- SINGLE_SELECT: 2 (headCountSize, educationLevel)
- MULTIPLE_CHOICE: 2 (benefitsUpdates, commuteTime)
- YES_NO: 4 (desklessEmployees, commuteMoreThan15Miles, contractorsSeasonalEmployees, employeesResideInSameZipCodes)
- STRUCTURED_ARRAY: 3 (commonJobTitles, topWorkLocations, employeeLivingZipCodes)
- NUMERIC: 4 (hourlyEmployeesPercentage, salaryEmployeesPercentage, involuntaryTurnoverRate, voluntaryTurnoverRate)

### Compensation (8 questions)
- SINGLE_SELECT: 5 (medianAnnualEarnings, hourlyMedianAnnualEarnings, salariedMedianAnnualEarnings, handlesHRPayrollInHouse, annualRaiseMonth, payrollProvider)
- YES_NO: 1 (offersAnnualRaises)
- TEXT_INPUT: 1 (payrollProviderOther)

### Benefits (21 questions)
- SINGLE_SELECT: 6 (workWithBenefitsBroker, benefitEnrollmentMonth, retirementProvider, retirementEnrollmentRate, retirementVestingPeriod, healthPlanInsuranceType)
- MULTI_SELECT: 3 (supplementalBenefits, healthPlanTypes, reimbursementArrangements)
- YES_NO: 5 (offersRetirementBenefit, retirementPlanHasMatch, retirementAutoEnroll, retirementAllowsHardshipWithdrawals, offersHealthInsurance)
- TEXT_INPUT: 3 (supplementalBenefitsOther, benefitsBrokerName, retirementProviderOther)
- NUMBER_INPUT: 2 (retirementMatchPercentage, lowestHealthPlanPremium)
- PARTICIPATION_RATES: 1 (healthPlanParticipationRates - 5 subfields)

### Goals (2 questions)
- MULTI_SELECT: 1 (workforceGoals - min: 3, max: 14)
- RANKING: 1 (workforceGoalsRanking - exactly 3)

**Total**: 46 questions across 4 sections

## Conditional Fields Summary

| Parent Field | Conditional Child | Condition | Required When Shown |
|--------------|-------------------|-----------|---------------------|
| commuteMoreThan15Miles | commuteTime | === true | No |
| offersAnnualRaises | annualRaiseMonth | === true | Yes |
| payrollProvider | payrollProviderOther | === "Other" | Yes |
| supplementalBenefits | supplementalBenefitsOther | includes "Other" | Yes |
| employeesResideInSameZipCodes | employeeLivingZipCodes | === false | No |
| offersRetirementBenefit | retirementProvider + 8 related fields | === true | Varies |
| retirementProvider | retirementProviderOther | === "Other" | Yes |
| retirementPlanHasMatch | retirementMatchPercentage | === true | No |
| offersHealthInsurance | healthPlanTypes + 5 related fields | === true | Varies |
| workforceGoals | workforceGoalsRanking | Selected items | Yes (must rank 3) |

## Validation Edge Cases

### 1. Sum Validation (hourly + salary = 100%)
```typescript
// Both fields must be filled AND sum to exactly 100
hourlyEmployeesPercentage + salaryEmployeesPercentage === 100
// Error: "Hourly and salary percentages must sum to 100%"
```

### 2. STRUCTURED_ARRAY Item Limits
```typescript
// All arrays limited to 5 items max
commonJobTitles.length <= 5
topWorkLocations.length <= 5
employeeLivingZipCodes.length <= 5
// Error: "Maximum 5 {items} allowed"
```

### 3. Zip Code Pattern
```typescript
// Must be exactly 5 digits
zipCode.match(/^\d{5}$/)
// Error: "Zip code must be exactly 5 digits"
```

### 4. workforceGoals Selection Range
```typescript
// Must select between 3 and 14 goals
workforceGoals.length >= 3 && workforceGoals.length <= 14
// Error: "Please select at least 3 workforce goals"
```

### 5. workforceGoalsRanking Validation
```typescript
// Must rank exactly 3 goals
workforceGoalsRanking.length === 3
// All ranked goals must be from selected workforceGoals
workforceGoalsRanking.every(goal => workforceGoals.includes(goal))
// Error: "Please rank exactly 3 goals from your selected workforce goals"
```

## API Request Body Transformation

### Input: Form Data (keyed by question.key)
```typescript
{
  headCountSize: "100-249",
  benefitsUpdates: ["Email", "Text/SMS"],
  desklessEmployees: true,
  // ... all other fields
}
```

### Output: API Request Body
```typescript
{
  responses: {
    headCountSize: "100-249",
    benefitsUpdates: ["Email", "Text/SMS"],
    desklessEmployees: true,
    // ... all other fields wrapped in "responses" key
  }
}
```

**Transformation Rule**: Wrap entire form data object in `{ "responses": {...} }`

## Implementation Checklist

### Phase 1: JSON Parsing
- [ ] Load /src/question.json on app init
- [ ] Parse sections array and sort by displayOrder
- [ ] Map section names to tab components (Workforce→WorkforceTab, etc.)

### Phase 2: Question Type Rendering
- [ ] Implement component mapper (questionType → React Component)
- [ ] SINGLE_SELECT → Select/Dropdown component
- [ ] MULTIPLE_CHOICE/MULTI_SELECT → Checkbox Group component
- [ ] YES_NO → Radio Group component (Yes/No options)
- [ ] STRUCTURED_ARRAY → Dynamic Array Form component
- [ ] NUMERIC/NUMBER_INPUT → Number Input component
- [ ] TEXT_INPUT → Text Input component
- [ ] PARTICIPATION_RATES → Nested Select Group component
- [ ] RANKING → Drag-and-Drop List component

### Phase 3: Validation Implementation
- [ ] Implement required field validation (isRequired, validationRules.required)
- [ ] Implement min/max validation for NUMERIC/NUMBER_INPUT
- [ ] Implement minItems/maxItems validation for arrays
- [ ] Implement pattern validation (regex) for TEXT_INPUT
- [ ] Implement sum validation (hourlyEmployeesPercentage + salaryEmployeesPercentage = 100%)
- [ ] Implement STRUCTURED_ARRAY itemSchema validation
- [ ] Implement workforceGoalsRanking custom validation (exactly 3 from selected goals)

### Phase 4: Conditional Field Logic
- [ ] Implement field visibility based on conditionalOn/conditionalValue
- [ ] Show/hide conditional fields reactively on parent field change
- [ ] Apply conditionalRequired validation when field is visible
- [ ] Handle multiple conditional chains (e.g., retirement provider → other field)

### Phase 5: Option Groups & Dynamic Options
- [ ] Render optionGroups for MULTI_SELECT with visual grouping
- [ ] Implement dynamicOptions for RANKING (populate from workforceGoals)
- [ ] Sort options by displayOrder within each group

### Phase 6: Error Messages
- [ ] Display inline errors from validationRules.errorMessage
- [ ] Show field-specific error messages (e.g., "Zip code must be exactly 5 digits")
- [ ] Clear errors on field value change

---

## Quick Reference: Conditional Fields

```typescript
// Check if field should be displayed
function shouldShowField(question: Question, formData: any): boolean {
  if (!question.validationRules.conditionalOn) return true;
  
  const parentValue = formData[question.validationRules.conditionalOn];
  const conditionalValue = question.validationRules.conditionalValue;
  
  // For array fields (e.g., supplementalBenefits includes "Other")
  if (Array.isArray(parentValue)) {
    return parentValue.includes(conditionalValue);
  }
  
  // For boolean/string fields
  return parentValue === conditionalValue;
}

// Check if conditional field is required
function isConditionallyRequired(question: Question, formData: any): boolean {
  if (!shouldShowField(question, formData)) return false;
  return question.validationRules.conditionalRequired === true;
}
```

## Quick Reference: Sum Validation

```typescript
function validatePercentageSum(formData: any, sumValidation: SumValidation): boolean {
  const sum = sumValidation.fields.reduce((total, fieldKey) => {
    return total + (Number(formData[fieldKey]) || 0);
  }, 0);
  
  return sum === sumValidation.mustEqual; // Must equal exactly, no tolerance
}
```

---

**Next Steps**: Use this reference to implement FormFieldRenderer component and validation logic per [dashboard.tasks.md](dashboard.tasks.md)
