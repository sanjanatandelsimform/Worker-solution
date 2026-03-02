import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, XClose } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { ProgressStepper } from "./ProgressStepper";
import WorkforceTab from "./WorkforceTab";
import CompensationTab from "./CompensationTab";
import BenefitsTab from "./BenefitsTab";
import GoalsTab from "./GoalsTab";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/selectors/authSelectors";
import { useAssessmentStatus } from "@/hooks/useAssessmentStatus";

const steps = [
  { id: "workforce", label: "Workforce" },
  { id: "compensation", label: "Compensation" },
  { id: "benefits", label: "Benefits" },
  { id: "goals", label: "Goals" },
];
// Helper: returns first incomplete step id
const getInitialStep = (completionCount: number): string | null => {
  if (completionCount >= steps.length) return null;
  return steps[completionCount].id;
};

export default function AssessmentWorkforcePage() {
  const { completionCount, isLoading, sectionCompletion, refetch } = useAssessmentStatus();
  const [manualStep, setManualStep] = useState<string | null>(null);
  const resolvedStep = !isLoading ? getInitialStep(completionCount) : null;
  const currentStep = manualStep ?? resolvedStep;

  const navigate = useNavigate();
  const user = useAppSelector(selectUser);

  // useEffect(() => {
  //   if (!isLoading && completionCount >= steps.length) {
  //     navigate("/dashboard");
  //   }
  // }, [isLoading, completionCount, navigate]);

  // // Check if email is verified before allowing access
  useEffect(() => {
    if (!user?.emailVerify) {
      navigate("/dashboard");
    }
  }, [user?.emailVerify, navigate]);

  // Recalculate currentStepIndex whenever currentStep changes
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const isLastStep = currentStepIndex === steps.length - 1;

  const completedStepIds = steps
    .filter(step => {
      if (!sectionCompletion) return false;
      const key = step.id as keyof typeof sectionCompletion;
      return sectionCompletion[key];
    })
    .map(step => step.id);

  const handleNext = async () => {
    // setManualStep(steps[currentStepIndex + 1].id);
    // This code is required; I will uncomment it.
    const dynamicTabValidation = (
      window as {
        __dynamicTabValidation?: {
          submit: () => Promise<{ success: boolean }>;
          clearErrors?: () => void;
          validate: () => boolean;
          getAnswers: () => Record<string, unknown>;
          getErrors: () => Record<string, string>;
        };
      }
    ).__dynamicTabValidation;

    if (!dynamicTabValidation) {
      console.error("[AssessmentWorkforce] Dynamic tab validation not found!");
      alert("Validation system not initialized. Please refresh the page.");
      return;
    }

    try {
      const response = await dynamicTabValidation.submit();
      if (response.success) {
        await refetch();
        if (isLastStep) {
          // navigate("/dashboard");
        } else {
          setManualStep(steps[currentStepIndex + 1].id);
        }
      }
    } catch (error) {
      console.error("[AssessmentWorkforce] Submit error:", error);
    }
  };

  const handleBack = async () => {
    const dynamicTabValidation = (
      window as {
        __dynamicTabValidation?: {
          submit: () => Promise<{ success: boolean }>;
          saveWithoutValidation?: () => Promise<{ success: boolean }>;
          clearErrors?: () => void;
        };
      }
    ).__dynamicTabValidation;

    dynamicTabValidation?.clearErrors?.();

    // Use currentStep directly (manualStep ?? resolvedStep) instead of prevStep
    // prevStep would be null if user landed here via resolvedStep without setting manualStep
    const currentIndex = steps.findIndex(step => step.id === currentStep);

    if (currentIndex <= 0) {
      navigate("/dashboard");
      return;
    }

    const previousStep = steps[currentIndex - 1];
    if (!previousStep) {
      navigate("/dashboard");
      return;
    }

    setManualStep(previousStep.id);
  };

  const handleClose = () => {
    navigate("/dashboard");
  };

  const isLoadingGet = currentStep === null;

  return (
    <div className="flex min-h-screen flex-col bg-ws-color-gray-20">
      {/* Top Navigation Bar */}
      <div className="flex h-14 items-center justify-between border-b border-cyan-700 bg-cyan-500 px-6 py-4">
        {/* Back Button */}
        <Button
          color="tertiary"
          size="md"
          iconLeading={<ChevronLeft data-icon />}
          onClick={handleBack}
          isDisabled={isLoadingGet}
          className={`flex items-center gap-1 text-lg font-normal text-white transition-opacity ${
            isLoadingGet ? "cursor-not-allowed opacity-40" : "hover:opacity-80"
          }`}
        >
          Back
        </Button>

        {/* Title */}
        <h1 className="text-lg font-medium text-ws-white">Assessment</h1>

        {/* Close Button */}
        <Button
          color="tertiary"
          size="md"
          iconLeading={<XClose data-icon />}
          onClick={handleClose}
          className="text-ws-white transition-opacity hover:opacity-80"
        />
      </div>

      {/* Main Content Area */}
      <div className="mx-auto w-full max-w-4xl flex-1 space-y-3 py-8 px-4">
        {/* Progress Stepper */}
        <ProgressStepper
          steps={steps}
          currentStep={currentStep ?? "workforce"}
          completedSteps={completedStepIds}
          onStepChange={stepId => {
            if (stepId === currentStep) {
              setManualStep(stepId);
              return;
            }

            // Only allow navigation to steps where data exists
            // and all previous steps are completed
            const targetIndex = steps.findIndex(step => step.id === stepId);
            if (targetIndex === -1) return;

            const completion = sectionCompletion ?? {
              workforce: false,
              compensation: false,
              benefits: false,
              goals: false,
            };

            const targetKey = stepId as keyof typeof completion;
            if (!completion[targetKey]) {
              return;
            }

            for (let i = 0; i < targetIndex; i += 1) {
              const prevKey = steps[i].id as keyof typeof completion;
              if (!completion[prevKey]) {
                return;
              }
            }

            setManualStep(stepId);
          }}
        />
        {/* Content Area */}
        <div className="my-8 mx-12.5">
          {currentStep === null ? (
            // Don't render anything until we know which tab to start on
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-ws-cyan-60 border-t-transparent" />
            </div>
          ) : (
            <>
              {currentStep === "workforce" && (
                <WorkforceTab
                  onNext={() => setManualStep(steps[currentStepIndex + 1].id)}
                  onSuccess={() => {}}
                />
              )}
              {currentStep === "compensation" && (
                <CompensationTab
                  onNext={() => setManualStep(steps[currentStepIndex + 1].id)}
                  onSuccess={() => {}}
                />
              )}
              {currentStep === "benefits" && (
                <BenefitsTab
                  onNext={() => setManualStep(steps[currentStepIndex + 1].id)}
                  onSuccess={() => {}}
                />
              )}
              {currentStep === "goals" && <GoalsTab onNext={() => {}} onSuccess={() => {}} />}
            </>
          )}
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="flex items-center justify-end border-t border-gray-300 bg-white px-6 py-2.5">
        <Button
          color="primary"
          size="md"
          onClick={handleNext}
          className="min-w-30"
          // isDisabled={isSaving} // Only disable during save, NOT during restore
          // isLoading={isSaving}
        >
          {isLastStep ? "Submit" : "Next"}
        </Button>
      </div>
    </div>
  );
}
