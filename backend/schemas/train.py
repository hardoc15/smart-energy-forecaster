from pydantic import BaseModel
from typing import List, Dict, Any

class TrainRequest(BaseModel):
    data: List[Dict[str, Any]]
    model: str = "catboost"
    target_column: str
    timestamp_column: str
