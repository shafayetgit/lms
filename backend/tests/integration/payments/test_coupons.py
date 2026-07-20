import pytest
from datetime import date, timedelta
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_and_validate_coupon_with_items(client: AsyncClient):
    # 1. Create a coupon with item restrictions (Course #1)
    coupon_payload = {
        "code": "SUMMER50",
        "type": "Percent",
        "discount": 50.0,
        "validity": str(date.today() + timedelta(days=10)),
        "max_uses": 5,
        "is_active": True,
        "applicable_items": [
            {"reference_type": "Course", "reference_id": 1}
        ]
    }

    response = await client.post(
        "/api/v1/payments/coupons",
        json=coupon_payload
    )
    assert response.status_code == 201
    res_data = response.json()
    assert res_data["success"] is True
    assert res_data["data"]["code"] == "SUMMER50"
    assert len(res_data["data"]["applicable_items"]) == 1

    # 2. Validate coupon for applicable item (Course #1)
    val_payload = {
        "code": "SUMMER50",
        "amount": 100.0,
        "payment_for_type": "Course",
        "payment_for_id": 1
    }
    val_resp = await client.post(
        "/api/v1/payments/coupons/validate",
        json=val_payload
    )
    assert val_resp.status_code == 201
    val_data = val_resp.json()
    assert val_data["success"] is True
    assert val_data["data"]["discount_amount"] == 50.0
    assert val_data["data"]["final_amount"] == 50.0

    # 3. Validate coupon for non-applicable item (Course #2) -> Error
    invalid_item_payload = {
        "code": "SUMMER50",
        "amount": 100.0,
        "payment_for_type": "Course",
        "payment_for_id": 2
    }
    inv_resp = await client.post(
        "/api/v1/payments/coupons/validate",
        json=invalid_item_payload
    )
    assert inv_resp.status_code == 400
    assert "not applicable" in inv_resp.json()["message"].lower()


@pytest.mark.asyncio
async def test_create_and_validate_coupon_batch_and_program(client: AsyncClient):
    # 1. Create a coupon with Batch and Program restrictions
    coupon_payload = {
        "code": "BATCHPROG30",
        "type": "Percent",
        "discount": 30.0,
        "validity": str(date.today() + timedelta(days=5)),
        "max_uses": 10,
        "is_active": True,
        "applicable_items": [
            {"reference_type": "Batch", "reference_id": 5},
            {"reference_type": "Program", "reference_id": 12}
        ]
    }

    response = await client.post(
        "/api/v1/payments/coupons",
        json=coupon_payload
    )
    assert response.status_code == 201
    res_data = response.json()
    assert res_data["success"] is True
    assert len(res_data["data"]["applicable_items"]) == 2

    # 2. Validate for Batch #5 -> Should succeed
    val_payload_batch = {
        "code": "BATCHPROG30",
        "amount": 200.0,
        "payment_for_type": "Batch",
        "payment_for_id": 5
    }
    val_resp_batch = await client.post(
        "/api/v1/payments/coupons/validate",
        json=val_payload_batch
    )
    assert val_resp_batch.status_code == 201
    val_data_batch = val_resp_batch.json()
    assert val_data_batch["success"] is True
    assert val_data_batch["data"]["discount_amount"] == 60.0

    # 3. Validate for Program #12 -> Should succeed
    val_payload_prog = {
        "code": "BATCHPROG30",
        "amount": 300.0,
        "payment_for_type": "Program",
        "payment_for_id": 12
    }
    val_resp_prog = await client.post(
        "/api/v1/payments/coupons/validate",
        json=val_payload_prog
    )
    assert val_resp_prog.status_code == 201
    val_data_prog = val_resp_prog.json()
    assert val_data_prog["success"] is True
    assert val_data_prog["data"]["discount_amount"] == 90.0

    # 4. Validate for Batch #6 -> Should fail (not applicable)
    invalid_payload = {
        "code": "BATCHPROG30",
        "amount": 200.0,
        "payment_for_type": "Batch",
        "payment_for_id": 6
    }
    inv_resp = await client.post(
        "/api/v1/payments/coupons/validate",
        json=invalid_payload
    )
    assert inv_resp.status_code == 400
    assert "not applicable" in inv_resp.json()["message"].lower()
