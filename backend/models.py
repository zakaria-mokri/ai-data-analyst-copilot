from typing import Any, Optional
from pydantic import BaseModel


class AnalysisPlan(BaseModel):
    tool: str
    column: Optional[str]


class AnalyzeResponse(BaseModel):
    question: str
    plan: AnalysisPlan
    result: Any
    answer: str