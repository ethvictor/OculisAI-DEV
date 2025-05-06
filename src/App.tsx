
// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import AITools from "./pages/AITools";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import PolicyPage from "./pages/Policies";
import CompetitorAnalysis from "./pages/CompetitorAnalysis";
import PageAnalyzer from "./pages/PageAnalyzer";
import Upgrade from "./pages/upgrade";
import "./App.css";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <div className="flex flex-col min-h-screen">
            <NavBar />
            <main className="flex-1">
              <Routes>
                {/* Öppna sidor */}
                <Route path="/" element={<Home />} />
                <Route path="/policies" element={<PolicyPage />} />
                <Route path="/upgrade" element={<Upgrade />} />

                {/* Sidor som är tillgängliga men kräver inloggning för att använda */}
                <Route
                  path="/installningar"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/ai-tools"
                  element={
                    <ProtectedRoute allowedPlans={["free-trial", "basic", "pro"]} requiresUsageCheck={true}>
                      <AITools />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/rapporter"
                  element={
                    <ProtectedRoute allowedPlans={["free-trial", "basic", "pro"]}>
                      <Reports />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/rapport/:reportId"
                  element={
                    <ProtectedRoute allowedPlans={["free-trial", "basic", "pro"]}>
                      <Reports />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/competitor-analysis"
                  element={
                    <ProtectedRoute allowedPlans={["basic", "pro"]}>
                      <CompetitorAnalysis />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/page-analyzer"
                  element={
                    <ProtectedRoute allowedPlans={["pro"]}>
                      <PageAnalyzer />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Home />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;