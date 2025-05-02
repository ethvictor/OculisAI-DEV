import { useEffect, useState } from "react";

export function useSubscription(userId: string, email: string) {
  const [subscription, setSubscription] = useState<string>("free");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const response = await fetch("http://localhost:8000/user-subscription", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: userId, email }),
        });

        const data = await response.json();
        setSubscription(data.subscription);
      } catch (error) {
        console.error("Failed to fetch subscription", error);
      } finally {
        setLoading(false);
      }
    }

    if (userId && email) {
      fetchSubscription();
    }
  }, [userId, email]);

  return { subscription, loading };
}
