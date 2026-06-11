---
title: Deliverable 3 — Workspaces, Roles, Real API & Automated Deployment
description: Multi-company system with roles and permissions, full integration with the API and database, global navbar, and continuous deployment.
---

## What was done in this deliverable?

The app evolved from a single-company dashboard with in-memory data into a **multi-company (workspaces) platform** with roles and permissions, connected to a real API backed by a persistent database. A global navbar, new account and company sections, an automated deployment workflow via GitHub Actions, and full internationalization coverage were also added.

---

## Workspaces (multi-company)

A user can belong to **multiple companies (workspaces)**, each with its own role.

### Roles and permissions

| Role    | Description                                                  |
|---------|------------------------------------------------------------|
| `OWNER` | Full control: edits the company, manages members and roles |
| `ADMIN` | Can edit workspace data (employees, products, company)     |
| `USER`  | Read-only: can view data but not modify it                  |

The active role is shown in the navbar and in the workspace selector in the sidebar, with a distinct color per role (gold, indigo, green).

When the user's role in the active workspace is `USER`, the Employees, Products and Company views render in **read-only** mode (`readOnly`): create, edit, and delete buttons are hidden.

### Workspace selector

The sidebar includes a dropdown selector that shows:
- The active workspace, with its role.
- The full list of companies the user belongs to.
- A button to create a new company (`+ Create company`), which opens `WorkspaceCreateModal`. The user who creates a company is automatically assigned as `OWNER`.

### "My Workspaces" view

New section (`WorkspacesView`) accessible from "Your Account → Workspaces" where the user can:
- See the active workspace highlighted.
- See all companies they belong to, with role and description.
- Switch the active workspace with a single click.
- See a legend explaining what each role can do.

---

## Workspace members

New section (`WorkspaceMembersView`, "Members" tab) where an `OWNER` can:

| Action          | Description                                                  |
|-----------------|---------------------------------------------------------------|
| View members    | Table with name, email, role and join date                  |
| Invite member   | Modal to invite by email, assigning `ADMIN` or `USER` role   |
| Change role     | Inline selector to promote/demote between `ADMIN` and `USER` |
| Remove member   | Removes a user's access to the workspace                      |

The workspace `OWNER` cannot be demoted or removed from this view.

---

## Company

New section (`CompanyView`, "Company" tab) with institutional information about the active workspace:

### Company data
- Name, location and description, editable by `OWNER`/`ADMIN` via a modal.
- If the workspace hasn't set up its company yet, a **"+ Set up company"** button is shown.

### Founders
A carousel of founder cards:

| Field     | Description                                       |
|-----------|----------------------------------------------------|
| Name      | Full name                                          |
| Initials  | 2 characters, used as avatar when there's no photo |
| Color     | Avatar color, chosen with a color picker           |
| Photo     | Optional image (JPG/PNG/WebP, max 3 MB)            |
| Quote     | Optional short quote or description                |

Founders can be added, edited and deleted (with confirmation), and a profile photo can be uploaded or removed. In `readOnly` mode (`USER` role) these actions are hidden.

---

## Account

New section (`AccountView`, "Account" tab) with:
- Personal information: full name (editable) and email (read-only).
- Preferences: a "Public profile" toggle.

---

## Global navbar

A navbar (`Navbar`) was added across the whole app, with:

- **Logo / brand** (`Shujman B2B`), linking to the dashboard if the user is logged in, or to the login page otherwise.
- **Active workspace badge**, showing its name and the user's role (visible only inside the dashboard).
- **Link to the documentation** (`/docs`).
- **Language switcher** (`LanguageSwitcher`).
- **User menu**: avatar with initials, full name, and a dropdown with:
  - "My account" → navigates to `/dashboard?tab=cuenta`.
  - "Log out" → logs the user out and redirects to the login page.

The dashboard supports deep-linking to specific tabs via the `?tab=` query param, validated against a whitelist (`VALID_TABS`).

---

## Backend and real database

The **Employees**, **Products**, **Company** and **Founders** views no longer use in-memory sample data — they're now persisted in a **SQLite** database via **Prisma ORM**.

### Data model (summary)

```
User ──< WorkspaceMember >── Workspace
                                ├──< Employee
                                ├──< Product
                                └─── Company ──< Founder
```

- `WorkspaceMember` links users to workspaces and stores the `role` (`OWNER` | `ADMIN` | `USER`).
- `Company` has a 1-to-1 relation with `Workspace`, and a 1-to-many relation with `Founder`.
- All business entities (`Employee`, `Product`, `Company`) are scoped by `workspaceId`, with cascade delete.

### Main endpoints (API v1)

| Resource                                           | Methods                          |
|------------------------------------------------------|------------------------------------|
| `/workspaces`                                         | `GET`, `POST`                      |
| `/workspaces/:id`                                     | `GET`, `PATCH`                     |
| `/workspaces/:id/members`                             | `POST`                             |
| `/workspaces/:id/members/:userId`                     | `PATCH`, `DELETE`                  |
| `/workspaces/:workspaceId/employees`                  | `GET`, `POST`, `PATCH`, `DELETE`   |
| `/workspaces/:workspaceId/products`                   | `GET`, `POST`, `PATCH`, `DELETE`   |
| `/workspaces/:workspaceId/company`                    | `GET`, `PUT`                       |
| `/workspaces/:workspaceId/company/founders`           | `POST`                             |
| `/workspaces/:workspaceId/company/founders/:id`       | `PATCH`, `DELETE`                  |
| `/workspaces/:workspaceId/company/founders/:id/photo` | `POST` (multipart/form-data)       |

All endpoints require a valid JWT token (`Authorization: Bearer <token>`).

### Migrations

The `add_workspaces`, `add_employees` and `add_founder_photo` migrations were added on top of the initial schema.

---

## Automated deployment (CI/CD)

The `.github/workflows/deploy.yml` workflow was added, triggered on every push to `master` or when a PR is merged into `master`. It:

1. Installs dependencies and builds the **documentation** site (Astro).
2. Copies the built docs into the frontend (`scripts/copy-docs.mjs`).
3. Installs dependencies and builds the **frontend** (Next.js static export).
4. Installs dependencies and builds the **backend** (TypeScript).
5. Uploads the built frontend, built backend, and Prisma schema/migrations to the school server via SCP.

### Simplified local setup

A `postinstall` script (`scripts/install.sh`) was added so that running `npm install` at the project root automatically installs dependencies for `backend`, `frontend` and `docs`, and applies Prisma migrations (`prisma migrate deploy` + `prisma generate`).

---

## Security

Vulnerabilities reported by `npm audit` in `backend`, `frontend` and `docs` were resolved by updating the affected dependencies.

---

## Internationalization (i18n)

`i18next`/`react-i18next` coverage was completed for **all** new components (Navbar, Workspaces, Members, Company, Account, Founders, etc.), adding new keys grouped by section, following the same pattern used in Deliverable 2 (`t("key", "fallback")`).

A bug was also fixed where switching languages always redirected to the "Overview" section instead of keeping the active tab.
