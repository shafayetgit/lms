import pytest
from httpx import AsyncClient

@pytest.fixture
def program_payload():
    return {
        "title": "Data Science Masterclass",
        "description": "A comprehensive program on Data Science",
        "published": True,
        "enforce_course_order": True,
        "courses": []
    }

@pytest.mark.asyncio
async def test_create_program(client: AsyncClient, program_payload):
    response = await client.post("/api/v1/programs/", json=program_payload)
    assert response.status_code == 201
    data = response.json()["data"]
    assert data["title"] == "Data Science Masterclass"
    assert data["enforce_course_order"] is True
    assert data["published"] is True

@pytest.mark.asyncio
async def test_update_program_with_courses(client: AsyncClient, program_payload, test_course):
    # 1. Create program
    resp = await client.post("/api/v1/programs/", json=program_payload)
    program_id = resp.json()["data"]["id"]
    
    # 2. Update with a course
    update_payload = {
        **program_payload,
        "courses": [
            {"course_id": test_course.id, "order_index": 0}
        ]
    }
    resp_update = await client.put(f"/api/v1/programs/{program_id}", json=update_payload)
    assert resp_update.status_code == 200
    updated_data = resp_update.json()["data"]
    assert len(updated_data["courses"]) == 1
    assert updated_data["courses"][0]["course_id"] == test_course.id

@pytest.mark.asyncio
async def test_enroll_and_query_members(client: AsyncClient, program_payload, test_course):
    # 1. Create program with course
    resp = await client.post("/api/v1/programs/", json=program_payload)
    program_id = resp.json()["data"]["id"]
    
    update_payload = {
        **program_payload,
        "courses": [
            {"course_id": test_course.id, "order_index": 0}
        ]
    }
    await client.put(f"/api/v1/programs/{program_id}", json=update_payload)
    
    # 2. Enroll current admin user in the program
    enroll_resp = await client.post(f"/api/v1/programs/{program_id}/enroll")
    assert enroll_resp.status_code == 201
    
    # 3. Retrieve program members list
    members_resp = await client.get(f"/api/v1/programs/{program_id}/members")
    assert members_resp.status_code == 200
    members = members_resp.json()["data"]
    assert len(members) == 1
    assert members[0]["progress"] == 0
