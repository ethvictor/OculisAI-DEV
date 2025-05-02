
import { Home, Search, BarChart2, Settings, GitCompare, FileSearch } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth0 } from "@auth0/auth0-react";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "./ui/navigation-menu";

const NavBar = () => {
  // Get authentication functions
  const { loginWithRedirect, logout, isAuthenticated } = useAuth0();

  // Use location to get correct pathname
  const location = useLocation();
  const currentPath = location.pathname;

  // Menu items
  const navItems = [
    { icon: Home, label: "Hem", path: "/" },
    { icon: Search, label: "AI-Analys", path: "/ai-tools" },
    { icon: GitCompare, label: "Konkurrenter", path: "/competitor-analysis" },
    { icon: FileSearch, label: "Sidanalys", path: "/page-analyzer" },
    { icon: BarChart2, label: "Rapporter", path: "/rapporter" },
    { icon: Settings, label: "Inställningar", path: "/installningar" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b shadow-sm dark:bg-gray-950 dark:border-gray-800">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        
        {/* Left side: Logo */}
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/c8d0e48d-32e6-4a66-8fee-dd425dc22beb.png" 
              alt="Oculis AI Logo" 
              className="h-8 w-auto" 
            />
            <span className="text-xl font-bold">Oculis AI</span>
          </Link>
        </div>
        
        {/* Center: Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {navItems.map((item) => (
              <NavigationMenuItem key={item.label}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors hover:text-primary",
                    currentPath === item.path
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
        
        {/* Right side: Auth button */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <button
              onClick={() =>
                logout({
                  logoutParams: {
                    returnTo: window.location.origin,
                  },
                })
              }
              className="text-sm font-medium px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              Logga ut
            </button>
          ) : (
            <button
              onClick={() => loginWithRedirect()}
              className="text-sm font-medium px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              Logga in
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavBar;
