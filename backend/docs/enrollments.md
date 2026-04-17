# Enrollment Module

The Enrollment module manages student registrations in courses. It tracks the status, timing, and expiration of each enrollment.

## Features
- **Student-Course Mapping**: Links students to courses.
- **Status Management**: Supports `active`, `cancelled`, `completed`, and `pending` statuses.
- **Expiration Tracking**: Optional `expires_at` support.
- **Completion Tracking**: `completed_at` timestamp.
- **Duplicate Prevention**: Users cannot enroll in the same course twice.
- **Security**: Management endpoints are restricted to Admin/Instructor.

## API Endpoints

- `POST /api/v1/enrollments/` - Enroll a student in a course.
- `GET /api/v1/enrollments/{id}` - Get enrollment details.
- `GET /api/v1/enrollments/user/{user_id}` - List all enrollments for a specific student.
- `GET /api/v1/enrollments/course/{course_id}` - List all enrollments for a specific course.
- `PATCH /api/v1/enrollments/{id}` - Update enrollment (e.g., change status or set completion date).
- `DELETE /api/v1/enrollments/{id}` - Remove an enrollment record.

## Models

### Enrollment
- `user_id`: (Required) The ID of the student.
- `course_id`: (Required) The ID of the course.
- `status`: Enrollment status (default: `active`).
- `is_active`: Boolean flag for quick activation/deactivation.
- `enrolled_at`: Auto-generated timestamp at creation.
- `expires_at`: Optional expiration date.
- `completed_at`: Optional completion timestamp.

## Usage Example (Creating an Enrollment)
`POST /api/v1/enrollments/`
```json
{
  "userId": 1,
  "courseId": 10,
  "status": "active"
}
```
Response:
```json
{
  "id": 5,
  "userId": 1,
  "courseId": 10,
  "status": "active",
  "isActive": true,
  "enrolledAt": "2026-04-11T00:50:00Z"
}
```
