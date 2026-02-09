import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, XClose } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { ProgressStepper } from "./ProgressStepper";
import WorkforceTab from "./WorkforceTab";
import CompensationTab from "./CompensationTab";
import BenefitsTab from "./BenefitsTab";
import GoalsTab from "./GoalsTab";

const steps = [
  { id: "workforce", label: "Workforce" },
  { id: "compensation", label: "Compensation" },
  { id: "benefits", label: "Benefits" },
  { id: "goals", label: "Goals" },
];

export default function AssessmentWorkforcePage() {
  const [currentStep, setCurrentStep] = useState("workforce");
  const navigate = useNavigate();

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNext = async () => {
    setCurrentStep(steps[currentStepIndex + 1].id);
    // This code is required; I will uncomment it.
    // const dynamicTabValidation = (
    //   window as {
    //     __dynamicTabValidation?: {
    //       submit: () => Promise<{ success: boolean }>;
    //       validate: () => boolean;
    //       getAnswers: () => Record<string, unknown>;
    //       getErrors: () => Record<string, string>;
    //     };
    //   }
    // ).__dynamicTabValidation;

    // if (!dynamicTabValidation) {
    //   console.error("[AssessmentWorkforce] Dynamic tab validation not found!");
    //   alert("Validation system not initialized. Please refresh the page.");
    //   return;
    // }

    // try {
    //   const response = await dynamicTabValidation.submit();

    //   if (response.success) {
    //     if (isLastStep) {
    //       navigate("/dashboard");
    //     } else {
    //       setCurrentStep(steps[currentStepIndex + 1].id);
    //     }
    //   }
    // } catch (error) {
    //   console.error("[AssessmentWorkforce] Submit error:", error);
    // }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    } else {
      navigate("/dashboard");
    }
  };

  const handleClose = () => {
    navigate("/dashboard");
  };

  // Get loading state from DynamicTab
  // const isSaving = (window as any).__dynamicTabValidation?.isSaving || false;

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
          // disabled={isFirstStep}
          // className={`flex items-center gap-1 text-lg font-normal text-white transition-opacity ${
          //   isFirstStep ? "cursor-not-allowed opacity-40" : "hover:opacity-80"
          // }`}
          className={`flex items-center gap-1 text-lg font-normal text-white transition-opacity`}
        >
          Back
        </Button>

        {/* Title */}
        <h1 className="text-lg font-medium text-white">Assessment</h1>

        {/* Close Button */}
        <Button
          color="tertiary"
          size="md"
          iconLeading={<XClose data-icon />}
          onClick={handleClose}
          className="text-white transition-opacity hover:opacity-80"
        />
      </div>

      {/* Main Content Area */}
      <div className="mx-auto w-full max-w-4xl flex-1 space-y-3 py-8">
        {/* Progress Stepper */}
        <ProgressStepper steps={steps} currentStep={currentStep} onStepChange={setCurrentStep} />

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
          // isDisabled={isSubmitting || isSaving}
          // isLoading={isSubmitting}
        >
          {isLastStep ? "Submit" : "Next"}
        </Button>
      </div>
    </div>
  );
}
