import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

export function useSubscription(userId: string, email: string) {
  const [subscription, setSubscription] = useState<string>("loading");
  const [loading, setLoading] = useState<boolean>(true);
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
  const [weeklyAnalysesLeft, setWeeklyAnalysesLeft] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const { user } = useAuth0();

  useEffect(() => {
    async function fetchSubscription() {
      try {
        // Check if user has Auth0 admin role
        const auth0AdminRole = !!(
          user &&
          (user as any)["https://oculis-ai.example.com/roles"]?.includes("admin")
        );
        
        if (auth0AdminRole) {
          setIsAdmin(true);
          setSubscription("pro"); // Admins get pro subscription level by default
          setLoading(false);
          return;
        }

        const response = await fetch("/api/user-subscription", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: userId, email }),
        });

        const data = await response.json();
        
        setSubscription(data.subscription);
        setIsAdmin(data.is_admin || false);
        
        if (data.trial_info) {
          setTrialDaysLeft(data.trial_info.days_left);
        }
        
        if (data.basic_info) {
          setWeeklyAnalysesLeft(data.basic_info.weekly_analyses_left);
        }
      } catch (error) {
        console.error("Failed to fetch subscription", error);
        setSubscription("free"); // Default to free if there's an error
      } finally {
        setLoading(false);
      }
    }

    if (userId && email) {
      fetchSubscription();
    } else if (!userId && !email) {
      // If we don't have user info, assume not logged in
      setLoading(false);
      setSubscription("free");
    }
  }, [userId, email, user]);

  return { subscription, trialDaysLeft, weeklyAnalysesLeft, loading, isAdmin };
}