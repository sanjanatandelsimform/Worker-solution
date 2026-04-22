import { Button } from "@/components/base/buttons/button";
import { ChevronRight, XClose } from "@untitledui/icons";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ErrorMessage from "@/components/common/ErrorMessage";
import { useSubmitFinchAssessment } from "@/hooks/useSubmitFinchAssessment";
import { useAssessmentStatus } from "@/hooks/useAssessmentStatus";
import { useFinchStatus } from "@/hooks/useFinchStatus";
import { buildFinchAssessmentPayload } from "@/utils/finchAssessmentPayload";
import type { QuestionAnswer, GoalsAnswer } from "@/types/additionalQuestionsTypes";
import WorkforceSection from "./WorkforceSection";
import CompensationSection from "./CompensationSection";
import BenefitsRetirementSection from "./BenefitsRetirementSection";
import GoalsSection from "./GoalsSection";

export default function AdditionalQuestions() {
  const navigate = useNavigate();
  const { isFinchCompleted } = useAssessmentStatus();
  const { isConnected, isLoading: isFinchStatusLoading } = useFinchStatus();
  const [answers, setAnswers] = useState<QuestionAnswer>({});
  const [goalsAnswers, setGoalsAnswers] = useState<GoalsAnswer>({
    selectedGoals: [],
    topThreeGoals: [],
  });
  const [annualRaiseMonth, setAnnualRaiseMonth] = useState<string>("");
  const [payrollProvider, setPayrollProvider] = useState<string>("");
  const [benefitsEnrollmentMonth, setBenefitsEnrollmentMonth] = useState<string>("");
  const [retirementMatchPercentage, setRetirementMatchPercentage] = useState<string>("");
  const [healthPremiumMonthly, setHealthPremiumMonthly] = useState<string>("");
  const { isSubmitting, error, success, submit, clearError } = useSubmitFinchAssessment();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isFinchCompleted) {
      navigate("/dashboard");
    }
  }, [isFinchCompleted, navigate]);

  useEffect(() => {
    if (!isFinchStatusLoading && !isConnected) {
      navigate("/dashboard");
    }
  }, [isConnected, isFinchStatusLoading, navigate]);

  useEffect(() => {
    if (success) {
      navigate("/dashboard");
    }
  }, [success, navigate]);

  const handleClose = () => {
    navigate("/dashboard");
  };

  const handleClearFieldError = (key: string) => {
    setFieldErrors(prev => ({ ...prev, [key]: "" }));
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    if (questionId === "retirement-employer-match" && value === "no-match") {
      setRetirementMatchPercentage("");
    }
    if (fieldErrors[questionId]) {
      setFieldErrors(prev => ({ ...prev, [questionId]: "" }));
    }
  };

  const handleMultiSelectToggle = (questionId: string, optionId: string) => {
    setAnswers(prev => {
      const current = prev[questionId];
      const currentArray = Array.isArray(current) ? current : [];
      return {
        ...prev,
        [questionId]: currentArray.includes(optionId)
          ? currentArray.filter(id => id !== optionId)
          : [...currentArray, optionId],
      };
    });
    if (fieldErrors[questionId]) {
      setFieldErrors(prev => ({ ...prev, [questionId]: "" }));
    }
  };

  const handleGoalToggle = (goalId: string) => {
    setGoalsAnswers(prev => ({
      ...prev,
      selectedGoals: prev.selectedGoals.includes(goalId)
        ? prev.selectedGoals.filter(id => id !== goalId)
        : [...prev.selectedGoals, goalId],
    }));
    if (fieldErrors["selectedGoals"]) {
      setFieldErrors(prev => ({ ...prev, selectedGoals: "" }));
    }
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};

    if (goalsAnswers.selectedGoals.length < 3) {
      newErrors["selectedGoals"] = "Please select at least 3 workforce goals to rank them.";
    }
    const benefitsUpdates = answers["benefits-updates"];
    if (!benefitsUpdates || (Array.isArray(benefitsUpdates) && benefitsUpdates.length === 0)) {
      newErrors["benefits-updates"] = "Select an option";
    }
    if (!answers["deskless-employees"]) {
      newErrors["deskless-employees"] = "Select an option";
    }
    if (!answers["annual-raises"]) {
      newErrors["annual-raises"] = "Select an option";
    }
    if (!payrollProvider) {
      newErrors["payroll-provider"] = "Select an option";
    }
    if (answers["annual-raises"] === "yes-raises" && !annualRaiseMonth) {
      newErrors["annualRaiseMonth"] = "Please select a month.";
    }
    if (!answers["benefits-broker"]) {
      newErrors["benefits-broker"] = "Select an option";
    }
    if (!benefitsEnrollmentMonth) {
      newErrors["benefits-enrollment-period"] = "Select an option";
    }
    if (!healthPremiumMonthly) {
      newErrors["health-plan-monthly-premium"] = "Enter an amount";
    }
    if (!answers["retirement-vesting-period"]) {
      newErrors["retirement-vesting-period"] = "Select an option";
    }
    if (!answers["retirement-employer-match"]) {
      newErrors["retirement-employer-match"] = "Select an option";
    }
    if (answers["retirement-employer-match"] === "yes-match" && !retirementMatchPercentage) {
      newErrors["retirementMatchPercentage"] = "Please enter a percentage.";
    } else if (
      answers["retirement-employer-match"] === "yes-match" &&
      Number(retirementMatchPercentage) > 100
    ) {
      newErrors["retirementMatchPercentage"] = "Percentage must be 100 or less.";
    }
    if (!answers["retirement-auto-enroll"]) {
      newErrors["retirement-auto-enroll"] = "Select an option";
    }
    if (!answers["retirement-hardship-withdrawals"]) {
      newErrors["retirement-hardship-withdrawals"] = "Select an option";
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      setTimeout(() => {
        document
          .querySelector("[data-field-error]")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 0);
      return;
    }

    setFieldErrors({});
    const payload = buildFinchAssessmentPayload(
      answers,
      goalsAnswers,
      annualRaiseMonth,
      payrollProvider,
      benefitsEnrollmentMonth,
      answers["retirement-employer-match"] === "yes-match",
      retirementMatchPercentage,
      healthPremiumMonthly
    );
    await submit(payload);
  };

  return (
    <div className="flex min-h-screen flex-col bg-ws-navy-25">
      {/* Top Navigation Bar */}
      <div className="flex h-14 items-center justify-end border-b border-ws-navy-700 px-6 py-4">
        <Button
          onClick={handleClose}
          color="link"
          size="md"
          iconLeading={<XClose data-icon className="font-bold text-ws-navy-800" />}
        />
      </div>

      <div className="mx-auto w-full max-w-4xl flex-1 space-y-3 py-8 px-4">
        {success && (
          <ErrorMessage
            errorType="success"
            errorMessage="Assessment submitted successfully!"
            onClose={() => {
              /* navigation handled by useEffect */
            }}
          />
        )}
        {error && <ErrorMessage errorType="danger" errorMessage={error} onClose={clearError} />}

        <div className="space-y-6">
          <div className="w-full">
            <h2 className="text-3xl font-medium mb-2 text-ws-text-primary">Almost there!</h2>
            <p className="text-base text-ws-text-secondary">
              While we intergrate with Finch to automatically sync your HR and payroll data, fill
              out this short assessment so we can tailor our recommendations to your goals.
            </p>
          </div>

          <WorkforceSection
            answers={answers}
            fieldErrors={fieldErrors}
            onAnswerChange={handleAnswerChange}
            onMultiSelectToggle={handleMultiSelectToggle}
          />

          <CompensationSection
            answers={answers}
            fieldErrors={fieldErrors}
            annualRaiseMonth={annualRaiseMonth}
            payrollProvider={payrollProvider}
            onAnswerChange={handleAnswerChange}
            onMultiSelectToggle={handleMultiSelectToggle}
            onAnnualRaiseMonthChange={setAnnualRaiseMonth}
            onPayrollProviderChange={setPayrollProvider}
            onClearFieldError={handleClearFieldError}
          />

          <BenefitsRetirementSection
            answers={answers}
            fieldErrors={fieldErrors}
            benefitsEnrollmentMonth={benefitsEnrollmentMonth}
            retirementMatchPercentage={retirementMatchPercentage}
            healthPremiumMonthly={healthPremiumMonthly}
            onAnswerChange={handleAnswerChange}
            onBenefitsEnrollmentMonthChange={setBenefitsEnrollmentMonth}
            onRetirementMatchPercentageChange={setRetirementMatchPercentage}
            onHealthPremiumMonthlyChange={setHealthPremiumMonthly}
            onClearFieldError={handleClearFieldError}
          />

          <GoalsSection
            goalsAnswers={goalsAnswers}
            fieldErrors={fieldErrors}
            onGoalToggle={handleGoalToggle}
            onTopThreeGoalsChange={value =>
              setGoalsAnswers(prev => ({ ...prev, topThreeGoals: value }))
            }
          />
        </div>

        <div className="flex gap-8 my-6 justify-end">
          <Button
            color="primary"
            size="md"
            iconTrailing={<ChevronRight data-icon />}
            onClick={handleSubmit}
            isDisabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
