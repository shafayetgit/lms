# Quiz Attempt Module

The Quiz Attempt module tracks and manages student attempts at quizzes. It handles the lifecycle from starting an attempt to grading and storing results.

## Models

### QuizAttempt
- `user_id`: The student taking the quiz.
- `quiz_id`: The quiz being attempted.
- `start_time`: When the attempt began.
- `end_time`: When the attempt was submitted.
- `score`: Total points earned.
- `total_points`: Total possible points in the quiz at the time of attempt.
- `percentage`: Score as a percentage of total points.
- `is_passed`: Whether the percentage met the quiz's `passing_score`.
- `status`: Enum (IN_PROGRESS, COMPLETED, TIMED_OUT).

### QuizAttemptAnswer
- `attempt_id`: Reference to the parent attempt.
- `question_id`: The question being answered.
- `choice_id`: Selected choice (for MCQ).
- `answer_text`: Provided text (for Short Answer).
- `is_correct`: Boolean indicating if the answer was correct.
- `points_earned`: Points allocated for this answer.

## Lifecycle
1. **Start**: Use `POST /api/v1/quiz-attempts/` to start a new attempt. Status is set to `IN_PROGRESS`.
2. **Submit**: Use `POST /api/v1/quiz-attempts/{id}/submit` with a list of answers. The system grades each answer and calculates the final score.
3. **Review**: Use `GET /api/v1/quiz-attempts/{id}` to see full details, including which answers were correct.

## Scoring Logic
- **MCQ_SINGLE / TRUE_FALSE**: 100% of question points if the correct choice is selected, otherwise 0.
- **SHORT_ANSWER**: Exact case-insensitive match against the set "correct" choice text.
- **MCQ_MULTIPLE**: (Currently treated as pass/fail for all correct choices, can be expanded to partial credit).

## API Endpoints

- `POST /api/v1/quiz-attempts/`: Start a new attempt.
- `POST /api/v1/quiz-attempts/{id}/submit`: Submit and grade an attempt.
- `GET /api/v1/quiz-attempts/my-attempts`: List current user's attempts.
- `GET /api/v1/quiz-attempts/{id}`: View detailed result of an attempt.
