from pydantic import BaseModel
from typing import List, Dict, Any

class CleanRequest(BaseModel):
    data: List[Dict[str, Any]]
    drop_columns: List[str] = []
    fillna_method: str = "mean"
    filters: Dict[str, Dict[str, float]] = {}
