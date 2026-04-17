# Question Module

The Question module manages questions and their choices within the LMS. It supports various question types and allows questions to be linked to quizzes, courses (for question banks), and categories.

## Models

### Question
- `text`: The main question text.
- `question_type`: Enum (MCQ_SINGLE, MCQ_MULTIPLE, TRUE_FALSE, SHORT_ANSWER).
- `points`: Marks allocated to the question.
- `order_index`: Sequence in which the question appears in a quiz.
- `explanation`: Text shown to the student after they answer.
- `quiz_id`: Reference to the Quiz it belongs to.
- `course_id`: Optional reference to a Course (for question bank organization).
- `category_id`: Optional reference to a Category.
- `created_by_id`: Reference to the User who created the question.

### Choice
- `text`: Choice text.
- `is_correct`: Boolean indicating if this choice is the correct answer.
- `explanation`: Optional explanation for this specific choice.

## Relationships
- **Quiz**: A question belongs to one quiz (nullable for bank questions).
- **Course**: A question can belong to a course's question bank.
- **Category**: A question can be categorized.
- **User**: Audit trail for creation.
- **Choices**: One-to-many relationship with Choice model.

## API Endpoints

All endpoints require **Admin** or **Instructor** privileges.

- `POST /api/v1/questions/`: Create a new question with choices.
- `GET /api/v1/questions/{id}`: Retrieve question details.
- `PUT /api/v1/questions/{id}`: Update question and its choices.
- `DELETE /api/v1/questions/{id}`: Remove a question.
- `GET /api/v1/questions/quiz/{quiz_id}`: Retrieve all questions for a specific quiz.

## Business Logic
- MCQ and True/False questions must have at least 2 choices.
- At least one choice must be marked as correct for these types.
- Automatic cascading deletes for choices when a question is deleted.
