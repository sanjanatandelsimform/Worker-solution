import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Label } from "@/components/base/input/label";
import { RankingList } from "@/components/common/RankList";
import { FieldError } from "@/components/common/FieldError";
import { goalsData } from "@/data/goalsData";
import type { GoalsAnswer } from "@/types/additionalQuestionsTypes";

interface GoalsSectionProps {
  goalsAnswers: GoalsAnswer;
  fieldErrors: Record<string, string>;
  onGoalToggle: (goalId: string) => void;
  onTopThreeGoalsChange: (topThreeGoals: string[]) => void;
}

export default function GoalsSection({
  goalsAnswers,
  fieldErrors,
  onGoalToggle,
  onTopThreeGoalsChange,
}: GoalsSectionProps): JSX.Element {
  return (
    <div className="bg-ws-base-white rounded-lg border border-ws-border-primary shadow-sm p-6 space-y-6">
      <h2 className="text-3xl font-semibold mb-2">Goals </h2>
      <p className="text-base text-ws-gray-90">
        Pick the goal that best reflects your company's workforce priorities. This helps us share
        insights and tips that fit your team's needs.
      </p>

      <div className="space-y-6">
        <div className="flex flex-col gap-6">
          <Label className="text-base font-medium">1. Please select your workforce goals.</Label>
          <FieldError message={fieldErrors["selectedGoals"]} />

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
                      onChange={() => onGoalToggle(goal.id)}
                      size="sm"
                      className="border border-ws-border-primary rounded-sm"
                    />
                    <span className="text-sm font-normal text-ws-text-secondary">{goal.label}</span>
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
            onChange={onTopThreeGoalsChange}
            maxItems={3}
          />
        </div>
      </div>
    </div>
  );
}
