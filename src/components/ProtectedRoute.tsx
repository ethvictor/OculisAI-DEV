import { Navigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useState, useEffect } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface ProtectedRouteProps {
  allowedPlans?: ("free-trial" | "basic" | "pro")[];  // Updated plan names
  requiresUsageCheck?: boolean; 
  children: JSX.Element;
}

export const ProtectedRoute = ({ 
  allowedPlans = [], 
  requiresUsageCheck = false,
  children 
}: ProtectedRouteProps) => {
  const { user, isLoading: userLoading, loginWithRedirect } = useAuth0();
  const { subscription, loading: subscriptionLoading, isAdmin } = useSubscription(user?.sub || "", user?.email || "");
  const [usageRemaining, setUsageRemaining] = useState<number | null>(null);
  const [checkingUsage, setCheckingUsage] = useState(false);
  const { toast } = useToast();

  // Check daily usage for free trial users
  useEffect(() => {
    const checkUsage = async () => {
      if (!user || subscription !== "free-trial" || !requiresUsageCheck) return;
      
      setCheckingUsage(true);
      try {
        const response = await fetch("/api/check-usage", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            user_id: user.sub,
            email: user.email 
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to check usage");
        }

        const data = await response.json();
        setUsageRemaining(data.remaining_analyses);
        
        if (data.remaining_analyses <= 0) {
          toast({
            title: "Daglig gräns uppnådd",
            description: "Du har använt dina 3 analyser för idag. Kom tillbaka imorgon eller uppgradera din plan.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error checking usage:", error);
      } finally {
        setCheckingUsage(false);
      }
    };

    checkUsage();
  }, [user, subscription, requiresUsageCheck]);

  if (userLoading || subscriptionLoading || checkingUsage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <p>Laddar...</p>
      </div>
    );
  }

  // If user is admin, always allow access regardless of plan
  if (isAdmin) {
    console.log("Admin access granted, bypassing plan restrictions");
    return children;
  }

  // Instead of redirecting, we'll render the children with an overlay if not authenticated
  if (!user) {
    return (
      <div className="relative">
        {children}
        <div className="fixed inset-0 top-16 bg-white/90 dark:bg-black/90 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="max-w-md mx-auto p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Upptäck kraften i Oculis AI</h2>
            <p className="text-lg mb-8 text-gray-600 dark:text-gray-300">
              Logga in för att låsa upp alla funktioner och börja optimera din e-handel med vår AI-drivna plattform.
            </p>
            <div className="space-y-4">
              <Button 
                onClick={() => loginWithRedirect()}
                size="lg" 
                variant="gradient"
                className="w-full text-base"
              >
                Starta din gratis provperiod
              </Button>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Ingen kreditkortsuppgift krävs. Avsluta när som helst.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle free trial users with no remaining usage
  if (
    subscription === "free-trial" && 
    requiresUsageCheck && 
    usageRemaining !== null && 
    usageRemaining <= 0
  ) {
    toast({
      title: "Daglig gräns uppnådd",
      description: "Du har använt dina 3 analyser för idag. Kom tillbaka imorgon eller uppgradera din plan.",
      variant: "destructive",
    });
    return <Navigate to="/upgrade" replace />;
  }

  // Check if user has an allowed plan
  if (allowedPlans.length > 0 && !allowedPlans.includes(subscription as any)) {
    return <Navigate to="/upgrade" replace />;
  }

  return children;
};
