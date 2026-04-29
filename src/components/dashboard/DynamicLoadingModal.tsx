import { useEffect, useRef, useState } from "react";
import { ProgressLoadingModal } from "../modals";
import { LandingProgress } from "@/assets/icons/LoadingProgress";

const labels = [
  {
    desc: "78% of employees reported they’re more likely to stay with an employer because of their benefits program.",
    note: "Source: 2018 Willis Towers Watson Employee and Employer Experience on a Benefit Marketplace Survey",
  },
  {
    desc: "Companies with strong benefits programs see 2x higher retention rates.",
    note: "Source: SHRM 2022 Employee Benefits Survey",
  },
  {
    desc: "Benefits satisfaction increases employee engagement by 41%.",
    note: "Source: MetLife Employee Benefit Trends Study 2023",
  },
];

const DynamicLoadingModal = ({ shouldShow }: { shouldShow: boolean }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!shouldShow) return;
    intervalRef.current = globalThis.setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % labels.length);
    }, 7000);
    return () => {
      if (intervalRef.current !== null) globalThis.clearInterval(intervalRef.current);
    };
  }, [shouldShow]);

  const { desc, note } = labels[currentIndex];

  return (
    <ProgressLoadingModal
      contentTitle="Did you know?"
      contentDescription={desc}
      title="Loading..."
      subtitle="Generating your custom dashboard."
      contentNote={note}
      isOpen={shouldShow}
      onClose={() => {}}
      showCloseButton={false}
      icon={<LandingProgress className="size-3" />}
    />
  );
};

export default DynamicLoadingModal;
