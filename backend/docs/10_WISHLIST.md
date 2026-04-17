# Wishlist Module Documentation

The Wishlist module allows students to save courses they are interested in for future purchase or enrollment.

## 🏗️ Architecture

The module follows the project's **Clean Architecture** patterns:

1.  **API Layer** ([wishlist.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/api/v1/endpoints/wishlist.py)): Handles RESTful requests. All endpoints are personal to the authenticated user.
2.  **Service Layer** ([wishlist.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/services/wishlist.py)): Implements business logic, ensuring courses exist and preventing duplicate entries.
3.  **Repository Layer** ([wishlist.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/repositories/wishlist.py)): Executes SQLAlchemy queries with `joinedload` to return course details automatically.
4.  **Data Layer** ([wishlist.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/models/wishlist.py)): Defines the database schema, including unique constraints and performance indices.

---

## 🚀 API Reference

> [!NOTE]
> All endpoints require authentication and operate on the `current_user` context.

### 1. Add to Wishlist
`POST /api/v1/wishlist/`

**Request Body (camelCase):**
```json
{
  "courseId": 45
}
```

### 2. Get My Wishlist
`GET /api/v1/wishlist/`

Returns a list of wishlist items, including full course details for easy display on the frontend.

### 3. Remove from Wishlist
`DELETE /api/v1/wishlist/{course_id}`

Removes a course from the user's wishlist using the `courseId`.

---

## ✨ Key Features

- **Efficiency**: Returns course details (`CourseRead`) directly within the wishlist response to avoid extra frontend round-trips.
- **Data Integrity**: Uses `UniqueConstraint("user_id", "course_id")` to prevent duplicate bookmarks.
- **Cascade Deletion**: If a user or course is deleted, respective wishlist entries are automatically removed (`ondelete="CASCADE"`).

---

## 🧪 Testing

The module includes integration tests in [test_wishlist.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/tests/test_wishlist.py).

**Running Tests:**
```bash
PYTHONPATH=. ./.venv/bin/pytest -v app/tests/test_wishlist.py
```

---

## 📂 Implementation Registry

| Component | Path |
| :--- | :--- |
| **SQL Model** | [app/models/wishlist.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/models/wishlist.py) |
| **Pydantic Schemas** | [app/schemas/wishlist.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/schemas/wishlist.py) |
| **Business logic** | [app/services/wishlist.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/services/wishlist.py) |
| **Repository** | [app/repositories/wishlist.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/repositories/wishlist.py) |
| **API Router** | [app/api/v1/endpoints/wishlist.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/api/v1/endpoints/wishlist.py) |
| **Integration Tests** | [app/tests/test_wishlist.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/tests/test_wishlist.py) |
