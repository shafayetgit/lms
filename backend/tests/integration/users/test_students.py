import pytest
import uuid
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User


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
        "date_of_birth": "1995-10-15",
    }


@pytest_asyncio.fixture(autouse=True)
async def cleanup_test_students(db_session: AsyncSession):
    """Clean up test students before and after each test."""
    await db_session.execute(delete(User).where(User.username.like("student_%")))
    await db_session.commit()
    yield
    await db_session.execute(delete(User).where(User.username.like("student_%")))
    await db_session.commit()


@pytest.mark.asyncio
async def test_create_student(client: AsyncClient, unique_student_data):
    """Test creating a new student."""
    response = await client.post(
        "/api/v1/students/",
        json=unique_student_data
    )
    assert response.status_code == 201
    res = response.json()
    assert res["success"] is True
    data = res["data"]
    assert data["username"] == unique_student_data["username"]
    assert data["email"] == unique_student_data["email"]
    assert data["first_name"] == unique_student_data["first_name"]
    assert data["last_name"] == unique_student_data["last_name"]
    assert data["phone_number"] == unique_student_data["phone_number"]
    assert data["role"] == "student"


@pytest.mark.asyncio
async def test_create_student_duplicate_username(client: AsyncClient, db_session: AsyncSession, unique_student_data):
    """Test creating a student with duplicate username."""
    response1 = await client.post(
        "/api/v1/students/",
        json=unique_student_data
    )
    assert response1.status_code == 201
    
    unique_student_data["email"] = f"different_{unique_student_data['email']}"
    response2 = await client.post(
        "/api/v1/students/",
        json=unique_student_data
    )
    assert response2.status_code == 400
    res_err = response2.json()
    err_msg = res_err.get("message") or res_err.get("detail", "")
    assert "already exists" in err_msg.lower()


@pytest.mark.asyncio
async def test_create_student_duplicate_email(client: AsyncClient, unique_student_data):
    """Test creating a student with duplicate email."""
    response1 = await client.post(
        "/api/v1/students/",
        json=unique_student_data
    )
    assert response1.status_code == 201
    
    unique_student_data["username"] = f"different_{unique_student_data['username']}"
    response2 = await client.post(
        "/api/v1/students/",
        json=unique_student_data
    )
    assert response2.status_code == 400
    res_err = response2.json()
    err_msg = res_err.get("message") or res_err.get("detail", "")
    assert "already registered" in err_msg.lower()


