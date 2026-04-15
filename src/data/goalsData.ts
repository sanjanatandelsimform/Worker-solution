interface GoalItem {
  id: string;
  label: string;
}

interface GoalCategory {
  category: string;
  goals: GoalItem[];
}

export const goalsData: GoalCategory[] = [
  {
    category: "Financial health",
    goals: [
      { id: "Improve Benefits Participation", label: "Improve Benefits Participation" },
      { id: "Reduce 401k Withdrawals", label: "Reduce 401k Loans and Withdrawals" },
      { id: "Increase Financial Health", label: "Increase Worker Financial Health" },
    ],
  },
  {
    category: "Healthcare",
    goals: [
      { id: "Improve Health Outcomes", label: "Improve Employee Health Outcomes" },
      { id: "Reduce Healthcare Costs", label: "Reduce Healthcare Costs" },
      { id: "Support Caregiving", label: "Address Caregiving Challenges" },
    ],
  },
  {
    category: "Performance",
    goals: [
      { id: "Attract Talent", label: "Attract Talent" },
      { id: "Reduce Time-to-Hire", label: "Reduce Time-to-Hire" },
      { id: "Reduce Absenteeism", label: "Reduce Absenteeism" },
      { id: "Reduce Quick Quits", label: "Reduce Quick Quits (Turnover in Under 90 Days)" },
    ],
  },
  {
    category: "Education and training",
    goals: [
      { id: "Retain Talent", label: "Retain Talent" },
      { id: "Upskilling/Training", label: "Upskilling and Training" },
      { id: "Employee Satisfaction", label: "Employee Satisfaction" },
      {
        id: "Benefits/Resources Navigation",
        label: "Support Employees Navigating Company Benefits and Community Resources",
      },
    ],
  },
];
