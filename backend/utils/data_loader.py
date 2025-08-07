import pandas as pd

def load_uploaded_data(filename: str) -> pd.DataFrame:
    filepath = f"uploads/{filename}"
    df = pd.read_csv(filepath)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    return df
