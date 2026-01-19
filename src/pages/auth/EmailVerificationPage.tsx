import { SuccessScreen } from "./SuccessScreen";

export const EmailVerificationPage = () => {
  const handleGetStarted = () => {
    // Handle navigation to dashboard or next step
    console.log("Let's Get Started clicked");
    // Add your navigation logic here
    // e.g., navigate('/dashboard')
  };

  return (
    <SuccessScreen
      title="Your email has been verified!"
      subtitle="Welcome aboard! Start your success journey with Worker Solutions®"
      buttonText="Let's Get Started"
      onButtonClick={handleGetStarted}
    />
  );
};

export default EmailVerificationPage;
