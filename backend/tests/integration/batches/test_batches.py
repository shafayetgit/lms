import pytest
from datetime import date, timedelta
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_and_read_batch(client: AsyncClient):
    today = date.today()
    payload = {
        "title": "Fullstack Web Dev Cohort 1",
        "description": "Comprehensive batch cohort",
        "start_date": str(today),
        "end_date": str(today + timedelta(days=90)),
        "seat_count": 25,
        "medium": "Online",
        "published": True,
        "allow_self_enrollment": True,
        "paid_batch": False,
    }

    response = await client.post("/api/v1/batches/", json=payload)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    assert res_data["data"]["title"] == "Fullstack Web Dev Cohort 1"
    batch_id = res_data["data"]["id"]
    public_id = res_data["data"]["public_id"]

    # Read batch list
    list_res = await client.get("/api/v1/batches/")
    assert list_res.status_code == 200
    assert list_res.json()["success"] is True

    # Read batch detail by integer id
    detail_res = await client.get(f"/api/v1/batches/{batch_id}")
    assert detail_res.status_code == 200
    assert detail_res.json()["data"]["id"] == batch_id

    # Read batch detail by UUID public_id
    pub_res = await client.get(f"/api/v1/batches/{public_id}")
    assert pub_res.status_code == 200
    assert pub_res.json()["data"]["public_id"] == public_id


@pytest.mark.asyncio
async def test_batch_validation_invalid_dates(client: AsyncClient):
    today = date.today()
    payload = {
        "title": "Invalid Date Batch",
        "start_date": str(today),
        "end_date": str(today - timedelta(days=5)),
    }

    response = await client.post("/api/v1/batches/", json=payload)
    assert response.status_code == 400
    err_body = response.json()
    err_msg = err_body.get("detail") or err_body.get("message") or ""
    assert "cannot be before" in err_msg.lower()


@pytest.mark.asyncio
async def test_batch_timetable_entry(client: AsyncClient):
    today = date.today()
    payload = {
        "title": "Timetable Test Batch",
        "start_date": str(today),
        "end_date": str(today + timedelta(days=30)),
        "published": True,
        "allow_self_enrollment": True,
        "seat_count": 10,
    }

    create_res = await client.post("/api/v1/batches/", json=payload)
    assert create_res.status_code == 200
    batch_id = create_res.json()["data"]["id"]
    public_id = create_res.json()["data"]["public_id"]

    # Add timetable entry by public_id
    tt_payload = {
        "date": str(today + timedelta(days=2)),
        "start_time": "10:00:00",
        "end_time": "12:00:00",
        "topic": "Intro to FastAPI Architecture",
    }
    tt_res = await client.post(f"/api/v1/batches/{public_id}/timetables", json=tt_payload)
    assert tt_res.status_code == 200
    tt_data = tt_res.json()["data"]
    assert tt_data["topic"] == "Intro to FastAPI Architecture"
    tt_id = tt_data["public_id"] or tt_data["id"]

    # Update timetable entry
    update_res = await client.put(
        f"/api/v1/batches/{public_id}/timetables/{tt_id}",
        json={"topic": "Advanced FastAPI Architecture"},
    )
    assert update_res.status_code == 200
    assert update_res.json()["data"]["topic"] == "Advanced FastAPI Architecture"

    # Delete timetable entry
    delete_res = await client.delete(f"/api/v1/batches/{public_id}/timetables/{tt_id}")
    assert delete_res.status_code == 200
    assert delete_res.json()["success"] is True


@pytest.mark.asyncio
async def test_batch_enrollment_crud(client: AsyncClient, db_session: AsyncSession):
    import uuid
    from app.models.user import User
    from app.api.deps import get_admin_or_instructor
    from app.main import app

    # Create an admin user for permission bypass
    admin = User(
        username=f"admin_{uuid.uuid4().hex}",
        email=f"admin_{uuid.uuid4().hex}@example.com",
        hashed_password="hashed",
        role="admin",
        is_active=True,
        first_name="Admin",
        last_name="User",
    )
    # Create a student user to enroll
    student = User(
        username=f"student_{uuid.uuid4().hex}",
        email=f"student_{uuid.uuid4().hex}@example.com",
        hashed_password="hashed",
        role="student",
        is_active=True,
        first_name="Test",
        last_name="Student",
    )
    db_session.add_all([admin, student])
    await db_session.commit()
    await db_session.refresh(admin)
    await db_session.refresh(student)

    # Set dependency override for permission checker
    app.dependency_overrides[get_admin_or_instructor] = lambda: admin

    # Create a batch
    today = date.today()
    payload = {
        "title": "Enrollment Test Cohort",
        "start_date": str(today),
        "end_date": str(today + timedelta(days=30)),
        "published": True,
        "allow_self_enrollment": False, # Admin enroll only
        "seat_count": 5,
    }
    create_res = await client.post("/api/v1/batches/", json=payload)
    assert create_res.status_code == 200
    batch_public_id = create_res.json()["data"]["public_id"]

    # Enroll the student into the batch
    enroll_res = await client.post(
        f"/api/v1/batches/{batch_public_id}/enrollments",
        json={"member_public_id": student.public_id, "is_paid": True},
    )
    assert enroll_res.status_code == 200
    enroll_data = enroll_res.json()["data"]
    assert enroll_data["is_paid"] is True
    assert enroll_data["member"]["public_id"] == student.public_id
    enrollment_pub_id = enroll_data["public_id"]

    # List enrollments for the batch
    list_res = await client.get(f"/api/v1/batches/{batch_public_id}/enrollments")
    assert list_res.status_code == 200
    list_body = list_res.json()
    assert list_body["success"] is True
    assert len(list_body["data"]) == 1
    assert list_body["data"][0]["public_id"] == enrollment_pub_id

    # Unenroll the student (delete the enrollment)
    delete_res = await client.delete(f"/api/v1/batches/{batch_public_id}/enrollments/{enrollment_pub_id}")
    assert delete_res.status_code == 200
    assert delete_res.json()["success"] is True

    # List again to verify empty
    list_res2 = await client.get(f"/api/v1/batches/{batch_public_id}/enrollments")
    assert list_res2.status_code == 200
    assert len(list_res2.json()["data"]) == 0

    app.dependency_overrides.clear()
