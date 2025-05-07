
import { useState, useEffect } from "react";
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
import { Loader2, Search, Layout, ShoppingBag, Shield, Briefcase, Smartphone, LineChart } from "lucide-react";
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
import { BACKEND_URL } from "@/utils/api";
import { LoadingAnimation } from "@/components/LoadingAnimation";

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

// Interface för prestandamätning
interface PerformanceMetrics {
  scrape_time: number;
  openai_analysis_time: number;
  design_analysis_time?: number;
  recommendations_time?: number;
  json_parse_time?: number;
  visitor_lookup_time?: number;
  total_processing_time: number;
  [key: string]: number | undefined;
}

const formatTimeDuration = (seconds: number | undefined): string => {
  if (seconds === undefined) return "N/A";
  return `${seconds.toFixed(2)}s`;
};

const PageAnalyzer = () => {
  const [url, setUrl] = useState("");
  const [analysisType, setAnalysisType] = useState<string>("landing_page");
  const [analysisResult, setAnalysisResult] = useState<StoreMetrics | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStartTime, setAnalysisStartTime] = useState<number | null>(null);
  const [analysisTiming, setAnalysisTiming] = useState({
    frontendStart: 0,
    requestSent: 0,
    responseReceived: 0,
    processingCompleted: 0
  });
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [analysisPhase, setAnalysisPhase] = useState<string>("");
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

    // Starta tidtagning
    const startTime = performance.now();
    setAnalysisStartTime(startTime);
    setAnalysisTiming({
      frontendStart: startTime,
      requestSent: 0,
      responseReceived: 0,
      processingCompleted: 0
    });
    setPerformanceMetrics(null);
    
    setIsAnalyzing(true);
    setAnalysisPhase("Förbereder analys...");
    
    console.time("totalAnalysisTime");
    console.log(`🕒 ${new Date().toISOString()} - Påbörjar analys av URL: ${formattedUrl}`);
    
    try {
      console.log("Skickar förfrågan till backend med URL:", formattedUrl);
      console.log("Analystyp:", analysisType);
      
      // Registrera tidpunkt för när förfrågan skickas
      const requestSentTime = performance.now();
      setAnalysisTiming(prev => ({...prev, requestSent: requestSentTime}));
      setAnalysisPhase("Skrapar webbsida...");
      
      const response = await fetch(`${BACKEND_URL}/get_suggestions`, {
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
      
      // Registrera tidpunkt för när svar mottages
      const responseReceivedTime = performance.now();
      setAnalysisTiming(prev => ({...prev, responseReceived: responseReceivedTime}));
      setAnalysisPhase("Behandlar analyssvar...");
      
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

      // Spara prestandamätningar från backend
      if (data.performance_metrics) {
        console.log("Prestandamätningar från backend:", data.performance_metrics);
        setPerformanceMetrics(data.performance_metrics);
      }

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

      // Registrera tidpunkt för när behandling är klar
      const processingCompletedTime = performance.now();
      setAnalysisTiming(prev => ({...prev, processingCompleted: processingCompletedTime}));
      
      setAnalysisResult(result);
      
      // Logga tidtagning
      console.timeEnd("totalAnalysisTime");
      
      // Beräkna och logga tider
      const requestTime = (requestSentTime - startTime) / 1000;
      const responseTime = (responseReceivedTime - requestSentTime) / 1000;
      const processingTime = (processingCompletedTime - responseReceivedTime) / 1000;
      const totalTime = (processingCompletedTime - startTime) / 1000;
      
      console.log(`
🕒 Tidtagning:
- Frontend förberedelse: ${requestTime.toFixed(2)}s
- Väntetid på svar: ${responseTime.toFixed(2)}s
- Frontend bearbetning: ${processingTime.toFixed(2)}s
- Total tid: ${totalTime.toFixed(2)}s
      `);
      
      if (data.performance_metrics) {
        const backendMetrics = data.performance_metrics;
        console.log(`
🔍 Backend prestanda:
- Skrapning: ${backendMetrics.scrape_time.toFixed(2)}s
- OpenAI-analys: ${backendMetrics.openai_analysis_time.toFixed(2)}s
- Design-analys: ${backendMetrics.design_analysis_time ? backendMetrics.design_analysis_time.toFixed(2) + 's' : 'N/A'}
- Total backend-tid: ${backendMetrics.total_processing_time.toFixed(2)}s
        `);
      }
      
      toast({
        title: "Analys klar",
        description: "Sidan har analyserats framgångsrikt",
      });
    } catch (error) {
      const endTime = performance.now();
      const totalTime = (endTime - startTime) / 1000;
      
      console.error("Fel vid analys:", error);
      console.log(`❌ Analys misslyckades efter ${totalTime.toFixed(2)}s`);
      
      toast({
        title: "Ett fel uppstod",
        description: error instanceof Error ? error.message : "Kunde inte analysera sidan",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setAnalysisPhase("");
    }
  };
  
  const currentAnalysisType = analysisTypes.find(type => type.value === analysisType);
  
  return (
    <div className="min-h-screen bg-apple-gray-50 dark:bg-gray-950">
      <div className="container max-w-6xl py-12 mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-semibold text-gray-900 dark:text-white mb-3">
            Specialiserad sidanalys
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 mx-auto max-w-2xl">
            Djupgående analys av specifika sidtyper med AI-drivna insikter
          </p>

          <div className="max-w-xl mx-auto mt-10">
            <div className="flex flex-col gap-5 p-7 bg-white dark:bg-gray-900 rounded-2xl border border-[#e8e8ed] dark:border-gray-800 shadow-sm">
              <div>
                <label htmlFor="url-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Webbadress
                </label>
                <Input
                  id="url-input"
                  type="text"
                  placeholder="Ange URL (t.ex. example.com)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full rounded-xl border-[#e8e8ed] bg-white dark:bg-gray-800 dark:border-gray-700 py-2.5 px-4"
                />
              </div>
              
              <div>
                <label htmlFor="analysis-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Analystyp
                </label>
                <Select 
                  value={analysisType} 
                  onValueChange={setAnalysisType}
                >
                  <SelectTrigger id="analysis-type" className="w-full rounded-xl border-[#e8e8ed] bg-white dark:bg-gray-800 dark:border-gray-700 py-2.5 px-4">
                    <SelectValue placeholder="Välj analystyp" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-[#e8e8ed] bg-white/95 backdrop-blur-xl">
                    {analysisTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="rounded-lg my-0.5">
                        <div className="flex items-center">
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {currentAnalysisType && (
                  <div className="mt-2 flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <currentAnalysisType.icon className="h-5 w-5 shrink-0 mt-0.5" />
                    <p>{currentAnalysisType.description}</p>
                  </div>
                )}
              </div>
              
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="mt-2 rounded-full bg-primary text-white hover:bg-primary/90 py-2.5"
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

        <LoadingAnimation 
          isVisible={isAnalyzing} 
          phase={analysisPhase} 
          startTime={analysisStartTime} 
        />

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
                
                {/* Prestandamätning */}
                {performanceMetrics && (
                  <div className="p-6 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2 mb-3">
                      <LineChart className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-medium">Prestandamätning</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Total tid</div>
                        <div className="text-xl font-semibold">{formatTimeDuration(performanceMetrics.total_processing_time)}</div>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Skrapningstid</div>
                        <div className="text-xl font-semibold">{formatTimeDuration(performanceMetrics.scrape_time)}</div>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500 dark:text-gray-400">OpenAI-analystid</div>
                        <div className="text-xl font-semibold">{formatTimeDuration(performanceMetrics.openai_analysis_time)}</div>
                      </div>
                      
                      {performanceMetrics.design_analysis_time !== undefined && (
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                          <div className="text-sm text-gray-500 dark:text-gray-400">Designanalystid</div>
                          <div className="text-xl font-semibold">{formatTimeDuration(performanceMetrics.design_analysis_time)}</div>
                        </div>
                      )}
                      
                      {performanceMetrics.visitor_lookup_time !== undefined && (
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                          <div className="text-sm text-gray-500 dark:text-gray-400">Besökardatahämtning</div>
                          <div className="text-xl font-semibold">{formatTimeDuration(performanceMetrics.visitor_lookup_time)}</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                      Frontend-rendering: {((analysisTiming.processingCompleted - analysisTiming.frontendStart) / 1000).toFixed(2)}s
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        
        <div className="mt-24">
          <h2 className="text-2xl font-semibold text-center mb-8">Välj rätt analystyp för din sida</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {analysisTypes.map((type) => (
              <Card 
                key={type.value} 
                className={`cursor-pointer hover:shadow-md transition-shadow overflow-hidden ${
                  analysisType === type.value 
                  ? 'ring-2 ring-primary' 
                  : 'border-[#e8e8ed] dark:border-gray-800'
                }`}
                onClick={() => setAnalysisType(type.value)}
              >
                <CardContent className="p-5 text-center">
                  <div className="flex justify-center mb-5 mt-2">
                    <div className="w-14 h-14 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                      <type.icon className="h-7 w-7 text-primary dark:text-primary-300" />
                    </div>
                  </div>
                  <h3 className="font-semibold mb-1.5">{type.label}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3">{type.description}</p>
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
