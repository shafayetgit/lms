# Review Module Documentation

The Review module allows students to provide feedback and ratings for the courses they are enrolled in. It is essential for community trust and course quality assessment.

## 🏗️ Architecture

The module follows the project's **Clean Architecture** patterns:

1.  **API Layer** ([reviews.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/api/v1/endpoints/reviews.py)): Handles RESTful requests, owner permissions, and moderation.
2.  **Service Layer** ([review.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/services/review.py)): Implements business logic, rating validation (1-5), and prevents duplicate reviews.
3.  **Repository Layer** ([review.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/repositories/review.py)): Executes specialized SQLAlchemy queries for the `reviews` table.
4.  **Data Layer** ([review.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/models/review.py)): Defines the database schema, including constraints and composite indexes.

---

## 🚀 API Reference

### 1. Create Review
`POST /api/v1/reviews/`

Allows an authenticated student to review a course. 
- **Validation**: Rating must be between 1 and 5. A user can only review a specific course once.

**Request Body (camelCase):**
```json
{
  "courseId": 22,
  "studentId": 105,
  "rating": 5,
  "body": "This course changed my life!",
  "isActive": true
}
```

### 2. List All Reviews
`GET /api/v1/reviews/`

### 3. Get Reviews for Course
`GET /api/v1/reviews/course/{course_id}`

### 4. Update Review
`PUT /api/v1/reviews/{review_id}`
- **Permissions**: Only the owner (Student) or an Admin/Instructor can update a review.

### 5. Delete Review
`DELETE /api/v1/reviews/{review_id}`
- **Permissions**: Restricted to **Admin** and **Instructor** for moderation purposes.

---

## ✨ Features & Constraints

- **One-per-Course**: A student can only leave one review per course (enforced by `UniqueConstraint`).
- **Rating Range**: Rating must be an integer between 1 and 5 (enforced by `CheckConstraint`).
- **Composite Index**: Optimized for filtering active reviews by course and date for fast page loads.

---

## 🧪 Testing

The module includes integration tests in [test_reviews.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/tests/test_reviews.py).

**Running Tests:**
```bash
PYTHONPATH=. ./.venv/bin/pytest -v app/tests/test_reviews.py
```

---

## 📂 Implementation Registry

| Component | Path |
| :--- | :--- |
| **SQL Model** | [app/models/review.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/models/review.py) |
| **Pydantic Schemas** | [app/schemas/review.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/schemas/review.py) |
| **Business logic** | [app/services/review.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/services/review.py) |
| **Repository** | [app/repositories/review.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/repositories/review.py) |
| **API Router** | [app/api/v1/endpoints/reviews.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/api/v1/endpoints/reviews.py) |
| **Integration Tests** | [app/tests/test_reviews.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/tests/test_reviews.py) |
