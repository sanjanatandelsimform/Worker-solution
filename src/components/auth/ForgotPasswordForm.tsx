import { Button } from "../base/buttons/button";
import { InputGroup } from "../base/input/input-group";
import { Input } from "../base/input/input";
import { Mail01 } from "@untitledui/icons";

export default function ForgotPasswordForm() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary">
      <div className="flex w-2xl items-center justify-center rounded-xl border border-solid border-primary bg-primary py-28">
        <div className="flex w-full max-w-md flex-col items-center gap-8">
          {/* Header */}
          <div className="flex w-full flex-col items-center gap-6">
            {/* Logo */}
            <div className="flex items-center justify-center rounded-xl bg-tertiary px-2 py-1">
              <h1 className="text-5xl font-bold leading-15 text-primary">BeneStat</h1>
            </div>

            {/* Title and Description */}
            <div className="flex w-full flex-col items-start gap-3 text-center">
              <h2 className="w-full text-4xl font-semibold leading-9.5 text-primary">
                Forgot your password?
              </h2>
              <p className="w-full text-medium font-normal leading-6 text-tertiary">
                Enter the email address associated with your account and we’ll send you a link to
                reset your password.
              </p>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex w-full flex-col items-center gap-6 rounded-xl">
            <form className="flex w-full cursor-pointer flex-col gap-5">
              {/* Email Input Field */}
              <InputGroup>
                <Input
                  name="email"
                  size="md"
                  icon={Mail01}
                  isRequired
                  label="Business Email Address"
                  placeholder="olivia@untitledui.com"
                  value={"email"}
                />
              </InputGroup>

              {/* Actions */}
              <div className="flex w-full flex-col items-start gap-4">
                {/* Sign in Button */}
                <Button
                  type="submit"
                  color="primary"
                  size="lg"
                  href="/reset-password"
                  className="w-full"
                >
                  Send Link
                </Button>
              </div>
            </form>
          </div>

          {/* Sign up link */}
          <div className="flex w-full items-baseline justify-center gap-1">
            <p className="text-sm font-normal leading-5 text-tertiary">Already have an account?</p>
            <Button href="/sign-in" color="link-color" size="md">
              Sign in
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
