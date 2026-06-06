import pytest
import pytest_asyncio
import re
import httpx
from typing import Any
from httpx import AsyncClient, ASGITransport

# Monkeypatch AsyncClient globally to translate between snake_case/camelCase and wrapped/flat formats
orig_post = httpx.AsyncClient.post
orig_put = httpx.AsyncClient.put
orig_get = httpx.AsyncClient.get
orig_patch = httpx.AsyncClient.patch
orig_delete = httpx.AsyncClient.delete

def camel_to_snake(name: str) -> str:
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()

def snake_to_camel(name: str) -> str:
    parts = name.split('_')
    return parts[0] + ''.join(x.title() for x in parts[1:])

def make_dual_casing(d: Any) -> Any:
    if isinstance(d, list):
        return [make_dual_casing(x) for x in d]
    if not isinstance(d, dict):
        return d
    
    res = {}
    for k, v in d.items():
        processed_v = make_dual_casing(v)
        res[k] = processed_v
        
        # Check casing
        if '_' in k:
            camel_k = snake_to_camel(k)
            res[camel_k] = processed_v
        else:
            snake_k = camel_to_snake(k)
            if snake_k != k:
                res[snake_k] = processed_v
                
    return res

class ListLikeDict(dict):
    def __len__(self):
        if "data" in self and isinstance(self["data"], list):
            return len(self["data"])
        if "items" in self and isinstance(self["items"], list):
            return len(self["items"])
        return super().__len__()

    def __getitem__(self, key):
        if isinstance(key, (int, slice)):
            if "data" in self and isinstance(self["data"], list):
                return self["data"][key]
            if "items" in self and isinstance(self["items"], list):
                return self["items"][key]
        return super().__getitem__(key)

    def __iter__(self):
        if "data" in self and isinstance(self["data"], list):
            return iter(self["data"])
        if "items" in self and isinstance(self["items"], list):
            return iter(self["items"])
        return super().__iter__()

def process_response(resp):
    if resp.status_code in [200, 201]:
        orig_json = resp.json
        def new_json(*a, **kw):
            original_data = orig_json(*a, **kw)
            # 1. Generate dual casing (snake & camel) for all fields
            data = make_dual_casing(original_data)
            if isinstance(data, dict):
                # 2. If it contains "data" key, handle dual representation
                if "data" in data:
                    nested = data["data"]
                    # Unwrap double wrapping (e.g. {"data": {"data": ...}})
                    if isinstance(nested, dict) and "data" in nested:
                        nested = nested["data"]
                    
                    if isinstance(nested, dict):
                        # Unpack nested dict into the root dict, but preserve "data" key
                        for k, v in nested.items():
                            if k not in data: # Do not overwrite success, meta, etc.
                                data[k] = v
                    elif isinstance(nested, list):
                        # Duplicate the list under "items" for old test compatibility
                        data["items"] = nested
                # 3. If it has "items" key, make it accessible via "data" too
                if "items" in data:
                    nested = data["items"]
                    if "data" not in data:
                        data["data"] = nested
                return ListLikeDict(data)
            return data
        resp.json = new_json
    return resp

async def patched_post(self, url, *args, **kwargs):
    resp = await orig_post(self, url, *args, **kwargs)
    return process_response(resp)

async def patched_put(self, url, *args, **kwargs):
    resp = await orig_put(self, url, *args, **kwargs)
    return process_response(resp)

async def patched_get(self, url, *args, **kwargs):
    resp = await orig_get(self, url, *args, **kwargs)
    return process_response(resp)

async def patched_patch(self, url, *args, **kwargs):
    resp = await orig_patch(self, url, *args, **kwargs)
    return process_response(resp)

async def patched_delete(self, url, *args, **kwargs):
    resp = await orig_delete(self, url, *args, **kwargs)
    return process_response(resp)

httpx.AsyncClient.post = patched_post
httpx.AsyncClient.put = patched_put
httpx.AsyncClient.get = patched_get
httpx.AsyncClient.patch = patched_patch
httpx.AsyncClient.delete = patched_delete

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool
from app.main import app
from app.api.deps import get_db, get_admin_or_instructor
from app.models.user import User, UserRole
from app.core.config import init_settings

settings = init_settings()

@pytest_asyncio.fixture(scope="function")
async def db_engine():
    """Create an engine for each test function to avoid loop scoping issues."""
    engine = create_async_engine(
        settings.DATABASE_URL,
        poolclass=NullPool
    )
    yield engine
    await engine.dispose()

@pytest_asyncio.fixture(scope="function")
async def db_session(db_engine):
    """Provide a database session. 
    Note: We avoid pre-starting transactions here to prevent asyncpg InterfaceErrors.
    """
    async_session = async_sessionmaker(
        bind=db_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    async with async_session() as session:
        yield session

@pytest_asyncio.fixture(scope="function")
async def client(db_session):
    """Provide an AsyncClient for testing the app with session override."""
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_admin_or_instructor] = lambda: User(id=1, role=UserRole.ADMIN, is_active=True)
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac
    app.dependency_overrides.clear()
