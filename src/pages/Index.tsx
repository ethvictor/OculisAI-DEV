
import { useState } from "react";
import { StoreMetricsCard } from "@/components/StoreMetricsCard";
import { StoreMetricsDialog } from "@/components/StoreMetricsDialog"; 
import { useToast } from "@/hooks/use-toast";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface AnalysisResult {
  summary: string;
  observations: string[];
  recommendations: string;
}

interface Store {
  id?: string;
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
  const [analysisStartTime, setAnalysisStartTime] = useState<number | null>(null);
  const [analysisPhase, setAnalysisPhase] = useState<string>("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  const analyzeStore = async (url: string) => {
    // Start timing
    const startTime = performance.now();
    setAnalysisStartTime(startTime);
    setIsAnalyzing(true);
    setAnalysisPhase("Förbereder analys...");
    setShowAddDialog(false);
    
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
          analysis_type: null,
          is_competitor: false
        }),
      });
      
      setAnalysisPhase("Analyserar data...");
      
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
        id: `store-${Date.now()}`,
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
        recommendations_summary: data.recommendations_summary
      };

      setStores(prev => [...prev, newStore]);
      
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
      setNewUrl("");
    }
  };

  const handleCardClick = (store: Store) => {
    setSelectedStore(store);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-gray-950">
      <div className="container py-12">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-[#1d1d1f] dark:text-white mb-3">
            E-handelsanalys
          </h1>
          <p className="text-lg text-[#6e6e73] dark:text-gray-400 max-w-2xl mx-auto">
            Analysera och optimera din e-handelsbutik med AI-driven insikt
          </p>
        </header>

        <LoadingAnimation 
          isVisible={isAnalyzing} 
          phase={analysisPhase} 
          startTime={analysisStartTime} 
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Add Store Card */}
          <Card 
            className="overflow-hidden backdrop-blur-xl bg-white/80 border border-[#e8e8ed] rounded-2xl p-6 min-h-[240px] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-lg group"
            onClick={() => setShowAddDialog(true)}
          >
            <div className="w-16 h-16 rounded-full bg-[#f5f5f7] flex items-center justify-center mb-4 transition-transform group-hover:scale-110 group-hover:bg-[#e8e8ed]">
              <Plus className="w-8 h-8 text-[#0066cc]" />
            </div>
            <p className="text-[#6e6e73] font-medium">Lägg till ny butik för analys</p>
          </Card>
          
          {/* Store Cards */}
          {stores.map((store) => (
            <StoreMetricsCard 
              key={store.id || store.url}
              name={store.name || "Unknown"}
              url={store.url || ""}
              metrics={{
                seo: store.designScore?.performance ? Math.round(store.designScore.performance * 100) : 0,
                usability: store.designScore?.usability ? Math.round(store.designScore.usability * 100) : 0,
                aesthetics: store.designScore?.aesthetics ? Math.round(store.designScore.aesthetics * 100) : 0
              }}
              onClick={() => handleCardClick(store)}
            />
          ))}
        </div>

        {/* Add Store Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-[#1d1d1f]">Analysera ny butik</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <Input
                placeholder="Ange butikens URL (t.ex. example.com)"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="rounded-xl border-[#e8e8ed]"
              />
              <Button 
                onClick={() => analyzeStore(newUrl)}
                disabled={isAnalyzing || !newUrl.trim()}
                className="w-full rounded-full bg-[#0066cc] hover:bg-[#0055b3]"
              >
                Analysera butik
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Store Details Dialog */}
        {selectedStore && (
          <StoreMetricsDialog 
            store={{
              name: selectedStore.name || "",
              url: selectedStore.url || "",
              metrics: {
                seo: selectedStore.designScore?.performance ? Math.round(selectedStore.designScore.performance * 100) : 0,
                usability: selectedStore.designScore?.usability ? Math.round(selectedStore.designScore.usability * 100) : 0,
                aesthetics: selectedStore.designScore?.aesthetics ? Math.round(selectedStore.designScore.aesthetics * 100) : 0,
                visitorsPerMonth: null,
                products: selectedStore.products,
                revenue: selectedStore.revenue,
                averagePrice: selectedStore.averagePrice
              },
              analysis: selectedStore.analysis
            }}
            open={!!selectedStore}
            onOpenChange={(open) => {
              if (!open) setSelectedStore(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
