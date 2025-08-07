import pandas as pd
import numpy as np
from catboost import CatBoostRegressor
import os

MODEL_PATH = "models/catboost_model.cbm"

def train_model(X_train, y_train, X_val=None, y_val=None, save_path=MODEL_PATH):
    model = CatBoostRegressor(
        iterations=1000,
        depth=8,
        learning_rate=0.05,
        loss_function='RMSE',
        verbose=0,
        random_seed=42
    )
    model.fit(X_train, y_train, eval_set=(X_val, y_val) if X_val is not None else None)
    model.save_model(save_path)
    return model

def load_model():
    path = os.path.join(os.path.dirname(__file__), "../models/catboost_model.cbm")
    if not os.path.exists(path):
        raise FileNotFoundError(f"Model not found at {path}")
    model = CatBoostRegressor()
    model.load_model(path)
    return model

def predict(model, X_test):
    return model.predict(X_test)

def forecast(df: pd.DataFrame, horizon: int = 24):
    df = df.copy()
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df.sort_values("timestamp", inplace=True)
    df.reset_index(drop=True, inplace=True)

    df["hour"] = df["timestamp"].dt.hour
    df["day_of_week"] = df["timestamp"].dt.dayofweek
    df["is_weekend"] = df["day_of_week"] >= 5

    df["lag_1"] = df["energy_kwh"].shift(1)
    df["lag_24"] = df["energy_kwh"].shift(24)
    df["rolling_mean_3"] = df["energy_kwh"].rolling(window=3).mean().shift(1)
    df["rolling_std_3"] = df["energy_kwh"].rolling(window=3).std().shift(1)

    df.dropna(inplace=True)

    features = ["hour", "day_of_week", "is_weekend", "lag_1", "lag_24", "rolling_mean_3", "rolling_std_3"]
    target = "energy_kwh"

    model = load_model()
    preds = model.predict(df[features])

    actual = df[target].values
    timestamps = df["timestamp"].dt.strftime("%Y-%m-%d %H:%M:%S").tolist()

    importance = sorted(zip(model.feature_names_, model.get_feature_importance()), key=lambda x: -x[1])
    importance = [{"feature": f, "importance": float(i)} for f, i in importance if i > 0]


    return preds[-horizon:].tolist(), timestamps[-horizon:], actual[-horizon:].tolist(), importance
