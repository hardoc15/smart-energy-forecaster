from pydantic import BaseModel
from typing import List

class MetricsRequest(BaseModel):
    y_true: List[float]
    y_pred: List[float]
