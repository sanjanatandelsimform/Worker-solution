import { Modal, ModalContent, ModalHeader, ModalTitle } from "@/components/base/modal/modal";
import { Button } from "@/components/base/buttons/button";
import { X } from "@untitledui/icons";
import prepareIcon from "@/assets/preparing-icon.svg";

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
  title = "Preparing...",
  subtitle = "One moment while we prepare your results and recommendations.",
}: InProgressModalProps) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="sm">
      <ModalContent>
        <ModalHeader className="relative flex flex-col items-start gap-4 border-0 pb-0 pt-6 px-6">
          {/* Featured Icon - Blue Loading Icon */}
          <div className="flex size-12 items-center justify-center overflow-clip rounded-full shrink-0 bg-blue-300">
            {/* <div className="size-6 overflow-clip"> */}
            <img src={prepareIcon} alt="Loading" className="block max-w-none size-full" />
            {/* </div> */}
          </div>

          <Button
            color="tertiary"
            size="sm"
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute right-3 top-3 flex size-11 items-center justify-center overflow-clip p-2 rounded-lg"
          >
            <X className="size-6 text-ws-black-10" />
          </Button>

          <div className="flex w-full flex-col gap-1">
            <ModalTitle className="text-[36px] font-medium leading-11 tracking-[-0.72px] font-display text-ws-black">
              {title}
            </ModalTitle>
            <p className="text-sm font-normal leading-5 font-body text-ws-black-10">{subtitle}</p>
          </div>

          <div className="h-5 w-full shrink-0" />
        </ModalHeader>
      </ModalContent>
    </Modal>
  );
};

export default InProgressModal;
