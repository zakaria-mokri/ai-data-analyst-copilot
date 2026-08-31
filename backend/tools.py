import pandas as pd


def numeric_summary(df: pd.DataFrame, column: str) -> dict:
    if column not in df.columns:
        raise ValueError(f"Column '{column}' was not found.")

    if not pd.api.types.is_numeric_dtype(df[column]):
        raise ValueError(f"Column '{column}' is not numeric.")

    series = df[column].dropna()

    return {
        "count": int(series.count()),
        "min": float(series.min()),
        "max": float(series.max()),
        "mean": float(series.mean()),
        "median": float(series.median()),
    }


def top_values(df: pd.DataFrame, column: str) -> list[dict]:
    if column not in df.columns:
        raise ValueError(f"Column '{column}' was not found.")

    counts = df[column].value_counts().head(10)

    return [
        {
            "value": str(value),
            "count": int(count),
        }
        for value, count in counts.items()
    ]