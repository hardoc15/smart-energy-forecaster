from pydantic import BaseModel
from typing import List, Dict

class ForecastRequest(BaseModel):
    data: List[Dict]
    model: str = "catboost"
    timestamp_column: str
    target_column: str
    drop_columns: List[str] = []
    fillna_method: str = "mean"
    filters: Dict[str, Dict[str, float]] = {}
