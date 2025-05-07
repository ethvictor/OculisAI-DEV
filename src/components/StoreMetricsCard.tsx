
import React from "react";
import { Card } from "@/components/ui/card";
import { Search, Globe, Zap } from "lucide-react";
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

  return (
    <Card 
      className={cn(
        "overflow-hidden backdrop-blur-xl bg-white/95 border border-[#e8e8ed] rounded-2xl p-6 transition-all duration-300 hover:shadow-lg cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold text-[#1d1d1f]">{name}</h3>
            <p className="text-sm text-[#6e6e73] mt-1">{url}</p>
          </div>
          <div className="rounded-full bg-blue-50 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Search className="h-4 w-4 mr-2 text-[#0066cc]" />
                <span className="text-sm font-medium text-[#1d1d1f]">SEO Score</span>
              </div>
              <span className="text-sm font-medium">{metrics.seo}%</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getScoreColor(metrics.seo)}`}
                style={{ width: `${metrics.seo}%` }}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Zap className="h-4 w-4 mr-2 text-[#0066cc]" />
                <span className="text-sm font-medium text-[#1d1d1f]">Användarvänlighet</span>
              </div>
              <span className="text-sm font-medium">{metrics.usability}%</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getScoreColor(metrics.usability)}`}
                style={{ width: `${metrics.usability}%` }}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Globe className="h-4 w-4 mr-2 text-[#0066cc]" />
                <span className="text-sm font-medium text-[#1d1d1f]">Estetik</span>
              </div>
              <span className="text-sm font-medium">{metrics.aesthetics}%</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getScoreColor(metrics.aesthetics)}`}
                style={{ width: `${metrics.aesthetics}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
