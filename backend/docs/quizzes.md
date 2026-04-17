# Quiz Module

The Quiz module enables instructors to create assessments for their courses and lessons. It supports tiered questions with multiple-choice, true/false, and short-answer options.

## Features
- **Flexible Attachment**: Quizzes can be attached to an entire Course or a specific Lesson.
- **Time Limits**: Configurable duration for quiz attempts.
- **Passing Scores**: Set a percentage threshold for passing.
- **Nested Questions**: Integrated support for questions and their respective choices.
- **Role-Based Security**: Only Admin and Instructors can manage quizzes.

## API Endpoints

- `POST /api/v1/quizzes/` - Create a new quiz.
- `GET /api/v1/quizzes/{id}` - Get full quiz details (including questions and choices).
- `PATCH /api/v1/quizzes/{id}` - Update quiz settings.
- `DELETE /api/v1/quizzes/{id}` - Remove a quiz and all its questions.
- `GET /api/v1/quizzes/course/{course_id}` - List all quizzes in a course.
- `POST /api/v1/quizzes/{quiz_id}/questions` - Add a question with choices to a quiz.

## Models

### Quiz
- `course_id`: (Required) Parent course.
- `lesson_id`: (Optional) Specific lesson this quiz belongs to.
- `title`: (Required) Quiz title.
- `description`: Optional text.
- `time_limit`: Duration in minutes.
- `passing_score`: Goal percentage (default: 70.0).

### Question
- `text`: The question content.
- `type`: `multiple_choice`, `true_false`, or `short_answer`.
- `points`: Weight of the question.

### Choice
- `text`: Option text.
- `is_correct`: Boolean flag for the right answer.

## Usage Example (Creating a Question)
`POST /api/v1/quizzes/{id}/questions`
```json
{
  "text": "Which language is used for FastAPI?",
  "type": "multiple_choice",
  "points": 10,
  "choices": [
    {"text": "JavaScript", "isCorrect": false},
    {"text": "Python", "isCorrect": true}
  ]
}
```
