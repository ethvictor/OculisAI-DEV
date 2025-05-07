
import React from "react";
import { Card } from "@/components/ui/card";
import { Search, Zap, Globe, ShoppingCart } from "lucide-react";
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
  // Helper function to get the appropriate color based on the score
  const getScoreColor = (score: number): string => {
    if (score >= 70) return "bg-green-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  // Helper function to get the text for the score description
  const getScoreDescription = (score: number): string => {
    if (score >= 70) return "Bra";
    if (score >= 50) return "Godkänt";
    return "Behöver förbättras";
  };

  return (
    <Card 
      className={cn(
        "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300 cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div className="p-4 pb-6">
        {/* Store header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{url}</p>
          </div>
          <ShoppingCart className="h-5 w-5 text-blue-500 dark:text-blue-400" />
        </div>

        {/* Metrics */}
        <div className="space-y-4">
          {/* SEO Score */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">SEO Score</span>
              </div>
              <span className="text-sm font-medium">{metrics.seo}%</span>
            </div>
            <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getScoreColor(metrics.seo)}`} 
                style={{ width: `${metrics.seo}%` }}
              ></div>
            </div>
          </div>

          {/* Usability */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Användarvänlighet</span>
              </div>
              <span className="text-sm font-medium">{metrics.usability}%</span>
            </div>
            <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getScoreColor(metrics.usability)}`} 
                style={{ width: `${metrics.usability}%` }}
              ></div>
            </div>
          </div>

          {/* Aesthetics */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Estetik</span>
              </div>
              <span className="text-sm font-medium">{metrics.aesthetics}%</span>
            </div>
            <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getScoreColor(metrics.aesthetics)}`} 
                style={{ width: `${metrics.aesthetics}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
