import React from "react";
import { RegistrationForm } from "../../components/auth/RegistrationForm";

export const RegisterPage: React.FC = () => {
  return (
    <>
      {/* Sign In Form */}
      <div className="w-full">
        <RegistrationForm />
      </div>
    </>
  );
};
