import { TabArrow } from "@/assets/icons/TabArrow";
import { Button } from "@/components/base/buttons/button";

interface Step {
  id: string;
  label: string;
}

interface ProgressStepperProps {
  steps: Step[];
  currentStep: string;
  completedSteps?: string[];
  onStepChange?: (stepId: string) => void;
}

export function ProgressStepper({
  steps,
  currentStep,
  completedSteps,
  onStepChange,
}: ProgressStepperProps) {
  const currentIndex = steps.findIndex(step => step.id === currentStep);

  console.log("currentIndex", currentIndex);
  return (
    <div className="flex w-full items-center gap-2 rounded-xl border border-ws-gray-50 bg-ws-white p-2">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = completedSteps
          ? completedSteps.includes(step.id)
          : index < currentIndex;
        const isFuture = !isActive && !isCompleted;
        const isClickable = isCompleted || isActive;

        // Determine background and text color based on state
        let bgColor = "bg-cyan-50"; // Current step (blue/cyan)
        let textColor = "text-cyan-500";

        if (isCompleted) {
          // Previous/completed steps: green
          bgColor = "bg-ws-blue-300";
          textColor = "text-ws-white";
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
              className={`flex h-8 flex-1 items-center justify-center rounded-md border px-4 py-2 text-sm font-normal transition-colors ${bgColor} ${textColor} hover:bg-${bgColor} hover:text-${textColor} ${isClickable ? "cursor-pointer hover:opacity-80" : "cursor-not-allowed"} ${isActive ? "border-ws-cyan-70 hover:bg-ws-cyan-70 hover:text-ws-white text-ws-blue-300" : "border-gray-200"}`}
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