@pytest.mark.asyncio
async def test_create_student_missing_required_fields(client: AsyncClient):
    """Test creating a student with missing required fields."""
    incomplete_data = {
        "username": "incomplete_student",
        "email": "incomplete@example.com"
    }
    response = await client.post(
        "/api/v1/students/",
        json=incomplete_data
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_get_student(client: AsyncClient, db_session: AsyncSession, unique_student_data):
    """Test retrieving a student by ID or public_id."""
    response = await client.post(
        "/api/v1/students/",
        json=unique_student_data
    )
    assert response.status_code == 201
    public_id = response.json()["data"]["public_id"]
    
    get_response = await client.get(f"/api/v1/students/{public_id}")
    assert get_response.status_code == 200
    res = get_response.json()
    assert res["success"] is True
    assert res["data"]["public_id"] == public_id
    assert res["data"]["username"] == unique_student_data["username"]


@pytest.mark.asyncio
async def test_get_student_not_found(client: AsyncClient):
    """Test retrieving a non-existent student."""
    response = await client.get("/api/v1/students/non-existent-public-id")
    assert response.status_code == 404
    res_err = response.json()
    err_msg = res_err.get("message") or res_err.get("detail", "")
    assert "not found" in err_msg.lower()


@pytest.mark.asyncio
async def test_get_students_list(client: AsyncClient, unique_student_data):
    """Test listing students with pagination."""
    for i in range(3):
        data = unique_student_data.copy()
        data["username"] = f"{data['username']}_list_{i}"
        data["email"] = f"list_{i}_{data['email']}"
        await client.post("/api/v1/students/", json=data)
    
    response = await client.get("/api/v1/students/?page=1&size=10")
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert "data" in res
    assert "meta" in res
    assert res["meta"]["page"] == 1
    assert res["meta"]["size"] == 10
    assert len(res["data"]) >= 3


@pytest.mark.asyncio
async def test_get_students_with_pagination(client: AsyncClient, unique_student_data):
    """Test pagination parameters."""
    for i in range(15):
        data = unique_student_data.copy()
        data["username"] = f"{data['username']}_page_{i}"
        data["email"] = f"page_{i}_{data['email']}"
        await client.post("/api/v1/students/", json=data)
    
    response = await client.get("/api/v1/students/?page=1&size=5")
    assert response.status_code == 200
    res = response.json()
    assert len(res["data"]) == 5
    assert res["meta"]["has_next"] is True


@pytest.mark.asyncio
async def test_get_students_with_term_filter(client: AsyncClient, unique_student_data):
    """Test filtering students by term (search)."""
    response = await client.post(
        "/api/v1/students/",
        json=unique_student_data
    )
    assert response.status_code == 201
    
    search_response = await client.get(
        f"/api/v1/students/?term={unique_student_data['username']}"
    )
    assert search_response.status_code == 200
    res = search_response.json()
    assert len(res["data"]) >= 1
    assert any(s["username"] == unique_student_data["username"] for s in res["data"])


@pytest.mark.asyncio
async def test_update_student(client: AsyncClient, unique_student_data):
    """Test updating a student's information."""
    response = await client.post(
        "/api/v1/students/",
        json=unique_student_data
    )
    assert response.status_code == 201
    public_id = response.json()["data"]["public_id"]
    
    update_data = {
        "first_name": "Updated",
        "last_name": "Name",
        "phone_number": "+9876543210"
    }
    update_response = await client.put(
        f"/api/v1/students/{public_id}",
        json=update_data
    )
    assert update_response.status_code == 200
    res = update_response.json()
    assert res["success"] is True
    data = res["data"]
    assert data["first_name"] == "Updated"
    assert data["last_name"] == "Name"
    assert data["phone_number"] == "+9876543210"


@pytest.mark.asyncio
async def test_delete_student(client: AsyncClient, unique_student_data):
    """Test deleting a student."""
    response = await client.post(
        "/api/v1/students/",
        json=unique_student_data
    )
    assert response.status_code == 201
    public_id = response.json()["data"]["public_id"]
    
    delete_response = await client.delete(f"/api/v1/students/{public_id}")
    assert delete_response.status_code == 200
    assert delete_response.json()["success"] is True
    
    get_response = await client.get(f"/api/v1/students/{public_id}")
    assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_get_student_dashboard_summary(client: AsyncClient):
    """Test retrieving student dashboard summary."""
    response = await client.get("/api/v1/students/dashboard/summary")
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert "data" in res
    assert "streak" in res["data"]
    assert "upcoming_evaluations" in res["data"]
    assert "upcoming_live_classes" in res["data"]


@pytest.mark.asyncio
async def test_student_lms_explorer_badge_assignment(client: AsyncClient, db_session: AsyncSession, unique_student_data):
    """Test that creating a student assigns the 'LMS Explorer' badge and generates a notification."""
    response = await client.post(
        "/api/v1/students/",
        json=unique_student_data
    )
    assert response.status_code == 201
    public_id = response.json()["data"]["public_id"]

    # Retrieve student from DB
    result = await db_session.execute(select(User).where(User.public_id == public_id))
    student = result.scalar_one_or_none()
    assert student is not None

    # Retrieve badge and check assignment
    from app.models.badge import Badge, BadgeAssignment
    from app.models.notification import Notification

    # Check that LMS Explorer badge assignment exists for the student
    stmt_badge = select(Badge).where(Badge.title == "LMS Explorer")
    badge_res = await db_session.execute(stmt_badge)
    badge = badge_res.scalar_one_or_none()
    assert badge is not None

    stmt_assignment = select(BadgeAssignment).where(
        BadgeAssignment.member_id == student.id,
        BadgeAssignment.badge_id == badge.id
    )
    assignment_res = await db_session.execute(stmt_assignment)
    assignment = assignment_res.scalar_one_or_none()
    assert assignment is not None

    # Check notification exists for the student
    stmt_notification = select(Notification).where(
        Notification.user_id == student.id,
        Notification.title == "New Badge Awarded"
    )
    notification_res = await db_session.execute(stmt_notification)
    notification = notification_res.scalars().all()
    assert len(notification) == 1
    assert "LMS Explorer" in notification[0].message

