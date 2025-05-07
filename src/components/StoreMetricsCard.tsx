
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
    if (score >= 70) return "text-green-700 dark:text-green-400";
    if (score >= 50) return "text-yellow-700 dark:text-yellow-400";
    return "text-red-700 dark:text-red-400";
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
        "relative overflow-hidden bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg cursor-pointer transform hover:-translate-y-1",
        className
      )}
      onClick={onClick}
    >
      <div className="space-y-5">
        {/* Score circle - prominently displayed at top */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full flex flex-col items-center justify-center relative">
            <svg className="w-full h-full absolute" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={overallScore >= 70 ? "#10b981" : overallScore >= 50 ? "#f59e0b" : "#ef4444"}
                strokeWidth="8"
                strokeDasharray="282.7"
                strokeDashoffset={282.7 - (282.7 * overallScore) / 100}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <span className={`text-3xl font-bold z-10 ${getScoreTextColor(overallScore)}`}>{overallScore}</span>
            <span className="text-sm font-medium z-10 mt-0.5">{getScoreDescription(overallScore)}</span>
          </div>
        </div>
        
        {/* Header section with store name and URL */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-1 line-clamp-1">{name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {url}
          </p>
        </div>
          
        {/* Metrics section - enhanced with better visual indicators */}
        <div className="space-y-3 mt-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Search className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">SEO</span>
              </div>
              <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${getScoreColor(metrics.seo)} bg-opacity-20 ${getScoreTextColor(metrics.seo)}`}>
                {metrics.seo}%
              </span>
            </div>
            <Progress 
              value={metrics.seo} 
              className="h-2 bg-gray-100 dark:bg-gray-700" 
              indicatorClassName={getScoreColor(metrics.seo)} 
            />
          </div>
          
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Zap className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Användarvänlighet</span>
              </div>
              <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${getScoreColor(metrics.usability)} bg-opacity-20 ${getScoreTextColor(metrics.usability)}`}>
                {metrics.usability}%
              </span>
            </div>
            <Progress 
              value={metrics.usability} 
              className="h-2 bg-gray-100 dark:bg-gray-700" 
              indicatorClassName={getScoreColor(metrics.usability)} 
            />
          </div>
          
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Globe className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Estetik</span>
              </div>
              <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${getScoreColor(metrics.aesthetics)} bg-opacity-20 ${getScoreTextColor(metrics.aesthetics)}`}>
                {metrics.aesthetics}%
              </span>
            </div>
            <Progress 
              value={metrics.aesthetics} 
              className="h-2 bg-gray-100 dark:bg-gray-700" 
              indicatorClassName={getScoreColor(metrics.aesthetics)} 
            />
          </div>
        </div>
        
        {/* Summary section with improved styling */}
        <div className="pt-3 mt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 flex items-center">
            <Gauge className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
