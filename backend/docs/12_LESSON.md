# Lesson Module Documentation

The Lesson module represents the individual units of learning within a Module. It supports various content types including video URLs and rich text/markdown content.

## 🏗️ Architecture

The module follows the project's **Clean Architecture** patterns:

1.  **API Layer** ([lessons.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/api/v1/endpoints/lessons.py)): Handles RESTful requests. Creation and management are restricted to Admins/Instructors.
2.  **Service Layer** ([lesson.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/services/lesson.py)): Implements business logic, including automatic slug generation and unique order enforcement.
3.  **Repository Layer** ([lesson.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/repositories/lesson.py)): Executes targeted SQLAlchemy queries, including ordered retrieval and slug-based lookups.
4.  **Data Layer** ([lesson.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/models/lesson.py)): Defines the database schema with strict sequence position integrity.

---

## 🚀 API Reference

### 1. Create Lesson
`POST /api/v1/lessons/`
- **Security**: Admin/Instructor only.

**Request Body (camelCase):**
```json
{
  "moduleId": 5,
  "title": "Introduction to Variables",
  "content": "In this lesson, we will cover...",
  "videoUrl": "https://vimeo.com/...",
  "duration": 300,
  "orderIndex": 1,
  "isPreview": true
}
```

### 2. Get Lessons by Module
`GET /api/v1/lessons/module/{module_id}`
- **Note**: Returns lessons sorted by `orderIndex`.

### 3. Update Lesson
`PUT /api/v1/lessons/{lesson_id}`
- **Security**: Admin/Instructor only.

### 4. Delete Lesson
`DELETE /api/v1/lessons/{lesson_id}`
- **Security**: Admin/Instructor only.

---

## ✨ Features & Constraints

- **Slug Generation**: Automatically generates a URL-friendly slug from the title if not provided.
- **Strict Ordering**: Uses `UniqueConstraint("module_id", "order_index")` to maintain sequence integrity within each module.
- **Preview Support**: `isPreview` flag allow specific lessons to be accessible without full course enrollment.
- **Cascade Deletion**: If a module is deleted, all associated lessons are automatically removed.

---

## 🧪 Testing

The module includes integration tests in [test_lessons.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/tests/test_lessons.py).

**Running Tests:**
```bash
PYTHONPATH=. ./.venv/bin/pytest -v app/tests/test_lessons.py
```

---

## 📂 Implementation Registry

| Component | Path |
| :--- | :--- |
| **SQL Model** | [app/models/lesson.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/models/lesson.py) |
| **Pydantic Schemas** | [app/schemas/lesson.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/schemas/lesson.py) |
| **Business logic** | [app/services/lesson.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/services/lesson.py) |
| **Repository** | [app/repositories/lesson.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/repositories/lesson.py) |
| **API Router** | [app/api/v1/endpoints/lessons.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/api/v1/endpoints/lessons.py) |
| **Integration Tests** | [app/tests/test_lessons.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/tests/test_lessons.py) |
