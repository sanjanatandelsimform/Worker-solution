import { useEffect, useRef, useState } from "react";
import { ProgressLoadingModal } from "../modals";
import { LandingProgress } from "@/assets/icons/LoadingProgress";
import { didYouKnowSlides } from "@/constants/didYouKnowSlides";

const DynamicLoadingModal = ({
  shouldShow,
  onClose,
}: {
  shouldShow: boolean;
  onClose: () => void;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!shouldShow) return;
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % didYouKnowSlides.length);
    }, 7000);
    return () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
    };
  }, [shouldShow]);

  const slide = didYouKnowSlides[currentIndex % didYouKnowSlides.length];

  return (
    <ProgressLoadingModal
      size="lg"
      contentTitle={slide.title}
      contentDescription={slide.content}
      title="Loading..."
      subtitle="Generating your custom dashboard."
      contentNote={`Source: ${slide.source}`}
      isOpen={shouldShow}
      icon={<LandingProgress className="size-3" />}
      showCloseButton
      onClose={onClose}
    />
  );
};

export default DynamicLoadingModal;
