import pytest
import uuid
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import Student, User
from app.core.security import get_password_hash
import httpx


@pytest.fixture
def unique_student_data():
    """Generate unique student data for each test."""
    unique_id = uuid.uuid4().hex[:8]
    return {
        "username": f"student_{unique_id}",
        "email": f"student_{unique_id}@example.com",
        "first_name": f"Student_FirstName_{unique_id}",
        "last_name": f"Student_LastName_{unique_id}",
        "password": "SecurePassword123!",
        "phone_number": "+1234567890",
        "department": "Engineering",
        "date_of_birth": "1995-10-15",
    }


@pytest_asyncio.fixture(autouse=True)
async def cleanup_test_students(db_session: AsyncSession):
    """Clean up test students before and after each test."""
    # Clean up students
    await db_session.execute(delete(Student).where(Student.username.like("student_%")))
    await db_session.commit()
    yield
    # Clean up after
    await db_session.execute(delete(Student).where(Student.username.like("student_%")))
    await db_session.commit()


@pytest.mark.asyncio
async def test_create_student(client: AsyncClient, unique_student_data):
    """Test creating a new student."""
    response = await client.post(
        "/api/v1/students/",
        json=unique_student_data
    )
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == unique_student_data["username"]
    assert data["email"] == unique_student_data["email"]
    assert data["firstName"] == unique_student_data["first_name"]
    assert data["lastName"] == unique_student_data["last_name"]
    assert data["phoneNumber"] == unique_student_data["phone_number"]
    assert data["department"] == unique_student_data["department"]
    assert "studentId" in data
    assert data["role"] == "student"


@pytest.mark.asyncio
async def test_create_student_with_custom_student_id(client: AsyncClient, unique_student_data):
    """Test creating a student with a custom student_id."""
    custom_student_id = f"STU-2024-{uuid.uuid4().hex[:6]}"
    unique_student_data["studentId"] = custom_student_id
    
    response = await client.post(
        "/api/v1/students/",
        json=unique_student_data
    )
    assert response.status_code == 201
    data = response.json()
    assert data["studentId"] == custom_student_id


@pytest.mark.asyncio
async def test_create_student_duplicate_username(client: AsyncClient, db_session: AsyncSession, unique_student_data):
    """Test creating a student with duplicate username."""
    # Create first student
    response1 = await client.post(
        "/api/v1/students/",
        json=unique_student_data
    )
    assert response1.status_code == 201
    
    # Try to create with same username
    unique_student_data["email"] = f"different_{unique_student_data['email']}"
    response2 = await client.post(
        "/api/v1/students/",
        json=unique_student_data
    )
    assert response2.status_code == 400
    assert "already exists" in response2.json()["message"].lower()


@pytest.mark.asyncio
async def test_create_student_duplicate_email(client: AsyncClient, unique_student_data):
    """Test creating a student with duplicate email."""
    # Create first student
    response1 = await client.post(
        "/api/v1/students/",
        json=unique_student_data
    )
    assert response1.status_code == 201
    
    # Try to create with same email
    unique_student_data["username"] = f"different_{unique_student_data['username']}"
    response2 = await client.post(
        "/api/v1/students/",
        json=unique_student_data
    )
    assert response2.status_code == 400
    assert "already registered" in response2.json()["message"].lower()


@pytest.mark.asyncio
async def test_create_student_missing_required_fields(client: AsyncClient):
    """Test creating a student with missing required fields."""
    incomplete_data = {
        "username": "incomplete_student",
        "email": "incomplete@example.com"
        # Missing password, first_name, last_name
    }
    response = await client.post(
        "/api/v1/students/",
        json=incomplete_data
    )
    assert response.status_code == 422  # Validation error


@pytest.mark.asyncio
async def test_get_student(client: AsyncClient, db_session: AsyncSession, unique_student_data):
    """Test retrieving a student by ID."""
    # Create a student
    response = await client.post(
        "/api/v1/students/",
        json=unique_student_data
    )
    assert response.status_code == 201
    student_id = response.json()["id"]
    
    # Retrieve the student
    get_response = await client.get(f"/api/v1/students/{student_id}")
    assert get_response.status_code == 200
    data = get_response.json()
    assert data["id"] == student_id
    assert data["username"] == unique_student_data["username"]


