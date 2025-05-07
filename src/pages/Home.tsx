
import { Search, BarChart2, GitCompare, FileSearch, Sparkles, Check, Lightbulb, ArrowRight } from "lucide-react";
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-white to-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Laddar...</p>
        </div>
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
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="py-24 md:py-36 relative overflow-hidden">
        {/* Subtle background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute -top-[500px] -right-[300px] w-[900px] h-[900px] rounded-full bg-gradient-to-r from-indigo-100/40 to-purple-100/40 blur-3xl"></div>
          <div className="absolute -bottom-[300px] -left-[200px] w-[700px] h-[700px] rounded-full bg-gradient-to-r from-blue-50/30 to-indigo-100/30 blur-3xl"></div>
        </div>
        
        <div className="container px-6 md:px-8 mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <div className="flex items-center mb-12">
              <img 
                src="/lovable-uploads/c8d0e48d-32e6-4a66-8fee-dd425dc22beb.png" 
                alt="Oculis AI Logo" 
                className="h-20 w-auto logo" 
              />
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter mb-10 fade-in-1 bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-900">
              Förvandla din e-handel med <span className="oculis-gradient-text">Oculis AI</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-14 max-w-3xl fade-in-2 leading-relaxed">
              Få professionell AI-analys av din webbshop för ökad konvertering, 
              bättre kundupplevelse och högre försäljning.
            </p>

            {!user ? (
              <div className="flex flex-col sm:flex-row gap-6 mb-20 w-full justify-center fade-in-3 mt-4">
                <button 
                  onClick={() => loginWithRedirect()}
                  className="apple-button text-lg px-10 py-5 min-w-[220px] flex items-center justify-center gap-2 rounded-full bg-black text-white hover:bg-black/90 transition-all shadow-lg"
                >
                  <Sparkles className="h-5 w-5" />
                  <span>Prova gratis</span>
                </button>
                <Link to="/upgrade">
                  <button className="text-lg px-10 py-5 rounded-full border-2 border-black hover:bg-black/5 transition-colors font-medium min-w-[220px]">
                    Se alla planer
                  </button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleAnalyzeUrl} className="w-full max-w-2xl mb-16 fade-in-3">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Input
                    type="text"
                    placeholder="Ange din webbshops URL"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1 h-16 text-lg px-6 rounded-full border-2 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-sm"
                  />
                  <Button 
                    type="submit" 
                    className="apple-button text-lg h-16 px-8 rounded-full"
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
                    className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 h-14 rounded-full shadow-md" 
                    disabled={subscription === "free"}
                  >
                    <Search className="h-4 w-4" />
                    Analysverktyg
                  </Button>
                </Link>
                <Link to="/competitor-analysis" className="w-full">
                  <Button 
                    variant="outline" 
                    className="w-full gap-2 border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700 h-14 rounded-full shadow-sm"
                    disabled={subscription === "free"}
                  >
                    <GitCompare className="h-4 w-4" />
                    Konkurrenter
                  </Button>
                </Link>
                <Link to="/page-analyzer" className="w-full">
                  <Button 
                    variant="outline" 
                    className="w-full gap-2 border-purple-500 text-purple-600 hover:bg-purple-50 hover:text-purple-700 h-14 rounded-full shadow-sm"
                    disabled={subscription === "free"}
                  >
                    <FileSearch className="h-4 w-4" />
                    Sidanalys
                  </Button>
                </Link>
                <Link to="/rapporter" className="w-full">
                  <Button 
                    variant="outline" 
                    className="w-full gap-2 h-14 rounded-full shadow-sm"
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
      </section>

      {/* Features Section */}
      {!user && (
        <section className="py-32 px-6 container mx-auto max-w-7xl bg-white relative overflow-hidden rounded-[3rem] my-8 shadow-2xl shadow-gray-200/50">
          <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 -z-10"></div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-900">Allt du behöver för att förbättra din e-handel</h2>
          <p className="text-xl text-gray-600 text-center mb-20 max-w-3xl mx-auto leading-relaxed">
            Vår AI-teknologi analyserar, identifierar problem och ger dig konkreta förbättringsförslag 
            för att öka din konverteringsgrad och intäkter.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <Card className="apple-card border-0 shadow-2xl p-2 rounded-3xl overflow-hidden hover:-translate-y-2 transition-all duration-300">
              <CardContent className="p-10">
                <div className="h-16 w-16 rounded-2xl bg-indigo-100 flex items-center justify-center mb-8">
                  <Lightbulb className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-6">Intelligent Analys</h3>
                <ul className="space-y-5">
                  <li className="flex gap-4">
                    <Check className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-lg">Genomsöker hela din webbshop på sekunder</span>
                  </li>
                  <li className="flex gap-4">
                    <Check className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-lg">Identifierar både små och stora brister</span>
                  </li>
                  <li className="flex gap-4">
                    <Check className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-lg">Prioriterar åtgärder för maximal effekt</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="apple-card border-0 shadow-2xl p-2 rounded-3xl overflow-hidden hover:-translate-y-2 transition-all duration-300">
              <CardContent className="p-10">
                <div className="h-16 w-16 rounded-2xl bg-indigo-100 flex items-center justify-center mb-8">
                  <GitCompare className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-6">Konkurrentanalys</h3>
                <ul className="space-y-5">
                  <li className="flex gap-4">
                    <Check className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-lg">Benchmarking mot ledande aktörer</span>
                  </li>
                  <li className="flex gap-4">
                    <Check className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-lg">Identifiera konkurrenters styrkor</span>
                  </li>
                  <li className="flex gap-4">
                    <Check className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-lg">Hitta outnyttjade marknadsmöjligheter</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="apple-card border-0 shadow-2xl p-2 rounded-3xl overflow-hidden hover:-translate-y-2 transition-all duration-300">
              <CardContent className="p-10">
                <div className="h-16 w-16 rounded-2xl bg-indigo-100 flex items-center justify-center mb-8">
                  <BarChart2 className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-6">Detaljerade Insikter</h3>
                <ul className="space-y-5">
                  <li className="flex gap-4">
                    <Check className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-lg">Tydliga, handlingsbara rekommendationer</span>
                  </li>
                  <li className="flex gap-4">
                    <Check className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-lg">Kontinuerlig förbättringsuppföljning</span>
                  </li>
                  <li className="flex gap-4">
                    <Check className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-lg">Personliga anpassningar för din bransch</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>
      )}
      
      {/* Visual Demo/Screenshot Section */}
      {!user && (
        <section className="py-32 px-6 container mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="lg:w-1/2">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-900">Kraftfull analys, enkelt presenterad</h2>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Vår AI-plattform presenterar komplex data på ett enkelt och lättförståeligt sätt. 
                Få tydliga rekommendationer som direkt kan omsättas till handling.
              </p>
              <ul className="space-y-5 mb-12">
                <li className="flex gap-4">
                  <Check className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-xl">Tydliga, visuella rapporter</span>
                </li>
                <li className="flex gap-4">
                  <Check className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-xl">Direkta åtgärdsförslag</span>
                </li>
                <li className="flex gap-4">
                  <Check className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-xl">Kontinuerlig uppföljning</span>
                </li>
              </ul>
              <button 
                onClick={() => loginWithRedirect()}
                className="apple-button px-10 py-5 text-lg rounded-full bg-black text-white hover:bg-black/90 transition-all shadow-lg flex items-center"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Prova själv
              </button>
            </div>
            <div className="lg:w-1/2">
              <div className="rounded-3xl overflow-hidden shadow-2xl relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 mix-blend-overlay"></div>
                <img 
                  src="/placeholder.svg"
                  alt="Oculis AI Dashboard" 
                  className="w-full h-auto object-cover" 
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {!user && (
        <section className="py-32 bg-gradient-to-br from-gray-900 to-indigo-900 text-white relative overflow-hidden rounded-[3rem] my-12">
          <div className="absolute inset-0 bg-[url('/pattern-dot.svg')] opacity-10"></div>
          <div className="container mx-auto px-6 md:px-8 max-w-4xl text-center relative">
            <div className="absolute w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -top-48 -left-48"></div>
            <div className="absolute w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -bottom-48 -right-48"></div>
            
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8 relative">
              Ta första steget mot en bättre e-handelsupplevelse
            </h2>
            <p className="text-xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed relative">
              Börja med en gratis analys och upptäck hur Oculis AI kan hjälpa dig att förbättra din 
              konvertering, kundupplevelse och försäljning.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center relative">
              <button 
                onClick={() => loginWithRedirect()}
                className="text-lg px-10 py-5 bg-white text-gray-900 rounded-full hover:bg-white/90 transition-all font-medium flex items-center justify-center shadow-lg"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                <span>Kom igång gratis</span>
              </button>
              <Link to="/upgrade">
                <button className="text-lg px-10 py-5 rounded-full border-2 border-white hover:bg-white/10 transition-colors font-medium flex items-center">
                  <ArrowRight className="h-5 w-5 mr-2" />
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
