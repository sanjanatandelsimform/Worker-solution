import type { ReactNode } from "react";
import { SmileFace } from "@/assets/icons/SmileFace";
import { KeyIcon } from "@/assets/icons/KeyIcon";
import { ChartIcon } from "@/assets/icons/ChartIcon";

export interface DidYouKnowSlide {
  id: number;
  icon: ReactNode;
  title: string;
  content: string;
  source: string;
}

export const didYouKnowSlides: DidYouKnowSlide[] = [
  {
    id: 1,
    icon: <SmileFace className="text-ws-gray-700" />,
    title: "Did you know?",
    content:
      "Lower-income earners with access to retirement benefits are 37% less likely to participate than higher-income earners. ",
    source: "U.S. Bureau of Labor Statistics",
  },
  {
    id: 2,
    icon: <KeyIcon className="text-ws-gray-700" />,
    title: "Did you know?",
    content:
      "Lower income earners with access to medical benefits are 26% less likely to participate than top earners.",
    source: "U.S. Bureau of Labor Statistics",
  },
  {
    id: 3,
    icon: <ChartIcon className="text-ws-gray-700" />,
    title: "Did you know?",
    content:
      "Enrollment in a non-high deductible health insurance plan is associated with higher financial health.",
    source: "Financial Health Network",
  },
  {
    id: 4,
    icon: <ChartIcon className="text-ws-gray-700" />,
    title: "Did you know?",
    content:
      "The cost of replacing an individual employee can range from .5x-2x the employee's annual salary.",
    source: "Gallup",
  },
  {
    id: 5,
    icon: <ChartIcon className="text-ws-gray-700" />,
    title: "Did you know?",
    content:
      "78% of employees reported they're more likely to stay with an employer because of their benefits program.",
    source:
      "2018 Willis Towers Watson Employee and Employer Experience on a Benefit Marketplace Survey",
  },
  {
    id: 6,
    icon: <ChartIcon className="text-ws-gray-700" />,
    title: "Did you know?",
    content: "1 in 3 (32%) of Americans have no emergency savings set aside.",
    source: "Empower",
  },
];
