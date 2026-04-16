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
    () =>
      (participationSection?.benefits ?? []).map(item => ({
        label: item.name,
        percentage: parsePercentage(item.enrollment),
        progressColor: "bg-ws-navy-300",
      })),
    [participationSection]
  );

  const retirementItems = useMemo(
    () =>
      (participationSection?.retirement ?? []).map(item => ({
        label: item.name,
        percentage: parsePercentage(item.enrollment),
        progressColor: "bg-ws-light-teal-400",
      })),
    [participationSection]
  );

  const insuranceItems = useMemo(
    () =>
      (participationSection?.insurance ?? []).map(item => ({
        label: item.name,
        percentage: parsePercentage(item.enrollment),
        progressColor: "bg-ws-light-teal-300",
      })),
    [participationSection]
  );

  return { participationCardsConfig, benefitsItems, retirementItems, insuranceItems };
}
