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

const steps = [
  { id: "workforce", label: "Workforce" },
  { id: "compensation", label: "Compensation" },
  { id: "benefits", label: "Benefits" },
  { id: "goals", label: "Goals" },
];

export default function AssessmentWorkforcePage() {
  const [currentStep, setCurrentStep] = useState("workforce");
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);

  // Check if email is verified before allowing access
  useEffect(() => {
    if (!user?.emailVerify) {
      navigate("/dashboard");
    }
  }, [user?.emailVerify, navigate]);

  // Recalculate currentStepIndex whenever currentStep changes
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNext = async () => {
    // setCurrentStep(steps[currentStepIndex + 1].id);
    // This code is required; I will uncomment it.
    const dynamicTabValidation = (
      window as {
        __dynamicTabValidation?: {
          submit: () => Promise<{ success: boolean }>;
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
        if (isLastStep) {
          navigate("/dashboard");
        } else {
          setCurrentStep(steps[currentStepIndex + 1].id);
        }
      }
    } catch (error) {
      console.error("[AssessmentWorkforce] Submit error:", error);
    }
  };

  const handleBack = async () => {
    // Use functional state update to get fresh currentStep value
    setCurrentStep(prevStep => {
      // Recalculate index based on CURRENT state (not closure)
      const currentIndex = steps.findIndex(step => step.id === prevStep);

      // Only navigate to dashboard if on first step (workforce)
      if (currentIndex === 0) {
        console.debug("[AssessmentWorkforce] On first step, navigating to dashboard");
        navigate("/dashboard");
        return prevStep; // Don't change step
      }

      // Ensure we have a valid previous step (defensive check)
      if (currentIndex < 0 || currentIndex >= steps.length) {
        console.error(
          "[AssessmentWorkforce] Invalid step index:",
          currentIndex,
          "prevStep:",
          prevStep
        );
        navigate("/dashboard");
        return prevStep; // Don't change step
      }

      // Calculate previous step explicitly
      const previousStepIndex = currentIndex - 1;
      const previousStep = steps[previousStepIndex];

      if (!previousStep) {
        console.error("[AssessmentWorkforce] No previous step found for index:", previousStepIndex);
        navigate("/dashboard");
        return prevStep; // Don't change step
      }
      return previousStep.id; // Return new step
    });
    setTimeout(async () => {
      const dynamicTabValidation = (
        window as {
          __dynamicTabValidation?: {
            submit: () => Promise<{ success: boolean }>;
          };
        }
      ).__dynamicTabValidation;

      if (dynamicTabValidation) {
        try {
          await dynamicTabValidation.submit();
          console.debug("[AssessmentWorkforce] Data saved after Back navigation");
        } catch (error) {
          console.warn("[AssessmentWorkforce] Background save failed after Back:", error);
        }
      }
    }, 0);
  };

  const handleClose = () => {
    navigate("/dashboard");
  };

  // Get loading state from DynamicTab
  const dynamicTabValidation = (
    window as {
      __dynamicTabValidation?: {
        isSaving?: boolean;
        isLoadingGet?: boolean;
      };
    }
  ).__dynamicTabValidation;

  // const isSaving = dynamicTabValidation?.isSaving || false;
  const isLoadingGet = dynamicTabValidation?.isLoadingGet || false;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
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
          currentStep={currentStep}
          onStepChange={stepId => {
            // Only allow navigation to completed steps or current step
            const targetIndex = steps.findIndex(step => step.id === stepId);
            const currentIdx = steps.findIndex(step => step.id === currentStep);
            if (targetIndex <= currentIdx) {
              setCurrentStep(stepId);
            }
          }}
        />

        {/* Content Area */}
        <div className="bg-white my-8 mx-12.5">
          {currentStep === "workforce" && (
            <WorkforceTab
              onNext={() => setCurrentStep(steps[currentStepIndex + 1].id)}
              onSuccess={() => {}}
            />
          )}
          {currentStep === "compensation" && (
            <CompensationTab
              onNext={() => setCurrentStep(steps[currentStepIndex + 1].id)}
              onSuccess={() => {}}
            />
          )}
          {currentStep === "benefits" && (
            <BenefitsTab
              onNext={() => setCurrentStep(steps[currentStepIndex + 1].id)}
              onSuccess={() => {}}
            />
          )}
          {currentStep === "goals" && (
            <GoalsTab onNext={() => navigate("/dashboard")} onSuccess={() => {}} />
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
