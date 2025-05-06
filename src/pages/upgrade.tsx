
import { useAuth0 } from "@auth0/auth0-react";
import { useSubscription } from "@/hooks/useSubscription";
import SubscriptionPlans from "@/components/SubscriptionPlans";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertCircle, User } from "lucide-react";
import { Link } from "react-router-dom";

const Upgrade = () => {
  const { user, isLoading, loginWithRedirect } = useAuth0();
  const { subscription, trialDaysLeft, weeklyAnalysesLeft, loading: subscriptionLoading } = useSubscription(user?.sub || "", user?.email || "");

  if (isLoading || subscriptionLoading) {
    return (
      <div className="container py-12">
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      {user && (
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <User className="h-12 w-12 text-indigo-500" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Min profil</h1>
          <div className="mb-8 text-center">
            <p className="text-lg font-medium">{user.name}</p>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>
      )}

      {user && subscription === "free-trial" && (
        <Alert className="max-w-3xl mx-auto mb-8 bg-blue-50 border-blue-200 text-blue-800">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription>
            Du har en aktiv gratis provperiod med {trialDaysLeft} dagar kvar och max 3 analyser per dag.
            Uppgradera för att få tillgång till fler funktioner och analyser.
          </AlertDescription>
        </Alert>
      )}

      {user && subscription === "basic" && weeklyAnalysesLeft !== null && (
        <Alert className="max-w-3xl mx-auto mb-8 bg-indigo-50 border-indigo-200 text-indigo-800">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription>
            Du har {weeklyAnalysesLeft} analyser kvar denna vecka med din Start-plan.
            Uppgradera till Pro för obegränsade analyser.
          </AlertDescription>
        </Alert>
      )}

      {user && subscription === "free" && (
        <Alert className="max-w-3xl mx-auto mb-8 bg-amber-50 border-amber-200 text-amber-800">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription>
            Din gratis provperiod har löpt ut. Uppgradera nu för fortsatt tillgång till Oculis AI.
          </AlertDescription>
        </Alert>
      )}

      {/* If user is not logged in, show login prompt */}
      {!user && (
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-6">Uppgradera Oculis AI</h1>
          <p className="text-lg text-gray-600 mb-8">
            Logga in för att komma åt alla premium-funktioner och fördelar med Oculis AI.
          </p>
          
          <Button size="lg" onClick={() => loginWithRedirect()} className="bg-indigo-600 hover:bg-indigo-700">
            Logga in för att fortsätta
          </Button>

          <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Fördelar med ett premium-konto</h2>
            <ul className="space-y-4">
              <li className="flex items-start">
                <span className="bg-green-100 text-green-800 p-1 rounded-full mr-3 mt-1">✓</span>
                <span>Obegränsad tillgång till AI-analyser av din e-handelsbutik</span>
              </li>
              <li className="flex items-start">
                <span className="bg-green-100 text-green-800 p-1 rounded-full mr-3 mt-1">✓</span>
                <span>Konkurrentanalyser för att få strategiska insikter om din marknad</span>
              </li>
              <li className="flex items-start">
                <span className="bg-green-100 text-green-800 p-1 rounded-full mr-3 mt-1">✓</span>
                <span>Specialiserade sidanalyser för olika delar av din webbshop</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Show subscription plans for all users */}
      <SubscriptionPlans />

      {/* Show button to go to AI tools for paid users */}
      {user && (subscription === "basic" || subscription === "pro") && (
        <div className="mt-12 text-center">
          <Button asChild size="lg">
            <Link to="/ai-tools" className="flex items-center">
              Gå till AI-verktygen <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default Upgrade;
