---
title: Entrega 3 — Workspaces, Roles, API real y Despliegue automático
description: Sistema multi-empresa con roles y permisos, integración completa con la API y base de datos, navbar global y despliegue continuo.
---

## ¿Qué se hizo en esta entrega?

Se transformó la app de un dashboard de una sola empresa con datos en memoria a una plataforma **multi-empresa (workspaces)** con roles y permisos, conectada a una API real con base de datos persistente. Además se agregó una navbar global, nuevas secciones de cuenta y empresa, un workflow de despliegue automático por GitHub Actions, y se completó la cobertura de internacionalización.

---

## Workspaces (multi-empresa)

Un usuario puede pertenecer a **múltiples empresas (workspaces)**, cada una con su propio rol.

### Roles y permisos

| Rol     | Descripción                                              |
|---------|------------------------------------------------------------|
| `OWNER` | Control total: edita la empresa, gestiona miembros y roles |
| `ADMIN` | Puede editar los datos del workspace (empleados, productos, empresa) |
| `USER`  | Solo lectura: puede ver los datos pero no modificarlos      |

El rol activo se muestra en la navbar y en el selector de workspace del sidebar, con un color distintivo por rol (dorado, índigo, verde).

Cuando el rol del usuario en el workspace activo es `USER`, las vistas de Empleados, Productos y Empresa se renderizan en modo **solo lectura** (`readOnly`): se ocultan los botones de crear, editar y eliminar.

### Selector de workspace

El sidebar incluye un selector desplegable que muestra:
- El workspace activo, con su rol.
- La lista completa de empresas a las que pertenece el usuario.
- Un botón para crear una nueva empresa (`+ Crear empresa`), que abre `WorkspaceCreateModal`. El usuario que crea una empresa queda asignado automáticamente como `OWNER`.

### Vista "Mis Workspaces"

Nueva sección (`WorkspacesView`) accesible desde "Tu cuenta → Workspaces" donde el usuario puede:
- Ver el workspace activo destacado.
- Ver todas las empresas a las que pertenece, con su rol y descripción.
- Cambiar el workspace activo con un solo clic.
- Ver una leyenda explicando qué puede hacer cada rol.

---

## Miembros del workspace

Nueva sección (`WorkspaceMembersView`, tab "Members") donde un `OWNER` puede:

| Acción              | Descripción                                                  |
|---------------------|---------------------------------------------------------------|
| Ver miembros        | Tabla con nombre, email, rol y fecha de ingreso              |
| Invitar miembro     | Modal para invitar por email, asignando rol `ADMIN` o `USER` |
| Cambiar rol         | Selector inline para promover/degradar entre `ADMIN` y `USER`|
| Eliminar miembro     | Quita el acceso de un usuario al workspace                   |

El `OWNER` del workspace no puede ser degradado ni eliminado desde esta vista.

---

## Empresa (Company)

Nueva sección (`CompanyView`, tab "Company") con información institucional del workspace activo:

### Datos de la empresa
- Nombre, ubicación y descripción, editables por `OWNER`/`ADMIN` mediante un modal.
- Si el workspace todavía no configuró su empresa, se muestra un botón **"+ Set up company"**.

### Founders (fundadores)
Carrusel de tarjetas con los fundadores de la empresa:

| Campo     | Descripción                                  |
|-----------|------------------------------------------------|
| Nombre    | Nombre completo                                |
| Iniciales | 2 caracteres, usados como avatar si no hay foto|
| Color     | Color del avatar, elegido con un color picker  |
| Foto      | Imagen opcional (JPG/PNG/WebP, máx. 3 MB)      |
| Quote     | Frase o descripción opcional                   |

Permite agregar, editar y eliminar fundadores (con confirmación), y subir/quitar la foto de perfil. En modo `readOnly` (rol `USER`) estas acciones quedan ocultas.

---

## Cuenta (Account)

Nueva sección (`AccountView`, tab "Cuenta") con:
- Información personal: nombre completo (editable) y email (de solo lectura).
- Preferencias: switch de "Perfil público".

---

## Navbar global

Se agregó una navbar (`Navbar`) presente en toda la app, con:

