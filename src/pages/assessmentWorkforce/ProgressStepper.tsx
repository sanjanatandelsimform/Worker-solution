import { TabArrow } from "@/assets/icons/TabArrow";
import { Button } from "@/components/base/buttons/button";

interface Step {
  id: string;
  label: string;
}

interface ProgressStepperProps {
  steps: Step[];
  currentStep: string;
  onStepChange?: (stepId: string) => void;
}

export function ProgressStepper({ steps, currentStep, onStepChange }: ProgressStepperProps) {
  const currentIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className="flex w-full items-center gap-2 rounded-xl border border-ws-gray-50 bg-ws-white p-2">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = index < currentIndex;
        const isFuture = index > currentIndex;
        const isClickable = isCompleted || isActive;

        // Determine background and text color based on state
        let bgColor = "bg-cyan-50"; // Current step (blue/cyan)
        let textColor = "text-cyan-500";

        if (isCompleted) {
          // Previous/completed steps: green
          bgColor = "bg-green-50";
          textColor = "text-green-600";
        } else if (isFuture) {
          // Future/next steps: gray
          bgColor = "bg-gray-100";
          textColor = "text-ws-gray-70";
        }

        return (
          <div key={step.id} className="flex flex-1 items-center gap-2">
            {/* Step Button */}
            <Button
              onClick={() => isClickable && onStepChange?.(step.id)}
              disabled={!isClickable}
              className={`flex h-8 flex-1 items-center justify-center rounded-md border border-gray-200 px-4 py-2 text-sm font-normal transition-colors ${bgColor} ${textColor} ${isClickable ? "cursor-pointer hover:opacity-80" : "cursor-not-allowed"}`}
            >
              {step.label}
            </Button>

            {/* Chevron Separator (except after last step) */}
            {index < steps.length - 1 && (
              <TabArrow
                className={`${index < currentIndex ? "text-ws-gray-100" : "text-ws-gray-50"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
