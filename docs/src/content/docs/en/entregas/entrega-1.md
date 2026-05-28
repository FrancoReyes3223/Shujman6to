---
title: Deliverable 1 — Initial Setup
description: Base project setup with frontend, backend and database.
---

## What was done in this deliverable?

The full project structure was built from scratch: database, REST API backend, and frontend with login and registration pages.

---

## Database

**SQLite** as local database (a `dev.db` file). Schema managed by **Prisma ORM**. No Docker or PostgreSQL required.

### `users` table

| Column       | Type       | Description                        |
|--------------|------------|------------------------------------|
| `id`         | UUID (PK)  | Unique identifier                  |
| `email`      | String     | User email (unique)                |
| `full_name`  | String?    | Full name (optional)               |
| `password`   | String     | bcrypt-hashed password             |
| `created_at` | DateTime   | Creation date                      |
| `updated_at` | DateTime   | Last update date                   |

To initialize the database (first time only):

```bash
cd backend
npx prisma migrate dev
```

---

## Backend

**Express** server with a layered architecture (Controller → Service → Repository).

### Structure

```
backend/src/
├── controllers/     # Handle requests and call services
├── services/        # Business logic
├── repositories/    # Database queries via Prisma
├── middlewares/     # Auth (JWT) and error handling
├── routes/v1/       # Endpoint definitions
└── utils/           # JWT and bcrypt helpers
```

### Available endpoints

| Method | Route                     | Auth | Description                        |
|--------|---------------------------|------|------------------------------------|
| POST   | `/api/v1/auth/register`   | No   | Register a new user                |
| POST   | `/api/v1/auth/login`      | No   | Login and return JWT               |
| GET    | `/api/v1/usuarios/perfil` | Yes  | Return logged-in user data         |

Authentication uses **JWT** stored in an `httpOnly` cookie.

To start the backend:

```bash
cd backend
npm install
npm run dev   # Port 3001
```

---

## Frontend

**Next.js 15** app with App Router.

### Pages

| Route         | Description                              |
|---------------|------------------------------------------|
| `/`           | Login page                               |
| `/register`   | Registration form                        |
| `/dashboard`  | Protected view after login               |

Route protection is handled by a `middleware.ts` that verifies the JWT cookie before granting access to the dashboard.

To start the frontend:

```bash
cd frontend
npm install
npm run dev   # Port 3000
```

---

## Running everything together

1. `cd backend && npm run dev` — API on port 3001
2. `cd frontend && npm run dev` — App on port 3000

Open [http://localhost:3000](http://localhost:3000).
