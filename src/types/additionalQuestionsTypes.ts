/** Generic answer map keyed by question ID */
export interface QuestionAnswer {
  [key: string]: string | string[];
}

/** Goals section state shape */
export interface GoalsAnswer {
  selectedGoals: string[];
  topThreeGoals: string[];
}

/** Shape of a single question option */
export interface QuestionOption {
  id: string;
  label: string;
}

/** Shape of a tooltip attached to a question */
export interface QuestionTooltip {
  title: string;
  description: string;
}

/** Shape of a standard question definition used in question data arrays */
export interface QuestionDefinition {
  id: string;
  question: string;
  required: boolean;
  options: QuestionOption[];
  isMultiSelect?: boolean;
  isDropdown?: boolean;
  hasConditional?: boolean;
  tooltip?: QuestionTooltip;
}
