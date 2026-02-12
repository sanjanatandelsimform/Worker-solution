import { useState } from "react";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Label } from "@/components/base/input/label";
import { Menu01 } from "@untitledui/icons";

type GoalOption = {
  id: string;
  label: string;
  category: string;
};

export default function GoalsTab() {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const goalOptions: GoalOption[] = [
    // Financial health
    { id: "improve-benefits", label: "Improve benefits participation", category: "financial" },
    { id: "reduce-401k", label: "Reduce 401k loans and withdrawals", category: "financial" },
    { id: "increase-financial", label: "Increase worker financial health", category: "financial" },
    // Healthcare
    {
      id: "improve-health",
      label: "Improve employee health outcomes",
      category: "healthcare",
    },
    { id: "reduce-healthcare", label: "Reduce healthcare costs", category: "healthcare" },
    {
      id: "address-caregiving",
      label: "Address caregiving challenges",
      category: "healthcare",
    },
    // Performance
    { id: "attract-talent", label: "Attract talent", category: "performance" },
    { id: "reduce-time", label: "Reduce time-to-hire", category: "performance" },
    { id: "reduce-absenteeism", label: "Reduce absenteeism", category: "performance" },
    {
      id: "reduce-quits",
      label: "Reduce quick quits (turnover in under 90 days)",
      category: "performance",
    },
    // Education and training
    { id: "retain-talent", label: "Retain talent", category: "education" },
    { id: "upskilling", label: "Upskilling and training", category: "education" },
    { id: "employee-satisfaction", label: "Employee satisfaction", category: "education" },
    {
      id: "support-navigation",
      label: "Support employees navigating company benefits and community resources",
      category: "education",
    },
  ];

  const handleGoalToggle = (goalId: string) => {
    setSelectedGoals(prev =>
      prev.includes(goalId) ? prev.filter(id => id !== goalId) : [...prev, goalId]
    );
  };

  // Get the labels for selected goals in the order they were selected
  const rankedGoals = selectedGoals
    .map(id => goalOptions.find(goal => goal.id === id))
    .filter(Boolean) as GoalOption[];
  return (
    <div className="flex w-full flex-col gap-8">
      {/* Benefits Section */}
      <div className="flex w-full flex-col gap-6 rounded-xl border border-ws-gray-50 bg-ws-white px-6 py-8">
        {/* Header Section */}
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-medium leading-9.5 text-ws-black-90">Goals</h2>
          <p className=" text-base leading-6 text-ws-gray-100">
            Pick the goal that best reflects your company’s workforce priorities. This helps us
            share insights and tips that fit your team’s needs.
          </p>
        </div>

        {/* Questions Container */}
        <div className="flex w-full flex-col gap-6">
          {/* Question 1 */}
          <div className="flex w-full flex-col gap-2">
            <Label>1. Please select your workforce goals.</Label>

            <div className="flex w-full flex-col gap-4">
              {/* Financial health */}
              <p className="text-sm font-medium leading-5 text-black">Financial health</p>

              <div className="flex flex-col gap-4">
                <Checkbox
                  label="Improve benefits participation"
                  isSelected={selectedGoals.includes("improve-benefits")}
                  onChange={() => handleGoalToggle("improve-benefits")}
                />

                <Checkbox
                  label="Reduce 401k loans and withdrawals"
                  isSelected={selectedGoals.includes("reduce-401k")}
                  onChange={() => handleGoalToggle("reduce-401k")}
                />

                <Checkbox
                  label="Increase worker financial health"
                  isSelected={selectedGoals.includes("increase-financial")}
                  onChange={() => handleGoalToggle("increase-financial")}
                />
              </div>

              {/* Healthcare */}
              <p className="text-sm font-medium leading-5 text-black">Healthcare</p>

              <div className="flex flex-col gap-4">
                <Checkbox
                  label="Improve employee health outcomes"
                  isSelected={selectedGoals.includes("improve-health")}
                  onChange={() => handleGoalToggle("improve-health")}
                />

                <Checkbox
                  label="Reduce healthcare costs"
                  isSelected={selectedGoals.includes("reduce-healthcare")}
                  onChange={() => handleGoalToggle("reduce-healthcare")}
                />

                <Checkbox
                  label="Address caregiving challenges"
                  isSelected={selectedGoals.includes("address-caregiving")}
                  onChange={() => handleGoalToggle("address-caregiving")}
                />
              </div>

              {/* Performance */}
              <p className="text-sm font-medium leading-5 text-black">Performance</p>

              <div className="flex flex-col gap-4">
                <Checkbox
                  label="Attract talent"
                  isSelected={selectedGoals.includes("attract-talent")}
                  onChange={() => handleGoalToggle("attract-talent")}
                />

                <Checkbox
                  label="Reduce time-to-hire"
                  isSelected={selectedGoals.includes("reduce-time")}
                  onChange={() => handleGoalToggle("reduce-time")}
                />

                <Checkbox
                  label="Reduce absenteeism"
                  isSelected={selectedGoals.includes("reduce-absenteeism")}
                  onChange={() => handleGoalToggle("reduce-absenteeism")}
                />

                <Checkbox
                  label="Reduce quick quits (turnover in under 90 days)"
                  isSelected={selectedGoals.includes("reduce-quits")}
                  onChange={() => handleGoalToggle("reduce-quits")}
                />
              </div>

              {/* Education and training */}
              <p className="text-sm font-medium leading-5 text-black">Education and training</p>

              <div className="flex flex-col gap-4">
                <Checkbox
                  label="Retain talent"
                  isSelected={selectedGoals.includes("retain-talent")}
                  onChange={() => handleGoalToggle("retain-talent")}
                />

                <Checkbox
                  label="Upskilling opportunities"
                  isSelected={selectedGoals.includes("upskilling")}
                  onChange={() => handleGoalToggle("upskilling")}
                />

                <Checkbox
                  label="Employee satisfaction"
                  isSelected={selectedGoals.includes("employee-satisfaction")}
                  onChange={() => handleGoalToggle("employee-satisfaction")}
                />

                <Checkbox
                  label="Support employees navigating company benefits and community resources"
                  isSelected={selectedGoals.includes("support-navigation")}
                  onChange={() => handleGoalToggle("support-navigation")}
                />
              </div>
            </div>
          </div>

          {/* Question 2 - Ranking */}
          {rankedGoals.length > 0 && (
            <div className="flex w-full flex-col gap-2">
              <Label>2. Rank your company's top three workforce goals (from above list).</Label>

              <div className="flex flex-col gap-3">
                {rankedGoals.map((goal, index) => (
                  <div
                    key={goal.id}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
                  >
                    <Menu01 className="h-5 w-5 text-ws-gray-70" />
                    <span className="text-sm leading-5 text-ws-black-90">
                      {index + 1}. {goal.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
