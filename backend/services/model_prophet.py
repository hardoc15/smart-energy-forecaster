import pandas as pd
import os
import pickle
from prophet import Prophet
from sklearn.metrics import mean_absolute_error, mean_squared_error

MODEL_PATH = "models/prophet_model.pkl"

def train_model(df, timestamp_col="timestamp", target_col="energy_kwh", save_path=MODEL_PATH):
    df = df.copy()
    df["ds"] = pd.to_datetime(df[timestamp_col])
    
    # Clean and convert target column to numeric, handling any string values
    df["y"] = pd.to_numeric(df[target_col], errors='coerce')
    df = df.dropna(subset=["y"])  # Remove any rows where conversion failed
    
    if len(df) == 0:
        raise ValueError(f"No valid numeric data found in column '{target_col}'")

    model = Prophet()
    model.fit(df[["ds", "y"]])

    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    with open(save_path, "wb") as f:
        pickle.dump(model, f)

def load_model():
    base_dir = os.path.dirname(__file__)
    path = os.path.join(base_dir, "../models/prophet_model.pkl")
    with open(path, "rb") as f:
        return pickle.load(f)

def forecast(df: pd.DataFrame, horizon: int = 24, timestamp_col="timestamp", target_col="energy_kwh"):
    df = df.copy()
    df["ds"] = pd.to_datetime(df[timestamp_col])
    
    # Clean and convert target column to numeric, handling any string values
    df["y"] = pd.to_numeric(df[target_col], errors='coerce')
    df = df.dropna(subset=["y"])  # Remove any rows where conversion failed
    
    if len(df) == 0:
        raise ValueError(f"No valid numeric data found in column '{target_col}'")
    
    df.sort_values("ds", inplace=True)

    model = load_model()

    future = pd.date_range(start=df["ds"].iloc[-1], periods=horizon + 1, freq="H")[1:]
    future_df = pd.DataFrame({"ds": future})

    forecast_df = model.predict(future_df)
    y_pred = forecast_df["yhat"].values.astype(float)
    
    # Get actual values, ensuring we have enough data and they're numeric
    actual_data = df["y"].iloc[-horizon:].values if len(df) >= horizon else df["y"].values
    y_true = actual_data.astype(float)

    return (
        y_pred[:len(y_true)].tolist(),
        future.strftime("%Y-%m-%d %H:%M:%S").tolist(),
        y_true.tolist()
    )
