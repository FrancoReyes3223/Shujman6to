---
title: Deliverable 2 — Dashboard, Documentation & Internationalization
description: Control panel with employee and product management, documentation site, and ES/EN translation system.
---

## What was done in this deliverable?

A full dashboard with three functional views (Overview, Employees, Products), the documentation site using Astro/Starlight, and an internationalization system that lets users switch between Spanish and English.

---

## Dashboard

The dashboard is the main screen users access after logging in. It is protected by JWT: if there is no valid token, the app redirects automatically to the login page.

### Layout structure

```
DashboardPage
├── Sidebar          # Side navigation with tabs and logout
└── main
    ├── OverviewView    # Tab: Overview
    ├── EmployeesView   # Tab: Employees
    └── ProductsView    # Tab: Products
```

The sidebar is collapsible: a toggle button lets users hide it to gain screen space.

---

### Overview

Displays three real-time metrics calculated from in-memory data:

| Metric             | Description                                      |
|--------------------|--------------------------------------------------|
| Total Employees    | Number of employees in the list                  |
| Products in Catalog | Total registered products                       |
| Stock Alerts       | Products with status `Low` or `Out of Stock`     |

Alerts are shown in red if there is at least one, and in gold if there are none.

---

### Employees

Company staff list with full CRUD operations:

| Column       | Description                               |
|--------------|-------------------------------------------|
| Name         | Employee's full name                      |
| Role         | Position held                             |
| Department   | Area they belong to                       |
| Status       | `Active`, `On Vacation`, or `Inactive`    |
| Actions      | Edit and delete buttons                   |

**Add employee** — `+ New Employee` button opens a modal with a form.  
**Edit** — pencil icon opens the same modal pre-filled with current data.  
**Delete** — trash icon opens a confirmation modal before deleting.

Initial data is sample data and lives in browser memory (not yet persisted to the database).

---

### Products

Product and service catalog with full CRUD operations:

| Column            | Description                                    |
|-------------------|------------------------------------------------|
| Name              | Product or service name                        |
| Category          | Type (e.g. Hardware, Services)                 |
| Price             | Price formatted as `$0.00`                     |
| Stock             | Available quantity or `Unlimited`              |
| Status            | `Normal`, `Low`, or `Out of Stock`             |
| Actions           | Edit and delete buttons                        |

`Out of Stock` and `Low` statuses trigger alerts in the Overview. The price is automatically normalized to include the `$` symbol if not typed.

---

## Documentation

The documentation site is built with **Astro** and the **Starlight** theme. It is published alongside the frontend on the school server.

### Structure

```
docs/
├── src/
│   ├── components/        # Custom Astro components
│   │   ├── SiteTitle.astro    # Logo/name in the top bar
│   │   ├── ThemeSelect.astro  # Light/dark theme toggle
│   │   └── LanguageSelect.astro # Language selector
│   ├── content/docs/
│   │   ├── es/            # Spanish documentation
│   │   └── en/            # English documentation
│   └── styles/custom.css  # Blue theme matching the frontend
└── astro.config.mjs       # Starlight configuration
```

### How to run the docs site

```bash
cd docs
npm install
npm run dev   # Port 4321
```

To build and publish:

```bash
USUARIO=yourusername npm run build
```

---

## Internationalization (i18n)

The app supports **Spanish** and **English** using `i18next` with `react-i18next`.

### How it works

Translations are defined in `frontend/lib/i18n.ts` as two objects (`en` and `es`) sharing the same keys. On startup, i18next reads the language from `localStorage`; if no preference is saved, it defaults to **Spanish**.

```ts
// frontend/lib/i18n.ts
const en = {
  sign_in: "Sign In",
  emp_title: "Employee Directory",
  // ...
};

const es = {
  sign_in: "Iniciar Sesión",
  emp_title: "Directorio de Empleados",
  // ...
};
```

### How to use a translation in a component

```tsx
import { useTranslation } from "react-i18next";

function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t("emp_title", "Employee Directory")}</h1>;
}
```

The second argument of `t()` is the fallback value in case the key is missing.

### Switching languages

The `LanguageSwitcher` component (visible in the top-right corner of the dashboard) allows switching between ES and EN in real time. The preference is saved to `localStorage`.

### Available keys

Keys are grouped by section in `lib/i18n.ts`:

| Group        | Example keys                                             |
|--------------|----------------------------------------------------------|
| Auth         | `sign_in`, `password_label`, `email_label`               |
| Sidebar      | `sidebar_employees`, `sidebar_overview`, `logout`        |
| Overview     | `overview_title`, `overview_total_emp`, `overview_stock_alerts` |
| Employees    | `emp_title`, `emp_btn_new`, `emp_col_role`, `emp_delete_confirm` |
| Products     | `prod_title`, `prod_btn_new`, `prod_col_price`, `status_out` |
| General      | `btn_save`, `btn_cancel`, `btn_delete`, `docs_button`    |
