import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectParticipationSection } from "@/store/selectors/workforceSelectors";
import { EnrolledIcon } from "@/assets/icons/EnrolledIcon";
import { SavingIcon } from "@/assets/icons/SavingIcon";
import { HeartLineIcon } from "@/assets/icons/HeartLineIcon";
import { parsePercentage } from "@/pages/workforce/workforceUtils";

export function useWorkforceParticipationConfig() {
  const participationSection = useAppSelector(selectParticipationSection);

  const participationCardsConfig = useMemo(
    () => [
      {
        id: "enrolled-employees",
        title: "Enrolled Employees",
        count: participationSection?.enrolledBenefits?.toLocaleString() ?? "--",
        countIcon: <EnrolledIcon className="size-5 text-ws-gray-300" />,
      },
      {
        id: "enrolled-retirement",
        title: "Enrolled in Retirement",
        count: participationSection?.retirementEnrollment ?? "--",
        countIcon: <SavingIcon className="size-5 text-ws-gray-300" />,
      },
      {
        id: "enrolled-healthcare",
        title: "Enrolled in Healthcare",
        count: participationSection?.healthcareEnrollment ?? "--",
        countIcon: <HeartLineIcon className="size-5 text-ws-gray-300" />,
      },
    ],
    [participationSection]
  );

  const benefitsItems = useMemo(
    () => [
      {
        label: "FSA",
        percentage: parsePercentage(participationSection?.benefits.FSA ?? "0"),
        progressColor: "bg-ws-navy-300",
      },
      {
        label: "Wellness",
        percentage: parsePercentage(participationSection?.benefits.wellness ?? "0"),
        progressColor: "bg-ws-navy-300",
      },
      {
        label: "EAP",
        percentage: parsePercentage(participationSection?.benefits.EAP ?? "0"),
        progressColor: "bg-ws-navy-300",
      },
    ],
    [participationSection]
  );

  const retirementItems = useMemo(
    () => [
      {
        label: "401k",
        percentage: parsePercentage(participationSection?.retirement["401k"] ?? "0"),
        progressColor: "bg-ws-light-teal-400",
      },
    ],
    [participationSection]
  );

  const insuranceItems = useMemo(
    () => [
      {
        label: "Health",
        percentage: parsePercentage(participationSection?.insurance.health ?? "0"),
        progressColor: "bg-ws-light-teal-300",
      },
      {
        label: "Dental",
        percentage: parsePercentage(participationSection?.insurance.dental ?? "0"),
        progressColor: "bg-ws-light-teal-300",
      },
      {
        label: "Vision",
        percentage: parsePercentage(participationSection?.insurance.vision ?? "0"),
        progressColor: "bg-ws-light-teal-300",
      },
      {
        label: "Life",
        percentage: parsePercentage(participationSection?.insurance.life ?? "0"),
        progressColor: "bg-ws-light-teal-300",
      },
    ],
    [participationSection]
  );

  return { participationCardsConfig, benefitsItems, retirementItems, insuranceItems };
}
