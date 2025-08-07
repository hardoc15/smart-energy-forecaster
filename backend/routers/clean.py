from fastapi import APIRouter, HTTPException
import pandas as pd
from ..schemas.clean import CleanRequest
from ..services.cleaner import DataCleaner

router = APIRouter()

@router.post("/")
def clean_data(req: CleanRequest):
    try:
        df = pd.DataFrame(req.data)

        cleaner = DataCleaner(
            drop_columns=req.drop_columns,
            fillna_method=req.fillna_method,
            filters=req.filters
        )
        df_clean = cleaner.fit(df).transform(df)

        return {
            "columns": df_clean.columns.tolist(),
            "rows": df_clean.head(100).to_dict(orient="records")
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
