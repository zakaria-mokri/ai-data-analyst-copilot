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


def correlation(
    df: pd.DataFrame,
    column_x: str,
    column_y: str,
) -> dict:
    if column_x not in df.columns:
        raise ValueError(f"Column '{column_x}' was not found.")

    if column_y not in df.columns:
        raise ValueError(f"Column '{column_y}' was not found.")

    if not pd.api.types.is_numeric_dtype(df[column_x]):
        raise ValueError(f"Column '{column_x}' is not numeric.")

    if not pd.api.types.is_numeric_dtype(df[column_y]):
        raise ValueError(f"Column '{column_y}' is not numeric.")

    clean_df = df[[column_x, column_y]].dropna()

    if len(clean_df) < 2:
        raise ValueError("Not enough data to calculate correlation.")

    value = clean_df[column_x].corr(clean_df[column_y])

    return {
        "column_x": column_x,
        "column_y": column_y,
        "correlation": float(value),
        "rows_used": len(clean_df),
    }