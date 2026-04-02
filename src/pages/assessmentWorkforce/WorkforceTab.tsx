import { useMemo } from "react";
import { DynamicTab } from "@/components/assessment/DynamicTab";
import questionData from "@/data/assessment/questionData.json";
import type { Question } from "@/types/questionTypes";
import { useStatesLookup } from "@/hooks/useStatesLookup";

interface WorkforceTabProps {
  onNext?: () => void;
  onSuccess?: () => void;
}

export default function WorkforceTab({ onNext, onSuccess }: WorkforceTabProps) {
  const { stateOptions, isLoading, error } = useStatesLookup();
  const workforceSection = questionData.sections.find(section => section.name === "Workforce");

  /**
   * Deep-clone questions and inject API-sourced state options into:
   * 1. topWorkLocations → validationRules.fields[0].options
   * 2. employeesResideInSameZipCodes → conditionalQuestion.question.validationRules.fields[0].options
   *
   * Uses useMemo keyed on [stateOptions, isLoading, error] to avoid re-cloning on every render.
   * DynamicTab passes question objects by reference — cloning here is required (FR-009).
   */
  const modifiedQuestions = useMemo((): Question[] => {
    if (!workforceSection) return [];

    // Deep-clone to avoid mutating the static JSON import
    const cloned = JSON.parse(JSON.stringify(workforceSection.questions)) as Question[];

    // Determine what options to inject based on hook state
    const resolvedOptions = (() => {
      if (error) return [];
      if (isLoading) return [];
      return stateOptions;
    })();

    // Determine placeholder text for loading/error states
    const placeholder = (() => {
      if (isLoading) return "Loading states...";
      if (error) return "State options unavailable";
      return undefined;
    })();

    for (const question of cloned) {
      // Path 1: topWorkLocations → fields[0].options
      if (question.key === "topWorkLocations") {
        const fields = question.validationRules?.fields;
        if (fields?.[0]) {
          fields[0].options = resolvedOptions;
          if (placeholder) {
            fields[0].placeholder = placeholder;
          }
        }
      }

      // Path 2: employeesResideInSameZipCodes → conditionalQuestion.question.fields[0].options
      if (question.key === "employeesResideInSameZipCodes") {
        const fields = question.conditionalQuestion?.question?.validationRules?.fields;
        if (fields?.[0]) {
          fields[0].options = resolvedOptions;
          if (placeholder) {
            fields[0].placeholder = placeholder;
          }
        }
      }
    }

    return cloned;
  }, [stateOptions, isLoading, error, workforceSection]);

  if (!workforceSection) {
    return <div className="text-ws-red-40">Workforce section not found in question data</div>;
  }

  return (
    <DynamicTab
      section="workforce"
      questions={modifiedQuestions}
      onNext={onNext}
      onSuccess={onSuccess}
    />
  );
}
