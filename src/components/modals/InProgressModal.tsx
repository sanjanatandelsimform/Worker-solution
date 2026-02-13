import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalTitle,
} from "@/components/base/modal/modal";
import { Button } from "@/components/base/buttons/button";
import { X } from "@untitledui/icons";

interface InProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToDashboard?: () => void;
  title?: string;
  subtitle?: string;
}

export const InProgressModal = ({
  isOpen,
  onClose,
  onGoToDashboard,
  title = "Preparing...",
  subtitle = "One moment while we prepare your results and recommendations.",
}: InProgressModalProps) => {
  const handleGoToDashboard = () => {
    if (onGoToDashboard) {
      onGoToDashboard();
    }
    onClose();
  };

  const loadingIcon = "http://localhost:3845/assets/0e6fb58232a90ae859fbd35b8641df1dea24e1f2.svg";

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="sm">
      <ModalContent>
        <ModalHeader className="relative flex flex-col items-start gap-4 border-0 pb-0 pt-6 px-6">
          <div
            className="flex size-12 items-center justify-center overflow-clip rounded-full shrink-0"
            style={{
              backgroundColor: "var(--color-blue-light-100)",
            }}
          >
            <div className="size-6 overflow-clip">
              <img
                src={loadingIcon}
                alt="Loading"
                className="block max-w-none size-full"
                style={{
                  filter:
                    "brightness(0) saturate(100%) invert(27%) sepia(89%) saturate(2234%) hue-rotate(216deg) brightness(96%) contrast(92%)",
                }}
              />
            </div>
          </div>

          <Button
            color="tertiary"
            size="sm"
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute right-3 top-3 flex size-11 items-center justify-center overflow-clip p-2 rounded-lg"
          >
            <X
              className="size-6"
              style={{
                color: "var(--color-text-quaternary)",
              }}
            />
          </Button>

          <div className="flex w-full flex-col gap-1">
            <ModalTitle className="text-[36px] font-medium leading-11 tracking-[-0.72px] font-display text-primary">
              {title}
            </ModalTitle>
            <p className="text-sm font-normal leading-5 font-body text-tertiary">{subtitle}</p>
          </div>

          <div className="h-5 w-full shrink-0" />
        </ModalHeader>

        <ModalFooter className="flex items-start gap-3 border-0 pb-6 pt-8 px-6">
          <Button
            type="button"
            color="secondary"
            size="md"
            onClick={handleGoToDashboard}
            className="w-full"
            isDisabled={true}
          >
            Go to Dashboard
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default InProgressModal;
