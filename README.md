<div align="center">

# 📚 PassDown

**So the next student doesn't have to ask around for what you already know.**

A course-material sharing platform where students find, request, and contribute
links to course resources, ahead of the semester and without chasing seniors.

![React](https://img.shields.io/badge/React-TypeScript-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

[Live Demo](https://passdown-weld.vercel.app/) · [Documentation](./docs) · [Report an Issue](../../issues)

</div>

---

## 📖 About

At most universities, the only way to preview a course during a semester gap is
to track down a senior and ask for their notes. It is inconsistent, hard to
scale, and leaves students without a reliable way to prepare.

**PassDown** gives every course one organized place for its materials. It
doesn't host files. It stores and organizes **links** (Google Drive, OneDrive,
GitHub, and so on), which keeps the platform lightweight and free to run.

Built as the semester project for **CSE 309: Web Applications & Internet**
at Independent University, Bangladesh (IUB).

## ✨ Features

| Section | Description |
|---|---|
| 📚 **Core Materials** | Curated, reliable resources per course, managed by admins and read-only for everyone else |
| 🤝 **Contributions** | Students submit links to materials they have; admins review them before they go public |
| 🙋 **Requests** | Students ask the community for materials they can't find |
| 🔐 **Access Control** | Role-based permissions (Admin, Student, Guest) enforced on the API with security scopes |

## 🗺️ Roadmap

The project ships in two releases.

**🟢 MVP: Mid-term demo (runs locally)**
- [ ] Course management (CRUD)
- [ ] Core Materials (CRUD)
- [ ] Contributions (CRUD)
- [ ] Requests (CRUD)
- [ ] React + TypeScript UI connected to the REST API

**🔵 Beta: Final demo**
- [ ] Registration and login (JWT)
- [ ] Role-Based Access Control (Admin / Student / Guest)
- [ ] Security scopes and permissions
- [ ] Contribution approval workflow
- [ ] User profile dashboard
- [ ] Production deployment on Vercel

## 👥 Roles

| Action | Admin | Student | Guest |
|---|:---:|:---:|:---:|
| Browse courses and approved materials | ✅ | ✅ | ✅ |
| Submit contributions and requests | ✅ | ✅ | ❌ |
| Manage courses and core materials | ✅ | ❌ | ❌ |
| Approve or reject contributions | ✅ | ❌ | ❌ |

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React, TypeScript, Vite |
| **Backend** | FastAPI (Python), layered architecture |
| **Database** | PostgreSQL via SQLAlchemy (Supabase) |
| **Auth** | OAuth2 password flow, JWT, FastAPI security scopes |
| **Hosting** | Vercel, with frontend and backend in one project |

## 📁 Project Structure

```
passdown/
├── backend/        FastAPI app (all routes served under /api)
├── frontend/       Vite + React + TypeScript
├── docs/           PRD, SRS and TDD
├── vercel.json     Routes /api/* to the backend, everything else to the frontend
└── pyproject.toml
```

## 🚀 Getting Started

### Requirements
- [Python](https://www.python.org/downloads/) 3.10+
- [Node.js](https://nodejs.org/) 22+

> On macOS/Linux, use `python3` instead of `python`.

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/passdown.git
cd passdown
```

### 2. Run the backend (terminal 1)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
fastapi dev main.py
```
API docs are available at <http://localhost:8000/docs>.

### 3. Run the frontend (terminal 2)
```bash
cd frontend
npm install
npm run dev
```
Open <http://localhost:5173>. Vite forwards `/api` requests to the backend on port 8000.

### Run it the way Vercel does
```bash
npm install -g vercel
vercel dev -L
```

> **GitHub Codespaces:** open the repo in a Codespace and run the two sections
> above in separate terminals. Ports 8000 and 5173 are forwarded automatically.

## ☁️ Deployment

The frontend and backend deploy together as **one Vercel project**.

1. Push the repository to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new) and keep **Root Directory** as `./`.
3. Add environment variables in the Vercel dashboard when the database is connected (never commit them).

Every push to `main` redeploys automatically.

## 📄 Documentation

Project documents live in the [`docs/`](./docs) folder:

- **PRD**: Product Requirements Document
- **SRS**: Software Requirements Specification
- **TDD**: Technical Design Document

## 🤝 Contributing

This is an academic project, but the workflow follows normal open-source practice:

1. Create an issue for the task.
2. Branch from `main` (for example `feat/<short-description>` or `docs/<short-description>`).
3. Commit using [Conventional Commits](https://www.conventionalcommits.org/).
4. Open a pull request that references the issue (`Closes #<number>`).

## 📜 License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for details.

## 🙏 Acknowledgements

- Course: CSE 309, Independent University, Bangladesh
- Base template: [fastapi-vite-react-vercel-template](https://github.com/SayefReyadh/fastapi-vite-react-vercel-template)

---

<div align="center">

Built by **[Tanjil Hasan Emon]** · IUB CSE

</div>
