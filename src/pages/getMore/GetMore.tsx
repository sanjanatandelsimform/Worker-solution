import { Button } from "@/components/base/buttons/button";
import { ChevronLeft, XClose, ChevronUp } from "@untitledui/icons";
import { useState } from "react";
import { Accordion, AccordionItem } from "@/components/base/accordion";
import { RadioButton, RadioGroup } from "@/components/base/radio-buttons/radio-buttons";
import { useNavigate } from "react-router-dom";

interface PlanOption {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  disclaimer: string;
}

const plans: PlanOption[] = [
  {
    id: "finch",
    name: "Finch",
    price: "Free",
    description:
      "Save time and get even more data insights by integrating your payroll with BeneStats and Finch.",
    features: [
      "Results in 3-5min",
      "Custom workforce data and insights",
      "Additional dashboard views plus everything you get in the free plan",
    ],
    disclaimer:
      "By selecting and connecting with Finch, I understand that I will leave this site. When you leave this site, we are not responsible for information you share with third-party services. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    id: "manual",
    name: "Manual Entry",
    price: "Free",
    description:
      "Fill out a simple assessment form and get recommendations to enhance your benefits program.",
    features: [
      "Results in 5-10min",
      "Industry benchmarks",
      "Placed-based insights",
      "Annual data updates",
    ],
    disclaimer: "",
  },
];

export default function GetMore() {
  const [selectedPlan, setSelectedPlan] = useState<string>("finch");
  const navigate = useNavigate();
  const renderAccordionHeader = (planId: string, plan: PlanOption) => (
    <div
      onClick={e => {
        e.stopPropagation();
        setSelectedPlan(planId);
      }}
      className="flex w-full cursor-pointer items-center gap-3"
    >
      {/* Radio Button */}
      <RadioGroup
        value={selectedPlan}
        onChange={setSelectedPlan}
        className="flex gap-0 border border-gray-300 rounded-full"
      >
        <RadioButton value={planId} />
      </RadioGroup>

      {/* Plan Title and Price */}
      <div className="flex flex-1 items-center justify-between gap-4">
        <span className="text-lg font-medium text-ws-text-secondary">{plan.name}</span>
        <span className="cursor-pointer text-base font-normal text-ws-text-tertiary hover:text-ws-text-secondary">
          {plan.price}
        </span>
      </div>

      {/* Chevron Icon - Rotates based on open/close state */}
      <ChevronUp
        data-icon
        className={`h-5 w-5 shrink-0 text-gray-600 transition-transform duration-300 ${
          selectedPlan === planId ? "rotate-0" : "rotate-180"
        }`}
      />
    </div>
  );

  const renderAccordionContent = (plan: PlanOption) => (
    <div className="space-y-4 text-ws-gray-100">
      <p className="text-base font-normal leading-6">{plan.description}</p>

      {plan.features.length > 0 && (
        <ul className="space-y-2 pl-6 text-base font-normal leading-6">
          {plan.features.map((feature, index) => (
            <li key={index} className="list-disc">
              {feature}
            </li>
          ))}
        </ul>
      )}

      {plan.disclaimer && <p className="text-base font-normal leading-6">{plan.disclaimer}</p>}
    </div>
  );

  const handleBack = async () => {
    navigate("/dashboard");
  };

  const handleClose = () => {
    navigate("/dashboard");
  };

  const handleGetStarted = () => {
    if (selectedPlan === "manual") {
      navigate("/assessment");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-ws-navy-25">
      {/* Top Navigation Bar */}
      <div className="flex h-14 items-center justify-between border-b border-ws-primary-600 px-6 py-4">
        {/* Back Button */}
        <Button
          onClick={handleBack}
          color="tertiary"
          size="md"
          iconLeading={<ChevronLeft data-icon className="text-ws-primary-800" />}
          className="flex items-center gap-1 text-lg font-normal text-ws-primary-800 transition-opacity"
        >
          Back
        </Button>

        {/* Close Button */}
        <Button
          color="tertiary"
          size="md"
          onClick={handleClose}
          iconLeading={<XClose data-icon className="text-ws-primary-800" />}
          className="text-ws-primary-800 transition-opacity hover:opacity-80"
        />
      </div>

      {/* Main Content Area */}
      <div className="mx-auto w-full flex-1 py-8 px-4">
        {/* Header Section */}
        <div className="mx-auto w-full max-w-2xl text-center mt-25">
          <h1 className="text-4xl font-semibold tracking-tight text-ws-text-primary">
            Get more from BeneStats
          </h1>
          <p className="text-lg font-normal text-ws-text-primary mt-2">
            Save time and unlock deeper insights by integrating your payroll with BeneStats. Choose
            the best plan to achieve your workforce goals—at no cost to you.
          </p>
        </div>

        {/* Accordion Section */}
        <div className="mx-auto w-full max-w-2xl space-y-4 mt-6">
          {plans.map(plan => (
            <Accordion key={plan.id} value={selectedPlan === plan.id ? plan.id : undefined}>
              <AccordionItem value={plan.id} header={renderAccordionHeader(plan.id, plan)}>
                {renderAccordionContent(plan)}
              </AccordionItem>
            </Accordion>
          ))}
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="flex items-center justify-end border-t border-ws-border-primary bg-ws-base-white px-6 py-2.5">
        <Button
          color="primary"
          size="md"
          onClick={handleGetStarted}
          className="min-w-30 bg-ws-primary-900 text-ws-base-white hover:bg-ws-primary-900-hover focus:bg-ws-primary-900-hover active:bg-ws-primary-900-hover"
        >
          Let's Get Started
        </Button>
      </div>
    </div>
  );
}
