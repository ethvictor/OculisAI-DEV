import { Search, BarChart2, GitCompare, FileSearch, Sparkles, Check, Lightbulb, ArrowRight, TrendingUp, Clock, Bell, ExternalLink, Activity, ChevronRight } from "lucide-react";
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

  // Sample data for the logged-in user dashboard
  const recentActivities = [
    { id: 1, type: "analysis", title: "Webbshop Analys", date: "2025-05-05", status: "Slutförd" },
    { id: 2, type: "competitor", title: "Konkurrentanalys", date: "2025-05-03", status: "Slutförd" },
    { id: 3, type: "page", title: "Produktsida Analys", date: "2025-05-01", status: "Slutförd" },
  ];

  const metrics = {
    sessioner: "1,243",
    konvertering: "3.7%",
    intäkter: "89,450 kr",
    förbättringar: "17"
  };

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
      {!user ? (
        // Non-logged in view - keep existing hero and features sections
        <>
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
              </div>
            </div>
          </section>

          {/* Features Section */}
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
          
          {/* Visual Demo/Screenshot Section */}
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

          {/* CTA Section */}
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
        </>
      ) : (
        // Logged in user dashboard - completely redesigned
        <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Welcome section with stats */}
          <div className="mb-10">
            <div className="welcome-gradient rounded-3xl p-8 mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    Välkommen tillbaka, {user.name?.split(' ')[0] || 'Användare'}
                  </h1>
                  <p className="text-gray-600">
                    {new Date().toLocaleDateString('sv-SE', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                
                <div className="mt-4 md:mt-0">
                  <span className="text-sm font-medium text-gray-500 block mb-1">Din plan: </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    subscription === 'pro' ? 'bg-indigo-100 text-indigo-800' :
                    subscription === 'basic' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {subscription === 'pro' ? 'Pro Plan' : 
                     subscription === 'basic' ? 'Basic Plan' : 
                     'Free Plan'}
                  </span>
                </div>
              </div>
              
              <div className="metrics-grid">
                <div className="metric-card">
                  <span className="text-sm font-medium text-gray-500 block mb-1">Sessioner</span>
                  <span className="stat-value">{metrics.sessioner}</span>
                  <div className="flex items-center text-green-500 text-xs font-medium">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    <span>+12.4% från föregående period</span>
                  </div>
                </div>
                <div className="metric-card">
                  <span className="text-sm font-medium text-gray-500 block mb-1">Konverteringsgrad</span>
                  <span className="stat-value">{metrics.konvertering}</span>
                  <div className="flex items-center text-green-500 text-xs font-medium">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    <span>+0.5% från föregående period</span>
                  </div>
                </div>
                <div className="metric-card">
                  <span className="text-sm font-medium text-gray-500 block mb-1">Intäkter</span>
                  <span className="stat-value">{metrics.intäkter}</span>
                  <div className="flex items-center text-green-500 text-xs font-medium">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    <span>+8.7% från föregående period</span>
                  </div>
                </div>
                <div className="metric-card">
                  <span className="text-sm font-medium text-gray-500 block mb-1">Förbättringar</span>
                  <span className="stat-value">{metrics.förbättringar}</span>
                  <div className="flex items-center text-amber-500 text-xs font-medium">
                    <Bell className="w-3 h-3 mr-1" />
                    <span>3 kritiska åtgärder</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* URL analysis section */}
            <div className="dashboard-card p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">Analysera din webbutik</h2>
              <form onSubmit={handleAnalyzeUrl} className="flex flex-col sm:flex-row gap-4 mb-2">
                <Input
                  type="text"
                  placeholder="Ange din webbshops URL för analys..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 h-14 text-lg rounded-xl px-6"
                />
                <Button 
                  type="submit" 
                  className="h-14 px-8 rounded-xl bg-gradient-to-r from-primary-700 to-primary-800 hover:from-primary-800 hover:to-primary-900 transition-all"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Starta analys
                </Button>
              </form>
              <p className="text-gray-500 text-sm">
                Få en omfattande AI-driven analys av din e-handelssida på några minuter
              </p>
            </div>
          </div>
          
          {/* Available tools */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {/* First row: Main tools */}
            <Link to="/ai-tools" className="w-full">
              <div className={`dashboard-card p-6 h-full flex flex-col ${subscription === "free" ? "opacity-60" : ""}`}>
                <div className="tool-icon-wrapper bg-indigo-100 mb-6">
                  <Search className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Butiksanalys</h3>
                <p className="text-gray-600 mb-4 text-sm flex-1">
                  Få en komplett analys av din webbshop med AI-drivna förbättringsförslag
                </p>
                <Button 
                  className="tool-button w-full justify-between bg-gradient-to-r from-indigo-600 to-primary-700" 
                  disabled={subscription === "free"}
                >
                  <span>Öppna verktyget</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </Link>
            
            <Link to="/competitor-analysis" className="w-full">
              <div className={`dashboard-card p-6 h-full flex flex-col ${subscription === "free" ? "opacity-60" : ""}`}>
                <div className="tool-icon-wrapper bg-amber-100 mb-6">
                  <GitCompare className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Konkurrentanalys</h3>
                <p className="text-gray-600 mb-4 text-sm flex-1">
                  Jämför din butik med konkurrenterna och hitta konkurrensfördelar
                </p>
                <Button 
                  variant="outline" 
                  className="tool-button w-full justify-between border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                  disabled={subscription === "free"}
                >
                  <span>Öppna verktyget</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </Link>
            
            <Link to="/page-analyzer" className="w-full">
              <div className={`dashboard-card p-6 h-full flex flex-col ${subscription === "free" ? "opacity-60" : ""}`}>
                <div className="tool-icon-wrapper bg-purple-100 mb-6">
                  <FileSearch className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Sidanalys</h3>
                <p className="text-gray-600 mb-4 text-sm flex-1">
                  Djupanalys av enskilda sidor för maximal konvertering
                </p>
                <Button 
                  variant="outline" 
                  className="tool-button w-full justify-between border-purple-500 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                  disabled={subscription === "free"}
                >
                  <span>Öppna verktyget</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </Link>
            
            <Link to="/rapporter" className="w-full">
              <div className={`dashboard-card p-6 h-full flex flex-col ${subscription === "free" ? "opacity-60" : ""}`}>
                <div className="tool-icon-wrapper bg-blue-100 mb-6">
                  <BarChart2 className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Rapporter</h3>
                <p className="text-gray-600 mb-4 text-sm flex-1">
                  Se alla dina analysrapporter och förbättringsrekommendationer
                </p>
                <Button 
                  variant="outline" 
                  className="tool-button w-full justify-between"
                  disabled={subscription === "free"}
                >
                  <span>Öppna rapporter</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </Link>
          </div>
          
          {/* Recent activities */}
          <div className="dashboard-card p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Senaste aktiviteter</h2>
              <Link to="/rapporter" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center">
                <span>Visa alla</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            <div className="recent-activity">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <div className={`mr-4 p-2 rounded-lg ${
                        activity.type === "analysis" ? "bg-indigo-100" : 
                        activity.type === "competitor" ? "bg-amber-100" : 
                        "bg-purple-100"
                      }`}>
                        {activity.type === "analysis" ? (
                          <Search className={`h-5 w-5 text-indigo-600`} />
                        ) : activity.type === "competitor" ? (
                          <GitCompare className={`h-5 w-5 text-amber-600`} />
                        ) : (
                          <FileSearch className={`h-5 w-5 text-purple-600`} />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{activity.title}</h3>
                        <p className="text-sm text-gray-500">{activity.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {activity.status}
                      </span>
                      <Link to={`/rapporter/${activity.id}`}>
                        <Button variant="ghost" size="sm" className="ml-2">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              
              {recentActivities.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Activity className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Inga aktiviteter ännu</h3>
                  <p className="text-gray-500 max-w-sm">
                    Starta din första analys för att börja samla insikter om din webbshop
                  </p>
                </div>
              )}
            </div>
            
            {subscription === "free" && (
              <div className="mt-8 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                <h3 className="text-lg font-semibold mb-2">Uppgradera för fler funktioner</h3>
                <p className="text-gray-600 mb-4">
                  Du använder gratisversionen av Oculis AI. Uppgradera för att låsa upp alla verktyg och funktioner.
                </p>
                <Link to="/upgrade">
                  <Button className="rounded-xl bg-gradient-to-r from-primary-700 to-primary-800">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Uppgradera nu
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
