# Shujman — Aplicación de Login

Frontend (Next.js) + Documentación (Starlight, bilingüe ES/EN) + Backend (Express/TypeScript) + SQLite (Prisma).

## Requisitos

- Node.js 18 o superior
- npm

> La base de datos es SQLite (un archivo local). No se necesita Docker ni PostgreSQL.

---

## Cómo correr en local

### 1. Backend

```bash
cd backend
npm install
npx prisma migrate dev        # crea backend/prisma/dev.db
npm run dev                   # API en http://localhost:3001
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                   # App en http://localhost:3000
```

### 3. Documentación

Las docs se sirven dentro del frontend en `/docs/`. Para regenerarlas después de modificar el contenido:

```bash
npm run dev:docs              # buildea docs y las copia a frontend/public/docs/
```

Después de eso:

- `http://localhost:3000/docs/` → redirige al idioma por defecto
- `http://localhost:3000/docs/es/` → documentación en español
- `http://localhost:3000/docs/en/` → documentación en inglés

---

## Deploy al servidor de clase

### Opción A — Script automático (recomendado)

```bash
./scripts/deploy.sh dos       # reemplazá "dos" por tu usuario asignado
```

El script:

1. Buildea docs + frontend con `USUARIO=dos` (paths con `/~dos/`)
2. Compila el backend a `dist/`
3. Sube `frontend/out/*` a `~/public_html/`
4. Sube `backend/dist/*` a `~/servicios/dist/`
5. Sube `backend/prisma/*` a `~/servicios/prisma/`

> Te va a pedir tu contraseña SSH varias veces. Para evitarlo, configurá una SSH key.

### Opción B — Paso a paso manual

```bash
# 1. Build completo (frontend + docs) con tu usuario
USUARIO=dos npm run build

# 2. Subir frontend + docs
scp -r frontend/out/* dos@200.3.127.46:~/public_html/

# 3. Compilar y subir backend
cd backend
npm run build
scp -r dist/* dos@200.3.127.46:~/servicios/dist/

# 4. Subir migraciones Prisma (la primera vez y cada vez que cambia el schema)
scp -r prisma/* dos@200.3.127.46:~/servicios/prisma/
```

Resultados:

- Sitio: `http://200.3.127.46:8002/~dos/`
- API: `http://200.3.127.46:8002/~dos/api/`
- Docs: `http://200.3.127.46:8002/~dos/docs/`

---

## Cambiar el schema de la base de datos

```bash
cd backend
# 1. Editar prisma/schema.prisma
npx prisma migrate dev --name nombre_descriptivo
# 2. La migración nueva queda en prisma/migrations/
# 3. Al deployar, scp -r prisma/* la sube y el servidor la aplica automáticamente
```

---

## Estructura del proyecto

```
├── backend/
│   ├── src/
│   │   ├── index.ts          ← entrypoint del servidor
│   │   ├── app.ts
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── middlewares/
│   │   ├── routes/v1/
│   │   ├── config/database.ts
│   │   └── utils/            ← jwt, bcrypt
│   ├── prisma/
│   │   ├── schema.prisma     ← provider sqlite
│   │   └── migrations/
│   ├── dist/                 ← generado por `npm run build` (se sube al servidor)
│   ├── package.json
│   └── tsconfig.json         ← module: commonjs
├── frontend/
│   ├── app/
│   │   ├── page.tsx          ← login
│   │   ├── register/
│   │   └── dashboard/        ← incluye botón a la documentación
│   ├── lib/api.ts            ← URL de la API (auto-detecta local vs servidor)
│   ├── public/docs/          ← generado por `npm run dev:docs` (gitignored)
│   ├── out/                  ← generado por `npm run build` (se sube al servidor)
│   └── next.config.ts        ← USUARIO desde env, basePath /~USUARIO/
├── docs/
│   ├── src/content/docs/
│   │   ├── es/               ← documentación en español
│   │   │   ├── index.mdx
│   │   │   └── entregas/
│   │   └── en/               ← documentación en inglés
│   │       ├── index.mdx
│   │       └── entregas/
│   └── astro.config.mjs      ← USUARIO desde env, locales es + en
├── scripts/
│   ├── copy-docs.mjs         ← docs/dist → frontend/public/docs (+ redirector raíz)
│   └── deploy.sh             ← deploy completo al servidor
└── package.json              ← scripts orquestadores (build, dev:docs, etc.)
```

## Scripts principales

| Comando | Qué hace |
|---|---|
| `npm run dev:backend` | Levanta la API en `:3001` (con hot reload) |
| `npm run dev:frontend` | Levanta el frontend en `:3000` |
| `npm run dev:docs` | Rebuildea las docs con base `/docs` y las copia al frontend |
| `npm run build` | Build completo (docs + frontend) listo para deploy |
| `./scripts/deploy.sh <usuario>` | Deploy completo al servidor de la facu |

## Agregar una nueva entrega

Crear el archivo en **ambos idiomas**:

- `docs/src/content/docs/es/entregas/entrega-N.md`
- `docs/src/content/docs/en/entregas/entrega-N.md`

```markdown
---
title: Entrega N — Nombre de la entrega
description: Qué se hizo en esta entrega.
---

## ¿Qué se hizo?
...
```

Después correr `npm run dev:docs` para verlas en local.
