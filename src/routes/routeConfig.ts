import { RouteAccess, type RouteConfig } from "@/types/routeTypes";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { SignInPage } from "@/pages/auth/SignInPage";
import { VerifyEmailPage } from "@/pages/auth/VerifyEmailPage";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { SettingsPage } from "@/pages/settings/SettingsPage";
import { SuccessPage } from "@/pages/successPage/SuccessPage";
import PrivacyPage from "@/pages/termsPolicy/PrivacyPage";
import TermsPage from "@/pages/termsPolicy/TermsPage";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import AssessmentWorkforcePage from "@/pages/assessmentWorkforce/AssessmentWorkforce";
import GetMorePage from "@/pages/getMore/GetMore";
import AdditionalQuestions from "@/pages/additionalQuestions/AdditionalQuestions";
import AboutUs from "@/pages/aboutUs/AboutUs";

export const routes: RouteConfig[] = [
  // Public routes - accessible only when NOT authenticated
  {
    path: "/sign-up",
    access: RouteAccess.PUBLIC,
    element: RegisterPage,
    redirectWhenAuthenticated: "/dashboard",
  },
  {
    path: "/sign-in",
    access: RouteAccess.PUBLIC,
    element: SignInPage,
    redirectWhenAuthenticated: "/dashboard",
  },
  {
    path: "/forgot-password",
    access: RouteAccess.PUBLIC,
    element: ForgotPasswordForm,
    redirectWhenAuthenticated: "/dashboard",
  },
  {
    path: "/reset-password",
    access: RouteAccess.PUBLIC,
    element: ResetPasswordForm,
    redirectWhenAuthenticated: "/dashboard",
  },

  // Unrestricted routes - accessible regardless of authentication
  {
    path: "/success",
    access: RouteAccess.UNRESTRICTED,
    element: SuccessPage,
  },
  {
    path: "/verify-email",
    access: RouteAccess.UNRESTRICTED,
    element: VerifyEmailPage,
  },
  {
    path: "/privacy-policy",
    access: RouteAccess.UNRESTRICTED,
    element: PrivacyPage,
  },
  {
    path: "/terms-page",
    access: RouteAccess.UNRESTRICTED,
    element: TermsPage,
  },

  // Protected routes - accessible only when authenticated
  {
    path: "/dashboard",
    access: RouteAccess.PROTECTED,
    element: DashboardPage,
    redirectWhenUnauthenticated: "/sign-in",
  },
  {
    path: "/settings",
    access: RouteAccess.PROTECTED,
    element: SettingsPage,
    redirectWhenUnauthenticated: "/sign-in",
  },
  {
    path: "/assessment",
    access: RouteAccess.PROTECTED,
    element: AssessmentWorkforcePage,
    redirectWhenUnauthenticated: "/sign-in",
  },
  {
    path: "/get-more",
    access: RouteAccess.PROTECTED,
    element: GetMorePage,
    redirectWhenUnauthenticated: "/sign-in",
  },
  {
    path: "/additional-questions",
    access: RouteAccess.PROTECTED,
    element: AdditionalQuestions,
    redirectWhenUnauthenticated: "/sign-in",
  },
  {
    path: "/about-us",
    access: RouteAccess.PROTECTED,
    element: AboutUs,
    redirectWhenUnauthenticated: "/sign-in",
  },
];

/**
 * Default redirect paths
 */
export const DEFAULT_REDIRECTS = {
  authenticated: "/dashboard",
  unauthenticated: "/sign-in",
} as const;