@pytest.mark.asyncio
async def test_get_student_not_found(client: AsyncClient):
    """Test retrieving a non-existent student."""
    response = await client.get("/api/v1/students/99999")
    assert response.status_code == 404
    assert "not found" in response.json()["message"].lower()


@pytest.mark.asyncio
async def test_get_students_list(client: AsyncClient, unique_student_data):
    """Test listing students with pagination."""
    # Create multiple students
    for i in range(3):
        data = unique_student_data.copy()
        data["username"] = f"{data['username']}_list_{i}"
        data["email"] = f"list_{i}_{data['email']}"
        await client.post("/api/v1/students/", json=data)
    
    # Get list
    response = await client.get("/api/v1/students/?page=1&size=10")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "meta" in data
    assert data["meta"]["page"] == 1
    assert data["meta"]["size"] == 10
    assert len(data["items"]) >= 3


@pytest.mark.asyncio
async def test_get_students_with_pagination(client: AsyncClient, unique_student_data):
    """Test pagination parameters."""
    # Create 15 students
    for i in range(15):
        data = unique_student_data.copy()
        data["username"] = f"{data['username']}_page_{i}"
        data["email"] = f"page_{i}_{data['email']}"
        await client.post("/api/v1/students/", json=data)
    
    # Get first page (size=5)
    response = await client.get("/api/v1/students/?page=1&size=5")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 5
    assert data["meta"]["has_next"] is True


@pytest.mark.asyncio
async def test_get_students_with_term_filter(client: AsyncClient, unique_student_data):
    """Test filtering students by term (search)."""
    # Create a student
    response = await client.post(
        "/api/v1/students/",
        json=unique_student_data
    )
    assert response.status_code == 201
    
    # Search by username
    search_response = await client.get(
        f"/api/v1/students/?term={unique_student_data['username']}"
    )
    assert search_response.status_code == 200
    data = search_response.json()
    assert len(data["items"]) >= 1
    assert any(s["username"] == unique_student_data["username"] for s in data["items"])


@pytest.mark.asyncio
async def test_get_students_with_department_filter(client: AsyncClient, unique_student_data):
    """Test filtering students by department."""
    # Create a student
    response = await client.post(
        "/api/v1/students/",
        json=unique_student_data
    )
    assert response.status_code == 201
    
    # Filter by department
    filter_response = await client.get(
        f"/api/v1/students/?department={unique_student_data['department']}"
    )
    assert filter_response.status_code == 200
    data = filter_response.json()
    assert len(data["items"]) >= 1


@pytest.mark.asyncio
async def test_get_students_with_is_active_filter(client: AsyncClient, unique_student_data):
    """Test filtering students by active status."""
    # Create a student
    response = await client.post(
        "/api/v1/students/",
        json=unique_student_data
    )
    assert response.status_code == 201
    
    # Filter by is_active
    filter_response = await client.get("/api/v1/students/?is_active=true")
    assert filter_response.status_code == 200
    data = filter_response.json()
    assert len(data["items"]) >= 1


@pytest.mark.asyncio
async def test_update_student(client: AsyncClient, unique_student_data):
    """Test updating a student's information."""
    # Create student
    response = await client.post(
        "/api/v1/students/",
        json=unique_student_data
    )
    assert response.status_code == 201
    student_id = response.json()["id"]
    
    # Update student
    update_data = {
        "first_name": "Updated",
        "last_name": "Name",
        "phone_number": "+9876543210",
        "department": "Computer Science"
    }
    update_response = await client.put(
        f"/api/v1/students/{student_id}",
        json=update_data
    )
    assert update_response.status_code == 200
    data = update_response.json()
    assert data["firstName"] == "Updated"
    assert data["lastName"] == "Name"
    assert data["phoneNumber"] == "+9876543210"
    assert data["department"] == "Computer Science"


@pytest.mark.asyncio
async def test_update_student_partial(client: AsyncClient, unique_student_data):
    """Test partial update of a student."""
    # Create student
    response = await client.post(
        "/api/v1/students/",
        json=unique_student_data
    )
    assert response.status_code == 201
    student_id = response.json()["id"]
    original_email = response.json()["email"]
    
    # Partial update (only phone_number)
    update_data = {"phone_number": "+1111111111"}
    update_response = await client.put(
        f"/api/v1/students/{student_id}",
        json=update_data
    )
    assert update_response.status_code == 200
    data = update_response.json()
    assert data["phoneNumber"] == "+1111111111"
    assert data["email"] == original_email  # Unchanged


