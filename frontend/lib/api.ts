import { ModelResult } from "@/components/energy-forecast-dashboard";

export async function uploadFile(file: File): Promise<{ filename: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("http://localhost:8000/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Upload failed");
  }

  return await res.json(); // { filename }
}



export async function getDataPreview(): Promise<any[]> {

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockDataPreview);
    }, 1000);
  });
}

export async function runForecastAll(): Promise<ModelResult[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockModelResults);
    }, 2000);
  });
}

const mockDataPreview = [
  { timestamp: "2023-01-01 00:00", consumption: 45.2, temperature: 12.5, is_weekend: false },
  { timestamp: "2023-01-01 01:00", consumption: 42.8, temperature: 11.8, is_weekend: false },
  { timestamp: "2023-01-01 02:00", consumption: 40.1, temperature: 11.2, is_weekend: false },
  { timestamp: "2023-01-01 03:00", consumption: 38.5, temperature: 10.9, is_weekend: false },
  { timestamp: "2023-01-01 04:00", consumption: 37.2, temperature: 10.5, is_weekend: false },
  { timestamp: "2023-01-01 05:00", consumption: 39.8, temperature: 10.2, is_weekend: false },
  { timestamp: "2023-01-01 06:00", consumption: 48.3, temperature: 10.8, is_weekend: false },
  { timestamp: "2023-01-01 07:00", consumption: 62.1, temperature: 11.5, is_weekend: false },
  { timestamp: "2023-01-01 08:00", consumption: 75.6, temperature: 12.3, is_weekend: false },
  { timestamp: "2023-01-01 09:00", consumption: 82.4, temperature: 13.1, is_weekend: false },
  { timestamp: "2023-01-01 10:00", consumption: 85.7, temperature: 14.2, is_weekend: false },
  { timestamp: "2023-01-01 11:00", consumption: 87.9, temperature: 15.0, is_weekend: false },
];

function generateTimestamps(days: number): string[] {
  const timestamps: string[] = [];
  const now = new Date();
  
  for (let day = days; day >= 0; day--) {
    for (let hour = 0; hour < 24; hour++) {
      const date = new Date(now);
      date.setDate(now.getDate() - day);
      date.setHours(hour, 0, 0, 0);
      timestamps.push(date.toISOString());
    }
  }
  
  return timestamps;
}

function generateDataPoints(timestamps: string[], baseValue: number, volatility: number): { timestamp: string; value: number }[] {
  return timestamps.map((timestamp, index) => {
    const hour = new Date(timestamp).getHours();
    const dayOfWeek = new Date(timestamp).getDay();
    
    let hourlyFactor = 1.0;
    if (hour >= 8 && hour <= 20) {
      hourlyFactor = 1.3 + (Math.sin((hour - 8) * Math.PI / 12) * 0.3);
    } else {
      hourlyFactor = 0.7 + (Math.sin((hour) * Math.PI / 8) * 0.2);
    }
    
    const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.8 : 1.0;
    
    const noise = (Math.random() - 0.5) * volatility;
    
    const value = baseValue * hourlyFactor * weekendFactor + noise;
    
    return {
      timestamp,
      value: Math.max(0, value)
    };
  });
}

// Generate mock model results
const timestamps = generateTimestamps(30);
const actualData = generateDataPoints(timestamps, 70, 10);

// Mock model results with different accuracy levels
const mockModelResults: ModelResult[] = [
  {
    name: "CatBoost",
    actual: actualData,
    predicted: generateDataPoints(timestamps, 70, 15).map((point, i) => ({
      timestamp: point.timestamp,
      value: actualData[i].value * (1 + (Math.random() * 0.1 - 0.05)) 
    })),
    metrics: {
      mae: 3.2,
      rmse: 4.1,
      mape: 4.8
    }
  },
  {
    name: "Prophet",
    actual: actualData,
    predicted: generateDataPoints(timestamps, 70, 15).map((point, i) => ({
      timestamp: point.timestamp,
      value: actualData[i].value * (1 + (Math.random() * 0.15 - 0.075))
    })),
    metrics: {
      mae: 4.5,
      rmse: 5.8,
      mape: 6.2
    }
  },
  {
    name: "LSTM",
    actual: actualData,
    predicted: generateDataPoints(timestamps, 70, 15).map((point, i) => ({
      timestamp: point.timestamp,
      value: actualData[i].value * (1 + (Math.random() * 0.12 - 0.06)) // Within 6% of actual
    })),
    metrics: {
      mae: 3.8,
      rmse: 4.9,
      mape: 5.5
    }
  }
];
