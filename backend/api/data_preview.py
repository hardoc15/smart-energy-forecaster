from fastapi import APIRouter, Query
from ..utils.data_loader import load_uploaded_data

router = APIRouter()

@router.get("/data_preview")
def data_preview(filename: str = Query(...), n_rows: int = 10):
    df = load_uploaded_data(filename)
    return df.head(n_rows).to_dict(orient="records")
