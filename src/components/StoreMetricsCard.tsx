
import React from "react";
import { Card } from "@/components/ui/card";
import { Search, Gauge, Star, TrendingUp } from "lucide-react";
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
  // Calculate the overall score as an average of all metrics
  const overallScore = Math.round(
    (metrics.seo + metrics.usability + metrics.aesthetics) / 3
  );

  // Helper function to determine color based on score
  const getScoreColor = (score: number) => {
    if (score >= 70) return "bg-green-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 70) return "text-green-700 dark:text-green-400";
    if (score >= 50) return "text-yellow-700 dark:text-yellow-400";
    return "text-red-700 dark:text-red-400";
  };

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
        "overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div className="flex flex-col h-full">
        {/* Header with score circle */}
        <div className="bg-gray-50 dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 text-lg">{name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{url}</p>
            </div>
            
            {/* Score circle */}
            <div className="relative flex-shrink-0">
              <div className={`h-16 w-16 rounded-full flex items-center justify-center border-4 ${getScoreColor(overallScore)} bg-white dark:bg-gray-800 border-opacity-30`}>
                <span className={`text-xl font-bold ${getScoreTextColor(overallScore)}`}>
                  {overallScore}
                </span>
              </div>
              <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 text-xs font-medium px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-700">
                {getScoreDescription(overallScore)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Body with metrics */}
        <div className="p-4 space-y-4 flex-grow">
          {/* SEO Metric */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Search className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">SEO</span>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getScoreColor(metrics.seo)} bg-opacity-15 ${getScoreTextColor(metrics.seo)}`}>
                {metrics.seo}%
              </span>
            </div>
            <Progress 
              value={metrics.seo} 
              className="h-1.5 bg-gray-200 dark:bg-gray-700"
              indicatorClassName={getScoreColor(metrics.seo)}
            />
          </div>
          
          {/* Usability Metric */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Användarvänlighet</span>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getScoreColor(metrics.usability)} bg-opacity-15 ${getScoreTextColor(metrics.usability)}`}>
                {metrics.usability}%
              </span>
            </div>
            <Progress 
              value={metrics.usability} 
              className="h-1.5 bg-gray-200 dark:bg-gray-700"
              indicatorClassName={getScoreColor(metrics.usability)}
            />
          </div>
          
          {/* Aesthetics Metric */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Estetik</span>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getScoreColor(metrics.aesthetics)} bg-opacity-15 ${getScoreTextColor(metrics.aesthetics)}`}>
                {metrics.aesthetics}%
              </span>
            </div>
            <Progress 
              value={metrics.aesthetics} 
              className="h-1.5 bg-gray-200 dark:bg-gray-700"
              indicatorClassName={getScoreColor(metrics.aesthetics)}
            />
          </div>
        </div>
        
        {/* Footer with summary */}
        <div className="bg-gray-50 dark:bg-gray-900 p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <Gauge className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
            <p>
              {overallScore >= 70 
                ? "Butiken presterar mycket bra" 
                : overallScore >= 50 
                ? "Butiken presterar godkänt" 
                : "Butiken behöver förbättras"}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
