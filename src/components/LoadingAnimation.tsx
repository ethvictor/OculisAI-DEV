
import { Progress } from "@/components/ui/progress";
import React, { useState, useEffect } from "react";
import { Eye, Timer } from "lucide-react";

interface LoadingAnimationProps {
  isVisible: boolean;
  phase: string;
  startTime: number | null;
  progressValue?: number;
}

export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  isVisible,
  phase,
  startTime,
  progressValue = 5,
}) => {
  const [progress, setProgress] = useState(progressValue);

  useEffect(() => {
    // Only increment progress when visible and not at 100%
    if (isVisible && progress < 100) {
      const timer = setTimeout(() => {
        setProgress((prevProgress) => {
          // Increment faster initially, then slow down
          const increment = prevProgress < 30 ? 1.5 : prevProgress < 70 ? 0.8 : 0.3;
          return Math.min(prevProgress + increment, 99);
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible, progress]);

  // Reset progress when animation becomes visible
  useEffect(() => {
    if (isVisible) {
      setProgress(5);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="w-[400px] max-w-[90vw] bg-gradient-to-br from-gray-900 to-black p-8 rounded-3xl shadow-2xl flex flex-col items-center space-y-6 border border-white/10">
        <div className="relative mb-2">
          <div className="rounded-full bg-black/40 p-5 backdrop-blur-sm border border-white/20">
            <Eye className="w-14 h-14 text-white/90" />
          </div>
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 blur-md -z-10 opacity-70 animate-pulse"></div>
        </div>
        
        <h3 className="text-2xl font-medium text-white tracking-tight">{phase || "Analyserar..."}</h3>
        <p className="text-white/70 text-center text-sm max-w-xs">
          {phase || "Analyserar din webbsidas prestanda och användarvänlighet..."}
        </p>
        
        <div className="w-full space-y-3">
          <Progress value={progress} className="h-3 bg-white/10 rounded-full" indicatorClassName="bg-gradient-to-r from-purple-500 to-indigo-500" />
          <div className="flex justify-between text-xs text-white/70">
            <span>{progress.toFixed(0)}% klart</span>
            {startTime && (
              <div className="flex items-center">
                <Timer className="h-3 w-3 mr-1" />
                <span>{((performance.now() - startTime) / 1000).toFixed(1)}s</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
