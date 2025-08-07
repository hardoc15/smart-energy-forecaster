from fastapi import APIRouter, HTTPException
import pandas as pd
from ..schemas.forecast import ForecastRequest
from ..services.cleaner import DataCleaner
from ..services.feature_engineering import FeatureEngineer
from ..services.model_catboost import load_model, predict

router = APIRouter()

@router.post("/")
def run_forecast(req: ForecastRequest):
    try:
        df = pd.DataFrame(req.data)
        cleaner = DataCleaner(
            drop_columns=req.drop_columns,
            fillna_method=req.fillna_method,
            filters=req.filters
        )
        df_clean = cleaner.fit(df).transform(df)

        fe = FeatureEngineer(
            target_column=req.target_column,
            timestamp_column=req.timestamp_column
        )
        df_feat = fe.transform(df_clean)

        X = df_feat.drop(columns=[req.target_column, req.timestamp_column])
        if req.model == "catboost":
            from services.model_catboost import load_model, predict
            model = load_model()
            y_pred = predict(model, X)

        elif req.model == "lstm":
            from services.model_lstm import load_model, load_scaler, predict
            model = load_model()
            scaler = load_scaler()
            values = df_clean[req.target_column].values.reshape(-1, 1)
            y_pred = predict(model, scaler, values, steps=len(X))


        else:
            raise HTTPException(status_code=400, detail="Unsupported model selected")

        return {"predictions": y_pred.tolist()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
