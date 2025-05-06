
import { Search, BarChart2, GitCompare, FileSearch, Sparkles, Check, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "../hooks/useSubscription";
import { useAuth0 } from "@auth0/auth0-react";
import { Card, CardContent } from "@/components/ui/card";

const Home = () => {
  const [url, setUrl] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: userLoading, loginWithRedirect } = useAuth0();

  const { subscription, loading: subscriptionLoading } = useSubscription(user?.sub || "", user?.email || "");

  if (userLoading || subscriptionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-2">Laddar...</p>
      </div>
    );
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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="hero-section py-20 md:py-28 lg:py-36 relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern -z-10"></div>
        <div className="container px-6 md:px-8 mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <div className="flex items-center mb-10">
              <img 
                src="/lovable-uploads/c8d0e48d-32e6-4a66-8fee-dd425dc22beb.png" 
                alt="Oculis AI Logo" 
                className="h-16 w-auto mr-4 logo" 
              />
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-8 fade-in-1">
              Förvandla din e-handel med <span className="oculis-gradient-text">Oculis AI</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl fade-in-2">
              Få professionell AI-analys av din webbshop för ökad konvertering, 
              bättre kundupplevelse och högre försäljning.
            </p>

            {!user ? (
              <div className="flex flex-col sm:flex-row gap-6 mb-16 w-full justify-center fade-in-3">
                <button 
                  onClick={() => loginWithRedirect()}
                  className="apple-button text-lg px-8 py-4 min-w-[200px] flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-5 w-5" />
                  <span>Prova gratis</span>
                </button>
                <Link to="/upgrade">
                  <button className="text-lg px-8 py-4 rounded-full border-2 border-black hover:bg-black/5 transition-colors font-medium min-w-[200px]">
                    Se alla planer
                  </button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleAnalyzeUrl} className="w-full max-w-2xl mb-12 fade-in-3">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Input
                    type="text"
                    placeholder="Ange din webbshops URL"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1 h-14 text-lg px-6 rounded-full border-2 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <Button 
                    type="submit" 
                    className="apple-button text-lg h-14 px-8 rounded-full"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    Analysera
                  </Button>
                </div>
              </form>
            )}

            {user && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl fade-in-3">
                <Link to="/ai-tools" className="w-full">
                  <Button 
                    className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 h-14" 
                    disabled={subscription === "free"}
                  >
                    <Search className="h-4 w-4" />
                    Analysverktyg
                  </Button>
                </Link>
                <Link to="/competitor-analysis" className="w-full">
                  <Button 
                    variant="outline" 
                    className="w-full gap-2 border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700 h-14"
                    disabled={subscription === "free"}
                  >
                    <GitCompare className="h-4 w-4" />
                    Konkurrenter
                  </Button>
                </Link>
                <Link to="/page-analyzer" className="w-full">
                  <Button 
                    variant="outline" 
                    className="w-full gap-2 border-purple-500 text-purple-600 hover:bg-purple-50 hover:text-purple-700 h-14"
                    disabled={subscription === "free"}
                  >
                    <FileSearch className="h-4 w-4" />
                    Sidanalys
                  </Button>
                </Link>
                <Link to="/rapporter" className="w-full">
                  <Button 
                    variant="outline" 
                    className="w-full gap-2 h-14"
                    disabled={subscription === "free"}
                  >
                    <BarChart2 className="h-4 w-4" />
                    Rapporter
                  </Button>
                </Link>
              </div>
            )}

            {subscription === "free" && user && (
              <p className="text-red-500 text-center mt-4">
                Endast Butiks-Analysen är tillgänglig på gratisplanen.
              </p>
            )}
          </div>
        </div>

        {/* Decorative Visual Elements */}
        <div className="absolute -bottom-16 left-0 w-64 h-64 bg-indigo-100 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute top-20 right-10 w-32 h-32 bg-purple-100 rounded-full opacity-40 blur-3xl animate-float"></div>
      </section>

      {/* Features Section */}
      {!user && (
        <section className="py-24 px-6 container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-4">Allt du behöver för att förbättra din e-handel</h2>
          <p className="text-lg text-gray-600 text-center mb-16 max-w-3xl mx-auto">
            Vår AI-teknologi analyserar, identifierar problem och ger dig konkreta förbättringsförslag 
            för att öka din konverteringsgrad och intäkter.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="apple-card border-0 shadow-lg p-2">
              <CardContent className="p-8">
                <div className="h-14 w-14 rounded-2xl bg-indigo-100 flex items-center justify-center mb-6">
                  <Lightbulb className="h-7 w-7 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Intelligent Analys</h3>
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Genomsöker hela din webbshop på sekunder</span>
                  </li>
                  <li className="flex gap-3">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Identifierar både små och stora brister</span>
                  </li>
                  <li className="flex gap-3">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Prioriterar åtgärder för maximal effekt</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="apple-card border-0 shadow-lg p-2">
              <CardContent className="p-8">
                <div className="h-14 w-14 rounded-2xl bg-indigo-100 flex items-center justify-center mb-6">
                  <GitCompare className="h-7 w-7 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Konkurrentanalys</h3>
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Benchmarking mot ledande aktörer</span>
                  </li>
                  <li className="flex gap-3">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Identifiera konkurrenters styrkor</span>
                  </li>
                  <li className="flex gap-3">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Hitta outnyttjade marknadsmöjligheter</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="apple-card border-0 shadow-lg p-2">
              <CardContent className="p-8">
                <div className="h-14 w-14 rounded-2xl bg-indigo-100 flex items-center justify-center mb-6">
                  <BarChart2 className="h-7 w-7 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Detaljerade Insikter</h3>
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Tydliga, handlingsbara rekommendationer</span>
                  </li>
                  <li className="flex gap-3">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Kontinuerlig förbättringsuppföljning</span>
                  </li>
                  <li className="flex gap-3">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Personliga anpassningar för din bransch</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>
      )}
      
      {/* Visual Demo/Screenshot Section */}
      {!user && (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6 md:px-8 max-w-6xl">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/2">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">Kraftfull analys, enkelt presenterad</h2>
                <p className="text-lg text-gray-600 mb-6">
                  Vår AI-plattform presenterar komplex data på ett enkelt och lättförståeligt sätt. 
                  Få tydliga rekommendationer som direkt kan omsättas till handling.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex gap-3">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-lg">Tydliga, visuella rapporter</span>
                  </li>
                  <li className="flex gap-3">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-lg">Direkta åtgärdsförslag</span>
                  </li>
                  <li className="flex gap-3">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-lg">Kontinuerlig uppföljning</span>
                  </li>
                </ul>
                <button 
                  onClick={() => loginWithRedirect()}
                  className="apple-button px-8 py-4 text-lg"
                >
                  Prova själv
                </button>
              </div>
              <div className="lg:w-1/2">
                <div className="rounded-2xl overflow-hidden shadow-xl">
                  <img 
                    src="/placeholder.svg"
                    alt="Oculis AI Dashboard" 
                    className="w-full h-auto object-cover" 
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {!user && (
        <section className="py-24">
          <div className="container mx-auto px-6 md:px-8 max-w-4xl text-center">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              Ta första steget mot en bättre e-handelsupplevelse
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
              Börja med en gratis analys och upptäck hur Oculis AI kan hjälpa dig att förbättra din 
              konvertering, kundupplevelse och försäljning.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button 
                onClick={() => loginWithRedirect()}
                className="apple-button px-10 py-5 text-lg"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                <span>Kom igång gratis</span>
              </button>
              <Link to="/upgrade">
                <button className="text-lg px-10 py-5 rounded-full border-2 border-black hover:bg-black/5 transition-colors font-medium">
                  Se alla våra planer
                </button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
