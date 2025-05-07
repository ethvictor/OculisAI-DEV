
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, ArrowRight, Sparkles, AlertCircle, BarChart3, LayoutGrid, Zap } from "lucide-react";
import { StoreCard } from "@/components/StoreCard";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth0 } from "@auth0/auth0-react";
import { useSubscription } from "@/hooks/useSubscription";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { BACKEND_URL } from "@/utils/api";
import { LoadingAnimation } from "@/components/LoadingAnimation";

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
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <div className="container px-4 py-16 mx-auto">
        <header className="mb-16 text-center">
          {/* Top Badge */}
          <div className="inline-block mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-4 py-1.5 rounded-full">
            <p className="text-blue-800 dark:text-blue-300 text-sm font-medium">Oculis AI</p>
          </div>
          
          {/* Main Heading */}
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-4 fade-in-1">
            Optimera din <span className="oculis-gradient-text">E-handelsbutik</span>
          </h1>
          
          {/* Subheading */}
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8 fade-in-2">
            Få en skräddarsydd analys och konkreta förbättringar med vår AI-drivna plattform
          </p>

          {/* Subscription Alerts */}
          {subscription === "free-trial" && usageRemaining !== null && (
            <Alert className="max-w-lg mx-auto mb-8 bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300 glass-effect">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Gratis provperiod</AlertTitle>
              <AlertDescription>
                Du har {usageRemaining} analyser kvar idag i din provperiod. 
                <a href="/upgrade" className="underline ml-1 font-medium">Uppgradera för mer tillgång.</a>
              </AlertDescription>
            </Alert>
          )}

          {subscription === "basic" && usageRemaining !== null && (
            <Alert className="max-w-lg mx-auto mb-8 bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300 glass-effect">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Start-plan</AlertTitle>
              <AlertDescription>
                Du har {usageRemaining} analyser kvar denna vecka med Start-planen. 
                <a href="/upgrade" className="underline ml-1 font-medium">Uppgradera till Pro för obegränsade analyser.</a>
              </AlertDescription>
            </Alert>
          )}

          {/* Main Analysis Card */}
          <Card className="mt-10 mx-auto max-w-4xl apple-card bg-white/90 dark:bg-gray-800/80 border-0 shadow-xl overflow-hidden fade-in-3">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 to-blue-50/30 dark:from-purple-900/10 dark:to-blue-900/10 z-0"></div>
            <CardContent className="p-0 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-3">
                <div className="p-8 md:border-r border-gray-100 dark:border-gray-700/30">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-4">
                    <span className="font-bold text-blue-700 dark:text-blue-400">1</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-3">Ange din webbadress</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                    Klistra in URL:en till din e-handelsbutik som du vill analysera
                  </p>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="example.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full bg-white dark:bg-gray-900 pr-10 border-gray-200 dark:border-gray-700"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Search className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
                
                <div className="p-8 md:border-r border-gray-100 dark:border-gray-700/30">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-4">
                    <span className="font-bold text-blue-700 dark:text-blue-400">2</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-3">Få en AI-analys</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                    Vi analyserar din sida och skapar en komplett rapport med förbättringsförslag
                  </p>
                  <div className="flex items-center justify-center h-10">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-200 dark:bg-blue-700 rounded-full blur-sm opacity-30 animate-pulse"></div>
                      <ArrowRight className="w-6 h-6 text-blue-500 dark:text-blue-400 relative z-10" />
                    </div>
                  </div>
                </div>
                
                <div className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-4">
                    <span className="font-bold text-blue-700 dark:text-blue-400">3</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-3">Optimera din butik</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                    Implementera våra förslag för att öka din konverteringsgrad
                  </p>
                  <Button
                    onClick={handleAnalyzeStore}
                    disabled={isAnalyzing || 
                      (subscription === "free-trial" && usageRemaining !== null && usageRemaining <= 0) ||
                      (subscription === "basic" && usageRemaining !== null && usageRemaining <= 0)
                    }
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all"
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

        <LoadingAnimation 
          isVisible={isAnalyzing} 
          phase={analysisPhase} 
          startTime={analysisStartTime} 
        />

        {/* Analysis Results Section */}
        <div className="mt-16">
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
                    <div className="bg-gradient-to-b from-blue-50 to-white dark:from-blue-900/10 dark:to-gray-900/80 rounded-3xl p-12 max-w-2xl mx-auto glass-effect border border-white/20 dark:border-white/5 shadow-lg">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-medium mb-3">Inga butiker analyserade ännu</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                        Ange webbadressen till din e-handelsbutik och klicka på "Analysera min butik" för att börja.
                      </p>
                      <div className="flex justify-center">
                        <Button 
                          variant="outline"
                          onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
                          className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 px-6 py-2"
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

        {/* Features Section */}
        <div className="mt-24 mb-16">
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-12">Vad vi analyserar</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center text-center p-6 apple-card bg-white/90 dark:bg-gray-800/80 hover-lift">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 flex items-center justify-center mb-5 shadow-md">
                <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-xl mb-3">SEO-optimering</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Få synpunkter på hur din e-handelsbutik kan förbättras för sökmotorer och nå fler potentiella kunder.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 apple-card bg-white/90 dark:bg-gray-800/80 hover-lift">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 flex items-center justify-center mb-5 shadow-md">
                <LayoutGrid className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-xl mb-3">Användarvänlighet</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Identifiera potentiella hinder i kundresan och skapa en bättre och smidigare köpupplevelse.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 apple-card bg-white/90 dark:bg-gray-800/80 hover-lift">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 flex items-center justify-center mb-5 shadow-md">
                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-xl mb-3">Konverteringsoptimering</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Konkreta tips för att öka konverteringsgraden och få fler besökare att bli betalande kunder.
              </p>
            </div>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="mt-16 mb-8 text-center max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">Redo att optimera din e-handelsbutik?</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Vår AI-teknik analyserar din butik och ger dig konkreta förbättringsförslag som kommer att öka din försäljning och kundnöjdhet.
          </p>
          <Button 
            onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl"
          >
            <Zap className="mr-2 h-5 w-5" />
            Starta din analys nu
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AITools;
