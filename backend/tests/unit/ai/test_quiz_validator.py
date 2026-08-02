from app.ai.prompts.schemas.quiz_output import QuizOutput, QuizQuestionSchema
from app.ai.tools.quiz_validator import QuizOutputValidator


def test_valid_quiz_passes():
    validator = QuizOutputValidator()
    quiz = QuizOutput(
        title="Valid Quiz",
        description="A valid quiz for testing",
        questions=[
            QuizQuestionSchema(
                question_text="What is 1 + 1?",
                options=["1", "2", "3", "4"],
                correct_option="2",
                explanation="1 plus 1 equals 2.",
            )
        ],
    )
    is_valid, issues = validator.validate(quiz, expected_num=1)
    assert is_valid is True
    assert len(issues) == 0


def test_wrong_option_count_fails():
    validator = QuizOutputValidator()
    quiz = QuizOutput(
        title="Invalid Option Count",
        description="Quiz with wrong number of options",
        questions=[
            QuizQuestionSchema(
                question_text="What is 1 + 1?",
                options=["1", "2", "3"],
                correct_option="2",
                explanation="Only 3 options provided.",
            )
        ],
    )
    is_valid, issues = validator.validate(quiz, expected_num=1)
    assert is_valid is False
    assert any("options instead of 4" in issue for issue in issues)


def test_correct_option_not_in_options_fails():
    validator = QuizOutputValidator()
    quiz = QuizOutput(
        title="Invalid Correct Option",
        description="Correct option not in options list",
        questions=[
            QuizQuestionSchema(
                question_text="What is 1 + 1?",
                options=["1", "2", "3", "4"],
                correct_option="5",
                explanation="5 is not in options.",
            )
        ],
    )
    is_valid, issues = validator.validate(quiz, expected_num=1)
    assert is_valid is False
    assert any("correct_option '5' doesn't match" in issue for issue in issues)


def test_duplicate_options_fails():
    validator = QuizOutputValidator()
    quiz = QuizOutput(
        title="Duplicate Options",
        description="Has duplicate choices",
        questions=[
            QuizQuestionSchema(
                question_text="What is 1 + 1?",
                options=["2", "2", "3", "4"],
                correct_option="2",
                explanation="Duplicate 2.",
            )
        ],
    )
    is_valid, issues = validator.validate(quiz, expected_num=1)
    assert is_valid is False
    assert any("duplicate options" in issue for issue in issues)


def test_duplicate_questions_fails():
    validator = QuizOutputValidator()
    quiz = QuizOutput(
        title="Duplicate Questions",
        description="Has identical questions",
        questions=[
            QuizQuestionSchema(
                question_text="What is 1 + 1?",
                options=["1", "2", "3", "4"],
                correct_option="2",
                explanation="First question.",
            ),
            QuizQuestionSchema(
                question_text="  What is 1 + 1?  ",
                options=["1", "2", "3", "4"],
                correct_option="2",
                explanation="Second identical question.",
            ),
        ],
    )
    is_valid, issues = validator.validate(quiz, expected_num=2)
    assert is_valid is False
    assert any("duplicate of a previous question" in issue for issue in issues)


def test_empty_question_text_fails():
    validator = QuizOutputValidator()
    quiz = QuizOutput(
        title="Empty Question Text",
        description="Has empty question text",
        questions=[
            QuizQuestionSchema(
                question_text="",
                options=["1", "2", "3", "4"],
                correct_option="2",
                explanation="Empty text.",
            )
        ],
    )
    is_valid, issues = validator.validate(quiz, expected_num=1)
    assert is_valid is False
    assert any(
        "empty or whitespace-only question_text" in issue for issue in issues
    )
