# Category Module Documentation

The Category module provides a hierarchical system for organizing courses and content within the LMS. It is built using the project's Clean Architecture patterns to ensure scalability and maintainability.

## 🏗️ Architecture

The module follows the **API → Service → Repository → DB** flow:

1.  **API Layer** ([categories.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/api/v1/endpoints/categories.py)): Defines RESTful endpoints and handles request/response lifecycle.
2.  **Service Layer** ([category.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/services/category.py)): Implements business logic, such as automatic slug generation and cross-field validation.
3.  **Repository Layer** ([category.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/repositories/category.py)): Encapsulates SQLAlchemy database queries for the `categories` table.
4.  **Data Layer** ([category.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/models/category.py)): Defines the database schema using SQLAlchemy ORM.

## 🚀 API Reference

> [!NOTE]
> The API supports **camelCase** for all fields. The examples below use camelCase as expected by the frontend.

### 1. Create Category
`POST /api/v1/categories/`

Creates a new category. If `slug` is not provided, it is automatically generated from the `name`.

**Request Body:**
```json
{
  "name": "Web Development",
  "parentId": null,
  "description": "Courses related to web technologies",
  "isActive": true
}
```

### 2. List Categories
`GET /api/v1/categories/`

Retrieves a paginated list of categories.

**Query Parameters:**
- `skip`: Number of records to skip (default: 0)
- `limit`: Maximum number of records to return (default: 100)

### 3. Get Category Details
`GET /api/v1/categories/{category_id}`

Fetches a single category by its unique ID.

### 4. Update Category
`PUT /api/v1/categories/{category_id}`

Updates an existing category. Updating the `name` will trigger a new `slug` generation unless an explicit `slug` is provided.

### 5. Delete Category
`DELETE /api/v1/categories/{category_id}`

Permanently removes a category from the database.

## ✨ Key Features

### Automatic Slugification
A custom utility [string.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/utils/string.py) ensures all categories have URL-friendly identifiers.
- **Example**: "AI & Data Science" → `ai-data-science`

### Hierarchical (Nested) Support
Categories support a `parentId` foreign key, enabling multi-level structures like:
- Development
  - Frontend
  - Backend
- Business
  - Marketing

### CamelCase Support
All schemas inherit from [BaseSchema](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/core/base.py), which automatically handles translation between frontend camelCase (e.g., `parentId`) and backend snake_case (e.g., `parent_id`).

## 🧪 Testing

The module includes integration tests located in [app/tests/test_categories.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/tests/test_categories.py).

**Coverage includes:**
- Success cases for all CRUD operations.
- Nesting and deep hierarchies.
- Uniqueness validation (preventing duplicate names/slugs).
- automatic slug generation on creation and update.

**Running Tests:**
```bash
PYTHONPATH=. ./.venv/bin/pytest -v app/tests/test_categories.py
```

## 📂 Implementation Details

| Component | Path |
| :--- | :--- |
| **Pydantic Schemas** | [app/schemas/category.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/schemas/category.py) |
| **Logic/Service** | [app/services/category.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/services/category.py) |
| **DB Queries** | [app/repositories/category.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/repositories/category.py) |
| **SQL Model** | [app/models/category.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/models/category.py) |
| **String Utils** | [app/utils/string.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/utils/string.py) |
| **Integration Tests** | [app/tests/test_categories.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/tests/test_categories.py) |

---

## 🛠️ Setup Tips

After creating new categories or modifying the model, remember to:
1. Update database metadata in [alembic/env.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/alembic/env.py).
2. Generate a migration: `alembic revision --autogenerate -m "Add categories table"`
3. Apply migration: `alembic upgrade head`
