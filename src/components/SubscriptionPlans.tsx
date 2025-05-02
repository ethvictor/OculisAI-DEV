import { useAuth0 } from "@auth0/auth0-react";

const SubscriptionPlans = () => {
  const { user } = useAuth0();

  const handleSubscribe = async (selectedPlan: "plus" | "pro") => {
    try {
      if (!user) {
        alert("Du måste vara inloggad.");
        return;
      }

      const response = await fetch("http://127.0.0.1:8000/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: selectedPlan,
          user_id: user.sub,
        }),
      });

      const data = await response.json();
      window.location.href = data.checkout_url;
    } catch (error) {
      console.error("Något gick fel:", error);
      alert("Kunde inte starta prenumeration.");
    }
  };

  return (
    <div className="flex flex-col space-y-4 p-6">
      <h2 className="text-2xl font-bold mb-4">Välj din plan</h2>
      <button
        onClick={() => handleSubscribe("plus")}
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
      >
        Välj Oculis Plus – 99 kr/mån
      </button>
      <button
        onClick={() => handleSubscribe("pro")}
        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
      >
        Välj Oculis Pro – 199 kr/mån
      </button>
    </div>
  );
};

export default SubscriptionPlans;
