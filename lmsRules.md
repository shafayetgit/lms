> **These rules are the authoritative guide for any AI agent working on this codebase.**
> Read them entirely before writing or modifying any code.

---

## Project Overview

This is a full-stack **Learning Management System (LMS)** codenamed **"Elite LMS"**.

| Layer | Stack |
|---|---|
| **Frontend** | Next.js 16 (App Router, Turbopack), React 19, MUI v9, Redux Toolkit / RTK Query, Formik + Yup, Framer Motion |
| **Backend** | FastAPI (fully async), SQLAlchemy 2 (async), Alembic, Pydantic v2, PostgreSQL 16, Redis 7, Celery


## Frontend Rules

### Path Aliases

- Always use the `@/` alias for imports (maps to `./src/`):
- Always use reusable components from `src/components`
- Keep the code consise and readable, follow category and course modules structure in folder and file naming and coding style. and folder and component naming convension
- Do not use comments excessively. Comment only where necessary. and it will be developer like comments not like ai comments or explanation. such as: `// fixed this bug` or `// TODO: implement this feature`. NOT `// this code is doing this and that`
- Do not repeat code. Use helper functions and components to avoid code duplication.
- Always use latest stable version of libraries and syntaxes. such as: react 19, next 16, mui 9, redux toolkit / rtk query, formik + yup, framer motion, tailwind css v4



## Backend Rules
 - Follow and course module sturcture from the existing codes.
 - remember that the codebase is async first.
 - Always use latest stable version of libraries and syntaxes.
 
