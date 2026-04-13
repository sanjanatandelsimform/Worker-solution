import { Button } from "@/components/base/buttons/button";
import { ChevronRight, XClose } from "@untitledui/icons";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RadioButton, RadioGroup } from "@/components/base/radio-buttons/radio-buttons";
import { Label } from "@/components/base/input/label";
import { Select } from "@/components/base/select/select";
import { SelectItem } from "@/components/base/select/select-item";
import { Checkbox } from "@/components/base/checkbox/checkbox";

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
      { id: "work-email", label: "Work (email and/or text)" },
      { id: "personal-device", label: "Personal device (email and/or text)" },
      { id: "office-flyer", label: "Office flyer, in-office experience" },
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
      { id: "group-transportation", label: "Group Transportation (i.e. Carpooling, Company bus)" },
    ],
  },
  {
    id: "commute-duration",
    question: "How long are employees commuting to the office (estimated average time)",
    required: false,
    options: [
      { id: "commute-under-15min", label: "> 15min" },
      { id: "commute-15-30min", label: "15-30min" },
      { id: "commute-30-1hr", label: "30-1hr min" },
      { id: "commute-1hr-plus", label: "1hr +" },
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
  // {
  //   id: "hr-payroll-inhouse",
  //   question: "Do you handle HR/payroll in-house?",
  //   required: true,
  //   options: [
  //     { id: "yes-inhouse", label: "Yes" },
  //     { id: "no-inhouse", label: "No" },
  //     { id: "unsure-inhouse", label: "Unsure" },
  //   ],
  // },
  {
    id: "payroll-provider",
    question: "Who is your company's payroll provider?",
    required: false,
    isDropdown: true,
    options: [
      { id: "ADP", label: "ADP" },
      { id: "Paychex", label: "Paychex" },
      { id: "Paycom", label: "Paycom" },
      { id: "Paylocity", label: "Paylocity" },
      { id: "Gusto", label: "Gusto" },
      { id: "Quickbooks", label: "Quickbooks" },
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
      { id: "cash-bonuses", label: "Cash bonuses" },
      { id: "profit-sharing", label: "Profit sharing" },
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
      { id: "stock-options", label: "Stock options" },
      { id: "rsus", label: "Restricted Stock Units (RSUs)" },
      { id: "espps", label: "Employee Stock Purchase Plans (ESPPs)" },
      { id: "deferred-compensation", label: "Deferred compensation" },
      { id: "pension-plans", label: "Pension plans" },
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
    required: false,
    options: [
      { id: "yes-broker", label: "Yes" },
      { id: "no-broker", label: "No" },
      { id: "unsure-broker", label: "Unsure" },
    ],
  },
  {
    id: "benefits-enrollment-period",
    question: "When is your benefits enrollment period?",
    required: false,
    isDropdown: true,
    options: monthOptions,
  },
];

const retirementQuestions = [
  // {
  //   id: "retirement-record-keeper",
  //   question: "Who is your retirement benefits record keeper or provider?",
  //   required: true,
  //   isDropdown: true,
  //   options: [
  //     { id: "fidelity", label: "Fidelity" },
  //     { id: "vanguard", label: "Vanguard" },
  //     { id: "schwab", label: "Charles Schwab" },
  //     { id: "empower", label: "Empower" },
  //     { id: "other-retirement", label: "Other" },
  //   ],
  // },
  {
    id: "retirement-vesting-period",
    question: "What is the vesting period of your business's retirement plan?",
    required: true,
    options: [
      { id: "vesting-less-6m", label: "6 months of less" },
      { id: "vesting-6m-1y", label: "Greater than 6 months - 1 year" },
      { id: "vesting-1y-2y", label: "Greater than 1 year - 2 years" },
      { id: "vesting-2y-4y", label: "Greater than 2 years - 4 years" },
      { id: "vesting-4y", label: "Greater than 4 years" },
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

const goalsData = [
  {
    category: "Financial health",
    goals: [
      { id: "improve-benefits-participation", label: "Improve benefits participation" },
      { id: "reduce-401k-loans", label: "Reduce 401k loans and withdrawals" },
      { id: "increase-worker-financial-health", label: "Increase worker financial health" },
    ],
  },
  {
    category: "Healthcare",
    goals: [
      { id: "improve-employee-health-outcomes", label: "Improve employee health outcomes" },
      { id: "reduce-healthcare-costs", label: "Reduce healthcare costs" },
      { id: "address-caregiving-challenges", label: "Address caregiving challenges" },
    ],
  },
  {
    category: "Performance",
    goals: [
      { id: "attract-talent", label: "Attract talent" },
      { id: "reduce-time-to-hire", label: "Reduce time-to-hire" },
      { id: "reduce-absenteeism", label: "Reduce absenteeism" },
      { id: "reduce-quick-quits", label: "Reduce quick quits (turnover in under 90 days)" },
    ],
  },
  {
    category: "Education and training",
    goals: [
      { id: "retain-talent", label: "Retain talent" },
      { id: "upskilling-training", label: "Upskilling and training" },
      { id: "employee-satisfaction", label: "Employee satisfaction" },
      {
        id: "support-employees-navigating",
        label: "Support employees navigating company benefits and community resources",
      },
    ],
  },
];

export default function AdditionalQuestions() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<QuestionAnswer>({});
  const [goalsAnswers, setGoalsAnswers] = useState<GoalsAnswer>({
    selectedGoals: [],
    topThreeGoals: [],
  });

  const handleClose = () => {
    navigate("/dashboard");
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
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
  };

  const handleGoalToggle = (goalId: string) => {
    setGoalsAnswers(prev => ({
      ...prev,
      selectedGoals: prev.selectedGoals.includes(goalId)
        ? prev.selectedGoals.filter(id => id !== goalId)
        : [...prev.selectedGoals, goalId],
    }));
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
                          >
                            {item => <SelectItem id={item.id} label={item.label} />}
                          </Select>
                        </div>
                      )}
                    </>
                  ) : (
                    <Select
                      items={question.options}
                      placeholder="Select payroll provider"
                      size="md"
                      className="w-full max-w-xs rounded-lg"
                    >
                      {item => <SelectItem id={item.id} label={item.label} />}
                    </Select>
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
                  <Label isRequired={question.required} className="text-base text-ws-text-primary">
                    {index + 1}. {question.question}
                  </Label>

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
                    <Select
                      items={question.options}
                      placeholder="Select Month"
                      size="md"
                      className="w-full max-w-xs rounded-lg"
                    >
                      {item => <SelectItem id={item.id} label={item.label} />}
                    </Select>
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
                <Label className="text-base font-medium">
                  2. Rank your company's top three workforce goals (from above list).
                </Label>
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
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
