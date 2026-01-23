import { Button } from "@/components/base/buttons/button";
import { useNavigate } from "react-router-dom";
export default function TermsPage() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary">
      <div className="flex w-3xl items-center justify-center rounded-xl border border-solid border-primary bg-primary pt-6">
        <div className="flex w-full flex-col items-center p-6 ">
          {/* Logo */}
          <div className="flex items-center justify-center rounded-xl bg-tertiary px-2 py-1 mb-6">
            <h1 className="text-5xl font-bold leading-15 text-primary">BeneStat</h1>
          </div>
          <div className="flex w-full flex-col items-start gap-6">
            <div className="prose w-full">
              <h2 className="text-black">Terms and Conditions</h2>
              <p className="text-card-subtitle text-lg">Last updated: [January 23, 2026]</p>
            </div>
            <div className="w-full h-110 overflow-y-scroll">
              <div className="prose max-w-none">
                <p className="text-sm text-black">1. Acceptance of Terms</p>
                <p className="text-sm text-black">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                  incididunt ut labore et dolore magna aliqua. By accessing or using this service,
                  you agree to be bound by these Terms and Conditions.
                </p>
                <p className="text-sm text-black">2. Acceptance of Terms</p>
                <p className="text-sm text-black">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                  incididunt ut labore et dolore magna aliqua. By accessing or using this service,
                  you agree to be bound by these Terms and Conditions.
                </p>
                <p className="text-sm text-black">3. Acceptance of Terms</p>
                <p className="text-sm text-black">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                  incididunt ut labore et dolore magna aliqua. By accessing or using this service,
                  you agree to be bound by these Terms and Conditions.
                </p>
                <p className="text-sm text-black">4. Acceptance of Terms</p>
                <p className="text-sm text-black">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                  incididunt ut labore et dolore magna aliqua. By accessing or using this service,
                  you agree to be bound by these Terms and Conditions.
                </p>
                <p className="text-sm text-black">5. Acceptance of Terms</p>
                <p className="text-sm text-black">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                  incididunt ut labore et dolore magna aliqua. By accessing or using this service,
                  you agree to be bound by these Terms and Conditions.
                </p>
                <p className="text-sm text-black">6. Acceptance of Terms</p>
                <p className="text-sm text-black">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                  incididunt ut labore et dolore magna aliqua. By accessing or using this service,
                  you agree to be bound by these Terms and Conditions.
                </p>
                <p className="text-sm text-black">7. Acceptance of Terms</p>
                <p className="text-sm text-black">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                  incididunt ut labore et dolore magna aliqua. By accessing or using this service,
                  you agree to be bound by these Terms and Conditions.
                </p>
                <p className="text-sm text-black">8. Acceptance of Terms</p>
                <p className="text-sm text-black">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                  incididunt ut labore et dolore magna aliqua. By accessing or using this service,
                  you agree to be bound by these Terms and Conditions.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end w-full">
              <Button color="primary" size="lg" onClick={() => navigate(-1)}>
                Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