@pytest.mark.asyncio
async def test_update_student_duplicate_email(client: AsyncClient, db_session: AsyncSession, unique_student_data):
    """Test updating student with duplicate email."""
    # Create two students
    response1 = await client.post("/api/v1/students/", json=unique_student_data)
    student1_id = response1.json()["id"]
    
    data2 = unique_student_data.copy()
    data2["username"] = f"another_{unique_student_data['username']}"
    data2["email"] = f"another_{unique_student_data['email']}"
    response2 = await client.post("/api/v1/students/", json=data2)
    
    # Try to update student1 with student2's email
    update_response = await client.put(
        f"/api/v1/students/{student1_id}",
        json={"email": data2["email"]}
    )
    assert update_response.status_code == 400


@pytest.mark.asyncio
async def test_update_student_not_found(client: AsyncClient):
    """Test updating a non-existent student."""
    response = await client.put(
        "/api/v1/students/99999",
        json={"first_name": "Updated"}
    )
    assert response.status_code == 400
    assert "not found" in response.json()["message"].lower()


@pytest.mark.asyncio
async def test_delete_student(client: AsyncClient, unique_student_data):
    """Test deleting a student."""
    # Create student
    response = await client.post(
        "/api/v1/students/",
        json=unique_student_data
    )
    assert response.status_code == 201
    student_id = response.json()["id"]
    
    # Delete student
    delete_response = await client.delete(f"/api/v1/students/{student_id}")
    assert delete_response.status_code == 204
    
    # Verify deletion
    get_response = await client.get(f"/api/v1/students/{student_id}")
    assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_delete_student_not_found(client: AsyncClient):
    """Test deleting a non-existent student."""
    response = await client.delete("/api/v1/students/99999")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_get_students_by_department(client: AsyncClient, unique_student_data):
    """Test retrieving students by department."""
    # Create students in Engineering department
    response = await client.post(
        "/api/v1/students/",
        json=unique_student_data
    )
    assert response.status_code == 201
    
    # Get students by department
    dept_response = await client.get(
        f"/api/v1/students/department/{unique_student_data['department']}?page=1&size=10"
    )
    assert dept_response.status_code == 200
    data = dept_response.json()
    assert "items" in data
    assert "meta" in data
    assert any(s["department"] == unique_student_data["department"] for s in data["items"])


@pytest.mark.asyncio
async def test_get_students_by_department_empty(client: AsyncClient):
    """Test retrieving students from non-existent department."""
    response = await client.get(
        "/api/v1/students/department/NonExistentDepartment?page=1&size=10"
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 0


@pytest.mark.asyncio
async def test_student_response_model(client: AsyncClient, unique_student_data):
    """Test that student response has all required fields."""
    response = await client.post(
        "/api/v1/students/",
        json=unique_student_data
    )
    assert response.status_code == 201
    data = response.json()
    
    required_fields = [
        "id", "username", "email", "firstName", "lastName",
        "role", "isActive", "studentId", "phoneNumber", "department"
    ]
    for field in required_fields:
        assert field in data, f"Missing field: {field}"


@pytest.mark.asyncio
async def test_create_student_with_enrollment_date(client: AsyncClient, unique_student_data):
    """Test creating a student with enrollment date."""
    unique_student_data["enrollmentDate"] = "2024-01-15T10:00:00"
    
    response = await client.post(
        "/api/v1/students/",
        json=unique_student_data
    )
    assert response.status_code == 201
    data = response.json()
    assert "enrollmentDate" in data


@pytest.mark.asyncio
async def test_create_student_with_avatar(client: AsyncClient, unique_student_data):
    """Test creating a student with avatar URL."""
    unique_student_data["avatar"] = "https://example.com/avatar.jpg"
    
    response = await client.post(
        "/api/v1/students/",
        json=unique_student_data
    )
    assert response.status_code == 201
    data = response.json()
    assert data["avatar"] == "https://example.com/avatar.jpg"
