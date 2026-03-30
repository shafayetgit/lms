### **1️⃣ Create & activate a virtual environment (recommended)**

```bash
python -m venv venv
source venv/bin/activate   # Linux/macOS
# OR
venv\Scripts\activate      # Windows
```

---

### **2️⃣ Install core FastAPI with ASGI server**

```bash
pip install "fastapi[standard]" uvicorn[standard]
```

* `fastapi[standard]` → installs FastAPI + Starlette + Pydantic + common extras.
* `uvicorn[standard]` → ASGI server with performance extras.

---

### **3️⃣ Install async database + migrations**

```bash
pip install sqlalchemy[asyncio] asyncpg alembic
```

* `sqlalchemy[asyncio]` → async DB ORM support.
* `asyncpg` → async PostgreSQL driver.
* `alembic` → migrations.

---

### **4️⃣ Install JWT + password hashing**

```bash
pip install pyjwt "pwdlib[argon2]"
```

* `pyjwt` → JWT token generation/verification.
* `pwdlib[argon2]` → secure password hashing with Argon2 (recommended).

> Optional: if you want `python-jose` for RS256/RSA JWTs:

```bash
pip install "python-jose[cryptography]"
```

---

### **5️⃣ Install Redis + HTTP client for async tasks**

```bash
pip install redis httpx
```

* `redis` → backend for Celery or async caching.
* `httpx` → async HTTP client (if you call external APIs).

---

### **6️⃣ Optional: Pydantic settings for config management**

```bash
pip install pydantic-settings
```

* Makes managing environment variables & config async-friendly and clean.

---

### ✅ **All together (single command)**

You could also run this in one go:

```bash
uv add "fastapi[standard-no-fastapi-cloud-cli]" uvicorn[standard] sqlalchemy[asyncio] asyncpg alembic pyjwt "pwdlib[argon2]" redis httpx pydantic-settings psycopg2-binary
```
