
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon, TrendingUp, Layout, Star, Plus, Loader2, Globe, Search, ShoppingCart, Zap, Trophy, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown";
import { StoreMetrics } from "@/pages/types";
import { BACKEND_URL } from "@/utils/api";
import { useAuth0 } from "@auth0/auth0-react";

// Helper function to clean recommendation text
function cleanRecommendationText(line: string): string {
  // Remove double-asterisks (**) or more
  line = line.replace(/\*{2,}/g, "");

  // Remove heading symbols (####) at the beginning of the line
  line = line.replace(/^#{1,}\s*/, "");

  // Remove bullet points (• or -) at the beginning of the line
  line = line.replace(/^[•-]\s*/, "");

  // Trim whitespace at the beginning and end
  return line.trim();
}

// Function to determine progress bar color based on score
function getBarColor(value: number) {
  // value is a number 0-100
  // Red < 50, Yellow 50-69, Green >= 70
  if (value >= 70) return "bg-green-500";
  if (value >= 50) return "bg-yellow-500";
  return "bg-red-500";
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

interface CompetitorCardProps {
  store: StoreMetrics;
  onAnalyze: (url: string) => Promise<void>;
  isEmpty?: boolean;
}

export const CompetitorCard = ({ store, onAnalyze, isEmpty = false }: CompetitorCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated, getAccessTokenSilently, user } = useAuth0();

  const handleAnalyze = async () => {
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
    } catch {
      toast({
        title: "Ogiltig URL",
        description: "Vänligen ange en giltig domän (t.ex. example.com)",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      await onAnalyze(formattedUrl);
      setIsOpen(false);
      setUrl(""); // Clear the input after successful analysis
    } catch (error) {
      // Error handling is managed by the parent component
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const saveAsReport = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Inloggning krävs",
        description: "Du måste vara inloggad för att spara rapporter",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const token = await getAccessTokenSilently();
      
      const reportData = {
        user_id: user?.sub,
        analysis_type: "competitor_analysis",
        url: store.url,
        results: {
          store_name: store.name,
          seo_analysis: store.analysis?.seo_analysis,
          ux_analysis: store.analysis?.ux_analysis,
          content_analysis: store.analysis?.content_analysis,
          designScore: store.designScore,
          strengths_summary: store.strengths_summary,
          is_competitor: true
        }
      };

      const response = await fetch(`${BACKEND_URL}/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Kunde inte spara rapporten");
      }

      toast({
        title: "Rapport sparad",
        description: "Rapporten har sparats och kan hittas på rapportsidan",
      });
    } catch (error) {
      console.error("Error saving report:", error);
      toast({
        title: "Kunde inte spara rapport",
        description: error instanceof Error ? error.message : "Ett fel uppstod, försök igen senare",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isEmpty) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Card className="p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer min-h-[300px] flex items-center justify-center group bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-900/10">
            <div className="text-center">
              <Plus className="w-12 h-12 mx-auto mb-4 text-indigo-500 group-hover:scale-110 transition-transform duration-200" />
              <p className="text-gray-600 dark:text-gray-400">Lägg till konkurrent för analys</p>
            </div>
          </Card>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lägg till ny konkurrent för analys</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Input
              placeholder="Ange konkurrentens URL (t.ex. example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full relative bg-indigo-500 hover:bg-indigo-600"
            >
              {isAnalyzing ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span>Analyserar...</span>
                </div>
              ) : (
                "Analysera konkurrent"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const renderMetricCard = (icon: React.ReactNode, title: string, value: string | number | undefined, change?: number) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</h4>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold">{value || "N/A"}</p>
        {change !== undefined && (
          <div className={`flex items-center ${change > 0 ? 'text-metrics-up' : 'text-metrics-down'}`}>
            {change > 0 ? <ArrowUpIcon className="w-4 h-4 mr-1" /> : <ArrowDownIcon className="w-4 h-4 mr-1" />}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
    </div>
  );

  // Helper function to safely render analysis content
  const renderAnalysisContent = (content: any): React.ReactNode => {
    if (!content) return "Ingen analys tillgänglig";
    
    if (typeof content === 'string') {
      return content;
    }
    
    // If it's an object with summary, observations
    if (content.summary) {
      return (
        <div>
          <p className="font-medium">{content.summary}</p>
          {content.observations && content.observations.length > 0 && (
            <ul className="mt-2 list-disc list-inside">
              {content.observations.map((obs: string, index: number) => (
                <li key={index}>{obs}</li>
              ))}
            </ul>
          )}
        </div>
      );
    }
    
    return JSON.stringify(content);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer bg-gradient-to-br from-indigo-50 to-gray-50 dark:from-gray-800 dark:to-indigo-900/20">
          {isAnalyzing && (
            <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center rounded-lg z-10">
              <div className="flex flex-col items-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
                <p className="text-sm font-medium">Analyserar konkurrenten...</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold mb-1">{store.name || "Ny konkurrent"}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{store.url}</p>
            </div>
            <Trophy className="w-6 h-6 text-indigo-500" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {renderMetricCard(
              <Globe className="w-4 h-4 text-indigo-500" />,
              "Besökare/mån",
              store.visitorsPerMonth || "N/A"
            )}
            
            {renderMetricCard(
              <ShoppingCart className="w-4 h-4 text-indigo-500" />,
              "Produkter",
              store.products
            )}
             
            {renderMetricCard(
              <Search className="w-4 h-4 text-indigo-500" />,
              "SEO Score",
              store.designScore?.performance ? `${(store.designScore.performance * 100).toFixed(0)}%` : "N/A"
            )}
            
            {renderMetricCard(
              <Zap className="w-4 h-4 text-indigo-500" />,
              "Prestanda",
              store.designScore?.usability ? `${(store.designScore.usability * 100).toFixed(0)}%` : "N/A"
            )}
          </div>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-indigo-500" />
              {store.name || "Konkurrentanalys"}
            </DialogTitle>
            <Button 
              variant="outline"
              size="sm"
              onClick={saveAsReport}
              disabled={isSaving}
              className="flex items-center gap-1"
            >
              {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
              Spara rapport
            </Button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <a
              href={store.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-indigo-500"
            >
              Besök konkurrent
            </a>
          </p>
        </DialogHeader>
        <Tabs defaultValue="seo" className="mt-4">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-gray-800 rounded-md p-1">
            <TabsTrigger
              value="seo"
              className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white text-sm py-2 rounded-md"
            >
              SEO
            </TabsTrigger>
            <TabsTrigger
              value="ux"
              className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white text-sm py-2 rounded-md"
            >
              UX
            </TabsTrigger>
            <TabsTrigger
              value="content"
              className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white text-sm py-2 rounded-md"
            >
              Innehåll
            </TabsTrigger>
            <TabsTrigger
              value="strengths"
              className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white text-sm py-2 rounded-md"
            >
              Styrkor
            </TabsTrigger>
          </TabsList>

          {/* SEO Analysis Tab */}
          <TabsContent value="seo" className="mt-4 space-y-4">
            {store.analysis && store.analysis.seo_analysis ? (
              <div className="space-y-4">
                {/* Sammanfattning */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold border-b pb-2 mb-2">Sammanfattning</h3>
                  <p>{store.analysis.seo_analysis.summary}</p>
                </div>
                {/* Observationer */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold border-b pb-2 mb-2">Observationer</h3>
                  <ul className="list-disc pl-5">
                    {store.analysis.seo_analysis.observations.map((obs: string, idx: number) => (
                      <li key={idx}>{obs}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Ingen SEO-analys tillgänglig</p>
            )}
          </TabsContent>

          {/* UX Analysis Tab */}
          <TabsContent value="ux" className="mt-4 space-y-4">
            {store.analysis?.ux_analysis ? (
              <div className="space-y-4">
                {/* Sammanfattning */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold border-b pb-2 mb-2">Sammanfattning</h3>
                  <p>{store.analysis.ux_analysis.summary}</p>
                </div>
                {/* Observationer */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold border-b pb-2 mb-2">Observationer</h3>
                  <ul className="list-disc pl-5">
                    {store.analysis.ux_analysis.observations.map((obs: string, idx: number) => (
                      <li key={idx}>{obs}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Ingen UX-analys tillgänglig</p>
            )}
          </TabsContent>

          {/* Content Analysis Tab */}
          <TabsContent value="content" className="mt-4 space-y-4">
            {store.analysis?.content_analysis ? (
              <div className="space-y-4">
                {/* Sammanfattning */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold border-b pb-2 mb-2">Sammanfattning</h3>
                  <p>{store.analysis.content_analysis.summary}</p>
                </div>
                {/* Observationer */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold border-b pb-2 mb-2">Observationer</h3>
                  <ul className="list-disc pl-5">
                    {store.analysis.content_analysis.observations.map((obs: string, idx: number) => (
                      <li key={idx}>{obs}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Ingen innehållsanalys tillgänglig</p>
            )}
          </TabsContent>

          {/* Strengths Tab */}
          <TabsContent value="strengths" className="mt-4 space-y-6">
            {store.strengths_summary ? (
              <div className="space-y-6">
                {/* Overall strengths */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold border-b pb-3 mb-4 flex items-center">
                    <Trophy className="w-5 h-5 text-indigo-500 mr-2" />
                    Konkurrentens styrkor
                  </h3>
                  <div className="prose dark:prose-invert max-w-none">
                    <ReactMarkdown>{store.strengths_summary.overall_strengths || "Ingen sammanfattning av styrkor tillgänglig."}</ReactMarkdown>
                  </div>
                </div>

                {/* Individual strength categories */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* SEO strengths */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h4 className="text-lg font-bold border-b pb-2 mb-3 flex items-center">
                      <Search className="w-4 h-4 text-indigo-500 mr-2" />
                      SEO-styrkor
                    </h4>
                    <div className="prose dark:prose-invert max-w-none">
                      <ReactMarkdown>{store.strengths_summary.seo_strengths || "Inga SEO-styrkor identifierade."}</ReactMarkdown>
                    </div>
                  </div>

                  {/* UX strengths */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h4 className="text-lg font-bold border-b pb-2 mb-3 flex items-center">
                      <Layout className="w-4 h-4 text-indigo-500 mr-2" />
                      UX-styrkor
                    </h4>
                    <div className="prose dark:prose-invert max-w-none">
                      <ReactMarkdown>{store.strengths_summary.ux_strengths || "Inga UX-styrkor identifierade."}</ReactMarkdown>
                    </div>
                  </div>

                  {/* Content strengths */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h4 className="text-lg font-bold border-b pb-2 mb-3 flex items-center">
                      <Star className="w-4 h-4 text-indigo-500 mr-2" />
                      Innehålls-styrkor
                    </h4>
                    <div className="prose dark:prose-invert max-w-none">
                      <ReactMarkdown>{store.strengths_summary.content_strengths || "Inga innehållsstyrkor identifierade."}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
                <p className="text-gray-500">Ingen analys av styrkor tillgänglig.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};