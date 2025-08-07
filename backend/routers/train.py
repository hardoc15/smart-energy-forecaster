from fastapi import APIRouter, HTTPException
import pandas as pd
from ..schemas.train import TrainRequest

router = APIRouter()

@router.post("/")
def train_model_route(req: TrainRequest):
    try:
        df = pd.DataFrame(req.data)

        if req.model == "catboost":
            from services.model_catboost import train_model
            X = df.drop(columns=[req.target_column, req.timestamp_column])
            y = df[req.target_column]
            train_model(X, y)

        elif req.model == "prophet":
            from services.model_prophet import train_model
            train_model(df, req.timestamp_column, req.target_column)

        elif req.model == "lstm":
            from services.model_lstm import train_model
            train_model(df, req.target_column)

        else:
            raise HTTPException(status_code=400, detail="Unsupported model type")

        return {"success": True, "message": f"{req.model} model trained successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
