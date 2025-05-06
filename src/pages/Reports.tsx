
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShoppingCart, Trophy } from "lucide-react";
import { BACKEND_URL } from "@/utils/api";
import { useAuth0 } from "@auth0/auth0-react";

interface Report {
  id: number;
  user_id: string;
  analysis_type: string;
  url: string;
  results: any;
  created_at: string;
}

const Reports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const { reportId } = useParams<{ reportId: string }>();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        const token = await getAccessTokenSilently();
        const response = await fetch(`${BACKEND_URL}/reports`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Kunde inte hämta rapporter");
        }

        const data = await response.json();
        setReports(data);

        // If a specific report ID is in the URL, find and select that report
        if (reportId) {
          const report = data.find((r: Report) => r.id === parseInt(reportId));
          if (report) {
            setSelectedReport(report);
          } else {
            toast({
              title: "Rapport hittades inte",
              description: "Den begärda rapporten kunde inte hittas",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
        toast({
          title: "Ett fel uppstod",
          description: "Kunde inte hämta rapporter",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [isAuthenticated, getAccessTokenSilently, toast, reportId]);

  // Filter reports based on active tab
  const filteredReports = reports.filter((report) => {
    if (activeTab === "all") return true;
    if (activeTab === "stores") return report.results?.is_competitor === false;
    if (activeTab === "competitors") return report.results?.is_competitor === true;
    return true;
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("sv-SE", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const viewReport = (report: Report) => {
    setSelectedReport(report);
  };

  if (isLoading) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-lg">Laddar rapporter...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container py-12">
        <div className="max-w-md mx-auto text-center space-y-4">
          <h2 className="text-2xl font-bold">Logga in för att visa rapporter</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Du måste vara inloggad för att se dina sparade rapporter.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Dina analyser och rapporter</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Här kan du se alla analyser du har sparat. Använd flikarna nedan för att filtrera mellan
            dina butiker och konkurrentanalyser.
          </p>
        </div>

        {selectedReport ? (
          <div className="space-y-6">
            <Button
              variant="outline"
              onClick={() => setSelectedReport(null)}
              className="mb-4"
            >
              ← Tillbaka till alla rapporter
            </Button>
            
            <Card className="border-t-4 border-t-primary">
              <CardHeader>
                <div className="flex items-center gap-2">
                  {selectedReport.results?.is_competitor ? (
                    <Trophy className="h-5 w-5 text-indigo-500" />
                  ) : (
                    <ShoppingCart className="h-5 w-5 text-blue-500" />
                  )}
                  <CardTitle className="text-xl">
                    {selectedReport.results?.store_name || "Rapport"}{" "}
                    {selectedReport.results?.is_competitor
                      ? "(Konkurrentanalys)"
                      : "(Butiksanalys)"}
                  </CardTitle>
                </div>
                <CardDescription>
                  <div className="flex flex-col space-y-1">
                    <span>URL: {selectedReport.url}</span>
                    <span>Skapad: {formatDate(selectedReport.created_at)}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="seo">
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="seo">SEO</TabsTrigger>
                    <TabsTrigger value="ux">Användarvänlighet</TabsTrigger>
                    <TabsTrigger value="content">Innehåll</TabsTrigger>
                  </TabsList>

                  <TabsContent value="seo" className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                      <h3 className="text-lg font-semibold mb-2">Sammanfattning</h3>
                      <p>{selectedReport.results?.seo_analysis?.summary || "Ingen sammanfattning tillgänglig"}</p>
                      
                      {selectedReport.results?.seo_analysis?.observations && 
                       selectedReport.results.seo_analysis.observations.length > 0 && (
                        <div className="mt-4">
                          <h3 className="text-lg font-semibold mb-2">Observationer</h3>
                          <ul className="list-disc pl-5">
                            {selectedReport.results.seo_analysis.observations.map((obs: string, idx: number) => (
                              <li key={idx}>{obs}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="ux" className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                      <h3 className="text-lg font-semibold mb-2">Sammanfattning</h3>
                      <p>{selectedReport.results?.ux_analysis?.summary || "Ingen sammanfattning tillgänglig"}</p>
                      
                      {selectedReport.results?.ux_analysis?.observations && 
                       selectedReport.results.ux_analysis.observations.length > 0 && (
                        <div className="mt-4">
                          <h3 className="text-lg font-semibold mb-2">Observationer</h3>
                          <ul className="list-disc pl-5">
                            {selectedReport.results.ux_analysis.observations.map((obs: string, idx: number) => (
                              <li key={idx}>{obs}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="content" className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                      <h3 className="text-lg font-semibold mb-2">Sammanfattning</h3>
                      <p>{selectedReport.results?.content_analysis?.summary || "Ingen sammanfattning tillgänglig"}</p>
                      
                      {selectedReport.results?.content_analysis?.observations && 
                       selectedReport.results.content_analysis.observations.length > 0 && (
                        <div className="mt-4">
                          <h3 className="text-lg font-semibold mb-2">Observationer</h3>
                          <ul className="list-disc pl-5">
                            {selectedReport.results.content_analysis.observations.map((obs: string, idx: number) => (
                              <li key={idx}>{obs}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <Tabs 
              defaultValue="all" 
              className="max-w-4xl mx-auto"
              onValueChange={setActiveTab}
              value={activeTab}
            >
              <div className="flex justify-center mb-6">
                <TabsList>
                  <TabsTrigger value="all">Alla rapporter</TabsTrigger>
                  <TabsTrigger value="stores">Mina butiker</TabsTrigger>
                  <TabsTrigger value="competitors">Konkurrenter</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="space-y-6">
                {reports.length === 0 ? (
                  <div className="text-center py-8">
                    <h3 className="text-xl font-medium mb-2">Inga rapporter än</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Du har inte sparat några rapporter ännu. Använd "Spara rapport" knappen när du analyserar en butik eller konkurrent.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredReports.map((report) => (
                      <ReportCard key={report.id} report={report} onView={viewReport} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="stores" className="space-y-6">
                {filteredReports.length === 0 ? (
                  <div className="text-center py-8">
                    <h3 className="text-xl font-medium mb-2">Inga butiksrapporter</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Du har inte sparat några butiksanalyser ännu.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredReports.map((report) => (
                      <ReportCard key={report.id} report={report} onView={viewReport} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="competitors" className="space-y-6">
                {filteredReports.length === 0 ? (
                  <div className="text-center py-8">
                    <h3 className="text-xl font-medium mb-2">Inga konkurrentrapporter</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Du har inte sparat några konkurrentanalyser ännu.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredReports.map((report) => (
                      <ReportCard key={report.id} report={report} onView={viewReport} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
};

interface ReportCardProps {
  report: Report;
  onView: (report: Report) => void;
}

const ReportCard = ({ report, onView }: ReportCardProps) => {
  const isCompetitor = report.results?.is_competitor === true;
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("sv-SE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  // Get design scores
  const usabilityScore = report.results?.designScore?.usability || 0;
  const performanceScore = report.results?.designScore?.performance || 0;

  return (
    <Card className={`hover:shadow-md transition-shadow ${
      isCompetitor 
        ? "border-l-4 border-l-indigo-500" 
        : "border-l-4 border-l-blue-500"
    }`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {isCompetitor ? (
              <Trophy className="h-5 w-5 text-indigo-500" />
            ) : (
              <ShoppingCart className="h-5 w-5 text-blue-500" />
            )}
            <CardTitle className="text-lg">
              {report.results?.store_name || new URL(report.url).hostname}
            </CardTitle>
          </div>
          <CardDescription className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
            {formatDate(report.created_at)}
          </CardDescription>
        </div>
        <CardDescription className="text-sm">
          {isCompetitor ? "Konkurrentanalys" : "Butiksanalys"}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-sm">
          <div className="flex justify-between mb-1">
            <span>Användarvänlighet:</span>
            <span>{(usabilityScore * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-3">
            <div 
              className={`h-1.5 rounded-full ${
                usabilityScore >= 0.7 
                  ? "bg-green-500" 
                  : usabilityScore >= 0.5 
                    ? "bg-yellow-500" 
                    : "bg-red-500"
              }`} 
              style={{ width: `${usabilityScore * 100}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between mb-1">
            <span>SEO/Prestanda:</span>
            <span>{(performanceScore * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-3">
            <div 
              className={`h-1.5 rounded-full ${
                performanceScore >= 0.7 
                  ? "bg-green-500" 
                  : performanceScore >= 0.5 
                    ? "bg-yellow-500" 
                    : "bg-red-500"
              }`} 
              style={{ width: `${performanceScore * 100}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => onView(report)}
        >
          Visa detaljer
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Reports;