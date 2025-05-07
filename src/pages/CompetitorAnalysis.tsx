import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { CompetitorCard } from "@/components/CompetitorCard";
import { useToast } from "@/hooks/use-toast";
import { StoreMetrics } from "@/pages/types";
import { BACKEND_URL } from "@/utils/api";
import { LoadingAnimation } from "@/components/LoadingAnimation";

function formatUrl(url: string): string {
  let formattedUrl = url.trim();
  
  if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
    formattedUrl = 'https://' + formattedUrl;
  }
  
  return formattedUrl;
}

const CompetitorAnalysis = () => {
  const [url, setUrl] = useState("");
  const [competitors, setCompetitors] = useState<StoreMetrics[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStartTime, setAnalysisStartTime] = useState<number | null>(null);
  const [analysisPhase, setAnalysisPhase] = useState<string>("");
  const { toast } = useToast();

  const handleAnalyzeCompetitor = async () => {
    if (!url) {
      toast({
        title: "URL krävs",
        description: "Vänligen ange en URL till konkurrentens butik",
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

    // Start timing
    const startTime = performance.now();
    setAnalysisStartTime(startTime);
    
    setIsAnalyzing(true);
    setAnalysisPhase("Förbereder konkurrentanalys...");
    
    console.time("totalAnalysisTime");
    console.log(`🕒 ${new Date().toISOString()} - Påbörjar analys av konkurrent: ${formattedUrl}`);
    
    try {
      console.log("Skickar förfrågan om konkurrentanalys med URL:", formattedUrl);
      
      setAnalysisPhase("Skrapar konkurrentens webbsida...");
      
      const response = await fetch(`${BACKEND_URL}/get_suggestions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: "Analysera konkurrenten",
          url: formattedUrl,
          is_competitor: true,
          analysis_type: ""  // viktigt att skicka med tom sträng om du inte använder det
        }),
      });
      
      setAnalysisPhase("Analyserar konkurrent...");
      
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

      setAnalysisPhase("Bearbetar analysresultat...");

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

      const newCompetitor = {
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
        strengths_summary: data.strengths_summary // summarizing strengths instead of recommendations
      };

      console.log("Ny konkurrent-objekt:", newCompetitor);

      setCompetitors(prev => [...prev, newCompetitor]);
      
      // Log timing
      console.timeEnd("totalAnalysisTime");
      const endTime = performance.now();
      const totalTime = (endTime - startTime) / 1000;
      console.log(`✅ Analys slutförd efter ${totalTime.toFixed(2)}s`);
      
      toast({
        title: "Analys klar",
        description: "Konkurrenten har analyserats framgångsrikt",
      });
    } catch (error) {
      const endTime = performance.now();
      const totalTime = (endTime - startTime) / 1000;
      
      console.error("Fel vid analys av konkurrent:", error);
      console.log(`❌ Analys misslyckades efter ${totalTime.toFixed(2)}s`);
      
      toast({
        title: "Ett fel uppstod",
        description: error instanceof Error ? error.message : "Kunde inte analysera konkurrenten",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setAnalysisPhase("");
      setAnalysisStartTime(null);
    }
  };

  const emptySlots = Array(Math.max(0, 3 - competitors.length))
    .fill(null)
    .map((_, index) => ({ id: `empty-${index}` }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/30 to-white">
      <div className="container py-8 px-4 sm:px-6">
        <div className="text-center mb-10">
          <div className="text-sm font-medium text-indigo-600 mb-2">Oculis AI</div>
          <h1 className="text-3xl font-bold mb-3">
            Konkurrentanalys för <span className="text-indigo-600">E-handelsbutiker</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Få en djupgående analys av dina konkurrenter med AI-drivna insikter
          </p>

          <div className="mt-8 max-w-2xl mx-auto bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="text"
                placeholder="Ange konkurrentens URL (t.ex. example.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 border-gray-200 focus-visible:ring-indigo-500"
              />
              <Button
                onClick={handleAnalyzeCompetitor}
                disabled={isAnalyzing}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyserar...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Analysera konkurrent
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <LoadingAnimation 
          isVisible={isAnalyzing} 
          phase={analysisPhase} 
          startTime={analysisStartTime} 
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {competitors.map((competitor, index) => (
            <CompetitorCard
              key={index}
              store={competitor}
              onAnalyze={handleAnalyzeCompetitor}
            />
          ))}
          {emptySlots.map((slot) => (
            <CompetitorCard
              key={slot.id}
              store={{}}
              onAnalyze={handleAnalyzeCompetitor}
              isEmpty={true}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompetitorAnalysis;
