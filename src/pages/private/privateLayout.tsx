import { Outlet, Navigate } from "react-router-dom";
import { useState } from "react";
import { Header } from "@/components/shared";

// Simulate authentication check
// In production, this would check your auth state/token
const useAuth = () => {
  // This is a simple demo - replace with your actual auth logic
  const [isAuthenticated] = useState(true); // Set to true for demo
  return isAuthenticated;
};

export default function PrivateLayout() {
  const isAuthenticated = useAuth();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header/Navigation */}
      <Header />

      {/* Main Content */}
      <main className="container mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}
