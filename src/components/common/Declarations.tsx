import { useState } from "react";
import { Button } from "../base/buttons/button";
import TermsModal from "../modals/TermsModal";
import { useModalConfig } from "@/hooks/useModalConfig";

interface DeclarationsProps {
  readonly className?: string;
}

export default function Declarations({ className = "" }: Readonly<DeclarationsProps>) {
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  const updateDeclarationTermsModal = useModalConfig("updateDeclarationTerms", {
    isOpen: isTermsModalOpen,
    onClose: () => setIsTermsModalOpen(false),
  });
  const updateDeclarationPrivacyModal = useModalConfig("updateDeclarationPrivacy", {
    isOpen: isPrivacyModalOpen,
    onClose: () => setIsPrivacyModalOpen(false),
  });

  return (
    <div className={`w-full ${className}`}>
      <p className="text-xs leading-4 font-normal text-ws-text-primary ">
        This product provides informational insights and recommendations based on the data you share and industry benchmarks. It does not provide legal, financial, tax, or benefits advice, and recommendations are not guarantees of outcomes or results. Actual results may vary, and you are responsible for evaluating and implementing any recommendations based on your organization’s specific circumstances. Read our 
        <Button
          color="link"
          size="sm"
          onClick={() => setIsTermsModalOpen(true)}
          className="text-xs text-ws-light-teal-850 underline p-0 m-0 h-5"
        >
          Terms & Conditions
        </Button>{" "}
        and{" "}
        <Button
          color="link"
          size="sm"
          onClick={() => setIsPrivacyModalOpen(true)}
          className="text-xs text-ws-light-teal-850 underline p-0 m-0 h-5"
        >
          Privacy Policy
        </Button>
      </p>
      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        {...updateDeclarationTermsModal}
      />
      <TermsModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        {...updateDeclarationPrivacyModal}
      />
    </div>
  );
}
