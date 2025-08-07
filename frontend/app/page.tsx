import { Suspense } from "react";
import EnergyForecastDashboard from "@/components/energy-forecast-dashboard";
import { Loader2 } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">⚡ Smart Energy Forecaster</h1>
          <p className="text-gray-600 mt-2">
            Upload your energy consumption data and get instant forecasts using advanced models
          </p>
        </header>
        
        <Suspense fallback={
          <div className="flex items-center justify-center h-[600px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Loading dashboard...</span>
          </div>
        }>
          <EnergyForecastDashboard />
        </Suspense>
      </div>
    </main>
  );
}