- **Logo / marca** (`Shujman B2B`), que lleva al dashboard si el usuario está logueado o al login si no.
- **Badge del workspace activo**, con su nombre y el rol del usuario (visible solo dentro del dashboard).
- **Link a la documentación** (`/docs`).
- **Selector de idioma** (`LanguageSwitcher`).
- **Menú de usuario**: avatar con iniciales, nombre completo, y un dropdown con:
  - "Mi cuenta" → navega a `/dashboard?tab=cuenta`.
  - "Cerrar sesión" → hace logout y redirige al login.

El dashboard soporta deep-linking a tabs específicos vía el query param `?tab=`, validando contra una whitelist (`VALID_TABS`).

---

## Backend y base de datos real

Las vistas de **Empleados**, **Productos**, **Empresa** y **Founders** dejaron de usar datos de ejemplo en memoria y ahora se persisten en una base de datos **SQLite** mediante **Prisma ORM**.

### Modelo de datos (resumen)

```
User ──< WorkspaceMember >── Workspace
                                ├──< Employee
                                ├──< Product
                                └─── Company ──< Founder
```

- `WorkspaceMember` vincula usuarios con workspaces y guarda el `role` (`OWNER` | `ADMIN` | `USER`).
- `Company` tiene una relación 1 a 1 con `Workspace`, y 1 a muchos con `Founder`.
- Todas las entidades de negocio (`Employee`, `Product`, `Company`) están scoped por `workspaceId`, con borrado en cascada.

### Endpoints principales (API v1)

| Recurso                                          | Métodos                          |
|---------------------------------------------------|------------------------------------|
| `/workspaces`                                      | `GET`, `POST`                      |
| `/workspaces/:id`                                  | `GET`, `PATCH`                     |
| `/workspaces/:id/members`                          | `POST`                             |
| `/workspaces/:id/members/:userId`                  | `PATCH`, `DELETE`                  |
| `/workspaces/:workspaceId/employees`               | `GET`, `POST`, `PATCH`, `DELETE`   |
| `/workspaces/:workspaceId/products`                | `GET`, `POST`, `PATCH`, `DELETE`   |
| `/workspaces/:workspaceId/company`                 | `GET`, `PUT`                       |
| `/workspaces/:workspaceId/company/founders`        | `POST`                             |
| `/workspaces/:workspaceId/company/founders/:id`    | `PATCH`, `DELETE`                  |
| `/workspaces/:workspaceId/company/founders/:id/photo` | `POST` (multipart/form-data)    |

Todos los endpoints requieren un token JWT válido (`Authorization: Bearer <token>`).

### Migraciones

Se agregaron las migraciones `add_workspaces`, `add_employees` y `add_founder_photo` sobre el esquema inicial.

---

## Despliegue automático (CI/CD)

Se agregó el workflow `.github/workflows/deploy.yml`, que se dispara con cada push a `master` o al mergear un PR a `master`, y:

1. Instala dependencias y compila la **documentación** (Astro).
2. Copia los docs compilados al frontend (`scripts/copy-docs.mjs`).
3. Instala dependencias y compila el **frontend** (Next.js, export estático).
4. Instala dependencias y compila el **backend** (TypeScript).
5. Sube por SCP el frontend compilado, el backend compilado y el schema/migraciones de Prisma al servidor de la facultad.

### Setup local simplificado

Se agregó un script `postinstall` (`scripts/install.sh`) que, al correr `npm install` en la raíz del proyecto, instala automáticamente las dependencias de `backend`, `frontend` y `docs`, y aplica las migraciones de Prisma (`prisma migrate deploy` + `prisma generate`).

---

## Seguridad

Se resolvieron las vulnerabilidades reportadas por `npm audit` en `backend`, `frontend` y `docs`, actualizando dependencias afectadas.

---

## Internacionalización (i18n)

Se completó la cobertura de `i18next`/`react-i18next` para **todos** los componentes nuevos (Navbar, Workspaces, Members, Company, Account, Founders, etc.), agregando claves nuevas agrupadas por sección, siguiendo el mismo patrón ya usado en la Entrega 2 (`t("clave", "fallback")`).

También se corrigió un bug por el cual cambiar de idioma redirigía siempre a la sección "Resumen" en vez de mantener la tab activa.
