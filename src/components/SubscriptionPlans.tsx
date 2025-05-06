
import { useAuth0 } from "@auth0/auth0-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Zap, Star, Check } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";

const SubscriptionPlans = () => {
  const { user } = useAuth0();
  const { subscription, trialDaysLeft, weeklyAnalysesLeft, loading, isAdmin } = useSubscription(user?.sub || "", user?.email || "");
  const { toast } = useToast();

  const handleSubscribe = async (selectedPlan: "basic" | "pro") => {
    try {
      if (!user) {
        toast({
          title: "Inloggning krävs",
          description: "Du måste vara inloggad för att prenumerera.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch("/api/create-checkout-session", {
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
      toast({
        title: "Något gick fel",
        description: "Kunde inte starta prenumeration.",
        variant: "destructive",
      });
    }
  };

  // Add admin indicator if user is admin
  const AdminBadge = isAdmin ? (
    <div className="mt-4 text-center">
      <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
        Administratör
      </span>
      <p className="text-xs text-gray-500 mt-1">Du har tillgång till alla funktioner</p>
    </div>
  ) : null;

  // ... keep existing code (rest of the component rendering cards, etc.)
  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-2">Välj din prenumerationsplan</h2>
        <p className="text-muted-foreground">
          {subscription === "free-trial" 
            ? `Du har ${trialDaysLeft} dagar kvar på din gratis provperiod med 3 analyser per dag.` 
            : "Välj den plan som passar dig bäst."}
        </p>
        {AdminBadge}
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Free Trial Plan */}
        <Card className={`border-2 ${subscription === "free-trial" ? "border-blue-400" : "border-transparent"}`}>
          <CardHeader>
            <div className="flex justify-between items-center mb-2">
              <Zap className="h-6 w-6 text-blue-500" />
              {subscription === "free-trial" && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Din plan
                </span>
              )}
            </div>
            <CardTitle>Gratis provperiod</CardTitle>
            <CardDescription>3 dagars gratis tillgång till AI-Analys</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold mb-4">0 kr</p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span>3 analyser per dag</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span>AI-Analys verktyget</span>
              </li>
              <li className="flex items-center text-gray-400">
                <span className="h-4 w-4 text-gray-300 mr-2">✗</span>
                <span>Konkurrentanalys</span>
              </li>
              <li className="flex items-center text-gray-400">
                <span className="h-4 w-4 text-gray-300 mr-2">✗</span>
                <span>Avancerad sidanalys</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {subscription === "free-trial" ? (
              <Button disabled className="w-full bg-gray-100 text-gray-500">
                Aktiv - {trialDaysLeft} dagar kvar
              </Button>
            ) : subscription === "free" ? (
              <Button disabled className="w-full bg-gray-100 text-gray-500">
                Provperiod använd
              </Button>
            ) : (
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Prova gratis i 3 dagar – inga kortuppgifter krävs!
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Basic Plan */}
        <Card className={`border-2 ${subscription === "basic" ? "border-indigo-500" : "border-transparent"}`}>
          <CardHeader>
            <div className="flex justify-between items-center mb-2">
              <Shield className="h-6 w-6 text-indigo-500" />
              {subscription === "basic" && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  Din plan
                </span>
              )}
            </div>
            <CardTitle>Start</CardTitle>
            <CardDescription>För de som precis börjat eller har små behov</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold mb-4">299 kr/mån</p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span>10 analyser i veckan</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span>AI-Analys verktyget</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span>Konkurrentanalys</span>
              </li>
              <li className="flex items-center text-gray-400">
                <span className="h-4 w-4 text-gray-300 mr-2">✗</span>
                <span>Avancerad sidanalys</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {subscription === "basic" ? (
              <Button disabled className="w-full bg-gray-100 text-gray-500">
                Din nuvarande plan
              </Button>
            ) : (
              <Button 
                onClick={() => handleSubscribe("basic")} 
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                {subscription === "free-trial" ? "Byt från gratis till Start – fortsätt analysera utan avbrott" : "Välj Start"}
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Pro Plan */}
        <Card className={`border-2 ${subscription === "pro" ? "border-purple-500" : "border-transparent"}`}>
          <CardHeader>
            <div className="flex justify-between items-center mb-2">
              <Star className="h-6 w-6 text-purple-500" />
              {subscription === "pro" && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Din plan
                </span>
              )}
            </div>
            <CardTitle>Pro</CardTitle>
            <CardDescription>För företag eller avancerade E-handlare</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold mb-4">699 kr/mån</p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span>Obegränsade analyser</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span>AI-Analys verktyget</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span>Konkurrentanalys</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span>Avancerad sidanalys</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {subscription === "pro" ? (
              <Button disabled className="w-full bg-gray-100 text-gray-500">
                Din nuvarande plan
              </Button>
            ) : (
              <Button 
                onClick={() => handleSubscribe("pro")} 
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Skapa din egen konkurrensbevakning – i realtid
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionPlans;