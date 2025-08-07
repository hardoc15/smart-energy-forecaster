import pandas as pd
from typing import List, Dict, Optional

class DataCleaner:
    def __init__(
        self,
        drop_columns: Optional[List[str]] = None,
        fillna_method: str = "mean",  
        filters: Optional[Dict[str, Dict[str, float]]] = None 
    ):
        self.drop_columns = drop_columns or []
        self.fillna_method = fillna_method
        self.filters = filters or {}

    def fit(self, df: pd.DataFrame):
        return self  

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()

        df.drop(columns=self.drop_columns, errors='ignore', inplace=True)

        for col in df.select_dtypes(include='number').columns:
            if df[col].isnull().any():
                if self.fillna_method == "mean":
                    df[col].fillna(df[col].mean(), inplace=True)
                elif self.fillna_method == "median":
                    df[col].fillna(df[col].median(), inplace=True)
                elif self.fillna_method == "mode":
                    df[col].fillna(df[col].mode().iloc[0], inplace=True)
                elif self.fillna_method == "zero":
                    df[col].fillna(0, inplace=True)

        for col, bounds in self.filters.items():
            if 'min' in bounds:
                df = df[df[col] >= bounds['min']]
            if 'max' in bounds:
                df = df[df[col] <= bounds['max']]

        return df
