/**
 * Assessment Storage Helper
 * Manages localStorage persistence for assessment progress
 * Follows the same pattern as Auth/Profile Settings storage
 */

const STORAGE_KEY = "assessment_progress";
const COMPLETION_KEY = "assessment_completion";

export interface AssessmentProgress {
  workforce?: Record<string, unknown>;
  compensation?: Record<string, unknown>;
  benefits?: Record<string, unknown>;
  goals?: Record<string, unknown>;
  lastUpdated?: string;
  currentStep?: string;
}

export interface AssessmentCompletion {
  completedTabs: string[];
  completionCount: number;
  lastCompletedAt?: string;
}

/**
 * Save assessment progress to localStorage
 */
export const saveAssessmentProgress = (
  section: "workforce" | "compensation" | "benefits" | "goals",
  data: Record<string, unknown>
): void => {
  try {
    const existing = loadAssessmentProgress();
    const updated = {
      ...existing,
      [section]: data,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to save assessment progress:", error);
  }
};

/**
 * Load all assessment progress from localStorage
 */
export const loadAssessmentProgress = (): AssessmentProgress => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error("Failed to load assessment progress:", error);
    return {};
  }
};

/**
 * Load progress for a specific section
 */
export const loadSectionProgress = (
  section: "workforce" | "compensation" | "benefits" | "goals"
): Record<string, unknown> => {
  const progress = loadAssessmentProgress();
  return progress[section] || {};
};

/**
 * Clear assessment progress (for logout or reset)
 */
export const clearAssessmentProgress = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(COMPLETION_KEY);
  } catch (error) {
    console.error("Failed to clear assessment progress:", error);
  }
};

/**
 * Save current step/tab
 */
export const saveCurrentStep = (step: string): void => {
  try {
    const existing = loadAssessmentProgress();
    const updated: AssessmentProgress = {
      ...existing,
      currentStep: step,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to save current step:", error);
  }
};

/**
 * Load current step/tab
 */
export const loadCurrentStep = (): string | null => {
  const progress = loadAssessmentProgress();
  return progress.currentStep || null;
};

/**
 * Mark a tab as completed
 */
export const markTabCompleted = (tabName: string): void => {
  try {
    const existing = loadCompletionStatus();
    if (!existing.completedTabs.includes(tabName)) {
      const updated: AssessmentCompletion = {
        completedTabs: [...existing.completedTabs, tabName],
        completionCount: existing.completionCount + 1,
        lastCompletedAt: new Date().toISOString(),
      };
      localStorage.setItem(COMPLETION_KEY, JSON.stringify(updated));
    }
  } catch (error) {
    console.error("Failed to mark tab as completed:", error);
  }
};

/**
 * Check if a tab is completed
 */
export const isTabCompleted = (tabName: string): boolean => {
  const completion = loadCompletionStatus();
  return completion.completedTabs.includes(tabName);
};

/**
 * Load completion status
 */
export const loadCompletionStatus = (): AssessmentCompletion => {
  try {
    const stored = localStorage.getItem(COMPLETION_KEY);
    return stored ? JSON.parse(stored) : { completedTabs: [], completionCount: 0 };
  } catch (error) {
    console.error("Failed to load completion status:", error);
    return { completedTabs: [], completionCount: 0 };
  }
};

/**
 * Get completion percentage (0-100)
 */
export const getCompletionPercentage = (): number => {
  const completion = loadCompletionStatus();
  const totalTabs = 4; // workforce, compensation, benefits, goals
  return Math.round((completion.completionCount / totalTabs) * 100);
};

/**
 * Check if assessment is fully completed
 */
export const isAssessmentComplete = (): boolean => {
  const completion = loadCompletionStatus();
  return completion.completionCount === 4;
};

/**
 * Auto-save with debounce (call this on input change)
 */
let autoSaveTimeout: ReturnType<typeof setTimeout> | null = null;

export const autoSaveProgress = (
  section: "workforce" | "compensation" | "benefits" | "goals",
  data: Record<string, unknown>,
  delay: number = 500
): void => {
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
  }

  autoSaveTimeout = setTimeout(() => {
    saveAssessmentProgress(section, data);
  }, delay);
};
