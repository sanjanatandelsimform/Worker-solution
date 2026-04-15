import { Button } from "@/components/base/buttons/button";
import { ChevronRight, InfoCircle, XClose } from "@untitledui/icons";
import { InputInfo } from "@/assets/icons/inputInfo";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RadioButton, RadioGroup } from "@/components/base/radio-buttons/radio-buttons";
import { Label } from "@/components/base/input/label";
import { Select } from "@/components/base/select/select";
import { SelectItem } from "@/components/base/select/select-item";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import ErrorMessage from "@/components/common/ErrorMessage";
import { RankingList } from "@/components/common/RankList";
import { goalsData } from "@/data/goalsData";
import { useSubmitFinchAssessment } from "@/hooks/useSubmitFinchAssessment";
import { useAssessmentStatus } from "@/hooks/useAssessmentStatus";
import { useFinchStatus } from "@/hooks/useFinchStatus";
import { buildFinchAssessmentPayload } from "@/utils/finchAssessmentPayload";
import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";

interface QuestionAnswer {
  [key: string]: string | string[];
}

interface GoalsAnswer {
  selectedGoals: string[];
  topThreeGoals: string[];
}

const questions = [
  {
    id: "benefits-updates",
    question: "Where are employees most likely to receive benefits updates?",
    required: true,
    isMultiSelect: true,
    options: [
      { id: "work_email", label: "Work (email and/or text)" },
      { id: "personal_email", label: "Personal device (email and/or text)" },
      { id: "office_signs", label: "Office flyer, in-office experience" },
    ],
  },
  {
    id: "deskless-employees",
    question: "Are many employees deskless (performing job duties outside of an office setting)?",
    required: true,
    options: [
      { id: "yes-deskless", label: "Yes" },
      { id: "no-deskless", label: "No" },
    ],
  },
  {
    id: "commute-methods",
    question: "What is the most common commute methods among your employees?",
    required: false,
    isMultiSelect: true,
    options: [
      { id: "train", label: "Train" },
      { id: "bus", label: "Bus" },
      { id: "car", label: "Car" },
      { id: "bike", label: "Bike" },
      { id: "walking", label: "Walking" },
      { id: "group_transportation", label: "Group Transportation (i.e. Carpooling, Company bus)" },
    ],
  },
  {
    id: "commute-duration",
    question: "How long are employees commuting to the office (estimated average time)",
    required: false,
    options: [
      { id: ">15min", label: "> 15min" },
      { id: "15-30min", label: "15-30min" },
      { id: "30-1hr", label: "30-1hr min" },
      { id: "1hr+", label: "1hr +" },
    ],
  },
];

const compensationQuestions = [
  {
    id: "annual-raises",
    question: "Do you offer annual raises?",
    required: true,
    options: [
      { id: "yes-raises", label: "Yes" },
      { id: "no-raises", label: "No" },
    ],
    hasConditional: true,
  },

  {
    id: "payroll-provider",
    question: "Who is your company's payroll provider?",
    required: true,
    isDropdown: true,
    options: [
      { id: "ADP", label: "ADP" },
      { id: "Paychex", label: "Paychex" },
      { id: "Paycom", label: "Paycom" },
      { id: "Paylocity", label: "Paylocity" },
      { id: "Gusto", label: "Gusto" },
      { id: "QuickBooks", label: "QuickBooks" },
      { id: "TriNet", label: "TriNet" },
      { id: "Deel", label: "Deel" },
      { id: "Rippling", label: "Rippling" },
      { id: "Paycor", label: "Paycor" },
      { id: "Square", label: "Square" },
      { id: "Patriot Software", label: "Patriot Software" },
      { id: "OnPay", label: "OnPay" },
      { id: "SurePayroll", label: "SurePayroll" },
      { id: "Insperity", label: "Insperity" },
      { id: "Other", label: "Other" },
    ],
  },
  {
    id: "shift-differentials",
    question:
      "Are your hourly employees eligible for shift differentials e.g. extra pay for nights/weekends/holidays?",
    required: false,
    options: [
      { id: "yes-shift-diff", label: "Yes" },
      { id: "no-shift-diff", label: "No" },
    ],
  },
  {
    id: "short-term-incentives",
    question:
      "Are most of your employees eligible for short-term incentives such as spot, quarterly or annual bonuses, commissions, profit sharing?",
    required: false,
    isMultiSelect: true,
    options: [
      { id: "cash_bonuses", label: "Cash bonuses" },
      { id: "profit_sharing", label: "Profit sharing" },
      { id: "commissions", label: "Commissions" },
    ],
  },
  {
    id: "long-term-incentives",
    question:
      "Are most of your employees eligible for long-term incentives such as stock plans, pension plan, deferred compensation?",
    required: false,
    isMultiSelect: true,
    options: [
      { id: "stock_options", label: "Stock options" },
      { id: "rsus", label: "Restricted Stock Units (RSUs)" },
      { id: "espps", label: "Employee Stock Purchase Plans (ESPPs)" },
      { id: "deferred_compensation", label: "Deferred compensation" },
      { id: "pension_plans", label: "Pension plans" },
    ],
  },
];

