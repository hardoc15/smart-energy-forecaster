"use client";

import { ModelResult } from "@/components/energy-forecast-dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from 'lucide-react';
import ModelChart from "@/components/model-chart";

interface BestModelHighlightProps {
  modelResults: ModelResult[];
}

export default function BestModelHighlight({ modelResults }: BestModelHighlightProps) {
  if (!modelResults || modelResults.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md bg-gray-50">
        <p className="text-gray-500">No model results available</p>
      </div>
    );
  }

  // Find the model with the lowest RMSE
  const bestModel = modelResults.reduce((best, current) => {
    return current.metrics.rmse < best.metrics.rmse ? current : best;
  }, modelResults[0]);

  // Get model-specific styling
  const getModelColor = (modelName: string) => {
    switch (modelName.toLowerCase()) {
      case "catboost":
        return "bg-blue-50 border-blue-200 text-blue-800";
      case "prophet":
        return "bg-green-50 border-green-200 text-green-800";
      case "lstm":
        return "bg-purple-50 border-purple-200 text-purple-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const modelColor = getModelColor(bestModel.name);

  return (
    <div className="space-y-6">
      <div className={`p-4 rounded-lg ${modelColor}`}>
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-full bg-white/80">
            <Trophy className="h-5 w-5 text-yellow-500" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{bestModel.name} is the Best Performing Model</h3>
            <p className="text-sm opacity-90">
              Lowest RMSE: {bestModel.metrics.rmse.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="h-[400px]">
            <ModelChart model={bestModel} />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="font-medium text-lg">Why {bestModel.name} Performed Best</h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Badge className="mb-2">RMSE: {bestModel.metrics.rmse.toFixed(2)}</Badge>
                <h4 className="font-medium">Accuracy</h4>
                <p className="text-sm text-gray-500 mt-2">
                  {getBestModelRMSEExplanation(bestModel.name, bestModel.metrics.rmse)}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Badge className="mb-2">MAE: {bestModel.metrics.mae.toFixed(2)}</Badge>
                <h4 className="font-medium">Error Distribution</h4>
                <p className="text-sm text-gray-500 mt-2">
                  {getBestModelMAEExplanation(bestModel.name, bestModel.metrics.mae)}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Badge className="mb-2">MAPE: {bestModel.metrics.mape.toFixed(2)}%</Badge>
                <h4 className="font-medium">Relative Accuracy</h4>
                <p className="text-sm text-gray-500 mt-2">
                  {getBestModelMAPEExplanation(bestModel.name, bestModel.metrics.mape)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper functions to generate model-specific explanations
function getBestModelRMSEExplanation(modelName: string, rmse: number): string {
  switch (modelName.toLowerCase()) {
    case "catboost":
      return `CatBoost's gradient boosting algorithm effectively minimized squared errors, resulting in the lowest RMSE of ${rmse.toFixed(2)}.`;
    case "prophet":
      return `Prophet's decomposition approach handled seasonality well, achieving the lowest RMSE of ${rmse.toFixed(2)}.`;
    case "lstm":
      return `LSTM's ability to capture long-term dependencies in time series data resulted in the lowest RMSE of ${rmse.toFixed(2)}.`;
    default:
      return `This model achieved the lowest RMSE of ${rmse.toFixed(2)}, indicating superior overall accuracy.`;
  }
}

function getBestModelMAEExplanation(modelName: string, mae: number): string {
  switch (modelName.toLowerCase()) {
    case "catboost":
      return `CatBoost showed consistent prediction accuracy with a low MAE of ${mae.toFixed(2)}, indicating reliable forecasts.`;
    case "prophet":
      return `Prophet's robust handling of outliers resulted in a low MAE of ${mae.toFixed(2)}, showing good overall prediction stability.`;
    case "lstm":
      return `LSTM's neural network architecture minimized absolute errors to ${mae.toFixed(2)}, showing strong prediction consistency.`;
    default:
      return `This model achieved an MAE of ${mae.toFixed(2)}, showing good prediction consistency across the dataset.`;
  }
}

function getBestModelMAPEExplanation(modelName: string, mape: number): string {
  switch (modelName.toLowerCase()) {
    case "catboost":
      return `CatBoost achieved a low percentage error of ${mape.toFixed(2)}%, making it reliable across different magnitudes of energy consumption.`;
    case "prophet":
      return `Prophet's ${mape.toFixed(2)}% MAPE indicates strong relative accuracy, especially during seasonal transitions in energy usage.`;
    case "lstm":
      return `LSTM's ${mape.toFixed(2)}% MAPE demonstrates its ability to adapt to varying scales in the energy consumption data.`;
    default:
      return `This model achieved a MAPE of ${mape.toFixed(2)}%, indicating good relative accuracy across different consumption levels.`;
  }
}
