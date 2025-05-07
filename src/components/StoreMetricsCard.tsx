
import React from "react";
import { Card } from "@/components/ui/card";
import { Search, Zap, Globe, ShoppingCart, Check } from "lucide-react";
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
  // Get score color based on the value
  const getScoreColor = (score: number): string => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-amber-500";
    return "bg-red-500";
  };
  
  // Get text color for pill
  const getTextColor = (score: number): string => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-blue-500";
    if (score >= 40) return "text-amber-500";
    return "text-red-500";
  };

  // Get background color for pill
  const getBgColor = (score: number): string => {
    if (score >= 80) return "bg-emerald-50 dark:bg-emerald-900/20";
    if (score >= 60) return "bg-blue-50 dark:bg-blue-900/20";
    if (score >= 40) return "bg-amber-50 dark:bg-amber-900/20";
    return "bg-red-50 dark:bg-red-900/20";
  };

  // Helper function to get the text for the score description
  const getScoreDescription = (score: number): string => {
    if (score >= 80) return "Utmärkt";
    if (score >= 60) return "Bra";
    if (score >= 40) return "Godkänt";
    return "Behöver förbättras";
  };

  // Calculate average score
  const averageScore = Math.round((metrics.seo + metrics.usability + metrics.aesthetics) / 3);

  return (
    <Card 
      className={cn(
        "overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-950",
        className
      )}
      onClick={onClick}
    >
      <div className="p-5">
        {/* Header with store name and URL */}
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">{name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{url}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800">
            <ShoppingCart className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </div>
        </div>

        {/* Overall score */}
        <div className="mb-5 flex items-center space-x-4">
          <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center">
            <svg className="h-full w-full" viewBox="0 0 36 36">
              <circle 
                cx="18" 
                cy="18" 
                r="16" 
                fill="none" 
                stroke="#e5e7eb" 
                strokeWidth="3" 
                className="dark:stroke-gray-700"
              />
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke={getScoreColor(averageScore).replace('bg-', 'stroke-')}
                strokeWidth="3"
                strokeDasharray={`${(averageScore / 100) * 100} 100`}
                strokeLinecap="round"
                transform="rotate(-90 18 18)"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold">{averageScore}</span>
            </div>
          </div>
          
          <div>
            <div className="mb-1 font-medium">Totalpoäng</div>
            <div className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium",
              getBgColor(averageScore),
              getTextColor(averageScore)
            )}>
              <Check className="mr-1 h-3.5 w-3.5" />
              {getScoreDescription(averageScore)}
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="space-y-4">
          {/* SEO Score */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <div className="flex items-center">
                <Search className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">SEO</span>
              </div>
              <span className={cn(
                "rounded-full px-2 py-0.5 text-xs font-semibold",
                getBgColor(metrics.seo),
                getTextColor(metrics.seo)
              )}>
                {metrics.seo}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className={cn("h-full transition-all duration-500", getScoreColor(metrics.seo))}
                style={{ width: `${metrics.seo}%` }}
              ></div>
            </div>
          </div>

          {/* Usability */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <div className="flex items-center">
                <Zap className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Användarvänlighet</span>
              </div>
              <span className={cn(
                "rounded-full px-2 py-0.5 text-xs font-semibold",
                getBgColor(metrics.usability),
                getTextColor(metrics.usability)
              )}>
                {metrics.usability}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className={cn("h-full transition-all duration-500", getScoreColor(metrics.usability))}
                style={{ width: `${metrics.usability}%` }}
              ></div>
            </div>
          </div>

          {/* Aesthetics */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <div className="flex items-center">
                <Globe className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Estetik</span>
              </div>
              <span className={cn(
                "rounded-full px-2 py-0.5 text-xs font-semibold",
                getBgColor(metrics.aesthetics),
                getTextColor(metrics.aesthetics)
              )}>
                {metrics.aesthetics}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className={cn("h-full transition-all duration-500", getScoreColor(metrics.aesthetics))}
                style={{ width: `${metrics.aesthetics}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
