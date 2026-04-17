# Module Module Documentation

The Module module provides structural organization for courses. Each course is composed of multiple modules, which in turn contain lessons.

## 🏗️ Architecture

The module follows the project's **Clean Architecture** patterns:

1.  **API Layer** ([modules.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/api/v1/endpoints/modules.py)): Handles RESTful requests. Creation and management are restricted to Admins/Instructors.
2.  **Service Layer** ([module.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/services/module.py)): Implements business logic, including validation of course existence and enforcement of unique ordering constraints.
3.  **Repository Layer** ([module.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/repositories/module.py)): Executes targeted SQLAlchemy queries, including ordered retrieval by `order_index`.
4.  **Data Layer** ([module.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/models/module.py)): Defines the database schema with unique constraints and indices for optimal ordering performance.

---

## 🚀 API Reference

### 1. Create Module
`POST /api/v1/modules/`
- **Security**: Admin/Instructor only.

**Request Body (camelCase):**
```json
{
  "courseId": 10,
  "title": "Getting Started with Python",
  "description": "Environment setup and basic syntax.",
  "orderIndex": 1,
  "isActive": true
}
```

### 2. Get Modules by Course
`GET /api/v1/modules/course/{course_id}`
- **Note**: Returns modules sorted by `orderIndex`.

### 3. Update Module
`PUT /api/v1/modules/{module_id}`
- **Security**: Admin/Instructor only.

### 4. Delete Module
`DELETE /api/v1/modules/{module_id}`
- **Security**: Admin/Instructor only.

---

## ✨ Features & Constraints

- **Strict Ordering**: Uses `UniqueConstraint("course_id", "order_index")` to ensure that no two modules in the same course share the same sequence position.
- **Ordered Relationships**: The `Course` model retrieves modules automatically sorted by `order_index`.
- **Cascade Management**: Deleting a course automatically removes all associated modules via `ondelete="CASCADE"`.

---

## 🧪 Testing

The module includes integration tests in [test_modules.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/tests/test_modules.py).

**Running Tests:**
```bash
PYTHONPATH=. ./.venv/bin/pytest -v app/tests/test_modules.py
```

---

## 📂 Implementation Registry

| Component | Path |
| :--- | :--- |
| **SQL Model** | [app/models/module.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/models/module.py) |
| **Pydantic Schemas** | [app/schemas/module.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/schemas/module.py) |
| **Business logic** | [app/services/module.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/services/module.py) |
| **Repository** | [app/repositories/module.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/repositories/module.py) |
| **API Router** | [app/api/v1/endpoints/modules.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/api/v1/endpoints/modules.py) |
| **Integration Tests** | [app/tests/test_modules.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/tests/test_modules.py) |
