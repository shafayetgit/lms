# Discussion and Comment Module

The Discussion and Comment module provides a communication layer for courses and lessons, allowing instructors and admins to facilitate conversations.

## Features
- **Course & Lesson Targeted**: Discussions can be globally in a course or specific to a lesson.
- **Rich Content**: Supports text-based bodies.
- **Moderation**: Includes `is_active`, `is_pinned`, and `is_locked` flags.
- **Nested Comments**: Supports parent-child relationship for comments (replies).
- **Security**: Protected CRUD operations (Admin/Instructor only).

## API Endpoints

### Discussions
- `POST /api/v1/discussions/` - Create a discussion.
- `GET /api/v1/discussions/{id}` - Get discussion details.
- `GET /api/v1/discussions/course/{course_id}` - List discussions in a course.
- `PATCH /api/v1/discussions/{id}` - Update discussion.
- `DELETE /api/v1/discussions/{id}` - Delete discussion.

### Comments
- `POST /api/v1/comments/` - Create a comment or reply.
- `GET /api/v1/comments/{id}` - Get comment details.
- `GET /api/v1/comments/discussion/{discussion_id}` - List comments for a discussion (with nested replies).
- `PATCH /api/v1/comments/{id}` - Update comment.
- `DELETE /api/v1/comments/{id}` - Delete comment.

## Models

### Discussion
- `course_id`: (Required) The course this discussion belongs to.
- `lesson_id`: (Optional) Specific lesson.
- `user_id`: Author.
- `title`: Discussion title.
- `body`: Content.

### Comment
- `discussion_id`: The related discussion.
- `user_id`: Author.
- `parent_id`: For nested replies.
- `body`: Content.

## Usage Example (Nested Comments)
When fetching comments for a discussion:
`GET /api/v1/comments/discussion/1`
Returns:
```json
[
  {
    "id": 1,
    "body": "Great lesson!",
    "replies": [
      {
        "id": 2,
        "body": "Yes, I agree!",
        "parentId": 1
      }
    ]
  }
]
```
