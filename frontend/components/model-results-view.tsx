"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ModelResult } from "@/components/energy-forecast-dashboard";
import ModelChart from "@/components/model-chart";
import ModelMetrics from "@/components/model-metrics";

interface ModelResultsViewProps {
  modelResults: ModelResult[];
}

export default function ModelResultsView({ modelResults }: ModelResultsViewProps) {
  const [activeModel, setActiveModel] = useState<string>(
    modelResults.length > 0 ? modelResults[0].name : ""
  );

  if (!modelResults || modelResults.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md bg-gray-50">
        <p className="text-gray-500">No model results available</p>
      </div>
    );
  }

  const getModelColor = (modelName: string) => {
    switch (modelName.toLowerCase()) {
      case "catboost":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "prophet":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "lstm":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeModel} onValueChange={setActiveModel}>
        <TabsList className="grid grid-cols-3 mb-4">
          {modelResults.map((model) => (
            <TabsTrigger
              key={model.name}
              value={model.name}
              className={`${getModelColor(model.name)}`}
            >
              {model.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {modelResults.map((model) => (
          <TabsContent key={model.name} value={model.name}>
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{model.name} Forecast</span>
                    <Badge variant="outline">
                      {model.actual.length} data points
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ModelChart model={model} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <ModelMetrics metrics={model.metrics} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
