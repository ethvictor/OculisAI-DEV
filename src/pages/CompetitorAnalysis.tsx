import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { CompetitorCard } from "@/components/CompetitorCard";
import { useToast } from "@/hooks/use-toast";
import { StoreMetrics } from "@/pages/types";

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

    setIsAnalyzing(true);
    try {
      console.log("Skickar förfrågan om konkurrentanalys med URL:", formattedUrl);
      
      const response = await fetch("http://127.0.0.1:8000/get_suggestions", {
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
      
      toast({
        title: "Analys klar",
        description: "Konkurrenten har analyserats framgångsrikt",
      });
    } catch (error) {
      console.error("Fel vid analys av konkurrent:", error);
      toast({
        title: "Ett fel uppstod",
        description: error instanceof Error ? error.message : "Kunde inte analysera konkurrenten",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const emptySlots = Array(Math.max(0, 3 - competitors.length))
    .fill(null)
    .map((_, index) => ({ id: `empty-${index}` }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-900/20 dark:to-gray-950">
      <div className="container py-8">
        <header className="mb-8 text-center">
          <div className="inline-block mb-4 bg-indigo-100 dark:bg-indigo-900/30 px-4 py-1 rounded-full">
            <p className="text-indigo-800 dark:text-indigo-300 text-sm font-medium">Oculis AI</p>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Konkurrentanalys för <span className="text-indigo-600 dark:text-indigo-400">E-handelsbutiker</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Få en djupgående analys av dina konkurrenter med AI-drivna insikter
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6 max-w-2xl mx-auto">
            <Input
              type="text"
              placeholder="Ange konkurrentens URL (t.ex. example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleAnalyzeCompetitor}
              disabled={isAnalyzing}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700"
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
        </header>

        {isAnalyzing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-6 h-6 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-indigo-600 rounded-full"></div>
                  </div>
                </div>
              </div>
              <p className="text-lg font-medium">Analyserar konkurrenten...</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

