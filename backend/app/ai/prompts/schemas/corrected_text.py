from pydantic import BaseModel, Field


class CorrectedText(BaseModel):
    corrected_text: str = Field(
        description="The cleaned, grammatically correct text without formatting artifacts or OCR typos."
    )
    confidence_score: float = Field(
        description="The model's confidence in the quality of the text from 0.0 (worst) to 1.0 (best)."
    )
    corrections_made: list[str] = Field(
        default=[],
        description="Bullet points summarizing the major OCR errors or grammatical corrections made.",
    )
