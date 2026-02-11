export interface QuestionField {
  name: string;
  label: string;
  placeholder: string;
  type: string;
  required: boolean;
  width: string;
  options?: Array<{ id: string; label: string }>;
}

export interface ValidationRules {
  type: string;
  required: boolean;
  min?: number;
  max?: number;
  minItems?: number;
  maxItems?: number;
  minSelections?: number;
  errorMessage?: string;
  fields?: QuestionField[];
  conditionalOn?: string;
  conditionalValue?: unknown;
  conditionalRequired?: boolean;
  sumValidation?: {
    fields: string[];
    mustEqual: number;
  };
  relatedField?: string;
  maxLength?: number;
  pattern?: string;
}

export interface ConditionalQuestion {
  showWhen: string;
  question: Question;
}

export interface OptionGroup {
  groupName: string;
  options: Array<{ label: string; value: string; displayOrder: number }>;
}

export interface QuestionOption {
  label: string;
  value: string;
  displayOrder: number;
  group?: string;
}

export interface SubField {
  key: string;
  label: string;
  options: Array<{ label: string; value: string; displayOrder: number }>;
}

export type QuestionType =
  | "SINGLE_SELECT"
  | "SINGLE_SELECT_DROPDOWN"
  | "MULTIPLE_CHOICE"
  | "YES_NO"
  | "STRUCTURED_ARRAY"
  | "NUMERIC"
  | "NUMBER_INPUT"
  | "TEXT_INPUT"
  | "PARTICIPATION_RATES"
  | "RANKING";

export interface Question {
  key: string;
  questionText: string;
  questionType: QuestionType;
  displayOrder: number;
  validationRules: ValidationRules;
  schemaVersion: number;
  isRequired: boolean;
  options?: QuestionOption[];
  subFields?: SubField[];
  placeholder?: string;
  conditionalQuestion?: {
    showWhen: string;
    question: Question;
  };
  metadata?: Record<string, unknown>;
}

export interface Section {
  name: string;
  displayOrder: number;
  description: string;
  questions: Question[];
}

export interface AssessmentData {
  sections: Section[];
}
