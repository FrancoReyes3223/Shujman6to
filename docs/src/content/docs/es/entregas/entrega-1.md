---
title: Entrega 1 — Setup inicial
description: Configuración del proyecto base con frontend, backend y base de datos.
---

## ¿Qué se hizo en esta entrega?

Se armó la estructura completa del proyecto desde cero: base de datos, backend con API REST y frontend con página de login y registro.

---

## Base de datos

Se usa **PostgreSQL** corriendo en un contenedor Docker. El esquema lo maneja **Prisma ORM**.

### Tabla `users`

| Columna      | Tipo       | Descripción                        |
|--------------|------------|------------------------------------|
| `id`         | UUID (PK)  | Identificador único                |
| `email`      | String     | Email del usuario (único)          |
| `full_name`  | String?    | Nombre completo (opcional)         |
| `password`   | String     | Contraseña hasheada con bcrypt     |
| `created_at` | DateTime   | Fecha de creación                  |
| `updated_at` | DateTime   | Fecha de última modificación       |

Para levantar la base de datos:

```bash
docker-compose up -d
cd backend
npx prisma migrate dev
```

---

## Backend

Servidor **Express** con arquitectura en capas (Controller → Service → Repository).

### Estructura

```
backend/src/
├── controllers/     # Reciben el request y llaman al service
├── services/        # Lógica de negocio
├── repositories/    # Consultas a la base de datos via Prisma
├── middlewares/     # Auth (JWT) y manejo de errores
├── routes/v1/       # Definición de endpoints
└── utils/           # Helpers de JWT y bcrypt
```

### Endpoints disponibles

| Método | Ruta                    | Auth | Descripción                        |
|--------|-------------------------|------|------------------------------------|
| POST   | `/api/v1/auth/register` | No   | Registra un usuario nuevo          |
| POST   | `/api/v1/auth/login`    | No   | Inicia sesión y devuelve JWT       |
| GET    | `/api/v1/usuarios/perfil` | Sí | Devuelve los datos del usuario logueado |

La autenticación usa **JWT** guardado en una cookie `httpOnly`.

Para iniciar el backend:

```bash
cd backend
npm install
npm run dev   # Puerto 3001
```

---

## Frontend

Aplicación **Next.js 15** con App Router.

### Páginas

| Ruta          | Descripción                              |
|---------------|------------------------------------------|
| `/`           | Página de login                          |
| `/register`   | Formulario de registro                   |
| `/dashboard`  | Vista protegida post-login               |

La protección de rutas se maneja con un `middleware.ts` que verifica el JWT de la cookie antes de permitir el acceso al dashboard.

Para iniciar el frontend:

```bash
cd frontend
npm install
npm run dev   # Puerto 3000
```

---

## Cómo correr todo junto

1. `docker-compose up -d` — levanta PostgreSQL
2. `cd backend && npm run dev` — API en puerto 3001
3. `cd frontend && npm run dev` — App en puerto 3000

Abrir [http://localhost:3000](http://localhost:3000).
