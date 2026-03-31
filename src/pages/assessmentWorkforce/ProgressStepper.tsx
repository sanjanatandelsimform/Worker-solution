import { TabArrow } from "@/assets/icons/TabArrow";
import { useState } from "react";

interface Step {
  id: string;
  label: string;
}

interface ProgressStepperProps {
  steps: Step[];
  currentStep: string;
  resolvedStep: string | null;
  completedSteps?: string[];
  onStepChange?: (stepId: string) => void;
}

export function ProgressStepper({
  steps,
  currentStep,
  resolvedStep,
  completedSteps = [],
  onStepChange,
}: ProgressStepperProps) {
  const [hoveredStep, setHoveredStep] = useState<string | null>(null);

  const resolvedIndex = steps.findIndex(step => step.id === resolvedStep);

  return (
    <div className="flex w-full items-center gap-2 rounded-xl border border-ws-primary-100 bg-ws-white p-2">
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(step.id);
        const isCurrent = step.id === resolvedStep; // actual progress position
        const isActiveFocus = step.id === currentStep && !isCurrent && isCompleted; // viewing a past step
        const isClickable = isCompleted || isCurrent;
        const isHovered = hoveredStep === step.id && isClickable;

        let bgColor: string;
        let textColor: string;
        let borderClass: string;

        if (isHovered) {
          // Hover: teal bg + white text + teal border (same look as Active Focus but filled)
          bgColor = "bg-ws-tab-active";
          textColor = "text-ws-tab-active-text";
          borderClass = "border-1 border-ws-gray-40";
        } else if (isActiveFocus) {
          // Active Focus: white bg + teal text + teal border
          bgColor = "bg-ws-tab-bg";
          textColor = "text-ws-tab-active-text";
          borderClass = "border-1 border-ws-gray-40";
        } else if (isCompleted) {
          // Completed: dark teal solid bg + white text
          bgColor = "bg-ws-tab-active";
          textColor = "text-ws-tab-active-text";
          borderClass = "border-1 border-ws-gray-40";
        } else if (isCurrent) {
          // Current: white bg + mid gray text + gray border
          bgColor = "bg-ws-tab-bg";
          textColor = "text-ws-tab-active-text";
          borderClass = "border-1 border-ws-gray-40";
        } else {
          // Disabled / Future: light gray bg + light text
          bgColor = "bg-ws-gray-30";
          textColor = "text-ws-black-10";
          borderClass = "border border-ws-gray-40";
        }

        return (
          <div key={step.id} className="flex flex-1 items-center gap-2">
            <button
              onClick={() => isClickable && onStepChange?.(step.id)}
              onMouseEnter={() => isClickable && setHoveredStep(step.id)}
              onMouseLeave={() => setHoveredStep(null)}
              disabled={!isClickable}
              className={`
                flex h-8 flex-1 items-center justify-center rounded-md px-4 py-2
                text-sm font-normal transition-colors duration-150
                ${bgColor} ${textColor} ${borderClass}
                ${isClickable ? "cursor-pointer" : "cursor-not-allowed"}
              `}
            >
              {step.label}
            </button>

            {index < steps.length - 1 && (
              <TabArrow
                className={`
                  flex-shrink-0 transition-colors
                  ${index < resolvedIndex ? "text-ws-gray-100" : "text-ws-gray-50"}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
