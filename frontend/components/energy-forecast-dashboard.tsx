"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import FileUploader from "@/components/file-uploader";
import DataPreview from "@/components/data-preview";
import ModelChart from "@/components/model-chart";
import { uploadFile } from "@/lib/api";

export type DataPoint = { timestamp: string; value: number };
export type ModelResult = {
  name?: string;
  actual: DataPoint[];
  predicted: DataPoint[];
  metrics: {
    mae: number;
    rmse: number;
    mape: number;
  } | null;
  feature_importance?: { feature: string; importance: number }[];
  error?: string;
};

export default function EnergyForecastDashboard() {
  const [filename, setFilename] = useState<string | null>(null);
  const [dataPreview, setDataPreview] = useState<any[]>([]);
  const [forecastResults, setForecastResults] = useState<Record<string, ModelResult>>({});
  const [loading, setLoading] = useState(false);
  const [horizon, setHorizon] = useState<number>(24);

  const handleUpload = async (file: File) => {
    const response = await uploadFile(file);
    setFilename(response.filename);

    const previewRes = await fetch(`http://localhost:8000/data_preview?filename=${response.filename}`);
    const previewJson = await previewRes.json();
    setDataPreview(previewJson);
  };

  const handleForecast = async () => {
    if (!filename) return;
    setLoading(true);
    const res = await fetch(`http://localhost:8000/forecast_all?filename=${filename}&horizon=${horizon}`);
    const json = await res.json();
    const parsed = Object.fromEntries(Object.entries(json).map(([name, result]) => {
      const toPoints = (arr: number[], times: any[]) => arr.map((v, i) => ({ timestamp: times[i], value: v }));
      if (result.error) return [name, { name, actual: [], predicted: [], metrics: null, error: result.error }];
      return [name, {
        name,
        actual: toPoints(result.actual, result.timestamps),
        predicted: toPoints(result.predicted, result.timestamps),
        metrics: result.metrics,
        feature_importance: result.feature_importance || []
      }];
    }));
    setForecastResults(parsed);
    setLoading(false);
  };

  const modelsWithValidMetrics = Object.entries(forecastResults).filter(([_, model]) => 
    model.metrics && model.metrics.rmse !== null && model.metrics.rmse !== undefined
  );

  const bestModelKey = modelsWithValidMetrics.length > 0 
    ? modelsWithValidMetrics.reduce((best, curr) =>
        curr[1].metrics.rmse < best[1].metrics.rmse ? curr : best
      )[0]
    : Object.keys(forecastResults)[0] || "";

  const bestModel = forecastResults[bestModelKey];

  return (
    <div className="space-y-8">
      <FileUploader onFileUpload={handleUpload} isLoading={loading} />

      {dataPreview.length > 0 && <DataPreview filename={filename!} />}

      {filename && (
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-3">
            <label htmlFor="horizon" className="text-sm font-medium">Forecast Horizon (hours):</label>
            <select
              id="horizon"
              className="border rounded px-2 py-1 text-sm"
              value={horizon}
              onChange={(e) => setHorizon(parseInt(e.target.value))}
            >
              {[6, 12, 24, 48].map((h) => (
                <option key={h} value={h}>{h} hours</option>
              ))}
            </select>
          </div>
          <Button onClick={handleForecast} disabled={loading}>
            {loading ? "Predicting..." : "Predict Data"}
          </Button>
        </div>
      )}

      {Object.keys(forecastResults).length > 0 && (
        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(forecastResults).map(([key, result]) => (
              <div key={key} className="max-w-sm w-full mx-auto">
                <ModelChart model={{ ...result, name: key }} />
              </div>
            ))}
          </div>

          {bestModel && bestModel.metrics && (
            <div className="border rounded-lg p-6 bg-white shadow space-y-6 max-w-6xl mx-auto w-full">
              <h2 className="text-2xl font-bold text-green-700">
                🏆 Best Model: {bestModelKey}
              </h2>
              <div className="w-full">
                <ModelChart model={{ ...bestModel, name: bestModelKey }} expanded />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
