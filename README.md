# Shujman6to - Pagina de Login

Este proyecto es una aplicación de login completa con un frontend en Next.js, un backend en Express (Node.js) con Prisma ORM, y una base de datos PostgreSQL.

## Requisitos Previos

Asegúrate de tener instalado:
- [Node.js](https://nodejs.org/) (versión 18 o superior)
- [Docker](https://www.docker.com/) y Docker Compose (para la base de datos)
- npm (normalmente viene con Node.js)

## Pasos para Correr el Programa

Sigue estos pasos en orden para iniciar la aplicación:

### 1. Iniciar la Base de Datos (Docker)
Abre una terminal en la raíz del proyecto y ejecuta:
```bash
docker-compose up -d
```
Esto levantará un contenedor de PostgreSQL en el puerto `5433`.

### 2. Configurar el Backend
Abre una **nueva terminal** y navega a la carpeta del backend:
```bash
cd backend
npm install
```
Luego, sincroniza la base de datos con el esquema de Prisma:
```bash
npx prisma migrate dev
```
Finalmente, inicia el servidor de desarrollo:
```bash
npm run dev
```
El servidor correrá por defecto en el puerto `3001`.

### 3. Configurar el Frontend
Abre una **tercera terminal** y navega a la carpeta del frontend:
```bash
cd frontend
npm install
npm run dev
```
La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

---

## Estructura del Proyecto

- `backend/`: API Express con arquitectura en capas.
  - `src/`: Controladores, Servicios y Repositorios.
  - `prisma/`: Esquema de la base de datos y migraciones.
- `frontend/`: Aplicación Next.js (App Router).
- `docker-compose.yml`: Configuración de la base de datos PostgreSQL.

## Notas Adicionales
- Si necesitas cambiar la clave secreta de JWT o el puerto, puedes hacerlo en el archivo `backend/.env`.
- La base de datos guarda la información de forma persistente en un volumen de Docker.
