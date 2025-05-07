
import React from "react";
import { Card } from "@/components/ui/card";
import { Search, Globe, Zap, ChartBar } from "lucide-react";
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

  // Calculate the overall score as an average of all metrics
  const overallScore = Math.round(
    (metrics.seo + metrics.usability + metrics.aesthetics) / 3
  );

  return (
    <Card 
      className={cn(
        "overflow-hidden backdrop-blur-xl bg-white/95 border border-[#e8e8ed] rounded-2xl p-6 transition-all duration-300 hover:shadow-lg cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div className="space-y-6">
        {/* Header section with store name, URL and score */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold text-[#1d1d1f]">{name}</h3>
            <p className="text-sm text-[#6e6e73] mt-1">{url}</p>
          </div>
          
          {/* Overall score display */}
          <div className="flex flex-col items-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${getScoreColor(overallScore)} border-opacity-20 mb-1`}>
              <span className="text-xl font-bold">{overallScore}%</span>
            </div>
            <span className="text-xs text-[#6e6e73]">Total score</span>
          </div>
        </div>

        {/* Metrics section */}
        <div className="space-y-5">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Search className="h-4 w-4 mr-2 text-[#0066cc]" />
                <span className="text-sm font-medium text-[#1d1d1f]">SEO Score</span>
              </div>
              <span className="text-sm font-medium">{metrics.seo}%</span>
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
              <span className="text-sm font-medium">{metrics.usability}%</span>
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
              <span className="text-sm font-medium">{metrics.aesthetics}%</span>
            </div>
            <Progress 
              value={metrics.aesthetics} 
              className="h-2 bg-gray-100" 
              indicatorClassName={getScoreColor(metrics.aesthetics)} 
            />
          </div>
        </div>
        
        {/* Visual summary section */}
        <div className="pt-2 border-t border-[#e8e8ed]">
          <div className="flex items-center space-x-2">
            <ChartBar className="h-4 w-4 text-[#0066cc]" />
            <span className="text-sm text-[#6e6e73]">
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
