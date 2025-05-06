
import { useState, useEffect } from "react";
import { BarChart2, FileChartLine, FileChartPie, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth0 } from "@auth0/auth0-react";
import { useToast } from "@/hooks/use-toast";

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
  const [loading, setLoading] = useState(true);
  const { getAccessTokenSilently, user } = useAuth0();
  const { toast } = useToast();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = await getAccessTokenSilently();
        
        const response = await fetch("/api/reports", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch reports");
        }
        
        const data = await response.json();
        setReports(data);
      } catch (error) {
        console.error("Error fetching reports:", error);
        toast({
          title: "Ett fel uppstod",
          description: "Kunde inte hämta dina rapporter",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [getAccessTokenSilently, toast]);

  // Group reports by analysis type
  const groupedReports = reports.reduce((acc, report) => {
    const type = report.analysis_type || "general";
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(report);
    return acc;
  }, {} as Record<string, Report[]>);

  // Analysis type display names and icons
  const analysisTypes = {
    "general": { name: "Generell", icon: BarChart2 },
    "landing_page": { name: "Landningssida", icon: FileChartLine },
    "product_page": { name: "Produktsida", icon: FileChartPie },
    "trust_check": { name: "Förtroende", icon: Sparkles },
    "brand_analysis": { name: "Varumärke", icon: BarChart2 },
    "mobile_experience": { name: "Mobil", icon: FileChartLine },
    "competitor": { name: "Konkurrent", icon: FileChartPie }
  };

  // Format date to Swedish format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('sv-SE', {
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Get domain name from URL
  const getDomainName = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch (e) {
      return url;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-400" />
          <p className="text-lg text-gray-600 dark:text-gray-300">Laddar dina rapporter...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="container py-16 px-4 md:px-6">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-8">
            <BarChart2 className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          </div>
          
          <h1 className="text-4xl font-bold mb-6 tracking-tight">Rapporter</h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed">
            Här ser du alla dina sparade analyser och insiktsrika rapporter.
            Välj en analys för att se mer detaljer.
          </p>
        </div>

        {reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center max-w-lg mx-auto">
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Du har inga sparade rapporter än. Skapa din första analys för att komma igång.
            </p>
            <div className="space-y-4 w-full max-w-md">
              <Button asChild size="lg" variant="gradient" className="w-full">
                <Link to="/ai-tools">Skapa din första analys</Link>
              </Button>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 mb-8">
              <TabsTrigger value="all">Alla</TabsTrigger>
              {Object.keys(analysisTypes).map(type => (
                groupedReports[type] && groupedReports[type].length > 0 && (
                  <TabsTrigger value={type} key={type}>
                    {analysisTypes[type as keyof typeof analysisTypes]?.name || type}
                  </TabsTrigger>
                )
              ))}
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map(report => (
                  <ReportCard 
                    key={report.id} 
                    report={report} 
                    analysisTypes={analysisTypes}
                    formatDate={formatDate}
                    getDomainName={getDomainName}
                  />
                ))}
              </div>
            </TabsContent>

            {Object.keys(groupedReports).map(type => (
              <TabsContent value={type} key={type} className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedReports[type].map(report => (
                    <ReportCard 
                      key={report.id} 
                      report={report} 
                      analysisTypes={analysisTypes}
                      formatDate={formatDate}
                      getDomainName={getDomainName}
                    />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 w-full">
          <div className="rounded-xl bg-gray-50 dark:bg-gray-900 p-6 text-center apple-card">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h3 className="text-lg font-medium mb-2">Trendanalyser</h3>
            <p className="text-gray-500 dark:text-gray-400">Se hur din butik utvecklas över tid med visuella rapporter</p>
          </div>
          
          <div className="rounded-xl bg-gray-50 dark:bg-gray-900 p-6 text-center apple-card">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <BarChart2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h3 className="text-lg font-medium mb-2">Jämförelsestatistik</h3>
            <p className="text-gray-500 dark:text-gray-400">Se hur din butik står sig mot konkurrenterna</p>
          </div>
          
          <div className="rounded-xl bg-gray-50 dark:bg-gray-900 p-6 text-center apple-card">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h3 className="text-lg font-medium mb-2">Exportering</h3>
            <p className="text-gray-500 dark:text-gray-400">Ladda ner dina rapporter i olika format för enkel delning</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Report Card Component
interface ReportCardProps {
  report: Report;
  analysisTypes: Record<string, { name: string; icon: any }>;
  formatDate: (date: string) => string;
  getDomainName: (url: string) => string;
}

const ReportCard = ({ report, analysisTypes, formatDate, getDomainName }: ReportCardProps) => {
  const type = report.analysis_type || "general";
  const TypeIcon = analysisTypes[type as keyof typeof analysisTypes]?.icon || BarChart2;
  const typeName = analysisTypes[type as keyof typeof analysisTypes]?.name || type;
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="bg-gray-50 dark:bg-gray-900/80 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <TypeIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-sm font-medium">{typeName}</CardTitle>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(report.created_at)}</span>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="font-bold mb-1">{getDomainName(report.url)}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 truncate">
          {report.url}
        </p>
        <Button asChild size="sm">
          <Link to={`/rapport/${report.id}`}>Visa rapport</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default Reports;