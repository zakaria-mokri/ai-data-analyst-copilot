from typing import Optional


def normalize_text(value: str) -> str:
    return (
        value.lower()
        .replace("_", "")
        .replace("-", "")
        .replace(" ", "")
    )


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
    normalized_question = normalize_text(question)

    for column in columns:
        if normalize_text(column) in normalized_question:
            return column

    return None


def choose_columns(question: str, columns: list[str]) -> list[str]:
    normalized_question = normalize_text(question)

    matches = []

    for column in columns:
        if normalize_text(column) in normalized_question:
            matches.append(column)

    return matches