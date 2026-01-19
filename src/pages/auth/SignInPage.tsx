import React from "react";
import { SignInForm } from "../../components/auth/SignInForm";

export const SignInPage: React.FC = () => {
  return (
    <>
      {/* Sign In Form */}
      <div className="w-full">
        <SignInForm />
      </div>
    </>
  );
};
