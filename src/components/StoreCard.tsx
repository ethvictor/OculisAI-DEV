
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon, TrendingUp, Layout, Star, Plus, Loader2, Globe, Search, ShoppingCart, Zap, Sparkles, BarChart2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown";

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

export interface AnalysisResult {
  summary: string;
  observations: string[];
  recommendations: string;
}

export interface StoreMetrics {
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
  visitorsPerMonth?: string;
  recommendations_summary?: {
    seo_recommendations: string;
    ux_recommendations: string;
    content_recommendations: string;
    overall_summary: string;
  };
}

interface StoreCardProps {
  store: StoreMetrics;
  onAnalyze: (url: string) => Promise<void>;
  isEmpty?: boolean;
}

export const StoreCard = ({ store, onAnalyze, isEmpty = false }: StoreCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
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

  if (isEmpty) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Card className="p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer min-h-[300px] flex items-center justify-center group bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-dashed border-blue-200 dark:border-blue-800">
            <div className="text-center">
              <Plus className="w-12 h-12 mx-auto mb-4 text-blue-500 group-hover:scale-110 transition-transform duration-200" />
              <p className="text-gray-600 dark:text-gray-400">Lägg till butik för analys</p>
            </div>
          </Card>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lägg till ny butik för analys</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Input
              placeholder="Ange butikens URL (t.ex. example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full relative bg-blue-600 hover:bg-blue-700"
            >
              {isAnalyzing ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span>Analyserar...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Sparkles className="w-4 h-4 mr-2" />
                  <span>Analysera butik</span>
                </div>
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
          <div className={`flex items-center ${change > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {change > 0 ? <ArrowUpIcon className="w-4 h-4 mr-1" /> : <ArrowDownIcon className="w-4 h-4 mr-1" />}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer">
          {isAnalyzing && (
            <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center rounded-lg z-10">
              <div className="flex flex-col items-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
                <p className="text-sm font-medium">Analyserar butiken...</p>
              </div>
            </div>
          )}
          
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-5">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <h3 className="text-xl font-semibold mb-1">{store.name || "Ny butik"}</h3>
                <p className="text-sm text-blue-100">{store.url}</p>
              </div>
              <div className="bg-white/20 p-2 rounded-full">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="p-5">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="col-span-2">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Genomsnittligt betyg</h4>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-blue-600">
                    {store.designScore ? 
                      `${(((store.designScore.usability + store.designScore.aesthetics + store.designScore.performance) / 3) * 100).toFixed(0)}%` : 
                      "N/A"
                    }
                  </div>
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span className="font-medium">SEO</span>
                  <span>{store.designScore?.performance ? `${(store.designScore.performance * 100).toFixed(0)}%` : "N/A"}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                    style={{ width: `${store.designScore?.performance ? store.designScore.performance * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span className="font-medium">Användarvänlighet</span>
                  <span>{store.designScore?.usability ? `${(store.designScore.usability * 100).toFixed(0)}%` : "N/A"}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                    style={{ width: `${store.designScore?.usability ? store.designScore.usability * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span className="font-medium">Design</span>
                  <span>{store.designScore?.aesthetics ? `${(store.designScore.aesthetics * 100).toFixed(0)}%` : "N/A"}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                    style={{ width: `${store.designScore?.aesthetics ? store.designScore.aesthetics * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="mt-5 pt-5 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <Button variant="outline" className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950/50">
                  <BarChart2 className="w-4 h-4 mr-2" />
                  <span>Visa detaljerad analys</span>
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            {store.name || "Butiksanalys"}
          </DialogTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <a
              href={store.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-500"
            >
              Besök butik
            </a>
          </p>
        </DialogHeader>
        <Tabs defaultValue="seo" className="mt-4">
          <TabsList className="grid w-full grid-cols-5 bg-gray-100 dark:bg-gray-800 rounded-md p-1">
            <TabsTrigger
              value="seo"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-sm py-2 rounded-md"
            >
              SEO
            </TabsTrigger>
            <TabsTrigger
              value="ux"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-sm py-2 rounded-md"
            >
              UX
            </TabsTrigger>
            <TabsTrigger
              value="content"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-sm py-2 rounded-md"
            >
              Innehåll
            </TabsTrigger>
            <TabsTrigger
              value="metrics"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-sm py-2 rounded-md"
            >
              Mätvärden
            </TabsTrigger>
            <TabsTrigger
              value="recommendations"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-sm py-2 rounded-md"
            >
              Rekommendationer
            </TabsTrigger>
          </TabsList>

          {/* SEO Analysis Tab */}
          <TabsContent value="seo" className="mt-4 space-y-4">
          {store.analysis && store.analysis.seo_analysis ? (
            <div className="space-y-4">
              {/* Sammanfattning */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-blue-500">
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
              {/* Rekommendationer */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold border-b pb-2 mb-2 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
                  Rekommendationer
                </h3>
                <p>{store.analysis.seo_analysis.recommendations}</p>
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
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-blue-500">
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
      {/* Rekommendationer */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold border-b pb-2 mb-2 flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
          Rekommendationer
        </h3>
        <p>{store.analysis.ux_analysis.recommendations}</p>
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
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-blue-500">
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
      {/* Rekommendationer */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold border-b pb-2 mb-2 flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
          Rekommendationer
        </h3>
        <p>{store.analysis.content_analysis.recommendations}</p>
      </div>
    </div>
  ) : (
    <p className="text-gray-500">Ingen innehållsanalys tillgänglig</p>
  )}
</TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="mt-4 space-y-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold border-b pb-2 mb-4">Design Score</h3>
              {store.designScore ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    {/* Användarvänlighet */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">Användarvänlighet</span>
                        <span className="font-bold">
                          {(store.designScore.usability * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${store.designScore.usability * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Estetik */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">Estetik</span>
                        <span className="font-bold">
                          {(store.designScore.aesthetics * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${store.designScore.aesthetics * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Prestanda */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">Prestanda</span>
                        <span className="font-bold">
                          {(store.designScore.performance * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${store.designScore.performance * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-3">
                        <div className="relative">
                          <div className="w-24 h-24 rounded-full border-8 border-gray-200"></div>
                          <div 
                            className="absolute top-0 left-0 w-24 h-24 rounded-full border-8 border-blue-500"
                            style={{ 
                              clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.sin(((((store.designScore.usability + store.designScore.aesthetics + store.designScore.performance) / 3) * 100) / 100) * 2 * Math.PI)}% ${50 - 50 * Math.cos(((((store.designScore.usability + store.designScore.aesthetics + store.designScore.performance) / 3) * 100) / 100) * 2 * Math.PI)}%, 50% 50%)` 
                            }}
                          ></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-bold text-blue-600">
                              {(((store.designScore.usability + store.designScore.aesthetics + store.designScore.performance) / 3) * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">Genomsnittligt betyg</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Inga mätvärden tillgängliga</p>
              )}
            </div>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="mt-4 space-y-6">
            {store.recommendations_summary ? (
              <div className="space-y-6">
                {/* Övergripande sammanfattning */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold border-b border-blue-200 dark:border-blue-800 pb-3 mb-4 text-blue-800 dark:text-blue-300">
                    Övergripande sammanfattning
                  </h3>
                  <div className="prose dark:prose-invert max-w-none">
                    <ReactMarkdown>{store.recommendations_summary.overall_summary || "Ingen sammanfattning tillgänglig."}</ReactMarkdown>
                  </div>
                </div>

                {/* Individuella rekommendationer */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* SEO-rekommendationer */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                        <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h4 className="text-lg font-bold">
                        SEO-rekommendationer
                      </h4>
                    </div>
                    <div className="prose dark:prose-invert max-w-none">
                      <ReactMarkdown>{store.recommendations_summary.seo_recommendations || "Inga SEO-rekommendationer tillgängliga."}</ReactMarkdown>
                    </div>
                  </div>

                  {/* UX-rekommendationer */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                        <Layout className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h4 className="text-lg font-bold">
                        UX-rekommendationer
                      </h4>
                    </div>
                    <div className="prose dark:prose-invert max-w-none">
                      <ReactMarkdown>{store.recommendations_summary.ux_recommendations || "Inga UX-rekommendationer tillgängliga."}</ReactMarkdown>
                    </div>
                  </div>

                  {/* Innehållsrekommendationer */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                        <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h4 className="text-lg font-bold">
                        Innehållsrekommendationer
                      </h4>
                    </div>
                    <div className="prose dark:prose-invert max-w-none">
                      <ReactMarkdown>{store.recommendations_summary.content_recommendations || "Inga innehållsrekommendationer tillgängliga."}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
                <p className="text-gray-500">Inga rekommendationer tillgängliga.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
