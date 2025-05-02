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
                <Route path="/rapporter" element={<Reports />} />
                <Route path="/installningar" element={<Settings />} />
                <Route path="/policies" element={<PolicyPage />} />

                {/* Skyddade sidor: bara Plus och Pro */}
                <Route
                  path="/ai-tools"
                  element={
                    <ProtectedRoute allowedPlans={["plus", "pro"]}>
                      <AITools />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/competitor-analysis"
                  element={
                    <ProtectedRoute allowedPlans={["plus", "pro"]}>
                      <CompetitorAnalysis />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/page-analyzer"
                  element={
                    <ProtectedRoute allowedPlans={["plus", "pro"]}>
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
