
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-[400px] max-w-[90vw] bg-gradient-to-br from-purple-400 to-indigo-500 p-8 rounded-xl shadow-xl flex flex-col items-center space-y-4">
        <div className="relative mb-2">
          <div className="rounded-full bg-purple-200/20 p-4 backdrop-blur-sm">
            <Eye className="w-12 h-12 text-white/90" />
          </div>
        </div>
        
        <h3 className="text-xl font-medium text-white">{phase || "Skrapar webbsidan..."}</h3>
        <p className="text-purple-100/80 text-center text-sm">
          {phase || "Skrapar webbsidan..."}
        </p>
        
        <div className="w-full space-y-2">
          <Progress value={progress} className="h-2 bg-white/20" indicatorClassName="bg-white" />
          <div className="flex justify-between text-xs text-purple-100">
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
