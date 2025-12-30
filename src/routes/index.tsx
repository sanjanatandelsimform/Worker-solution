import { lazy, Suspense, type ComponentType } from "react";
import type { RouteObject } from "react-router-dom";
import { PageLoader, PageNotFound } from "@/components/shared";

// Lazy load layouts
const AuthLayout = lazy(() => import("@/pages/public/authLayout"));
const PrivateLayout = lazy(() => import("@/pages/private/privateLayout"));

// Lazy load public pages
const Login = lazy(() => import("@/pages/public/login"));

// Lazy load private pages
const Dashboard = lazy(() => import("@/pages/private/dashboard"));

// Helper function to wrap lazy components with Suspense
function lazyLoad(Component: ComponentType) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

// Routes configuration
export const routes: RouteObject[] = [
  // Public routes
  {
    path: "/auth",
    element: lazyLoad(AuthLayout),
    children: [
      {
        path: "login",
        element: lazyLoad(Login),
      },
    ],
  },

  // Private routes (protected)
  {
    path: "/",
    element: lazyLoad(PrivateLayout),
    children: [
      {
        index: true,
        element: lazyLoad(Dashboard),
      },
    ],
  },

  // 404 - Not Found
  {
    path: "*",
    element: <PageNotFound />,
  },
];
