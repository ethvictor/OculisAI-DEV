
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Search, Globe, Zap, Save, Loader2, ExternalLink } from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";
import { useToast } from "@/hooks/use-toast";
import { BACKEND_URL } from "@/utils/api";

interface StoreAnalysis {
  summary: string;
  observations: string[];
}

interface StoreDetails {
  name: string;
  url: string;
  metrics: {
    seo: number;
    usability: number;
    aesthetics: number;
    visitorsPerMonth?: number | null;
    products?: number | null;
    revenue?: number | null;
    averagePrice?: number | null;
  };
  analysis?: {
    seo_analysis?: StoreAnalysis;
    ux_analysis?: StoreAnalysis;
    content_analysis?: StoreAnalysis;
  };
}

interface StoreMetricsDialogProps {
  store: StoreDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StoreMetricsDialog: React.FC<StoreMetricsDialogProps> = ({
  store,
  open,
  onOpenChange
}) => {
  const { isAuthenticated, getAccessTokenSilently, user } = useAuth0();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = React.useState(false);

  // Helper function to determine color based on score
  const getScoreColor = (score: number) => {
    if (score >= 70) return "bg-green-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  const getScoreIndicator = (score: number) => {
    if (score >= 70) return "green-500";
    if (score >= 50) return "yellow-500";
    return "red-500";
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
        analysis_type: "store_analysis",
        url: store.url,
        results: {
          store_name: store.name,
          seo_analysis: store.analysis?.seo_analysis,
          ux_analysis: store.analysis?.ux_analysis,
          content_analysis: store.analysis?.content_analysis,
          designScore: {
            performance: store.metrics.seo / 100,
            usability: store.metrics.usability / 100,
            aesthetics: store.metrics.aesthetics / 100
          },
          is_competitor: false
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto pt-10">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-semibold text-[#1d1d1f]">
              {store.name || "Butiksanalys"}
            </DialogTitle>
            <Button 
              variant="outline"
              size="sm"
              onClick={saveAsReport}
              disabled={isSaving}
              className="flex items-center gap-1 rounded-full border bg-[#f5f5f7] hover:bg-[#e8e8ed] border-[#e8e8ed] px-4"
            >
              {isSaving ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1" />}
              Spara rapport
            </Button>
          </div>
          <div className="flex items-center gap-1 text-[#0066cc] mt-1 text-sm">
            <ExternalLink className="h-3.5 w-3.5" />
            <a 
              href={store.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:underline"
            >
              Besök butik
            </a>
          </div>
        </DialogHeader>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
          <div className="bg-[#f5f5f7] p-4 rounded-xl">
            <div className="text-sm text-[#6e6e73] mb-1">Användarvänlighet</div>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full bg-${getScoreIndicator(store.metrics.usability)} mr-2`}></div>
              <div className="text-lg font-semibold">{store.metrics.usability}%</div>
            </div>
          </div>
          
          <div className="bg-[#f5f5f7] p-4 rounded-xl">
            <div className="text-sm text-[#6e6e73] mb-1">Estetik</div>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full bg-${getScoreIndicator(store.metrics.aesthetics)} mr-2`}></div>
              <div className="text-lg font-semibold">{store.metrics.aesthetics}%</div>
            </div>
          </div>
          
          <div className="bg-[#f5f5f7] p-4 rounded-xl">
            <div className="text-sm text-[#6e6e73] mb-1">Prestanda</div>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full bg-${getScoreIndicator(store.metrics.seo)} mr-2`}></div>
              <div className="text-lg font-semibold">{store.metrics.seo}%</div>
            </div>
          </div>
          
          <div className="bg-[#f5f5f7] p-4 rounded-xl">
            <div className="text-sm text-[#6e6e73] mb-1">Besökare/mån</div>
            <div className="text-lg font-semibold">
              {store.metrics.visitorsPerMonth?.toLocaleString() || "N/A"}
            </div>
          </div>
          
          <div className="bg-[#f5f5f7] p-4 rounded-xl">
            <div className="text-sm text-[#6e6e73] mb-1">Produkter</div>
            <div className="text-lg font-semibold">
              {store.metrics.products?.toLocaleString() || "N/A"}
            </div>
          </div>
          
          <div className="bg-[#f5f5f7] p-4 rounded-xl">
            <div className="text-sm text-[#6e6e73] mb-1">Intäkter</div>
            <div className="text-lg font-semibold">
              {store.metrics.revenue ? `${store.metrics.revenue.toLocaleString()} kr` : "N/A"}
            </div>
          </div>
        </div>

        <Tabs defaultValue="seo" className="mt-8">
          <TabsList className="grid grid-cols-4 bg-[#f5f5f7] rounded-full p-1 mb-6 max-w-2xl mx-auto">
            <TabsTrigger
              value="seo"
              className="data-[state=active]:bg-[#0066cc] data-[state=active]:text-white rounded-full"
            >
              SEO
            </TabsTrigger>
            <TabsTrigger
              value="ux"
              className="data-[state=active]:bg-[#0066cc] data-[state=active]:text-white rounded-full"
            >
              UX
            </TabsTrigger>
            <TabsTrigger
              value="content"
              className="data-[state=active]:bg-[#0066cc] data-[state=active]:text-white rounded-full"
            >
              Innehåll
            </TabsTrigger>
            <TabsTrigger
              value="recommendations"
              className="data-[state=active]:bg-[#0066cc] data-[state=active]:text-white rounded-full"
            >
              Rekommendationer
            </TabsTrigger>
          </TabsList>

          {/* SEO Analysis Tab */}
          <TabsContent value="seo" className="space-y-6">
            {store.analysis?.seo_analysis ? (
              <>
                <div className="bg-white border border-[#e8e8ed] rounded-2xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold mb-4 text-[#1d1d1f] border-b border-[#e8e8ed] pb-3">Sammanfattning</h3>
                  <p className="text-[#424245]">{store.analysis.seo_analysis.summary}</p>
                </div>
                <div className="bg-white border border-[#e8e8ed] rounded-2xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold mb-4 text-[#1d1d1f] border-b border-[#e8e8ed] pb-3">Observationer</h3>
                  <ul className="space-y-2">
                    {store.analysis.seo_analysis.observations.map((obs, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#0066cc]"></div>
                        <p className="text-[#424245]">{obs}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className="text-center py-10 text-[#6e6e73]">
                Ingen SEO-analys tillgänglig
              </div>
            )}
          </TabsContent>

          {/* UX Analysis Tab */}
          <TabsContent value="ux" className="space-y-6">
            {store.analysis?.ux_analysis ? (
              <>
                <div className="bg-white border border-[#e8e8ed] rounded-2xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold mb-4 text-[#1d1d1f] border-b border-[#e8e8ed] pb-3">Sammanfattning</h3>
                  <p className="text-[#424245]">{store.analysis.ux_analysis.summary}</p>
                </div>
                <div className="bg-white border border-[#e8e8ed] rounded-2xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold mb-4 text-[#1d1d1f] border-b border-[#e8e8ed] pb-3">Observationer</h3>
                  <ul className="space-y-2">
                    {store.analysis.ux_analysis.observations.map((obs, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#0066cc]"></div>
                        <p className="text-[#424245]">{obs}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className="text-center py-10 text-[#6e6e73]">
                Ingen UX-analys tillgänglig
              </div>
            )}
          </TabsContent>

          {/* Content Analysis Tab */}
          <TabsContent value="content" className="space-y-6">
            {store.analysis?.content_analysis ? (
              <>
                <div className="bg-white border border-[#e8e8ed] rounded-2xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold mb-4 text-[#1d1d1f] border-b border-[#e8e8ed] pb-3">Sammanfattning</h3>
                  <p className="text-[#424245]">{store.analysis.content_analysis.summary}</p>
                </div>
                <div className="bg-white border border-[#e8e8ed] rounded-2xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold mb-4 text-[#1d1d1f] border-b border-[#e8e8ed] pb-3">Observationer</h3>
                  <ul className="space-y-2">
                    {store.analysis.content_analysis.observations.map((obs, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#0066cc]"></div>
                        <p className="text-[#424245]">{obs}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className="text-center py-10 text-[#6e6e73]">
                Ingen innehållsanalys tillgänglig
              </div>
            )}
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            <div className="text-center py-10 text-[#6e6e73]">
              Rekommendationer kommer att genereras baserat på analysdata
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
