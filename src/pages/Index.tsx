
import { useState } from "react";
import { StoreCard } from "@/components/StoreCard";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Timer } from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";

export interface AnalysisResult {
  summary: string;
  observations: string[];
  recommendations: string;
}

interface Store {
  name?: string;
  revenue?: number;
  revenueChange?: number;
  products?: number;
  averagePrice?: number;
  priceChange?: number;
  designScore?: {
    usability: number;
    aesthetics: number;
    performance: number;
  };
  url?: string;
  analysis?: {
    seo_analysis?: AnalysisResult;
    ux_analysis?: AnalysisResult;
    content_analysis?: AnalysisResult;
  };
}

// Function to properly format URL input
function formatUrl(url: string): string {
  // Remove any leading/trailing whitespace
  let formattedUrl = url.trim();
  
  // If URL doesn't start with http:// or https://, add https://
  if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
    formattedUrl = 'https://' + formattedUrl;
  }
  
  return formattedUrl;
}

const Index = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const [analysisCount, setAnalysisCount] = useState(0);
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const [analysisStartTime, setAnalysisStartTime] = useState<number | null>(null);
  const [analysisPhase, setAnalysisPhase] = useState<string>("");

  const analyzeStore = async (url: string) => {
    // Start timing
    const startTime = performance.now();
    setAnalysisStartTime(startTime);
    setIsAnalyzing(true);
    setAnalysisPhase("Förbereder analys...");
    
    console.time("totalAnalysisTime");
    
    try {
      // Format the URL to ensure proper structure
      const formattedUrl = formatUrl(url);
      
      try {
        new URL(formattedUrl);
      } catch {
        throw new Error("Ogiltig URL. Vänligen ange en komplett URL (t.ex. example.com)");
      }

      console.log("Skickar förfrågan till backend med URL:", formattedUrl);
      setAnalysisPhase("Skrapar webbsida...");
      
      const response = await fetch("http://localhost:8000/get_suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: "Analysera butiken",
          url: formattedUrl,
          analysis_type: null,       // eller undefined om du föredrar
          is_competitor: false
        }),
      });
      
      setAnalysisPhase("Analyserar data...");
      
      console.log("Svarsstatus:", response.status);
      
      const headers = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      console.log("Response headers:", headers);

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

      setAnalysisPhase("Bearbetar resultat...");
      
      const responseText = await response.text();
      console.log("Raw response:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Kunde inte parsa JSON-svar:", e);
        throw new Error("Ogiltigt svar från servern");
      }

      console.log("Parsad API-respons:", data);

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

      console.log("Skapar ny butik:", newStore);

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

  const emptySlots = Array(Math.max(0, 3 - stores.length))
    .fill(null)
    .map((_, index) => ({ id: `empty-${index}` }));

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="container py-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            E-handelsanalys Dashboard
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Analysera och optimera din e-handelsbutik med AI-driven insikt
          </p>
        </header>

        {isAnalyzing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl flex flex-col items-center space-y-4">
              <div className="relative mb-2">
                <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-6 h-6 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-emerald-600 rounded-full"></div>
                  </div>
                </div>
              </div>
              <p className="text-lg font-medium">{analysisPhase || "Analyserar butiken..."}</p>
              
              {analysisStartTime && (
                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  <Timer className="h-4 w-4 mr-1" />
                  <span>
                    {((performance.now() - analysisStartTime) / 1000).toFixed(1)}s
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store, index) => (
            <StoreCard
              key={index}
              store={{
                ...store,
                analysis: store.analysis
              }}
              onAnalyze={analyzeStore}
            />
          ))}
          {emptySlots.map((slot) => (
            <StoreCard
              key={slot.id}
              store={{}}
              onAnalyze={analyzeStore}
              isEmpty={true}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
