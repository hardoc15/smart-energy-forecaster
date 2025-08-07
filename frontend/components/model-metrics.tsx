"use client";

import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from 'lucide-react';

interface ModelMetricsProps {
  metrics: {
    mae: number;
    rmse: number;
    mape: number;
  };
}

export default function ModelMetrics({ metrics }: ModelMetricsProps) {
  // Helper function to normalize metrics for progress bars
  // Lower values are better for all these metrics
  const normalizeMetric = (value: number, max: number) => {
    // Invert the scale since lower values are better
    return 100 - Math.min((value / max) * 100, 100);
  };

  // Arbitrary max values for visualization purposes
  // These would ideally be based on domain knowledge or dataset characteristics
  const maxMAE = 100;
  const maxRMSE = 150;
  const maxMAPE = 30; // 30%

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="font-medium">MAE</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="ml-1">
                    <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Mean Absolute Error: Average absolute difference between predicted and actual values.
                    Lower is better.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <span className="text-sm font-medium">{metrics.mae.toFixed(2)}</span>
        </div>
        <Progress value={normalizeMetric(metrics.mae, maxMAE)} className="h-2" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="font-medium">RMSE</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="ml-1">
                    <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Root Mean Square Error: Square root of the average squared differences.
                    More sensitive to large errors. Lower is better.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <span className="text-sm font-medium">{metrics.rmse.toFixed(2)}</span>
        </div>
        <Progress value={normalizeMetric(metrics.rmse, maxRMSE)} className="h-2" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="font-medium">MAPE</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="ml-1">
                    <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Mean Absolute Percentage Error: Average percentage difference between predicted and actual values.
                    Lower is better.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <span className="text-sm font-medium">{metrics.mape.toFixed(2)}%</span>
        </div>
        <Progress value={normalizeMetric(metrics.mape, maxMAPE)} className="h-2" />
      </div>

      <div className="pt-4 border-t">
        <p className="text-sm text-gray-500">
          Lower values indicate better model performance. RMSE is the primary metric used for model comparison.
        </p>
      </div>
    </div>
  );
}
