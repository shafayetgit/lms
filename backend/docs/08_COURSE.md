# Course Module Documentation

The Course module is the core of the LMS, allowing instructors to create and manage academic content. It integrates with the User (Instructor) and Category modules to provide a rich learning environment.

## 🏗️ Architecture

The module follows the project's **Clean Architecture** patterns:

1.  **API Layer** ([courses.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/api/v1/endpoints/courses.py)): Handles RESTful requests and role-based access control.
2.  **Service Layer** ([course.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/services/course.py)): Implements business logic, relation validation (Category/User), and slug generation.
3.  **Repository Layer** ([course.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/repositories/course.py)): Executes specialized SQLAlchemy queries.
4.  **Data Layer** ([course.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/models/course.py)): Defines the database schema, including Enum types and composite indexes.

---

## 🚀 API Reference

> [!IMPORTANT]
> **RBAC Required**: These endpoints are protected by the `get_admin_or_instructor` dependency. Only users with `admin` or `instructor` roles can perform operations.

### 1. Create Course
`POST /api/v1/courses/`

Creates a new course. The system validates that the `instructorId` (User) and `categoryId` exist.

**Request Body (camelCase):**
```json
{
  "title": "Mastering Python for Data Science",
  "instructorId": 55,
  "categoryId": 12,
  "description": "From zero to hero in data science.",
  "level": "beginner",
  "language": "en",
  "price": 99.99,
  "isFree": false,
  "status": "draft"
}
```

### 2. List Courses
`GET /api/v1/courses/`

### 3. Get Course
`GET /api/v1/courses/{course_id}`

### 4. Update Course
`PUT /api/v1/courses/{course_id}`

### 5. Delete Course
`DELETE /api/v1/courses/{course_id}`

---

## ✨ Features & Enums

### Course Levels
- `beginner` (Default)
- `intermediate`
- `advanced`

### Course Status
- `draft` (Default)
- `published`
- `archived`

### Course Languages
- `en` (English - Default)
- `bn` (Bengali)

---

## 🧪 Testing

The module includes comprehensive integration tests in [test_courses.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/tests/test_courses.py). 

**Running Tests:**
```bash
PYTHONPATH=. ./.venv/bin/pytest -v app/tests/test_courses.py
```

---

## 📂 Implementation Registry

| Component | Path |
| :--- | :--- |
| **SQL Model** | [app/models/course.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/models/course.py) |
| **Pydantic Schemas** | [app/schemas/course.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/schemas/course.py) |
| **Business logic** | [app/services/course.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/services/course.py) |
| **Repository** | [app/repositories/course.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/repositories/course.py) |
| **API Router** | [app/api/v1/endpoints/courses.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/api/v1/endpoints/courses.py) |
| **Integration Tests** | [app/tests/test_courses.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/tests/test_courses.py) |
