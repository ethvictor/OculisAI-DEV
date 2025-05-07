import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { StoreMetrics } from "@/pages/types"; // Import from the centralized types file
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { AnalysisResult } from "@/pages/types"; // Import AnalysisResult type
import { LoadingAnimation } from "@/components/LoadingAnimation";

interface StoreComparisonProps {
  searchQuery: string;
  store: StoreMetrics;
}

interface AnalysisData {
  seo_analysis: string | AnalysisResult;
  ux_analysis: string | AnalysisResult;
  content_analysis: string | AnalysisResult;
  designScore: { 
      usability: number; 
      aesthetics: number; 
      performance: number; 
  };
}

const StoreComparison: React.FC<StoreComparisonProps> = ({ searchQuery, store }) => {
  const [storeUrl, setStoreUrl] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  
  useEffect(() => {
    console.log("🔄 State har uppdaterats! Ny analysis:", analysis);
  }, [analysis]);

  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [analysisStartTime, setAnalysisStartTime] = useState<number | null>(null);
  const [analysisPhase, setAnalysisPhase] = useState<string>("");
  const { toast } = useToast();

  // Function to format URL input
  function formatUrl(url: string): string {
    // Remove any leading/trailing whitespace
    let formattedUrl = url.trim();
    
    // If URL doesn't start with http:// or https://, add https://
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }
    
    return formattedUrl;
  }

  const analyzeStore = async () => {
    if (!storeUrl) {
      toast({
        title: "URL krävs",
        description: "Vänligen ange en URL till butiken",
        variant: "destructive",
      });
      return;
    }

    // Format the URL properly
    const formattedUrl = formatUrl(storeUrl);

    try {
      new URL(formattedUrl);
    } catch {
      toast({
        title: "Ogiltig URL",
        description: "Vänligen ange en giltig URL (t.ex. example.com)",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setAnalysis(null);
    const startTime = performance.now();
    setAnalysisStartTime(startTime);
    setAnalysisPhase("Skrapar webbsida...");
    
    try {
      console.log("Skickar analys-förfrågan för URL:", formattedUrl);
      
      const response = await fetch("http://127.0.0.1:8000/get_suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: "Analysera butiken",
          url: formattedUrl, 
        }),
      });

      console.log("Mottog svar med status:", response.status);
      const data = await response.json();
      if (!response.ok) {
        console.log("Mottagen API-data:", JSON.stringify(data, null, 2)); // Viktig logg!
        throw new Error(data.detail || "Ett fel uppstod vid analys av butiken");
      }

      console.log("Mottog analysdata:", data);
      
      if (data.success) {
        setAnalysis({
          seo_analysis: data.seo_analysis || "Ingen SEO-analys tillgänglig",
          ux_analysis: data.ux_analysis || "Ingen UX-analys tillgänglig",
          content_analysis: data.content_analysis || "Ingen innehållsanalys tillgänglig",
          designScore: data.designScore || { usability: 0, aesthetics: 0, performance: 0 }
        });
      
        console.log("✅ Uppdaterad analys i state:", {
          seo_analysis: data.seo_analysis,
          ux_analysis: data.ux_analysis,
          content_analysis: data.content_analysis,
          designScore: data.designScore
        });
        
        setDialogOpen(true);
        toast({
          title: "Analys klar",
          description: "Butiken har analyserats framgångsrikt",
        });
      } else {
        throw new Error(data.error || "Något gick fel");
      }
    } catch (error) {
      console.error("Error analyzing store:", error);
      toast({
        title: "Ett fel uppstod",
        description: error instanceof Error ? error.message : "Kunde inte analysera butiken",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setAnalysisPhase("");
      setAnalysisStartTime(null);
    }
  };

  // Helper function to safely render analysis content
  const renderAnalysisContent = (content: string | AnalysisResult | undefined): React.ReactNode => {
    if (!content) return "Ingen analys tillgänglig";
    
    if (typeof content === 'string') {
      return content;
    }
    
    // If it's an AnalysisResult object, extract and format the content
    return (
      <div>
        <p className="font-medium">{content.summary}</p>
        {content.observations && content.observations.length > 0 && (
          <ul className="mt-2 list-disc list-inside">
            {content.observations.map((obs, index) => (
              <li key={index}>{obs}</li>
            ))}
          </ul>
        )}
        {content.recommendations && (
          <div className="mt-2">
            <p className="font-medium">Rekommendationer:</p>
            <p>{content.recommendations}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Lägg till butik för analys</h2>
        <div className="flex gap-4 mb-4">
          <Input
            placeholder="Ange butikens URL"
            value={storeUrl}
            onChange={(e) => setStoreUrl(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={analyzeStore}
            disabled={loading}
            className="relative min-w-[150px]"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>Analyserar...</span>
              </div>
            ) : (
              "Analysera butik"
            )}
          </Button>
        </div>

        <LoadingAnimation
          isVisible={loading}
          phase={analysisPhase}
          startTime={analysisStartTime}
        />

        {analysis && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                Visa fullständig analys
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Butiksanalys</DialogTitle>
                <DialogDescription>
                  Analys av {storeUrl}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold">SEO-Analys</h3>
                  <div className="mt-2">
                    {renderAnalysisContent(store.analysis?.seo_analysis)}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold">UX-Analys</h3>
                  <div className="mt-2">
                    {renderAnalysisContent(store.analysis?.ux_analysis)}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold">Innehållsanalys</h3>
                  <div className="mt-2">
                    {renderAnalysisContent(store.analysis?.content_analysis)}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </Card>
    </div>
  );
};

export default StoreComparison;
