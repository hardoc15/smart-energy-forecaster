
import pandas as pd
from typing import List, Optional

class FeatureEngineer:
    def __init__(
        self,
        target_column: str,
        timestamp_column: str,
        lags: Optional[List[int]] = None,
        rolling_windows: Optional[List[int]] = None
    ):
        self.target_column = target_column
        self.timestamp_column = timestamp_column
        self.lags = lags or [1, 2, 3, 6, 12, 24]
        self.rolling_windows = rolling_windows or [3, 6, 12]

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        df[self.timestamp_column] = pd.to_datetime(df[self.timestamp_column])
        df = df.sort_values(by=self.timestamp_column)

        for lag in self.lags:
            df[f"{self.target_column}_lag_{lag}"] = df[self.target_column].shift(lag)

        for window in self.rolling_windows:
            df[f"{self.target_column}_roll_mean_{window}"] = (
                df[self.target_column].shift(1).rolling(window=window).mean()
            )

        df["hour"] = df[self.timestamp_column].dt.hour
        df["dayofweek"] = df[self.timestamp_column].dt.dayofweek
        df["month"] = df[self.timestamp_column].dt.month
        df["day"] = df[self.timestamp_column].dt.day
        df = df.dropna()

        return df
