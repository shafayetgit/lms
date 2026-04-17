# Lesson Progress Module

The `LessonProgress` module tracks student progress through individual lessons within a course. It allows for resuming playback and marking lessons as completed.

## Features

- **Progress Tracking**: Store `current_time` (in seconds) for video lessons.
- **Completion Tracking**: Mark lessons as completed with a timestamp.
- **Relational Consistency**: Linked to `User` and `Lesson` models.
- **Efficient Queries**: Optimized with indexes for user and lesson lookups.

## API Endpoints

All endpoints are currently restricted to **Admin** and **Instructor** roles for management.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/lesson-progress/user/{userId}` | Get all progress records for a specific user. |
| GET | `/api/v1/lesson-progress/user/{userId}/lesson/{lessonId}` | Get or create a progress record for a user and lesson. |
| PATCH | `/api/v1/lesson-progress/user/{userId}/lesson/{lessonId}` | Update progress (current time and completion status). |
| POST | `/api/v1/lesson-progress/user/{userId}/lesson/{lessonId}/complete` | Mark a lesson as 100% completed. |

## Data Models

### LessonProgress
- `id`: Primary key
- `user_id`: Foreign key to `users.id`
- `lesson_id`: Foreign key to `lessons.id`
- `current_time`: Integer (seconds)
- `is_completed`: Boolean
- `completed_at`: DateTime (populated when is_completed transitions to True)
- `created_at`: Timestamp
- `updated_at`: Timestamp

## Schemas

The module uses Pydantic schemas that inherit from `BaseSchema` to ensure `camelCase` support in the API.

- `LessonProgressRead`
- `LessonProgressUpdate`
- `LessonProgressCreate`

## Usage Example (Updating Progress)

```bash
PATCH /api/v1/lesson-progress/user/123/lesson/456
Content-Type: application/json

{
  "currentTime": 120,
  "isCompleted": false
}
```

## Security

Endpoints are protected using the `get_admin_or_instructor` dependency.
Only users with `ADMIN` or `INSTRUCTOR` roles can access these endpoints.
