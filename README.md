<div align="center">

<img src="./frontend/public/logo.svg" alt="PassDown Logo" width="88" height="88" />

# PassDown

**So the next student doesn't have to ask around for what you already know.**

An academic course-material link archive and peer resource repository where students browse, request, and contribute verified study links ahead of the semester.

<p align="center">
  <img src="[https://img.shields.io/badge/Release-v0.2.0%20(Beta)-0F5338?style=flat-square](https://img.shields.io/badge/Release-v0.2.0%20(Beta)-0F5338?style=flat-square)" alt="Release v0.2.0" />
  <img src="[https://img.shields.io/badge/React_19-TypeScript-111315?style=flat-square&logo=react&logoColor=61DAFB](https://img.shields.io/badge/React_19-TypeScript-111315?style=flat-square&logo=react&logoColor=61DAFB)" alt="React TypeScript" />
  <img src="[https://img.shields.io/badge/FastAPI-Python_3.10+-009688?style=flat-square&logo=fastapi&logoColor=white](https://img.shields.io/badge/FastAPI-Python_3.10+-009688?style=flat-square&logo=fastapi&logoColor=white)" alt="FastAPI Python" />
  <img src="[https://img.shields.io/badge/SQLAlchemy_2.0-Supabase_PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white](https://img.shields.io/badge/SQLAlchemy_2.0-Supabase_PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white)" alt="Supabase PostgreSQL" />
  <img src="[https://img.shields.io/badge/Auth-OAuth2_%2B_JWT_%2B_Argon2id-111315?style=flat-square](https://img.shields.io/badge/Auth-OAuth2_%2B_JWT_%2B_Argon2id-111315?style=flat-square)" alt="OAuth2 JWT Argon2id" />
  <img src="[https://img.shields.io/badge/Deployed_on-Vercel-000000?style=flat-square&logo=vercel&logoColor=white](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)" alt="Deployed on Vercel" />
  <img src="[https://img.shields.io/badge/License-MIT-0F5338?style=flat-square](https://img.shields.io/badge/License-MIT-0F5338?style=flat-square)" alt="License MIT" />
</p>

<p align="center">
  <a href="[https://passdown-weld.vercel.app/](https://passdown-weld.vercel.app/)"><strong>Live Production App</strong></a> ·
  <a href="[https://passdown-weld.vercel.app/api/docs](https://passdown-weld.vercel.app/api/docs)"><strong>Interactive OpenAPI Docs</strong></a> ·
  <a href="./docs/01-prd.md"><strong>PRD</strong></a> ·
  <a href="./docs/02-srs.md"><strong>SRS</strong></a> ·
  <a href="./docs/03-tdd.md"><strong>TDD</strong></a> ·
  <a href="[https://github.com/tanjilhasanemon/passdown/issues](https://github.com/tanjilhasanemon/passdown/issues)"><strong>Issues &amp; PRs</strong></a>
</p>

</div>

---

## 📖 Overview

At most universities, previewing a course during a semester break means tracking down a senior who took it previously and asking for their notes. That process is informal, inconsistent, and leaves students without a central archive.

**PassDown** gives every course a structured, permanent directory with three sections:

| Module | Purpose | Access & Governance |
|---|---|---|
| **Core Materials** | Curated baseline links (`slides`, `notes`, `past_paper`, `book`, `other`) per course | Public read; created, updated, and deleted by **Admins** (`materials:write`) |
| **Student Contributions** | Peer-submitted study links that enter a `pending` moderation queue before publication | Submitted by **Students/Admins** (`contributions:write`); editable by owner while `pending`; reviewed by **Admins** (`contributions:moderate`) |
| **Material Requests** | Community posts asking for missing past papers, notes, or slides | Posted by **Students/Admins** (`requests:write`); marked `fulfilled` or deleted by the **Owner** or an **Admin** |

