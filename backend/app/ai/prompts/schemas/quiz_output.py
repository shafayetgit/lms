from pydantic import BaseModel, Field


class QuizQuestionSchema(BaseModel):
    question_text: str = Field(description="The text of the multiple-choice question.")
    options: list[str] = Field(description="Exactly 4 distinct options to choose from.")
    correct_option: str = Field(
        description="The exact text of the correct option (must match one of the options)."
    )
    explanation: str = Field(
        description="Detailed explanation of why the correct option is right and others are wrong."
    )


class QuizOutput(BaseModel):
    title: str = Field(
        description="A concise, descriptive title for the quiz based on the text topic."
    )
    description: str = Field(
        description="A short description of what this quiz covers."
    )
    questions: list[QuizQuestionSchema] = Field(
        description="The list of generated multiple-choice questions."
    )
