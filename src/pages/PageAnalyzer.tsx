
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader2, Search, Layout, ShoppingBag, Shield, Briefcase, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  StoreMetrics, 
  AnalysisTypeOption,
  LandingPageAnalysis,
  ProductPageAnalysis,
  TrustCheckAnalysis,
  BrandAnalysis,
  MobileExperienceAnalysis
} from "./types";
import { SpecializedAnalysisResult } from "@/components/SpecializedAnalysisResult";


function formatUrl(url: string): string {
  let formattedUrl = url.trim();
  
  if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
    formattedUrl = 'https://' + formattedUrl;
  }
  
  return formattedUrl;
}

const analysisTypes: AnalysisTypeOption[] = [
  {
    value: "landing_page",
    label: "Landningssida",
    description: "Analysera effektivitet och konverteringsoptimering för landningssidor",
    icon: Layout
  },
  {
    value: "product_page",
    label: "Produktsida",
    description: "Analysera produktsidor för e-handel och konverteringsoptimering",
    icon: ShoppingBag
  },
  {
    value: "trust_check",
    label: "Pålitlighetsanalys",
    description: "Bedöm webbplatsens trovärdighet och förtroendeingivande signaler",
    icon: Shield
  },
  {
    value: "brand_analysis",
    label: "Varumärkesanalys",
    description: "Analysera varumärkespresentation och kommunikation",
    icon: Briefcase
  },
  {
    value: "mobile_experience",
    label: "Mobilupplevelse",
    description: "Bedöm webbplatsens mobilanpassning och användarvänlighet",
    icon: Smartphone
  }
];

const PageAnalyzer = () => {
  const [url, setUrl] = useState("");
  const [analysisType, setAnalysisType] = useState<string>("landing_page");
  const [analysisResult, setAnalysisResult] = useState<StoreMetrics | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  
  const handleAnalyze = async () => {
    if (!url) {
      toast({
        title: "URL krävs",
        description: "Vänligen ange en URL att analysera",
        variant: "destructive",
      });
      return;
    }

    const formattedUrl = formatUrl(url);

    try {
      // Validera URL-format
      new URL(formattedUrl);
    } catch (error) {
      toast({
        title: "Ogiltig URL",
        description: "Vänligen ange en giltig URL (t.ex. https://example.com)",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      console.log("Skickar förfrågan till backend med URL:", formattedUrl);
      console.log("Analystyp:", analysisType);
      
      const response = await fetch("http://127.0.0.1:8000/get_suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: "Standardanalys",
          url: formattedUrl,
          analysis_type: analysisType,
          is_competitor: false
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

      const data = await response.json();
      console.log("Analyssvar:", data);

      const urlObj = new URL(formattedUrl);
      const domainName = urlObj.hostname.replace('www.', '');

      const result: StoreMetrics = {
        name: domainName,
        url: formattedUrl,
        analysis_type: analysisType,
        specialized_analysis: data.specialized_analysis,
        designScore: data.designScore || { usability: 0.5, aesthetics: 0.5, performance: 0.5 },
        visitorsPerMonth: data.visitors_per_month
      };

      setAnalysisResult(result);
      
      toast({
        title: "Analys klar",
        description: "Sidan har analyserats framgångsrikt",
      });
    } catch (error) {
      console.error("Fel vid analys:", error);
      toast({
        title: "Ett fel uppstod",
        description: error instanceof Error ? error.message : "Kunde inte analysera sidan",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const currentAnalysisType = analysisTypes.find(type => type.value === analysisType);
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="container py-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Specialiserad sidanalys
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Djupgående analys av specifika sidtyper med AI-drivna insikter
          </p>

          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col gap-4 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
              <div>
                <label htmlFor="url-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Webbadress
                </label>
                <Input
                  id="url-input"
                  type="text"
                  placeholder="Ange URL (t.ex. example.com)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div>
                <label htmlFor="analysis-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Analystyp
                </label>
                <Select 
                  value={analysisType} 
                  onValueChange={setAnalysisType}
                >
                  <SelectTrigger id="analysis-type" className="w-full">
                    <SelectValue placeholder="Välj analystyp" />
                  </SelectTrigger>
                  <SelectContent>
                    {analysisTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="flex items-center">
                        <div className="flex items-center">
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {currentAnalysisType && (
                  <div className="mt-2 flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <currentAnalysisType.icon className="h-5 w-5 shrink-0 mt-0.5" />
                    <p>{currentAnalysisType.description}</p>
                  </div>
                )}
              </div>
              
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="mt-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyserar...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Analysera sida
                  </>
                )}
              </Button>
            </div>
          </div>
        </header>

        {isAnalyzing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl flex items-center space-x-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-lg font-medium">Analyserar sidan...</p>
            </div>
          </div>
        )}

        {analysisResult && (
          <div className="mt-8">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold">{analysisResult.name}</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        <a href={analysisResult.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {analysisResult.url}
                        </a>
                      </p>
                    </div>
                    {currentAnalysisType && (
                      <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1 rounded-full">
                        <currentAnalysisType.icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{currentAnalysisType.label}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {analysisResult.specialized_analysis && (
                  <SpecializedAnalysisResult 
                    analysisType={analysisResult.analysis_type || ""}
                    specializedAnalysis={analysisResult.specialized_analysis} 
                    designScore={analysisResult.designScore}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        )}
        
        <div className="mt-16">
          <h2 className="text-xl font-bold text-center mb-6">Välj rätt analystyp för din sida</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {analysisTypes.map((type) => (
              <Card 
                key={type.value} 
                className={`cursor-pointer hover:shadow-md transition-shadow ${analysisType === type.value ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setAnalysisType(type.value)}
              >
                <CardContent className="p-4 text-center">
                  <div className="flex justify-center mb-4 mt-2">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <type.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <h3 className="font-medium mb-1">{type.label}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{type.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageAnalyzer;
