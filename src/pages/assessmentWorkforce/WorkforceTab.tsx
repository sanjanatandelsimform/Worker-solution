//import { useState } from "react";
import { DynamicTab } from "@/components/assessment/DynamicTab";
import questionData from "@/data/assessment/questionData.json";
import type { Question } from "@/types/questionTypes";
//import { MultiSelect } from "@/components/common/MultiSelect";

interface WorkforceTabProps {
  onNext?: () => void;
  onSuccess?: () => void;
}

// const commuteOptions = [
//   { label: "Train", value: "train" },
//   { label: "Bus", value: "bus" },
//   { label: "Walking", value: "walking" },
//   { label: "Bike", value: "bike" },
//   { label: "Car", value: "car" },
// ];

export default function WorkforceTab({ onNext, onSuccess }: WorkforceTabProps) {
  //const [selected, setSelected] = useState<string[]>([]);
  const workforceSection = questionData.sections.find(section => section.name === "Workforce");

  if (!workforceSection) {
    return <div className="text-red-600">Workforce section not found in question data</div>;
  }

  return (
    <>
      {/* <MultiSelect Keep this commented till PM not approval the final design.
        options={commuteOptions}
        value={selected}
        onChange={setSelected}
        placeholder="Select methods of commute"
      /> */}
      <DynamicTab
        section="workforce"
        questions={workforceSection.questions as Question[]}
        onNext={onNext}
        onSuccess={onSuccess}
      />
    </>
  );
}