const monthOptions = [
  { id: "january", label: "January" },
  { id: "february", label: "February" },
  { id: "march", label: "March" },
  { id: "april", label: "April" },
  { id: "may", label: "May" },
  { id: "june", label: "June" },
  { id: "july", label: "July" },
  { id: "august", label: "August" },
  { id: "september", label: "September" },
  { id: "october", label: "October" },
  { id: "november", label: "November" },
  { id: "december", label: "December" },
];

const benefitsQuestions = [
  {
    id: "benefits-broker",
    question: "Do you work with a benefits broker?",
    required: true,
    tooltip: {
      title: "A benefits broker is lorem ipsum dolor sit amet, consectetur adipiscing elit ",
      description: "",
    },
    options: [
      { id: "yes-broker", label: "Yes" },
      { id: "no-broker", label: "No" },
      { id: "unsure-broker", label: "Unsure" },
    ],
  },
  {
    id: "benefits-enrollment-period",
    question: "When is your benefits enrollment period?",
    required: true,
    isDropdown: true,
    options: monthOptions,
  },
];

const retirementQuestions = [
  {
    id: "retirement-vesting-period",
    question: "What is the vesting period of your business's retirement plan?",
    required: true,
    options: [
      { id: "6mo_or_less", label: "6 months or less" },
      { id: "6mo_1yr", label: "Greater than 6 months - 1 year" },
      { id: "1yr_2yr", label: "Greater than 1 year - 2 years" },
      { id: "2yr_4yr", label: "Greater than 2 years - 4 years" },
      { id: "4yr_plus", label: "Greater than 4 years" },
    ],
  },
  {
    id: "retirement-auto-enroll",
    question: "Does your company auto-enroll employees in retirement benefits?",
    required: true,
    options: [
      { id: "yes-autoenroll", label: "Yes" },
      { id: "no-autoenroll", label: "No" },
    ],
  },
  {
    id: "retirement-hardship-withdrawals",
    question: "Does your company's retirement plan allows for hardship withdrawals and/or loans?",
    required: true,
    options: [
      { id: "yes-hardship", label: "Yes" },
      { id: "no-hardship", label: "No" },
    ],
  },
];

