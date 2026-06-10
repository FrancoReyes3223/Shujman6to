#!/usr/bin/env bash
# Instala las dependencias de todos los subproyectos y aplica las migraciones.
#
# Se ejecuta automáticamente con `npm install` en la raíz (hook postinstall).
#
# Uso manual:
#   ./scripts/install.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> [1/2] Instalando dependencias..."
cd "$ROOT/backend" && npm install
cd "$ROOT/frontend" && npm install
cd "$ROOT/docs" && npm install

echo ""
echo "==> [2/2] Aplicando migraciones..."
cd "$ROOT/backend"
npx prisma migrate deploy
npx prisma generate

echo ""
echo "Listo. Ejecutá 'npm run dev' para levantar el proyecto."