PassDown stores **validated `http://` and `https://` links** rather than hosting binary files—keeping the platform fast, secure against malicious URI schemes, and 100% operable on free-tier cloud infrastructure.

---

## 🏗️ Layered Architecture

| Architectural Layer | Directory | Responsibility |
|---|---|---|
| **Presentation & Auth Guard Layer** | `frontend/src/` | Two-column Swiss editorial directory, `AuthContext` (`sessionStorage`), Axios Bearer + `401` interceptors, `ProtectedRoute` & `RoleRoute` guards |
| **HTTP Router & Scope Layer** | `backend/api/v1/` | Parses HTTP requests, enforces `Security(get_current_user, scopes=[...])`, and formats responses |
| **Business & Ownership Service Layer** | `backend/services/` | Enforces status state machines (`pending` → `approved`/`rejected`), `409` duplicate checks, 5-attempt login lockout (`429`), and per-item ownership (`author_id == current_user.id`) |
| **Data Access Repository Layer** | `backend/repositories/` | Executes parameterized SQLAlchemy 2.0 queries, case-insensitive search (`q`), status/type filtering, grouped `COUNT` aggregations, and `limit`/`offset` pagination |
| **Persistence & Schema Layer** | `backend/models/` & `schemas/` | SQLAlchemy 2.0 `Mapped` tables (`course`, `core_material`, `contribution`, `request`, `app_user`) with `ON DELETE CASCADE` / `SET NULL`, paired with strict Pydantic v2 schemas |

---

## 🔐 Role-Based Access Control (RBAC) & Security Matrix

Every protected endpoint validates the caller's HS256 JWT signature, reloads the user record from the database (so deactivated accounts are blocked immediately), and verifies OAuth2 security scopes:

| Operation | Guest | Student | Admin | Required OAuth2 Scope |
|---|:---:|:---:|:---:|---|
| Browse courses, core materials, approved contributions & requests | ✅ | ✅ | ✅ | *Public (None)* |
| Register (`POST /auth/register`) & Log in (`POST /auth/login`) | ✅ | — | — | *Public (None)* |
| View own profile, summary counts, contributions & requests (`/me/*`) | ❌ | ✅ | ✅ | `profile:read` |
| Update own display name & password (`PATCH /me`, `POST /me/password`) | ❌ | ✅ | ✅ | `profile:write` |
| Submit contribution (`POST /courses/{id}/contributions`) | ❌ | ✅ | ✅ | `contributions:write` |
| Edit contribution (allowed only while `status == "pending"`) | ❌ | **Own** | **Own** | `contributions:write` |
| Delete contribution (`DELETE /contributions/{id}`) | ❌ | **Own** | **Any** | `contributions:write` |
| Post material request (`POST /courses/{id}/requests`) | ❌ | ✅ | ✅ | `requests:write` |
| Edit, mark `fulfilled`, or delete request | ❌ | **Own** | **Any** | `requests:write` |
| View cross-course moderation queue & approve/reject contributions | ❌ | ❌ | ✅ | `contributions:moderate` |
| Create, update, and delete courses (`/courses`) | ❌ | ❌ | ✅ | `courses:write` |
| Create, update, and delete core materials (`/core-materials`) | ❌ | ❌ | ✅ | `materials:write` |
| View platform-wide statistics (`GET /admin/stats`) | ❌ | ❌ | ✅ | `stats:read` |
| List users & activate/deactivate accounts (`/admin/users/*`) | ❌ | ❌ | ✅ | `users:manage` |

---

## 🗺️ Release Roadmap & Milestones

**🟢 MVP Release (`v0.1.0` — Mid-Term Assessment: 30/30 Marks)**
- [x] Course catalog with case-insensitive search (`q`), department/level filtering, and incremental **Load More** pagination (`limit` & `offset`)
- [x] Core Materials CRUD with resource type filtering (`slides`, `notes`, `past_paper`, `book`, `other`)
- [x] Student Contributions CRUD with `pending` → `approved` / `rejected` review lifecycle
- [x] Material Requests CRUD with idempotent `open` → `fulfilled` state transitions
- [x] Full-viewport responsive React 19 + TypeScript SPA with Archival Light & Graphite Dark themes

