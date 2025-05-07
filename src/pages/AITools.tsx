
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, ArrowRight, Sparkles, AlertCircle, Timer } from "lucide-react";
import { StoreCard } from "@/components/StoreCard";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth0 } from "@auth0/auth0-react";
import { useSubscription } from "@/hooks/useSubscription";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { BACKEND_URL } from "@/utils/api";

export interface AnalysisResult {
  summary: string;
  observations: string[];
  recommendations: string;
}

interface Store {
  name?: string;
  url?: string;
  analysis?: {
    seo_analysis?: AnalysisResult;
    ux_analysis?: AnalysisResult;
    content_analysis?: AnalysisResult;
  };
  designScore?: {
    usability: number;
    aesthetics: number;
    performance: number;
  };
}

function formatUrl(url: string): string {
  let formattedUrl = url.trim();
  
  if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
    formattedUrl = 'https://' + formattedUrl;
  }
  
  return formattedUrl;
}

const AITools = () => {
  const [searchParams] = useSearchParams();
  const initialUrl = searchParams.get("url") || "";
  
  const [url, setUrl] = useState(initialUrl);
  const [stores, setStores] = useState<Store[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [usageRemaining, setUsageRemaining] = useState<number | null>(null);
  const { toast } = useToast();
  const { user } = useAuth0();
  const { subscription, weeklyAnalysesLeft } = useSubscription(user?.sub || "", user?.email || "");
  const [analysisStartTime, setAnalysisStartTime] = useState<number | null>(null);
  const [analysisPhase, setAnalysisPhase] = useState<string>("");
  
  // Check remaining usage for free trial users or basic plan users
  useEffect(() => {
    const checkRemainingUsage = async () => {
      if (!user || (subscription !== "free-trial" && subscription !== "basic")) return;
      
      try {
        const response = await fetch(`${BACKEND_URL}/check-usage`, {
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
      } catch (error) {
        console.error("Error checking usage:", error);
      }
    };

    checkRemainingUsage();
  }, [user, subscription]);

  useEffect(() => {
    if (initialUrl) {
      handleAnalyzeStore();
    }
  }, []);

  const trackAnalysisUsage = async () => {
    if (!user || (subscription !== "free-trial" && subscription !== "basic")) return true;
    
    try {
      const response = await fetch(`${BACKEND_URL}/track-analysis`, {
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
        const errorData = await response.json();
        const limitType = subscription === "free-trial" ? "Daglig" : "Veckovis";
        toast({
          title: `${limitType} gräns uppnådd`,
          description: errorData.detail || `Du har använt alla dina analyser för ${subscription === "free-trial" ? "idag" : "denna vecka"}`,
          variant: "destructive",
        });
        return false;
      }

      const data = await response.json();
      if (!data.unlimited) {
        setUsageRemaining(data.remaining_analyses);
      }
      return true;
    } catch (error) {
      console.error("Error tracking analysis usage:", error);
      return false;
    }
  };

  const handleAnalyzeStore = async () => {
    if (!url) {
      toast({
        title: "URL krävs",
        description: "Vänligen ange en URL till butiken",
        variant: "destructive",
      });
      return;
    }

    const formattedUrl = formatUrl(url);

    try {
      new URL(formattedUrl);
    } catch (error) {
      toast({
        title: "Ogiltig URL",
        description: "Vänligen ange en giltig domän (t.ex. example.com)",
        variant: "destructive",
      });
      return;
    }

    // For free trial or basic users, track usage
    if (subscription === "free-trial" || subscription === "basic") {
      const canProceed = await trackAnalysisUsage();
      if (!canProceed) return;
    }

    // Start timing
    const startTime = performance.now();
    setAnalysisStartTime(startTime);
    setIsAnalyzing(true);
    setAnalysisPhase("Förbereder analys...");
    
    console.time("totalAnalysisTime");
    console.log(`🕒 ${new Date().toISOString()} - Påbörjar analys av URL: ${formattedUrl}`);
    
    try {
      console.log("Skickar förfrågan till backend med URL:", formattedUrl);
      setAnalysisPhase("Skrapar webbsida...");
      
      const response = await fetch(`${BACKEND_URL}/get_suggestions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: "Analysera med valt verktyg",
          url: formattedUrl,
          is_competitor: false,
          analysis_type: "", // Tom sträng för nu – backend hanterar detta
        }),
      });
      
      setAnalysisPhase("Bearbetar data...");
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch (e) {
          console.error("Kunde inte parsa felsvar:", e);
        }
        throw new Error(errorMessage);
      }

      setAnalysisPhase("Genererar insikter...");
      
      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Kunde inte parsa JSON-svar:", e);
        throw new Error("Ogiltigt svar från servern");
      }

      const urlObj = new URL(formattedUrl);
      const domainName = urlObj.hostname.replace('www.', '');

      const newStore = {
        name: domainName,
        url: formattedUrl,
        analysis: {
          seo_analysis: data.seo_analysis || {
            summary: "Ingen SEO-analys tillgänglig",
            observations: [],
            recommendations: ""
          },
          ux_analysis: data.ux_analysis || {
            summary: "Ingen UX-analys tillgänglig",
            observations: [],
            recommendations: ""
          },
          content_analysis: data.content_analysis || {
            summary: "Ingen innehållsanalys tillgänglig",
            observations: [],
            recommendations: ""
          },
        },
        designScore: data.designScore || { usability: 0, aesthetics: 0, performance: 0 },
        recommendations_summary: data.recommendations_summary // om du använder denna del
      };

      console.log("Nytt store-objekt:", newStore);

      setStores(prev => [...prev, newStore]);
      
      // Log timing
      console.timeEnd("totalAnalysisTime");
      const endTime = performance.now();
      const totalTime = (endTime - startTime) / 1000;
      console.log(`✅ Analys slutförd efter ${totalTime.toFixed(2)}s`);
      
      toast({
        title: "Analys klar",
        description: "Butiken har analyserats framgångsrikt",
      });
    } catch (error) {
      const endTime = performance.now();
      const totalTime = (endTime - startTime) / 1000;
      
      console.error("Fel vid analys av butik:", error);
      console.log(`❌ Analys misslyckades efter ${totalTime.toFixed(2)}s`);
      
      toast({
        title: "Ett fel uppstod",
        description: error instanceof Error ? error.message : "Kunde inte analysera butiken",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setAnalysisPhase("");
      setAnalysisStartTime(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-950">
      <div className="container py-12">
        <header className="mb-12 text-center">
          <div className="inline-block mb-4 bg-blue-100 dark:bg-blue-900/30 px-4 py-1 rounded-full">
            <p className="text-blue-800 dark:text-blue-300 text-sm font-medium">Oculis AI</p>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Optimera din <span className="text-blue-600 dark:text-blue-400">E-handelsbutik</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Få en skräddarsydd analys och konkreta förbättringar med vår AI-drivna plattform
          </p>

          {subscription === "free-trial" && usageRemaining !== null && (
            <Alert className="max-w-lg mx-auto mt-6 bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Gratis provperiod</AlertTitle>
              <AlertDescription>
                Du har {usageRemaining} analyser kvar idag i din provperiod. 
                <a href="/upgrade" className="underline ml-1">Uppgradera för mer tillgång.</a>
              </AlertDescription>
            </Alert>
          )}

          {subscription === "basic" && usageRemaining !== null && (
            <Alert className="max-w-lg mx-auto mt-6 bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Start-plan</AlertTitle>
              <AlertDescription>
                Du har {usageRemaining} analyser kvar denna vecka med Start-planen. 
                <a href="/upgrade" className="underline ml-1">Uppgradera till Pro för obegränsade analyser.</a>
              </AlertDescription>
            </Alert>
          )}

          <Card className="mt-10 mx-auto max-w-3xl bg-white dark:bg-gray-800 border-0 shadow-lg overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-3">
                <div className="p-6 md:p-8 md:border-r border-gray-100 dark:border-gray-700">
                  <h3 className="font-semibold text-lg mb-2">1. Ange din webbadress</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Klistra in URL:en till din e-handelsbutik som du vill analysera
                  </p>
                  <Input
                    type="text"
                    placeholder="example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div className="p-6 md:p-8 md:border-r border-gray-100 dark:border-gray-700">
                  <h3 className="font-semibold text-lg mb-2">2. Få en AI-analys</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Vi analyserar din sida och skapar en komplett rapport
                  </p>
                  <div className="flex items-center justify-center h-10">
                    <ArrowRight className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
                
                <div className="p-6 md:p-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                  <h3 className="font-semibold text-lg mb-2">3. Optimera din butik</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Implementera våra förslag och öka din konvertering
                  </p>
                  <Button
                    onClick={handleAnalyzeStore}
                    disabled={isAnalyzing || 
                      (subscription === "free-trial" && usageRemaining !== null && usageRemaining <= 0) ||
                      (subscription === "basic" && usageRemaining !== null && usageRemaining <= 0)
                    }
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyserar...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Analysera min butik
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </header>

        {isAnalyzing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl flex flex-col items-center space-y-4">
              <div className="relative mb-2">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-600 w-6 h-6" />
              </div>
              <h3 className="text-xl font-medium mb-1">{analysisPhase || "Analyserar din butik"}</h3>
              <p className="text-gray-500 text-center max-w-sm">
                Vår AI genomsöker din webbplats efter förbättringsmöjligheter...
              </p>
              
              {analysisStartTime && (
                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-2">
                  <Timer className="h-4 w-4 mr-1" />
                  <span>
                    {((performance.now() - analysisStartTime) / 1000).toFixed(1)}s
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stores.length > 0 ? (
              stores.map((store, index) => (
                <StoreCard
                  key={index}
                  store={store}
                  onAnalyze={handleAnalyzeStore}
                />
              ))
            ) : (
              <>
                {!isAnalyzing && (
                  <div className="lg:col-span-3 text-center py-16">
                    <div className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-8 max-w-2xl mx-auto">
                      <Sparkles className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                      <h3 className="text-xl font-medium mb-2">Inga butiker analyserade ännu</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Ange webbadressen till din e-handelsbutik och klicka på "Analysera min butik" för att börja.
                      </p>
                      <div className="flex justify-center">
                        <Button 
                          variant="outline"
                          onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
                          className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400"
                        >
                          Börja analysera
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-lg mb-2">SEO-optimering</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Få synpunkter på hur din e-handelsbutik kan förbättras för sökmotorer och nå fler kunder.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Användarvänlighet</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Identifiera potentiella hinder i kundresan och skapa en bättre köpupplevelse.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
              <ArrowRight className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Konverteringsoptimering</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Konkreta tips för att öka konverteringsgraden och få fler besökare att bli betalande kunder.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITools;
