# Testing Guide

This document outlines the testing infrastructure, configuration, and best practices for the LMS backend.

## 🛠️ Requirements

The project uses the following tools for testing:
- **[pytest](https://docs.pytest.org/)**: Core testing framework.
- **[pytest-asyncio](https://github.com/pytest-dev/pytest-asyncio)**: Support for testing asynchronous code (FastAPI, SQLAlchemy).
- **[httpx](https://www.python-httpx.org/)**: Async HTTP client for integration testing endpoints.

## ⚙️ Configuration

### Pytest Settings ([pytest.ini](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/pytest.ini))
```ini
[pytest]
asyncio_mode = auto
asyncio_default_fixture_loop_scope = function
```
> [!IMPORTANT]
> `asyncio_default_fixture_loop_scope` must be set to `function` to ensure that every test and its fixtures share the same event loop, preventing "Task attached to different loop" errors during teardown.

### Fixtures ([conftest.py](file:///home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend/app/tests/conftest.py))
- `db_engine`: Creates an isolated SQLAlchemy engine for the test.
- `db_session`: Provides an `AsyncSession` injected into the app.
- `client`: An `AsyncClient` that points to the FastAPI app with the database dependency overridden.

## 🗄️ Database Strategy

To ensure clean test execution and avoid `asyncpg` transaction/loop conflicts:
1.  **NullPool**: We use `poolclass=NullPool` in tests to disable connection pooling. This ensures connections are closed immediately after each test.
2.  **Unique Data**: Tests should generate unique data (e.g., using `uuid`) to avoid primary key/unique constraint conflicts when running against a shared development database.

## ✍️ Writing a Test

Example of an integration test for a new endpoint:

```python
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_your_feature(client: AsyncClient):
    response = await client.post("/api/v1/feature/", json={"name": "Test"})
    assert response.status_code == 201
    assert response.json()["name"] == "Test"
```

## 🚀 Running Tests

Run all tests from the root directory:
```bash
PYTHONPATH=. ./.venv/bin/pytest
```

Run specific test files:
```bash
PYTHONPATH=. ./.venv/bin/pytest app/tests/test_categories.py -v
```

## ⚠️ Common Issues & Fixes

### "Task got Future attached to a different loop"
- **Cause**: Fixture scope mismatch or loop closed before cleanup.
- **Fix**: Ensure `pytest.ini` has `asyncio_default_fixture_loop_scope = function` and `conftest.py` uses `NullPool`.

### "InterfaceError: cannot use Connection.transaction() in a manually started transaction"
- **Cause**: Nested transactions in `asyncpg`.
- **Fix**: Avoid using `session.begin()` in fixtures if the production code already manages transactions, or ensure proper rollback/commit cycles.
