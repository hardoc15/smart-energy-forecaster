from fastapi import APIRouter, HTTPException
from ..schemas.metrics import MetricsRequest
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import numpy as np

router = APIRouter()

@router.post("/")
def compute_metrics(req: MetricsRequest):
    try:
        y_true = req.y_true
        y_pred = req.y_pred

        mae = mean_absolute_error(y_true, y_pred)
        rmse = mean_squared_error(y_true, y_pred, squared=False)
        r2 = r2_score(y_true, y_pred)
        mape = np.mean(np.abs((np.array(y_true) - np.array(y_pred)) / np.array(y_true))) * 100

        return {
            "MAE": round(mae, 4),
            "RMSE": round(rmse, 4),
            "R2": round(r2, 4),
            "MAPE (%)": round(mape, 2)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
