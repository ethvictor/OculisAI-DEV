import { Search, Shield, BarChart2, GitCompare, FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "../hooks/useSubscription";
import { useAuth0 } from "@auth0/auth0-react";



const Home = () => {
  const [url, setUrl] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: userLoading } = useAuth0();


  const { subscription, loading: subscriptionLoading } = useSubscription(user?.sub || "", user?.email || "");

  if (userLoading || subscriptionLoading) {
    return <div>Loading...</div>;
  }

  const handleAnalyzeUrl = (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      toast({
        title: "URL krävs",
        description: "Vänligen ange en URL att analysera",
        variant: "destructive",
      });
      return;
    }

    try {
      new URL(url);
      navigate(`/ai-tools?url=${encodeURIComponent(url)}`);
    } catch (error) {
      toast({
        title: "Ogiltig URL",
        description: "Vänligen ange en giltig URL (t.ex. https://example.com)",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero Section */}
      <section className="container py-12 md:py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-gray-950 -z-10"></div>
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#4D3B99_1px,transparent_1px)] [background-size:20px_20px] -z-10"></div>

        <div className="mx-auto flex flex-col items-center text-center">
          <div className="flex items-center mb-6">
            <img 
              src="/lovable-uploads/c8d0e48d-32e6-4a66-8fee-dd425dc22beb.png" 
              alt="Oculis AI Logo" 
              className="h-16 w-auto mr-4" 
            />
            <div className="rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-medium text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300">
              E-handelsanalys
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Optimera din <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">e-handelsbutik</span>
          </h1>

          <p className="max-w-[42rem] text-muted-foreground mb-12 text-xl">
            Analysera din webbshop med AI och få konkreta förslag på hur du kan förbättra 
            design, UX och innehåll för ökad konvertering.
          </p>

          <form onSubmit={handleAnalyzeUrl} className="w-full max-w-xl mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="text"
                placeholder="Ange din URL (t.ex. example.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="lg" className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                <Search className="h-4 w-4" />
                Analysera nu
              </Button>
            </div>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
            <Link to="/ai-tools">
              <Button 
                size="lg" 
                className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700" 
                disabled={subscription === "free"}
              >
                <Search className="h-4 w-4" />
                Analysverktyg
              </Button>
            </Link>
            <Link to="/competitor-analysis">
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full gap-2 border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                disabled={subscription === "free"}
              >
                <GitCompare className="h-4 w-4" />
                Konkurrenter
              </Button>
            </Link>
            <Link to="/page-analyzer">
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full gap-2 border-purple-500 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                disabled={subscription === "free"}
              >
                <FileSearch className="h-4 w-4" />
                Sidanalys
              </Button>
            </Link>
            <Link to="/rapporter">
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full gap-2"
                disabled={subscription === "free"}
              >
                <BarChart2 className="h-4 w-4" />
                Rapporter
              </Button>
            </Link>
          </div>

          {/* Visa info för gratisanvändare */}
          {subscription === "free" && (
            <p className="text-red-500 text-center mt-4">
              Endast Butiks-Analysen är tillgänglig på gratisplanen.
            </p>
          )}
        </div>
      </section>

      {/* Resten av sektionerna (URL-exempel, features osv.) */}
      {/* ... */}
    </div>
  );
};

export default Home;
