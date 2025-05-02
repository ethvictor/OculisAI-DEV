import { Navigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useSubscription } from "@/hooks/useSubscription";

interface ProtectedRouteProps {
  allowedPlans?: ("plus" | "pro")[];  // Vilka abonnemang som tillåts
  children: JSX.Element;
}

export const ProtectedRoute = ({ allowedPlans = [], children }: ProtectedRouteProps) => {
  const { user, isLoading: userLoading } = useAuth0();
  const { subscription, loading: subscriptionLoading } = useSubscription(user?.sub || "", user?.email || "");

  if (userLoading || subscriptionLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedPlans.length > 0 && !allowedPlans.includes(subscription as "plus" | "pro")) {
    return <Navigate to="/upgrade" replace />;
  }

  return children;
};