export default function AdditionalQuestions() {
  const navigate = useNavigate();
  const { isFinchCompleted } = useAssessmentStatus();
  const { isConnected, isLoading: isFinchStatusLoading } = useFinchStatus();
  const [answers, setAnswers] = useState<QuestionAnswer>({});
  const [goalsAnswers, setGoalsAnswers] = useState<GoalsAnswer>({
    selectedGoals: [],
    topThreeGoals: [],
  });
  // T013: Controlled state for the three Select dropdowns
  const [annualRaiseMonth, setAnnualRaiseMonth] = useState<string>("");
  const [payrollProvider, setPayrollProvider] = useState<string>("");
  const [benefitsEnrollmentMonth, setBenefitsEnrollmentMonth] = useState<string>("");
  // T015: Hook + validation state
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

  const handleClose = () => {
    navigate("/dashboard");
  };

  // T016: Form submission handler with validation
  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};

    // Minimum 3 goals required for ranking
    if (goalsAnswers.selectedGoals.length < 3) {
      newErrors["selectedGoals"] = "Please select at least 3 workforce goals to rank them.";
    }
    // Required field validation
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
    // annualRaiseMonth is required when offersAnnualRaises is true
    if (answers["annual-raises"] === "yes-raises" && !annualRaiseMonth) {
      newErrors["annualRaiseMonth"] = "Please select a month.";
    }
    if (!answers["benefits-broker"]) {
      newErrors["benefits-broker"] = "Select an option";
    }
    if (!benefitsEnrollmentMonth) {
      newErrors["benefits-enrollment-period"] = "Select an option";
    }
    if (!answers["retirement-vesting-period"]) {
      newErrors["retirement-vesting-period"] = "Select an option";
    }
    if (!answers["retirement-auto-enroll"]) {
      newErrors["retirement-auto-enroll"] = "Select an option";
    }
    if (!answers["retirement-hardship-withdrawals"]) {
      newErrors["retirement-hardship-withdrawals"] = "Select an option";
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    setFieldErrors({});
    const payload = buildFinchAssessmentPayload(
      answers,
      goalsAnswers,
      annualRaiseMonth,
      payrollProvider,
      benefitsEnrollmentMonth
    );
    await submit(payload);
  };

  // T018: Navigate to /dashboard after successful submission
  useEffect(() => {
    if (success) {
      navigate("/dashboard");
    }
  }, [success, navigate]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
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

  // const handleTopThreeGoalChange = (position: number, goalId: string) => {
  //   const newTopThree = [...goalsAnswers.topThreeGoals];
  //   newTopThree[position] = goalId;
  //   setGoalsAnswers(prev => ({
  //     ...prev,
  //     topThreeGoals: newTopThree,
  //   }));
  // };

  // Get selected goal labels for ranking
  // const selectedGoalOptions = goalsData
  //   .flatMap(category => category.goals)
  //   .filter(goal => goalsAnswers.selectedGoals.includes(goal.id));

  return (
    <div className="flex min-h-screen flex-col bg-ws-navy-25">
      {/* Top Navigation Bar */}
      <div className="flex h-14 items-center justify-end border-b border-ws-navy-800 px-6 py-4">
        {/* Back Button */}
        {/* <Button
          onClick={handleBack}
          color="tertiary"
          size="md"
          iconLeading={<ChevronLeft data-icon className="text-ws-primary-800" />}
          className="flex items-center gap-1 text-lg font-normal text-ws-primary-800 transition-opacity"
        >
          Back
        </Button> */}

        {/* Title */}
        {/* <h1 className="text-lg font-medium text-ws-primary-800">Additional Questions</h1> */}

        {/* Close Button */}
        <Button
          onClick={handleClose}
          color="tertiary"
          size="md"
          iconLeading={<XClose data-icon className="font-bold text-ws-navy-800" />}
        />
      </div>

      {/* Compensation Area */}
      <div className="mx-auto w-full max-w-4xl flex-1 space-y-3 py-8 px-4">
        {/* T019/T020: Success and error banners */}
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
          {/* Workforce Section */}
          <div className="bg-ws-base-white rounded-lg border border-ws-border-primary shadow-sm p-6 space-y-6">
            <h2 className="text-3xl font-semibold mb-2">Workforce</h2>
            <p className="text-base text-ws-gray-90">
              We’d like to get a better understanding of your workforce and how they’re structured.
              This will help us customize relevant solution providers.
            </p>

            {/* Question section */}
            <div className="space-y-8">
              {questions.map((question, index) => (
                <div key={question.id} className="space-y-3">
                  <Label isRequired={question.required} className="text-base text-ws-text-primary">
                    {index + 1}. {question.question}
                  </Label>
                  {question.required && fieldErrors[question.id] && (
                    <div className="flex items-center gap-2">
                      <InputInfo className="text-ws-error-600" />
                      <span className="text-sm text-ws-error-600">{fieldErrors[question.id]}</span>
                    </div>
                  )}

                  {question.isMultiSelect ? (
                    <div className="flex flex-col gap-3">
                      {question.options.map(option => (
                        <label
                          key={option.id}
                          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          <Checkbox
                            isSelected={((answers[question.id] as string[]) || []).includes(
                              option.id
                            )}
                            onChange={() => handleMultiSelectToggle(question.id, option.id)}
                            size="sm"
                            className="border border-ws-border-primary rounded-sm"
                          />
                          <span className="text-sm font-normal text-ws-text-secondary">
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <RadioGroup
                      value={(answers[question.id] as string) || ""}
                      onChange={value => handleAnswerChange(question.id, value)}
                      className="flex flex-col gap-3"
                    >
                      {question.options.map(option => (
                        <label key={option.id} className="flex items-center gap-3 cursor-pointer">
                          <RadioButton
                            value={option.id}
                            className="border border-ws-border-primary rounded-full"
                          />
                          <span className="text-sm font-normal text-ws-text-secondary">
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </RadioGroup>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Compensation Section */}
          <div className="bg-ws-base-white rounded-lg border border-ws-border-primary shadow-sm p-6 space-y-6">
            <h2 className="text-3xl font-semibold mb-2">Compensation </h2>
            <p className="text-base text-ws-gray-90">
              Select salary that apply best to your workforce. This doesn’t have to be exact.
            </p>

            {/* Compensation section */}
            <div className="space-y-8">
              {compensationQuestions.map((question, index) => (
                <div key={question.id} className="space-y-3">
                  <Label isRequired={question.required} className="text-base text-ws-text-primary">
                    {index + 1}. {question.question}
                  </Label>
                  {question.required && !question.isDropdown && fieldErrors[question.id] && (
                    <div className="flex items-center gap-2">
                      <InputInfo className="text-ws-error-600" />
                      <span className="text-sm text-ws-error-600">{fieldErrors[question.id]}</span>
                    </div>
                  )}

                  {question.isMultiSelect ? (
                    <div className="flex flex-col gap-3">
                      {question.options.map(option => (
                        <label
                          key={option.id}
                          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          <Checkbox
                            isSelected={((answers[question.id] as string[]) || []).includes(
                              option.id
                            )}
                            onChange={() => handleMultiSelectToggle(question.id, option.id)}
                            size="sm"
                            className="border border-ws-border-primary rounded-sm"
                          />
                          <span className="text-sm font-normal text-ws-text-secondary">
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : !question.isDropdown ? (
                    <>
                      <RadioGroup
                        value={(answers[question.id] as string) || ""}
                        onChange={value => handleAnswerChange(question.id, value)}
                        className="flex flex-col gap-3"
                      >
                        {question.options.map(option => (
                          <label key={option.id} className="flex items-center gap-3 cursor-pointer">
                            <RadioButton
                              value={option.id}
                              className="border border-ws-border-primary rounded-full"
                            />
                            <span className="text-sm font-normal text-ws-text-secondary">
                              {option.label}
                            </span>
                          </label>
                        ))}
                      </RadioGroup>

                      {/* Conditional Month Dropdown for Annual Raises Question */}
                      {question.hasConditional && answers[question.id] === "yes-raises" && (
                        <div className="ml-6 space-y-2 pt-2">
                          <Label className="text-sm font-normal text-ws-text-secondary">
                            If yes, when?
                          </Label>
                          <Select
                            items={monthOptions}
                            placeholder="Select Month"
                            size="md"
                            className="w-full max-w-xs rounded-lg"
                            selectedKey={annualRaiseMonth}
                            onSelectionChange={key => {
                              setAnnualRaiseMonth(String(key));
                              if (fieldErrors["annualRaiseMonth"]) {
                                setFieldErrors(prev => ({ ...prev, annualRaiseMonth: "" }));
                              }
                            }}
                          >
                            {item => <SelectItem id={item.id} label={item.label} />}
                          </Select>
                          {fieldErrors["annualRaiseMonth"] && (
                            <div className="flex items-center gap-2">
                              <InputInfo className="text-ws-error-600" />
                              <span className="text-sm text-ws-error-600">
                                {fieldErrors["annualRaiseMonth"]}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {fieldErrors["payroll-provider"] && (
                        <div className="flex items-center gap-2">
                          <InputInfo className="text-ws-error-600" />
                          <span className="text-sm text-ws-error-600">
                            {fieldErrors["payroll-provider"]}
                          </span>
                        </div>
                      )}
                      <Select
                        items={question.options}
                        placeholder="Select payroll provider"
                        size="md"
                        className="w-full max-w-xs rounded-lg"
                        selectedKey={payrollProvider}
                        onSelectionChange={key => {
                          setPayrollProvider(String(key));
                          if (fieldErrors["payroll-provider"]) {
                            setFieldErrors(prev => ({ ...prev, "payroll-provider": "" }));
                          }
                        }}
                      >
                        {item => <SelectItem id={item.id} label={item.label} />}
                      </Select>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Benefits & Retirement Section */}
          <div className="bg-ws-base-white rounded-lg border border-ws-border-primary shadow-sm p-6 space-y-6">
            <h2 className="text-3xl font-semibold mb-2">Benefits </h2>
            <p className="text-base text-ws-gray-90">
              To understand what gaps may exist in your current benefits offerings, please select
              all relevant options that you currently offer.{" "}
            </p>

            {/* Benefits questions */}
            <div className="space-y-8">
              {benefitsQuestions.map((question, index) => (
                <div key={question.id} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label
                      isRequired={question.required}
                      className="text-base text-ws-text-primary"
                    >
                      {index + 1}. {question.question}
                    </Label>
                    {question.tooltip && (
                      <Tooltip
                        title={question.tooltip.title}
                        description={question.tooltip.description}
                        placement="top"
                        arrow={true}
                      >
                        <TooltipTrigger className="group relative flex cursor-pointer flex-col items-center gap-2 text-fg-quaternary transition duration-100 ease-linear hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover">
                          <InfoCircle className="size-5 text-ws-gray-70" />
                        </TooltipTrigger>
                      </Tooltip>
                    )}
                  </div>

                  {question.required && !question.isDropdown && fieldErrors[question.id] && (
                    <div className="flex items-center gap-2">
                      <InputInfo className="text-ws-error-600" />
                      <span className="text-sm text-ws-error-600">{fieldErrors[question.id]}</span>
                    </div>
                  )}

                  {!question.isDropdown ? (
                    <RadioGroup
                      value={(answers[question.id] as string) || ""}
                      onChange={value => handleAnswerChange(question.id, value)}
                      className="flex flex-col gap-3"
                    >
                      {question.options.map(option => (
                        <label key={option.id} className="flex items-center gap-3 cursor-pointer">
                          <RadioButton
                            value={option.id}
                            className="border border-ws-border-primary rounded-full"
                          />
                          <span className="text-sm font-normal text-ws-text-secondary">
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </RadioGroup>
                  ) : (
                    <>
                      {fieldErrors[question.id] && (
                        <div className="flex items-center gap-2">
                          <InputInfo className="text-ws-error-600" />
                          <span className="text-sm text-ws-error-600">
                            {fieldErrors[question.id]}
                          </span>
                        </div>
                      )}
                      <Select
                        items={question.options}
                        placeholder="Select Month"
                        size="md"
                        className="w-full max-w-xs rounded-lg"
                        selectedKey={benefitsEnrollmentMonth}
                        onSelectionChange={key => {
                          setBenefitsEnrollmentMonth(String(key));
                          if (fieldErrors[question.id]) {
                            setFieldErrors(prev => ({ ...prev, [question.id]: "" }));
                          }
                        }}
                      >
                        {item => <SelectItem id={item.id} label={item.label} />}
                      </Select>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Retirement subsection within Benefits */}
            <div className="pt-8">
              <h3 className="text-2xl font-medium pb-2 mb-6 border-b border-ws-border-primary">
                Retirement
              </h3>

              {/* Retirement questions section */}
              <div className="space-y-8 pt-4">
                {retirementQuestions.map((question, index) => (
                  <div key={question.id} className="space-y-3">
                    <Label isRequired={question.required} className="text-base">
                      {index + 3}. {question.question}
                    </Label>
                    {fieldErrors[question.id] && (
                      <div className="flex items-center gap-2">
                        <InputInfo className="text-ws-error-600" />
                        <span className="text-sm text-ws-error-600">
                          {fieldErrors[question.id]}
                        </span>
                      </div>
                    )}

                    {
                      <RadioGroup
                        value={(answers[question.id] as string) || ""}
                        onChange={value => handleAnswerChange(question.id, value)}
                        className="flex flex-col gap-3"
                      >
                        {question.options.map(option => (
                          <label key={option.id} className="flex items-center gap-3 cursor-pointer">
                            <RadioButton
                              value={option.id}
                              className="border border-ws-border-primary rounded-full"
                            />
                            <span className="text-sm font-normal text-ws-text-secondary">
                              {option.label}
                            </span>
                          </label>
                        ))}
                      </RadioGroup>
                    }
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Goals Section */}
          <div className="bg-ws-base-white rounded-lg border border-ws-border-primary shadow-sm p-6 space-y-6">
            <h2 className="text-3xl font-semibold mb-2">Goals </h2>
            <p className="text-base text-ws-gray-90">
              Pick the goal that best reflects your company’s workforce priorities. This helps us
              share insights and tips that fit your team’s needs.
            </p>

            {/* Question 1: Select Goals */}
            <div className="space-y-6">
              <div className="flex flex-col gap-6">
                <Label className="text-base font-medium">
                  1. Please select your workforce goals.
                </Label>
                {fieldErrors["selectedGoals"] && (
                  <div className="flex items-center gap-2">
                    <InputInfo className="text-ws-error-600" />
                    <span className="text-sm text-ws-error-600">
                      {fieldErrors["selectedGoals"]}
                    </span>
                  </div>
                )}

                {/* Goals by Category */}
                {goalsData.map(categoryGroup => (
                  <div key={categoryGroup.category} className="space-y-3">
                    <h3 className="text-sm font-semibold text-ws-text-secondary">
                      {categoryGroup.category}
                    </h3>
                    <div className="space-y-2 ml-0">
                      {categoryGroup.goals.map(goal => (
                        <label
                          key={goal.id}
                          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          <Checkbox
                            isSelected={goalsAnswers.selectedGoals.includes(goal.id)}
                            onChange={() => handleGoalToggle(goal.id)}
                            size="sm"
                            className="border border-ws-border-primary rounded-sm"
                          />
                          <span className="text-sm font-normal text-ws-text-secondary">
                            {goal.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Question 2: Rank Top 3 Goals */}
              <div className="pt-4">
                <RankingList
                  label="Rank your company's top three workforce goals (from above list)."
                  isRequired={true}
                  displayOrder={2}
                  availableOptions={goalsData
                    .flatMap(cat => cat.goals.map(g => ({ label: g.label, value: g.id })))
                    .filter(opt => goalsAnswers.selectedGoals.includes(opt.value))}
                  value={goalsAnswers.topThreeGoals}
                  onChange={value => setGoalsAnswers(prev => ({ ...prev, topThreeGoals: value }))}
                  maxItems={3}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-8 my-6 justify-end">
          <Button
            color="primary"
            size="md"
            iconTrailing={<ChevronRight data-icon />}
            className="text-base font-semibold min-w-30 bg-ws-navy-800 text-ws-base-white hover:bg-ws-navy-800 focus:bg-ws-navy-800 active:bg-ws-navy-800"
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
