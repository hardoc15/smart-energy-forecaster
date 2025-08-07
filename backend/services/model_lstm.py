import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error
import joblib
import os

MODEL_PATH = "models/lstm_model.h5"
SCALER_PATH = "models/lstm_scaler.pkl"

def train_model(df, timestamp_col="timestamp", target_col="energy_kwh"):
    df = df.copy()
    df[timestamp_col] = pd.to_datetime(df[timestamp_col])
    df.sort_values(timestamp_col, inplace=True)
    
    # Clean and convert target column to numeric, handling any string values
    df[target_col] = pd.to_numeric(df[target_col], errors='coerce')
    df = df.dropna(subset=[target_col])  # Remove any rows where conversion failed
    
    if len(df) == 0:
        raise ValueError(f"No valid numeric data found in column '{target_col}'")

    values = df[target_col].values.reshape(-1, 1)
    scaler = MinMaxScaler()
    scaled = scaler.fit_transform(values)

    X, y = [], []
    window_size = 24
    for i in range(len(scaled) - window_size):
        X.append(scaled[i:i + window_size])
        y.append(scaled[i + window_size])
    X, y = np.array(X), np.array(y)

    model = tf.keras.Sequential([
        tf.keras.layers.LSTM(64, return_sequences=True, input_shape=(window_size, 1)),
        tf.keras.layers.LSTM(32),
        tf.keras.layers.Dense(1)
    ])
    model.compile(optimizer="adam", loss="mse")
    model.fit(X, y, epochs=10, batch_size=16, verbose=0)

    os.makedirs("models", exist_ok=True)
    model.save(MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)

def load_model():
    base_dir = os.path.dirname(__file__)
    model = tf.keras.models.load_model(os.path.join(base_dir, "../models/lstm_model.h5"), compile=False)
    scaler = joblib.load(os.path.join(base_dir, "../models/lstm_scaler.pkl"))
    return model, scaler

def forecast(df: pd.DataFrame, horizon: int = 24, timestamp_col="timestamp", target_col="energy_kwh"):
    df = df.copy()
    df[timestamp_col] = pd.to_datetime(df[timestamp_col])
    df.sort_values(timestamp_col, inplace=True)

    # Clean and convert target column to numeric, handling any string values
    df[target_col] = pd.to_numeric(df[target_col], errors='coerce')
    df = df.dropna(subset=[target_col])  # Remove any rows where conversion failed
    
    if len(df) == 0:
        raise ValueError(f"No valid numeric data found in column '{target_col}'")

    model, scaler = load_model()

    values = df[target_col].values.reshape(-1, 1)
    scaled = scaler.transform(values)

    window_size = 24
    if len(scaled) < window_size:
        raise ValueError(f"Not enough data points. Need at least {window_size}, got {len(scaled)}")
        
    last_window = scaled[-window_size:].reshape(1, window_size, 1)

    preds = []
    for _ in range(horizon):
        pred = model.predict(last_window, verbose=0)
        preds.append(pred[0])
        last_window = np.append(last_window[:, 1:, :], pred.reshape(1, 1, 1), axis=1)

    preds = scaler.inverse_transform(np.array(preds)).flatten()
    timestamps = pd.date_range(start=df[timestamp_col].iloc[-1], periods=horizon+1, freq="H")[1:]
    
    # Get actual values, ensuring we have enough data
    actual_data = df[target_col].iloc[-horizon:].values if len(df) >= horizon else df[target_col].values
    
    return (
        preds[:len(actual_data)].tolist(),
        timestamps.strftime("%Y-%m-%d %H:%M:%S").tolist(),
        actual_data.astype(float).tolist()
    )
