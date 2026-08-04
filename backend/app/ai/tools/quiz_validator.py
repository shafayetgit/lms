import logging
from app.ai.prompts.schemas.quiz_output import QuizOutput

logger = logging.getLogger(__name__)


class QuizOutputValidator:
    """
    Validates a generated QuizOutput object against structural, completeness,
    and deduplication rules.
    """

    def validate(self, quiz: QuizOutput, expected_num: int) -> tuple[bool, list[str]]:
        """
        Validate the quiz and return (is_valid, list_of_issues).
        """
        issues = []
        actual_num = len(quiz.questions)

        # 1. Question count warning check
        if actual_num != expected_num:
            logger.warning(
                "Expected %d questions, got %d", expected_num, actual_num
            )

        seen_questions = set()

        for i, q in enumerate(quiz.questions, 1):
            # 2. Check question text not empty
            if not q.question_text or not q.question_text.strip():
                issues.append(f"Question {i} has empty or whitespace-only question_text")
                continue

            # 3. Check duplicate question text (case-insensitive, stripped)
            q_text_norm = q.question_text.strip().lower()
            if q_text_norm in seen_questions:
                issues.append(f"Question {i} is a duplicate of a previous question")
            else:
                seen_questions.add(q_text_norm)

            # 4. Check option count
            if len(q.options) != 4:
                issues.append(f"Question {i} has {len(q.options)} options instead of 4")

            # 5. Check duplicate options
            seen_options = set()
            has_duplicate_options = False
            for opt in q.options:
                opt_norm = opt.strip().lower() if opt else ""
                if opt_norm in seen_options:
                    has_duplicate_options = True
                seen_options.add(opt_norm)

            if has_duplicate_options:
                issues.append(f"Question {i} has duplicate options")

            # 6. Check correct option matches one of the options
            if q.correct_option not in q.options:
                issues.append(
                    f"Question {i} correct_option '{q.correct_option}' doesn't match any option"
                )

            # 7. Check explanation not empty
            if not q.explanation or not q.explanation.strip():
                issues.append(f"Question {i} has empty or whitespace-only explanation")

        is_valid = len(issues) == 0
        return is_valid, issues
