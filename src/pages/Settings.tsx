
import { useAuth0 } from "@auth0/auth0-react";
import { Settings as SettingsIcon, User, Link as LinkIcon } from "lucide-react";
import { Navigate, Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const Settings = () => {
  const { user, isLoading } = useAuth0();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Laddar...</p>
        </div>
      </div>
    );
  }

  // Redirect to home if not authenticated
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="container py-16 px-4 md:px-6">
        <div className="flex flex-col items-center justify-center text-center mb-12">
          <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6">
            <User className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          
          <h1 className="text-4xl font-bold mb-4 tracking-tight">Min profil</h1>
          
          <div className="mb-6">
            <p className="text-xl font-medium">{user.name}</p>
            <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
          </div>
          
          <Button asChild variant="outline" className="mb-12 apple-button bg-black text-white hover:bg-black/90">
            <Link to="/upgrade" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Hantera prenumerationer
            </Link>
          </Button>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
          <Card className="apple-card border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Profilinformation</CardTitle>
              <CardDescription>Hantera din personliga information</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">Din profil hanteras via Auth0.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full hover:bg-gray-100 dark:hover:bg-gray-800">Uppdatera profil</Button>
            </CardFooter>
          </Card>
          
          <Card className="apple-card border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Notifikationer</CardTitle>
              <CardDescription>Hantera dina notifikationsinställningar</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">Välj vilka notifikationer du vill ta emot från Oculis AI.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full hover:bg-gray-100 dark:hover:bg-gray-800">Anpassa notifikationer</Button>
            </CardFooter>
          </Card>
          
          <Card className="apple-card border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Integrationer</CardTitle>
              <CardDescription>Anslut dina externa tjänster</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">Koppla ihop Oculis AI med dina andra verktyg.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full hover:bg-gray-100 dark:hover:bg-gray-800">Hantera integrationer</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
