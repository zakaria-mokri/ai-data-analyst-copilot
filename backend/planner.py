from typing import Optional


def choose_tool(question: str) -> str:
    question_lower = question.lower()

    if any(
        word in question_lower
        for word in ["correlation", "correlate", "relationship"]
    ):
        return "correlation"

    if any(
        word in question_lower
        for word in ["average", "mean", "median", "min", "max"]
    ):
        return "numeric_summary"

    if any(
        word in question_lower
        for word in ["top", "common", "most frequent", "popular"]
    ):
        return "top_values"

    return "unknown"


def choose_column(question: str, columns: list[str]) -> Optional[str]:
    question_lower = question.lower()

    for column in columns:
        if column.lower() in question_lower:
            return column

    return None


def choose_columns(question: str, columns: list[str]) -> list[str]:
    question_lower = question.lower()

    matches = []

    for column in columns:
        if column.lower() in question_lower:
            matches.append(column)

    return matches