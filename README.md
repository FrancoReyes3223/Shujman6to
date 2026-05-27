# Shujman — Aplicación de Login

Frontend (Next.js) + Documentación (Starlight) + Backend (Express/TypeScript) + SQLite (Prisma).

## Requisitos

- Node.js 18 o superior
- npm

> Ya no se necesita Docker. La base de datos es SQLite (un archivo local).

## Cómo correr en local

### Backend

```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run dev        # Puerto 3001
```

### Frontend

```bash
cd frontend
npm install
npm run dev        # Puerto 3000
```

### Documentación (opcional, solo para ver en local)

```bash
cd docs
npm run dev        # Puerto 4321
```

---

## Deploy al servidor de clase

### Antes de compilar — configurar tu usuario

Cambiá `USUARIO` en **dos archivos** por tu usuario asignado (ej: `dos`, `tres`, etc.):

1. `frontend/next.config.ts` → `const USUARIO = "dos"`
2. `docs/astro.config.mjs` → `const USUARIO = 'dos'`

### 1. Build completo (frontend + docs juntos)

```bash
npm run build
```

Esto:
1. Compila la documentación (`docs/dist/`)
2. Copia los docs a `frontend/public/docs/`
3. Compila el frontend → `frontend/out/` (incluye los docs en `out/docs/`)

### 2. Subir el frontend + docs

```bash
scp -r frontend/out/* USUARIO@200.3.127.46:~/public_html/
```

Tu sitio: `http://200.3.127.46:8002/~USUARIO/`
Tus docs: `http://200.3.127.46:8002/~USUARIO/docs/`

### 3. Compilar y subir el backend

```bash
cd backend
npm run build
scp -r dist/* USUARIO@200.3.127.46:~/servicios/dist/
```

### 4. Subir las migraciones de base de datos

```bash
scp -r backend/prisma/* USUARIO@200.3.127.46:~/servicios/prisma/
```

Tu API: `http://200.3.127.46:8002/~USUARIO/api/`

---

## Estructura del Proyecto

```
├── backend/
│   ├── src/
│   │   ├── index.ts          ← entrada del servidor
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   └── utils/
│   ├── prisma/schema.prisma
│   ├── dist/                 ← npm run build (esto se sube al servidor)
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── app/
│   │   ├── page.tsx          ← login
│   │   ├── register/
│   │   └── dashboard/
│   ├── lib/api.ts            ← URL de la API (auto-detecta local vs servidor)
│   ├── out/                  ← npm run build (esto se sube al servidor)
│   └── next.config.ts
├── docs/
│   ├── src/content/docs/
│   │   ├── index.mdx         ← página de inicio de la documentación
│   │   └── entregas/         ← un .md por entrega
│   └── astro.config.mjs
├── scripts/
│   └── copy-docs.mjs         ← copia docs/dist → frontend/public/docs
└── package.json              ← build combinado
```

## Agregar una nueva entrega

Crear un archivo en `docs/src/content/docs/entregas/`:

```markdown
---
title: Entrega 2 — Nombre de la entrega
description: Qué se hizo en esta entrega.
---

## ¿Qué se hizo?
...
```
