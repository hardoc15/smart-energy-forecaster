from fastapi import APIRouter, Query
from ..services import model_catboost, model_prophet, model_lstm
from ..utils.data_loader import load_uploaded_data
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import numpy as np

router = APIRouter()

def calculate_metrics(y_true, y_pred):
    mae = mean_absolute_error(y_true, y_pred)
    mse = mean_squared_error(y_true, y_pred)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_true, y_pred)
    mape = np.mean(np.abs((np.array(y_true) - np.array(y_pred)) / np.array(y_true))) * 100
    return {
        "mae": round(mae, 4),
        "rmse": round(rmse, 4),
        "r2": round(r2, 4),
        "mape": round(mape, 2)
    }

@router.get("/forecast_all")
def forecast_all(filename: str = Query(...), horizon: int = Query(24)):
    df = load_uploaded_data(filename)
    response = {}

    for model_name, model_service in {
        "catboost": model_catboost,
        "prophet": model_prophet,
        "lstm": model_lstm
    }.items():
        try:
            if model_name == "catboost":
                preds, timestamps, actuals, importance = model_service.forecast(df, horizon=horizon)
            else:
                preds, timestamps, actuals = model_service.forecast(df, horizon=horizon)
                importance = None

            metrics = calculate_metrics(actuals, preds)
            response[model_name] = {
                "timestamps": timestamps,
                "actual": actuals,
                "predicted": preds,
                "metrics": metrics,
                "feature_importance": importance
            }
        except Exception as e:
            response[model_name] = {
                "error": str(e),
                "timestamps": [],
                "actual": [],
                "predicted": [],
                "metrics": None,
                "feature_importance": None
            }

    return response
