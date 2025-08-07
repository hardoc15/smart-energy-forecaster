"use client";

import { useRef } from "react";
import { ModelResult } from "@/components/energy-forecast-dashboard";
import { Card } from "@/components/ui/card";
import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface ModelChartProps {
  model: ModelResult;
  expanded?: boolean;
}

export default function ModelChart({ model, expanded = false }: ModelChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  if (!model || !model.metrics) {
    return (
      <Card className="p-4 space-y-4 bg-red-50 border-red-200">
        <h3 className="text-lg font-semibold text-red-700">{model?.name || 'Unknown'} - Error</h3>
        <div className="bg-red-100 p-3 rounded text-sm text-red-800">
          <p><strong>Error:</strong> {(model as any)?.error || 'Model failed to generate predictions'}</p>
        </div>
      </Card>
    );
  }

  if (!model.actual || !model.predicted) {
    return (
      <div className="h-[300px] flex items-center justify-center border rounded-md bg-gray-50">
        <p className="text-gray-500">No chart data available</p>
      </div>
    );
  }
  

  const actualTrace = {
    x: model.actual.map((p) => new Date(p.timestamp)),
    y: model.actual.map((p) => p.value),
    type: "scatter",
    mode: "lines",
    name: "Actual",
    line: { color: "#111827", width: 2 }
  };

  const predictedTrace = {
    x: model.predicted.map((p) => new Date(p.timestamp)),
    y: model.predicted.map((p) => p.value),
    type: "scatter",
    mode: "lines",
    name: "Predicted",
    line: { color: getModelColor(model.name), dash: "dot", width: 2 }
  };

  const layout = {
    autosize: true,
    height: expanded ? 480 : 300,
    margin: { l: 40, r: 20, t: 40, b: 50 },
    xaxis: { title: "Time", showgrid: false },
    yaxis: { title: "Energy Consumption", showgrid: true, zeroline: false },
    legend: { orientation: "h", x: 0.5, xanchor: "center", y: -0.25 },
    title: expanded ? `${model.name} - Most Accurate Model` : undefined,
  };

  const cleanImportance = model.feature_importance?.filter(f => f.importance && f.importance > 0);

  const featureImportancePlot = cleanImportance?.length ? (
    <Plot
      data={[{
        type: 'bar',
        orientation: 'h',
        x: cleanImportance.map(f => f.importance).reverse(),
        y: cleanImportance.map(f => f.feature).reverse(),
        marker: { color: '#3b82f6' },
        name: 'Feature Importance'
      }]}
      layout={{
        height: 250,
        margin: { l: 100, r: 20, t: 30, b: 30 },
        title: 'Top Features (CatBoost)',
        xaxis: { title: 'Importance' },
        yaxis: { automargin: true }
      }}
      useResizeHandler
      style={{ width: '100%' }}
    />
  ) : null;

  return (
    <Card className="p-4 space-y-4 w-full">
      <h3 className="text-lg font-semibold">{model.name} Forecast</h3>
      <Plot data={[actualTrace, predictedTrace]} layout={layout} useResizeHandler style={{ width: "100%" }} />
      <div className="bg-gray-100 p-3 rounded text-sm">
        <p><strong>MAE:</strong> {model.metrics.mae.toFixed(4)}</p>
        <p><strong>RMSE:</strong> {model.metrics.rmse.toFixed(4)}</p>
        <p><strong>MAPE:</strong> {model.metrics.mape.toFixed(2)}%</p>
      </div>
      {featureImportancePlot}
    </Card>
  );
}

function getModelColor(name: string) {
  switch (name.toLowerCase()) {
    case "catboost":
      return "#3b82f6";
    case "prophet":
      return "#8b5cf6";
    case "lstm":
      return "#10b981";
    default:
      return "#e11d48";
  }
}
