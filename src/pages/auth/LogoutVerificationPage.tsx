import { useNavigate } from "react-router-dom";
import { SuccessScreen } from "./SuccessScreen";
import logoutIcon from "@/assets/logout-Icon.svg";
export const LogoutVerificationPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    // Handle navigation to dashboard or next step
    //console.log("Let's Get Started clicked");
    // Add your navigation logic here
    // e.g., navigate('/dashboard')
    navigate("/sign-in");
  };

  return (
    <SuccessScreen
      messageImg={logoutIcon}
      title="You’ve been logged out"
      subtitle="You’ve been logged out of your account. Log back in anytime to continue."
      buttonText="Log back in"
      onButtonClick={handleGetStarted}
    />
  );
};

export default LogoutVerificationPage;
