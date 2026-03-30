import React from "react";
import { useGoogleSSO } from "../../hooks/useGoogleSSO";
import { SocialButton } from "../base/buttons/social-button";

interface GoogleSSOButtonProps {
  className?: string;
  text?: string;
}

export const GoogleSSOButton: React.FC<GoogleSSOButtonProps> = () => {
  const { initiateGoogleSignIn } = useGoogleSSO();

  const handleClick = () => {
    initiateGoogleSignIn();
  };

  return (
    <SocialButton social="google" size="md" onClick={handleClick} className="w-full">
      Sign in with Google
    </SocialButton>
  );
};
