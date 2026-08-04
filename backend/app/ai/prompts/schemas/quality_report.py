from pydantic import BaseModel, Field


class QualityReport(BaseModel):
    score: int = Field(description="Quality score of the quiz from 0 to 100.")
    is_passing: bool = Field(
        description="True if the quiz meets high educational standards (score >= 80), False otherwise."
    )
    issues: list[str] = Field(
        description="List of issues identified (e.g. 'Option A and C are too similar', 'Question 2 difficulty is too high')."
    )
    suggestions: list[str] = Field(
        description="Actionable suggestions to improve the quiz quality."
    )
