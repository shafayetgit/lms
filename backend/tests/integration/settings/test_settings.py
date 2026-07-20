import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_get_settings(client: AsyncClient):
    """Test retrieving settings details."""
    response = await client.get("/api/v1/settings/")
    assert response.status_code == 200
    data = response.json()
    
    # Check default/fallback settings structure
    assert "default_currency" in data
    assert "site_logo_dark" in data
    assert "site_logo_light" in data
    assert "site_short_logo_dark" in data
    assert "site_short_logo_light" in data
    assert "certificate_logo" in data
    assert "send_payment_reminders_for_batch" in data
    assert "send_payment_reminders_for_course" in data
    assert "payment_gateway" in data
    assert "apply_rounding_on_equivalent" in data

@pytest.mark.asyncio
async def test_update_settings(client: AsyncClient):
    """Test updating settings with new values."""
    update_payload = {
        "default_currency": "EUR",
        "payment_gateway": "Stripe",
        "site_logo_dark": "https://example.com/logo-dark.png",
        "site_logo_light": "https://example.com/logo-light.png",
        "site_short_logo_dark": "https://example.com/logo-short-dark.png",
        "site_short_logo_light": "https://example.com/logo-short-light.png",
        "certificate_logo": "https://example.com/logo-cert.png",
        "send_payment_reminders_for_batch": True,
        "send_payment_reminders_for_course": True,
        "apply_rounding_on_equivalent": True,
    }
    response = await client.put("/api/v1/settings/", json=update_payload)
    assert response.status_code == 200
    data = response.json()
    
    assert data["default_currency"] == "EUR"
    assert data["payment_gateway"] == "Stripe"
    assert data["site_logo_dark"] == "https://example.com/logo-dark.png"
    assert data["site_logo_light"] == "https://example.com/logo-light.png"
    assert data["site_short_logo_dark"] == "https://example.com/logo-short-dark.png"
    assert data["site_short_logo_light"] == "https://example.com/logo-short-light.png"
    assert data["certificate_logo"] == "https://example.com/logo-cert.png"
    assert data["send_payment_reminders_for_batch"] is True
    assert data["send_payment_reminders_for_course"] is True
    assert data["apply_rounding_on_equivalent"] is True
