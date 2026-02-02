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

  const handleNext = () => {
    if (isLastStep) {
      // Handle form submission
      console.log("Submitting assessment...");
      // Add your submission logic here (e.g., API call to save assessment data)
      navigate("/dashboard");
    } else {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  const handleClose = () => {
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="flex h-14 items-center justify-between border-b border-cyan-700 bg-cyan-500 px-6 py-4">
        {/* Back Button */}
        {/* <Button
          onClick={handleBack}
          disabled={isFirstStep}
          className={`flex items-center gap-1 text-lg font-normal text-white transition-opacity ${
            isFirstStep ? "cursor-not-allowed opacity-40" : "hover:opacity-80"
          }`}
        >
          <ChevronLeft className="size-6" />
          <span>Back</span>
        </Button> */}
        <Button
          color="tertiary"
          size="md"
          iconLeading={<ChevronLeft data-icon />}
          onClick={handleBack}
          disabled={isFirstStep}
          className={`flex items-center gap-1 text-lg font-normal text-white transition-opacity ${
            isFirstStep ? "cursor-not-allowed opacity-40" : "hover:opacity-80"
          }`}
        >
          Back
        </Button>
        {/* Title */}
        <h1 className="text-lg font-medium text-white">Assessment</h1>

        {/* Close Button */}
        {/* <Button
          onClick={handleClose}
          className="text-white transition-opacity hover:opacity-80"
          aria-label="Close assessment"
        >
          <XClose className="size-6" />
        </Button> */}
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
          {currentStep === "workforce" && <WorkforceTab />}
          {currentStep === "compensation" && <CompensationTab />}
          {currentStep === "benefits" && <BenefitsTab />}
          {currentStep === "goals" && <GoalsTab />}
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="flex items-center justify-end border-t border-gray-300 bg-white px-6 py-2.5">
        <Button color="primary" size="md" onClick={handleNext} className="min-w-30">
          {isLastStep ? "Submit" : "Next"}
        </Button>
      </div>
    </div>
  );
}