**🔵 Beta Release (`v0.2.0` — Final Release)**
- [x] User registration and OAuth2 password-flow login with signed HS256 JWTs (`60-min` expiry)
- [x] Argon2id password hashing (`argon2-cffi`) and 5-attempt / 15-minute account lockout (`429 Too Many Requests`)
- [x] FastAPI `SecurityScopes` enforcement and service-layer item ownership verification
- [x] Student Profile Dashboard (`/dashboard`) with summary counts, own submissions, and profile/password management
- [x] Admin Control Center (`/admin`) with platform statistics, moderation queue, and user activation/deactivation controls
- [x] HTTP security headers (`CSP`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`), Alembic migrations, and production deployment on Vercel + Supabase PostgreSQL

---

## 🧪 Demo Accounts (Live & Local Evaluation)

On the [`/login`](https://passdown-weld.vercel.app/login) page, you can sign in with **1 click** using the pre-seeded evaluation accounts:

| Role | Email | Password | Capabilities |
|---|---|---|---|
| **Admin** | `admin@passdown.edu` | `Admin1234` | Full access to `/admin` (stats, moderation queue, user activation), `/admin/courses`, `/admin/materials`, and `/dashboard` |
| **Student** | `student@passdown.edu` | `Student1234` | Submit contributions & requests, edit/delete own items, and manage `/dashboard` |

---

## 📁 Repository Structure

    passdown/
    ├── backend/
    │   ├── main.py                  FastAPI app entry point, CORS, security headers & /api/docs
    │   ├── requirements.txt         Python dependencies for Vercel & local venv
    │   ├── alembic.ini              Alembic migration configuration
    │   ├── alembic/                 Schema migrations (0001_mvp_initial, 0002_beta_auth)
    │   ├── core/                    config.py, database.py (SQLite + Supabase NullPool), security.py
    │   ├── dependencies/            OAuth2PasswordBearer & get_current_user (SecurityScopes)
    │   ├── models/                  ORM models (course, core_material, contribution, request, app_user)
    │   ├── schemas/                 Pydantic v2 request/response schemas & URL validators
    │   ├── repositories/            Parameterized SQLAlchemy queries & grouped COUNT stats
    │   ├── services/                Business logic, ownership checks & lockout rules
    │   ├── api/v1/                  REST routers (auth, me, admin, courses, core_materials, contributions, requests)
    │   └── scripts/                 Idempotent seed scripts (seed_admin.py, seed_mvp.py)
    ├── frontend/
    │   ├── public/logo.svg          Official PassDown vector avatar & browser favicon
    │   ├── index.html               App shell & typography imports
    │   └── src/                     api/, auth/, components/, pages/, types/
    ├── docs/                        01-prd.md, 02-srs.md, 03-tdd.md (v2.0 Final)
    ├── .github/                     Issue templates & Pull Request template
    ├── vercel.json                  Unified Vercel routing (/api/* -> FastAPI, /* -> Vite SPA)
    └── .env.example                 Environment variable template

---

## 🚀 Getting Started Locally / GitHub Codespaces

### Prerequisites
- [Python](https://www.python.org/downloads/) 3.10+
- [Node.js](https://nodejs.org/) 22+

### 1. Clone the repository

    git clone https://github.com/tanjilhasanemon/passdown.git
    cd passdown

### 2. Configure environment variables

    cp .env.example backend/.env

### 3. Start the FastAPI backend (Terminal 1)

    cd backend
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
    python3 scripts/seed_admin.py
    python3 scripts/seed_mvp.py
    fastapi dev main.py

- Interactive Swagger UI: <http://localhost:8000/api/docs>
- Health Check: <http://localhost:8000/api/health>

### 4. Start the React + Vite frontend (Terminal 2)

    cd frontend
    npm install
    npm run dev

- Web Application: <http://localhost:5173> (Vite proxies `/api` requests to port `8000`).

---

## ☁️ Production Deployment (Vercel + Supabase)

1. Create a free PostgreSQL project on [Supabase](https://supabase.com/) and copy the **Transaction Pooler** URI (port `6543`).
2. Import the repository at [vercel.com/new](https://vercel.com/new) with **Root Directory** set to `./`.
3. Configure `DATABASE_URL` and `JWT_SECRET` (32+ random characters) in **Vercel → Settings → Environment Variables**.
4. Every Pull Request merged into `main` automatically deploys the updated frontend and serverless FastAPI backend.

---

## 📄 Engineering Documentation

- **[PRD (`docs/01-prd.md`)](./docs/01-prd.md)**: Product Requirements Document, release plan, user stories, and success metrics
- **[SRS (`docs/02-srs.md`)](./docs/02-srs.md)**: Functional requirements (`FR-01`–`FR-46`), non-functional requirements (`NFR-01`–`NFR-18`), permission matrix, and acceptance criteria (`AC-01`–`AC-30`)
- **[TDD (`docs/03-tdd.md`)](./docs/03-tdd.md)**: Layered architecture, ERD, REST endpoint specifications, JWT/RBAC security design, and deployment topology
- **[Contributing Guidelines (`CONTRIBUTING.md`)](./CONTRIBUTING.md)** · **[Security Policy (`SECURITY.md`)](./SECURITY.md)** · **[Code of Conduct (`CODE_OF_CONDUCT.md`)](./CODE_OF_CONDUCT.md)**

## 📜 License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for details.

---

<div align="center">

Built by **Tanjil Hasan Emon** (ID: 2331024) · **CSE 309: Web Applications & Internet** · Independent University, Bangladesh (IUB)

</div><div align="center">

<img src="./frontend/public/logo.svg" alt="PassDown Logo" width="88" height="88" />

# PassDown

**So the next student doesn't have to ask around for what you already know.**

An academic course-material link archive and peer resource repository where students browse, request, and contribute verified study links ahead of the semester.

<p align="center">
  <img src="[https://img.shields.io/badge/Release-v0.2.0%20(Beta)-0F5338?style=flat-square](https://img.shields.io/badge/Release-v0.2.0%20(Beta)-0F5338?style=flat-square)" alt="Release v0.2.0" />
  <img src="[https://img.shields.io/badge/React_19-TypeScript-111315?style=flat-square&logo=react&logoColor=61DAFB](https://img.shields.io/badge/React_19-TypeScript-111315?style=flat-square&logo=react&logoColor=61DAFB)" alt="React TypeScript" />
  <img src="[https://img.shields.io/badge/FastAPI-Python_3.10+-009688?style=flat-square&logo=fastapi&logoColor=white](https://img.shields.io/badge/FastAPI-Python_3.10+-009688?style=flat-square&logo=fastapi&logoColor=white)" alt="FastAPI Python" />
  <img src="[https://img.shields.io/badge/SQLAlchemy_2.0-Supabase_PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white](https://img.shields.io/badge/SQLAlchemy_2.0-Supabase_PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white)" alt="Supabase PostgreSQL" />
  <img src="[https://img.shields.io/badge/Auth-OAuth2_%2B_JWT_%2B_Argon2id-111315?style=flat-square](https://img.shields.io/badge/Auth-OAuth2_%2B_JWT_%2B_Argon2id-111315?style=flat-square)" alt="OAuth2 JWT Argon2id" />
  <img src="[https://img.shields.io/badge/Deployed_on-Vercel-000000?style=flat-square&logo=vercel&logoColor=white](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)" alt="Deployed on Vercel" />
  <img src="[https://img.shields.io/badge/License-MIT-0F5338?style=flat-square](https://img.shields.io/badge/License-MIT-0F5338?style=flat-square)" alt="License MIT" />
</p>

<p align="center">
  <a href="[https://passdown-weld.vercel.app/](https://passdown-weld.vercel.app/)"><strong>Live Production App</strong></a> ·
  <a href="[https://passdown-weld.vercel.app/api/docs](https://passdown-weld.vercel.app/api/docs)"><strong>Interactive OpenAPI Docs</strong></a> ·
  <a href="./docs/01-prd.md"><strong>PRD</strong></a> ·
  <a href="./docs/02-srs.md"><strong>SRS</strong></a> ·
  <a href="./docs/03-tdd.md"><strong>TDD</strong></a> ·
  <a href="[https://github.com/tanjilhasanemon/passdown/issues](https://github.com/tanjilhasanemon/passdown/issues)"><strong>Issues &amp; PRs</strong></a>
</p>

</div>

---

## 📖 Overview

At most universities, previewing a course during a semester break means tracking down a senior who took it previously and asking for their notes. That process is informal, inconsistent, and leaves students without a central archive.

**PassDown** gives every course a structured, permanent directory with three sections:

| Module | Purpose | Access & Governance |
|---|---|---|
| **Core Materials** | Curated baseline links (`slides`, `notes`, `past_paper`, `book`, `other`) per course | Public read; created, updated, and deleted by **Admins** (`materials:write`) |
| **Student Contributions** | Peer-submitted study links that enter a `pending` moderation queue before publication | Submitted by **Students/Admins** (`contributions:write`); editable by owner while `pending`; reviewed by **Admins** (`contributions:moderate`) |
| **Material Requests** | Community posts asking for missing past papers, notes, or slides | Posted by **Students/Admins** (`requests:write`); marked `fulfilled` or deleted by the **Owner** or an **Admin** |

PassDown stores **validated `http://` and `https://` links** rather than hosting binary files—keeping the platform fast, secure against malicious URI schemes, and 100% operable on free-tier cloud infrastructure.

---

## 🏗️ Layered Architecture

| Architectural Layer | Directory | Responsibility |
|---|---|---|
| **Presentation & Auth Guard Layer** | `frontend/src/` | Two-column Swiss editorial directory, `AuthContext` (`sessionStorage`), Axios Bearer + `401` interceptors, `ProtectedRoute` & `RoleRoute` guards |
| **HTTP Router & Scope Layer** | `backend/api/v1/` | Parses HTTP requests, enforces `Security(get_current_user, scopes=[...])`, and formats responses |
| **Business & Ownership Service Layer** | `backend/services/` | Enforces status state machines (`pending` → `approved`/`rejected`), `409` duplicate checks, 5-attempt login lockout (`429`), and per-item ownership (`author_id == current_user.id`) |
| **Data Access Repository Layer** | `backend/repositories/` | Executes parameterized SQLAlchemy 2.0 queries, case-insensitive search (`q`), status/type filtering, grouped `COUNT` aggregations, and `limit`/`offset` pagination |
| **Persistence & Schema Layer** | `backend/models/` & `schemas/` | SQLAlchemy 2.0 `Mapped` tables (`course`, `core_material`, `contribution`, `request`, `app_user`) with `ON DELETE CASCADE` / `SET NULL`, paired with strict Pydantic v2 schemas |

---

## 🔐 Role-Based Access Control (RBAC) & Security Matrix

Every protected endpoint validates the caller's HS256 JWT signature, reloads the user record from the database (so deactivated accounts are blocked immediately), and verifies OAuth2 security scopes:

| Operation | Guest | Student | Admin | Required OAuth2 Scope |
|---|:---:|:---:|:---:|---|
| Browse courses, core materials, approved contributions & requests | ✅ | ✅ | ✅ | *Public (None)* |
| Register (`POST /auth/register`) & Log in (`POST /auth/login`) | ✅ | — | — | *Public (None)* |
| View own profile, summary counts, contributions & requests (`/me/*`) | ❌ | ✅ | ✅ | `profile:read` |
| Update own display name & password (`PATCH /me`, `POST /me/password`) | ❌ | ✅ | ✅ | `profile:write` |
| Submit contribution (`POST /courses/{id}/contributions`) | ❌ | ✅ | ✅ | `contributions:write` |
| Edit contribution (allowed only while `status == "pending"`) | ❌ | **Own** | **Own** | `contributions:write` |
| Delete contribution (`DELETE /contributions/{id}`) | ❌ | **Own** | **Any** | `contributions:write` |
| Post material request (`POST /courses/{id}/requests`) | ❌ | ✅ | ✅ | `requests:write` |
| Edit, mark `fulfilled`, or delete request | ❌ | **Own** | **Any** | `requests:write` |
| View cross-course moderation queue & approve/reject contributions | ❌ | ❌ | ✅ | `contributions:moderate` |
| Create, update, and delete courses (`/courses`) | ❌ | ❌ | ✅ | `courses:write` |
| Create, update, and delete core materials (`/core-materials`) | ❌ | ❌ | ✅ | `materials:write` |
| View platform-wide statistics (`GET /admin/stats`) | ❌ | ❌ | ✅ | `stats:read` |
| List users & activate/deactivate accounts (`/admin/users/*`) | ❌ | ❌ | ✅ | `users:manage` |

---

## 🗺️ Release Roadmap & Milestones

**🟢 MVP Release (`v0.1.0` — Mid-Term Assessment: 30/30 Marks)**
- [x] Course catalog with case-insensitive search (`q`), department/level filtering, and incremental **Load More** pagination (`limit` & `offset`)
- [x] Core Materials CRUD with resource type filtering (`slides`, `notes`, `past_paper`, `book`, `other`)
- [x] Student Contributions CRUD with `pending` → `approved` / `rejected` review lifecycle
- [x] Material Requests CRUD with idempotent `open` → `fulfilled` state transitions
- [x] Full-viewport responsive React 19 + TypeScript SPA with Archival Light & Graphite Dark themes

**🔵 Beta Release (`v0.2.0` — Final Release)**
- [x] User registration and OAuth2 password-flow login with signed HS256 JWTs (`60-min` expiry)
- [x] Argon2id password hashing (`argon2-cffi`) and 5-attempt / 15-minute account lockout (`429 Too Many Requests`)
- [x] FastAPI `SecurityScopes` enforcement and service-layer item ownership verification
- [x] Student Profile Dashboard (`/dashboard`) with summary counts, own submissions, and profile/password management
- [x] Admin Control Center (`/admin`) with platform statistics, moderation queue, and user activation/deactivation controls
- [x] HTTP security headers (`CSP`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`), Alembic migrations, and production deployment on Vercel + Supabase PostgreSQL

---

## 🧪 Demo Accounts (Live & Local Evaluation)

On the [`/login`](https://passdown-weld.vercel.app/login) page, you can sign in with **1 click** using the pre-seeded evaluation accounts:

| Role | Email | Password | Capabilities |
|---|---|---|---|
| **Admin** | `admin@passdown.edu` | `Admin1234` | Full access to `/admin` (stats, moderation queue, user activation), `/admin/courses`, `/admin/materials`, and `/dashboard` |
| **Student** | `student@passdown.edu` | `Student1234` | Submit contributions & requests, edit/delete own items, and manage `/dashboard` |

---

## 📁 Repository Structure

    passdown/
    ├── backend/
    │   ├── main.py                  FastAPI app entry point, CORS, security headers & /api/docs
    │   ├── requirements.txt         Python dependencies for Vercel & local venv
    │   ├── alembic.ini              Alembic migration configuration
    │   ├── alembic/                 Schema migrations (0001_mvp_initial, 0002_beta_auth)
    │   ├── core/                    config.py, database.py (SQLite + Supabase NullPool), security.py
    │   ├── dependencies/            OAuth2PasswordBearer & get_current_user (SecurityScopes)
    │   ├── models/                  ORM models (course, core_material, contribution, request, app_user)
    │   ├── schemas/                 Pydantic v2 request/response schemas & URL validators
    │   ├── repositories/            Parameterized SQLAlchemy queries & grouped COUNT stats
    │   ├── services/                Business logic, ownership checks & lockout rules
    │   ├── api/v1/                  REST routers (auth, me, admin, courses, core_materials, contributions, requests)
    │   └── scripts/                 Idempotent seed scripts (seed_admin.py, seed_mvp.py)
    ├── frontend/
    │   ├── public/logo.svg          Official PassDown vector avatar & browser favicon
    │   ├── index.html               App shell & typography imports
    │   └── src/                     api/, auth/, components/, pages/, types/
    ├── docs/                        01-prd.md, 02-srs.md, 03-tdd.md (v2.0 Final)
    ├── .github/                     Issue templates & Pull Request template
    ├── vercel.json                  Unified Vercel routing (/api/* -> FastAPI, /* -> Vite SPA)
    └── .env.example                 Environment variable template

---

## 🚀 Getting Started Locally / GitHub Codespaces

### Prerequisites
- [Python](https://www.python.org/downloads/) 3.10+
- [Node.js](https://nodejs.org/) 22+

### 1. Clone the repository

    git clone https://github.com/tanjilhasanemon/passdown.git
    cd passdown

### 2. Configure environment variables

    cp .env.example backend/.env

### 3. Start the FastAPI backend (Terminal 1)

    cd backend
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
    python3 scripts/seed_admin.py
    python3 scripts/seed_mvp.py
    fastapi dev main.py

- Interactive Swagger UI: <http://localhost:8000/api/docs>
- Health Check: <http://localhost:8000/api/health>

### 4. Start the React + Vite frontend (Terminal 2)

    cd frontend
    npm install
    npm run dev

- Web Application: <http://localhost:5173> (Vite proxies `/api` requests to port `8000`).

---

## ☁️ Production Deployment (Vercel + Supabase)

1. Create a free PostgreSQL project on [Supabase](https://supabase.com/) and copy the **Transaction Pooler** URI (port `6543`).
2. Import the repository at [vercel.com/new](https://vercel.com/new) with **Root Directory** set to `./`.
3. Configure `DATABASE_URL` and `JWT_SECRET` (32+ random characters) in **Vercel → Settings → Environment Variables**.
4. Every Pull Request merged into `main` automatically deploys the updated frontend and serverless FastAPI backend.

---

## 📄 Engineering Documentation

- **[PRD (`docs/01-prd.md`)](./docs/01-prd.md)**: Product Requirements Document, release plan, user stories, and success metrics
- **[SRS (`docs/02-srs.md`)](./docs/02-srs.md)**: Functional requirements (`FR-01`–`FR-46`), non-functional requirements (`NFR-01`–`NFR-18`), permission matrix, and acceptance criteria (`AC-01`–`AC-30`)
- **[TDD (`docs/03-tdd.md`)](./docs/03-tdd.md)**: Layered architecture, ERD, REST endpoint specifications, JWT/RBAC security design, and deployment topology
- **[Contributing Guidelines (`CONTRIBUTING.md`)](./CONTRIBUTING.md)** · **[Security Policy (`SECURITY.md`)](./SECURITY.md)** · **[Code of Conduct (`CODE_OF_CONDUCT.md`)](./CODE_OF_CONDUCT.md)**

## 📜 License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for details.

---

<div align="center">

Built by **Tanjil Hasan Emon** (ID: 2331024) · **CSE 309: Web Applications & Internet** · Independent University, Bangladesh (IUB)

</div>