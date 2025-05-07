
import React from "react";
import { Card } from "@/components/ui/card";
import { Search, Globe, Zap, ChartBar, Gauge } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface StoreMetricsProps {
  url: string;
  name: string;
  metrics: {
    seo: number;
    usability: number;
    aesthetics: number;
  };
  className?: string;
  onClick?: () => void;
}

export const StoreMetricsCard: React.FC<StoreMetricsProps> = ({
  url,
  name,
  metrics,
  className,
  onClick
}) => {
  // Helper function to determine color based on score
  const getScoreColor = (score: number) => {
    if (score >= 70) return "bg-green-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 70) return "text-green-700";
    if (score >= 50) return "text-yellow-700";
    return "text-red-700";
  };

  // Calculate the overall score as an average of all metrics
  const overallScore = Math.round(
    (metrics.seo + metrics.usability + metrics.aesthetics) / 3
  );

  // Helper function to get text description based on overall score
  const getScoreDescription = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 70) return "Bra";
    if (score >= 50) return "Godkänt";
    return "Behöver förbättras";
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden backdrop-blur-xl bg-white/95 border border-[#e8e8ed] rounded-2xl p-6 transition-all duration-300 hover:shadow-lg cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div className="space-y-6">
        {/* Score circle - prominently displayed at top */}
        <div className="flex justify-center mb-2">
          <div className={`w-24 h-24 rounded-full ${getScoreColor(overallScore)} bg-opacity-20 border-4 ${getScoreColor(overallScore)} flex flex-col items-center justify-center`}>
            <span className={`text-3xl font-bold ${getScoreTextColor(overallScore)}`}>{overallScore}%</span>
            <span className={`text-xs ${getScoreTextColor(overallScore)} font-medium`}>{getScoreDescription(overallScore)}</span>
          </div>
        </div>
        
        {/* Header section with store name and URL */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-[#1d1d1f]">{name}</h3>
          <p className="text-sm text-[#6e6e73] mt-1 truncate">{url}</p>
        </div>
          
        {/* Metrics section - enhanced with better visual indicators */}
        <div className="space-y-5 mt-4">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Search className="h-4 w-4 mr-2 text-[#0066cc]" />
                <span className="text-sm font-medium text-[#1d1d1f]">SEO Score</span>
              </div>
              <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${getScoreColor(metrics.seo)} bg-opacity-20 ${getScoreTextColor(metrics.seo)}`}>
                {metrics.seo}%
              </span>
            </div>
            <Progress 
              value={metrics.seo} 
              className="h-2 bg-gray-100" 
              indicatorClassName={getScoreColor(metrics.seo)} 
            />
          </div>
          
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Zap className="h-4 w-4 mr-2 text-[#0066cc]" />
                <span className="text-sm font-medium text-[#1d1d1f]">Användarvänlighet</span>
              </div>
              <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${getScoreColor(metrics.usability)} bg-opacity-20 ${getScoreTextColor(metrics.usability)}`}>
                {metrics.usability}%
              </span>
            </div>
            <Progress 
              value={metrics.usability} 
              className="h-2 bg-gray-100" 
              indicatorClassName={getScoreColor(metrics.usability)} 
            />
          </div>
          
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Globe className="h-4 w-4 mr-2 text-[#0066cc]" />
                <span className="text-sm font-medium text-[#1d1d1f]">Estetik</span>
              </div>
              <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${getScoreColor(metrics.aesthetics)} bg-opacity-20 ${getScoreTextColor(metrics.aesthetics)}`}>
                {metrics.aesthetics}%
              </span>
            </div>
            <Progress 
              value={metrics.aesthetics} 
              className="h-2 bg-gray-100" 
              indicatorClassName={getScoreColor(metrics.aesthetics)} 
            />
          </div>
        </div>
        
        {/* Visual summary section - new, more informative text based on score */}
        <div className="pt-4 mt-2 border-t border-[#e8e8ed] text-center">
          <div className="inline-flex items-center px-3 py-1.5 bg-[#f5f5f7] rounded-full">
            <Gauge className="h-4 w-4 text-[#0066cc] mr-2" />
            <span className="text-sm font-medium">
              {overallScore >= 70 
                ? "Butiken presterar mycket bra" 
                : overallScore >= 50 
                ? "Butiken presterar godkänt" 
                : "Butiken behöver förbättras"}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
